/**
 * Edge Function: Weekly Bonus Checker
 *
 * Vérifie chaque dimanche soir les bonus hebdomadaires éligibles
 * et attribue automatiquement les XP aux utilisateurs.
 *
 * À exécuter chaque dimanche à 23h00 via un cron job Supabase
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    console.log('🔍 Checking weekly bonuses for period:', startDate, 'to', endDate);

    const { data: weeklyRules, error: rulesError } = await supabase
      .from('bonus_xp_rules')
      .select('*')
      .eq('is_active', true)
      .eq('period', 'weekly')
      .order('priority', { ascending: true });

    if (rulesError) {
      console.error('Error fetching weekly rules:', rulesError);
      throw rulesError;
    }

    console.log(`📋 Found ${weeklyRules?.length || 0} weekly bonus rules`);

    if (!weeklyRules || weeklyRules.length === 0) {
      console.log('ℹ️  No weekly bonus rules configured');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No weekly bonus rules to check',
          results: {
            rulesChecked: 0,
            usersChecked: 0,
            bonusesAwarded: 0,
            totalXpAwarded: 0,
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { data: activeUsers, error: usersError } = await supabase
      .from('user_gamification_progress')
      .select('user_id');

    if (usersError) {
      console.error('Error fetching active users:', usersError);
      throw usersError;
    }

    console.log(`👥 Found ${activeUsers?.length || 0} active users`);

    const results = {
      rulesChecked: weeklyRules.length,
      usersChecked: 0,
      bonusesAwarded: 0,
      totalXpAwarded: 0,
      errors: 0,
      details: [] as any[],
    };

    for (const user of (activeUsers || [])) {
      try {
        results.usersChecked++;
        const userId = user.user_id;

        const { data: perfScore, error: perfError } = await supabase.rpc(
          'calculate_overall_performance_score',
          {
            p_user_id: userId,
            p_period_type: 'weekly',
            p_start_date: startDate,
            p_end_date: endDate,
          }
        );

        if (perfError) {
          console.error(`Error calculating performance for user ${userId}:`, perfError);
          results.errors++;
          continue;
        }

        console.log(`👤 User ${userId} weekly performance:`, perfScore);

        for (const rule of weeklyRules) {
          try {
            const { data: existing } = await supabase
              .from('user_bonus_history')
              .select('id')
              .eq('user_id', userId)
              .eq('rule_id', rule.id)
              .eq('period_start', startDate)
              .eq('period_end', endDate)
              .maybeSingle();

            if (existing) {
              console.log(`ℹ️  Bonus already awarded: ${rule.rule_name} for user ${userId}`);
              continue;
            }

            let eligible = false;

            switch (rule.rule_type) {
              case 'nutrition_streak': {
                const minDays = rule.condition.min_days || 7;
                const { data: meals } = await supabase
                  .from('meals')
                  .select('consumed_at')
                  .eq('user_id', userId)
                  .gte('consumed_at', new Date(startDate).toISOString())
                  .lte('consumed_at', new Date(endDate).toISOString());

                const dayGroups = new Set<string>();
                meals?.forEach((meal: any) => {
                  const day = new Date(meal.consumed_at).toISOString().split('T')[0];
                  dayGroups.add(day);
                });

                eligible = dayGroups.size >= minDays;
                break;
              }

              case 'training_frequency': {
                const minSessions = rule.condition.min_sessions || 3;
                const { data: activities } = await supabase
                  .from('biometric_activities')
                  .select('id')
                  .eq('user_id', userId)
                  .gte('activity_date', startDate)
                  .lte('activity_date', endDate);

                eligible = (activities?.length || 0) >= minSessions;
                break;
              }

              case 'weekly_perfect': {
                const minPerfectDays = rule.condition.min_perfect_days || 5;
                const { data: perfectDays } = await supabase
                  .from('perfect_days_tracking')
                  .select('id')
                  .eq('user_id', userId)
                  .gte('perfect_date', startDate)
                  .lte('perfect_date', endDate);

                eligible = (perfectDays?.length || 0) >= minPerfectDays;
                break;
              }

              default:
                eligible = perfScore?.overall_score >= 75;
            }

            if (!eligible) {
              console.log(`❌ User ${userId} not eligible for ${rule.rule_name}`);
              continue;
            }

            const { error: historyError } = await supabase.from('user_bonus_history').insert({
              user_id: userId,
              rule_id: rule.id,
              rule_name: rule.rule_name,
              xp_awarded: rule.xp_reward,
              period_start: startDate,
              period_end: endDate,
              performance_score: perfScore.overall_score,
              condition_details: rule.condition,
            });

            if (historyError) {
              console.error(`Error recording bonus for user ${userId}:`, historyError);
              results.errors++;
              continue;
            }

            const { error: xpError } = await supabase.rpc('award_xp', {
              p_user_id: userId,
              p_event_type: `bonus_${rule.rule_type}`,
              p_event_category: 'performance_bonus',
              p_base_xp: rule.xp_reward,
              p_event_metadata: {
                rule_id: rule.id,
                rule_name: rule.rule_name,
                period: 'weekly',
                performance_score: perfScore.overall_score,
              },
            });

            if (xpError) {
              console.error(`Error awarding XP to user ${userId}:`, xpError);
              results.errors++;
              continue;
            }

            results.bonusesAwarded++;
            results.totalXpAwarded += rule.xp_reward;

            console.log(`✅ Awarded ${rule.rule_name} to user ${userId}: +${rule.xp_reward} XP`);

            results.details.push({
              userId,
              ruleName: rule.rule_name,
              xpAwarded: rule.xp_reward,
              performanceScore: perfScore.overall_score,
            });
          } catch (ruleError) {
            console.error(`Error processing rule ${rule.rule_name} for user ${userId}:`, ruleError);
            results.errors++;
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.user_id}:`, userError);
        results.errors++;
      }
    }

    console.log('📈 Final weekly results:', {
      rulesChecked: results.rulesChecked,
      usersChecked: results.usersChecked,
      bonusesAwarded: results.bonusesAwarded,
      totalXpAwarded: results.totalXpAwarded,
      errors: results.errors,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly bonuses checked successfully',
        results: {
          rulesChecked: results.rulesChecked,
          usersChecked: results.usersChecked,
          bonusesAwarded: results.bonusesAwarded,
          totalXpAwarded: results.totalXpAwarded,
          errors: results.errors,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Fatal error in weekly-bonus-checker:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
