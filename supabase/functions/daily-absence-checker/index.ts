/**
 * Daily Absence Checker - Cron Job
 * Runs daily to detect user absences and send reminders
 * Schedule: Daily at 8:00 AM UTC
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UserAbsenceStatus {
  userId: string;
  lastActivity: string;
  daysInactive: number;
  hasActiveAbsence: boolean;
  hasActiveSubscription: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting daily absence check...");

    // 1. Get all users with activity tracking
    const { data: users, error: usersError } = await supabase
      .from("user_activity_tracking")
      .select("user_id, last_activity_logged_at");

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      console.log("No users to check");
      return new Response(
        JSON.stringify({ message: "No users to check", checkedUsers: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Checking ${users.length} users for absence...`);

    const results = {
      totalChecked: users.length,
      absencesDetected: 0,
      remindersS: 0,
      estimationsCreated: 0,
      errors: [] as string[],
    };

    // 2. Process each user
    for (const user of users) {
      try {
        const status = await checkUserAbsence(supabase, user.user_id);

        if (!status.hasActiveSubscription) {
          console.log(`User ${user.user_id} has no active subscription, skipping`);
          continue;
        }

        const daysSinceActivity = Math.floor(
          (Date.now() - new Date(status.lastActivity).getTime()) /
            (24 * 60 * 60 * 1000)
        );

        // Detect absence at different thresholds
        if (daysSinceActivity >= 3 && !status.hasActiveAbsence) {
          // Create absence log
          await createAbsenceLog(supabase, user.user_id, status.lastActivity, daysSinceActivity);
          results.absencesDetected++;
          console.log(`Absence detected for user ${user.user_id} (${daysSinceActivity} days)`);

          // Generate estimation if >= 3 days
          if (daysSinceActivity >= 3) {
            await generateAbsenceEstimation(supabase, user.user_id, daysSinceActivity);
            results.estimationsCreated++;
          }
        } else if (status.hasActiveAbsence && daysSinceActivity >= 5) {
          // Send reminder for existing absence
          await sendAbsenceReminder(supabase, user.user_id, daysSinceActivity);
          results.remindersS++;
          console.log(`Reminder sent to user ${user.user_id}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error);
        results.errors.push(`User ${user.user_id}: ${error.message}`);
      }
    }

    // 3. Expire old pending XP rewards (30+ days)
    const { error: expireError } = await supabase.rpc("expire_old_pending_xp_rewards");
    if (expireError) {
      console.error("Failed to expire old rewards:", expireError);
    }

    console.log("Daily absence check complete:", results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Daily absence check failed:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Check user absence status
 */
async function checkUserAbsence(
  supabase: any,
  userId: string
): Promise<UserAbsenceStatus> {
  // Get last activity
  const { data: tracking } = await supabase
    .from("user_activity_tracking")
    .select("last_activity_logged_at")
    .eq("user_id", userId)
    .maybeSingle();

  // Check for active absence
  const { data: absence } = await supabase
    .from("absence_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  // Check subscription
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  const lastActivity = tracking?.last_activity_logged_at || new Date().toISOString();
  const daysInactive = Math.floor(
    (Date.now() - new Date(lastActivity).getTime()) / (24 * 60 * 60 * 1000)
  );

  return {
    userId,
    lastActivity,
    daysInactive,
    hasActiveAbsence: !!absence,
    hasActiveSubscription: !!subscription,
  };
}

/**
 * Create absence log
 */
async function createAbsenceLog(
  supabase: any,
  userId: string,
  lastActivity: string,
  daysAbsent: number
): Promise<void> {
  const { error } = await supabase.from("absence_logs").insert({
    user_id: userId,
    absence_start_date: new Date(lastActivity).toISOString().split("T")[0],
    days_absent: daysAbsent,
    status: "active",
    detected_at: new Date().toISOString(),
  });

  if (error) throw error;
}

/**
 * Generate absence estimation
 */
async function generateAbsenceEstimation(
  supabase: any,
  userId: string,
  daysAbsent: number
): Promise<void> {
  // Get activity pattern
  const { data: pattern } = await supabase
    .from("user_activity_tracking")
    .select("avg_daily_xp")
    .eq("user_id", userId)
    .maybeSingle();

  if (!pattern || !pattern.avg_daily_xp) {
    console.log(`No activity pattern for user ${userId}, skipping estimation`);
    return;
  }

  // Get active absence log
  const { data: absence } = await supabase
    .from("absence_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("detected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!absence) return;

  // Create estimated daily entries (max 14 days)
  const estimationDays = Math.min(daysAbsent, 14);
  const dailyEstimates = [];

  for (let i = 0; i < estimationDays; i++) {
    const variation = 0.9 + Math.random() * 0.2; // 0.9-1.1x
    const estimatedXp = Math.round(pattern.avg_daily_xp * variation);

    dailyEstimates.push({
      date: new Date(Date.now() - (daysAbsent - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      estimated_xp: estimatedXp,
      confidence_score: 0.75,
    });

    // Create pending XP reward
    await supabase.from("pending_xp_rewards").insert({
      user_id: userId,
      absence_log_id: absence.id,
      base_estimated_xp: estimatedXp,
      multiplier: 0.7,
      final_xp: Math.round(estimatedXp * 0.7),
      event_type: "absence_estimation",
      event_category: "general",
      event_date: new Date(Date.now() - (daysAbsent - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "pending",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Update absence log with estimation data
  const totalEstimatedXp = dailyEstimates.reduce((sum, d) => sum + d.estimated_xp, 0);

  await supabase
    .from("absence_logs")
    .update({
      estimated_activity_data: {
        days: dailyEstimates,
        total_estimated_xp: totalEstimatedXp,
        estimation_method: "historical_average",
        data_quality: "good",
      },
    })
    .eq("id", absence.id);
}

/**
 * Send absence reminder
 */
async function sendAbsenceReminder(
  supabase: any,
  userId: string,
  daysAbsent: number
): Promise<void> {
  // Get absence log
  const { data: absence } = await supabase
    .from("absence_logs")
    .select("id, reminder_sent_count, last_reminder_sent_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("detected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!absence) return;

  // Check if reminder was sent recently (don't spam)
  if (absence.last_reminder_sent_at) {
    const daysSinceLastReminder = Math.floor(
      (Date.now() - new Date(absence.last_reminder_sent_at).getTime()) /
        (24 * 60 * 60 * 1000)
    );

    if (daysSinceLastReminder < 3) {
      console.log(`Reminder sent recently for user ${userId}, skipping`);
      return;
    }
  }

  // Update reminder count
  await supabase
    .from("absence_logs")
    .update({
      reminder_sent_count: (absence.reminder_sent_count || 0) + 1,
      last_reminder_sent_at: new Date().toISOString(),
    })
    .eq("id", absence.id);

  // Note: Actual notification sending would be handled by the notification system
  console.log(`Reminder logged for user ${userId} (${daysAbsent} days absent)`);
}
