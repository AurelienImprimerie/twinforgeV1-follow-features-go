/**
 * AbsenceDetectionService
 * Detects user inactivity and creates absence logs
 *
 * Thresholds:
 * - 24h (1 day): Soft reminder
 * - 48h (2 days): Active absence detection
 * - 72h (3 days): Estimation kicks in
 * - 7 days: Maximum estimation period
 * - 14 days: Fallback to smoothing/hibernation
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '@/lib/utils/logger';

export interface AbsenceDetectionResult {
  hasActiveAbsence: boolean;
  absenceLog: AbsenceLog | null;
  daysAbsent: number;
  lastActivity: Date | null;
  shouldTriggerRecovery: boolean;
  estimationStatus: 'none' | 'soft_reminder' | 'active' | 'estimation' | 'max_reached' | 'hibernation';
}

export interface AbsenceLog {
  id: string;
  userId: string;
  absenceStartDate: string;
  absenceEndDate: string | null;
  daysAbsent: number;
  status: 'active' | 'reconciled' | 'expired' | 'cancelled';
  estimatedActivityData: any;
  reconciledAt: string | null;
  reconciliationId: string | null;
  reminderSentCount: number;
  lastReminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LastActivityTimestamps {
  lastMealLogged: Date | null;
  lastTrainingLogged: Date | null;
  lastWeightUpdate: Date | null;
  lastBodyScan: Date | null;
  lastAnyActivity: Date | null;
}

export class AbsenceDetectionService {
  private supabase: SupabaseClient;

  private readonly THRESHOLDS = {
    SOFT_REMINDER: 24 * 60 * 60 * 1000, // 24 hours
    ACTIVE_ABSENCE: 48 * 60 * 60 * 1000, // 48 hours
    ESTIMATION_START: 72 * 60 * 60 * 1000, // 72 hours
    MAX_ESTIMATION: 7 * 24 * 60 * 60 * 1000, // 7 days
    HIBERNATION: 14 * 24 * 60 * 60 * 1000, // 14 days
  };

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    console.log('✅ AbsenceDetectionService initialized');
  }

  /**
   * Check if user has an active absence and should trigger recovery
   */
  async detectAbsence(userId: string): Promise<AbsenceDetectionResult> {
    console.log('🔍 [ABSENCE_DETECTION] Checking for user absence', { userId });
    try {
      logger.info('ABSENCE_DETECTION', 'Checking for user absence', { userId });

      // Check for existing active absence
      console.log('📋 [ABSENCE_DETECTION] Checking for existing active absence');
      const existingAbsence = await this.getActiveAbsence(userId);

      if (existingAbsence) {
        const daysAbsent = this.calculateDaysAbsent(
          new Date(existingAbsence.absenceStartDate)
        );
        console.log('✅ [ABSENCE_DETECTION] Found existing absence', { daysAbsent, status: this.getEstimationStatus(daysAbsent) });

        return {
          hasActiveAbsence: true,
          absenceLog: existingAbsence,
          daysAbsent,
          lastActivity: new Date(existingAbsence.absenceStartDate),
          shouldTriggerRecovery: true,
          estimationStatus: this.getEstimationStatus(daysAbsent),
        };
      }

      // Get last activity timestamps
      console.log('⏰ [ABSENCE_DETECTION] Fetching last activity timestamps');
      const lastActivities = await this.getLastActivityTimestamps(userId);

      if (!lastActivities.lastAnyActivity) {
        // No activity recorded yet, user is new
        console.log('ℹ️ [ABSENCE_DETECTION] No activity recorded for new user');
        return {
          hasActiveAbsence: false,
          absenceLog: null,
          daysAbsent: 0,
          lastActivity: null,
          shouldTriggerRecovery: false,
          estimationStatus: 'none',
        };
      }

      const timeSinceLastActivity = Date.now() - lastActivities.lastAnyActivity.getTime();
      const daysAbsent = Math.floor(timeSinceLastActivity / (24 * 60 * 60 * 1000));
      console.log('⏱️ [ABSENCE_DETECTION] Time since last activity', { timeSinceLastActivity, daysAbsent });

      // Check if absence threshold is reached
      if (timeSinceLastActivity >= this.THRESHOLDS.ACTIVE_ABSENCE) {
        // Create absence log
        console.log('🚨 [ABSENCE_DETECTION] Absence threshold reached, creating log');
        const absenceLog = await this.createAbsenceLog(
          userId,
          lastActivities.lastAnyActivity
        );

        return {
          hasActiveAbsence: true,
          absenceLog,
          daysAbsent,
          lastActivity: lastActivities.lastAnyActivity,
          shouldTriggerRecovery: true,
          estimationStatus: this.getEstimationStatus(daysAbsent),
        };
      }

      // Soft reminder phase (24h-48h)
      if (timeSinceLastActivity >= this.THRESHOLDS.SOFT_REMINDER) {
        console.log('💡 [ABSENCE_DETECTION] Soft reminder phase detected');
        return {
          hasActiveAbsence: false,
          absenceLog: null,
          daysAbsent,
          lastActivity: lastActivities.lastAnyActivity,
          shouldTriggerRecovery: false,
          estimationStatus: 'soft_reminder',
        };
      }

      // All good, user is active
      console.log('✅ [ABSENCE_DETECTION] User is active, no absence detected');
      return {
        hasActiveAbsence: false,
        absenceLog: null,
        daysAbsent: 0,
        lastActivity: lastActivities.lastAnyActivity,
        shouldTriggerRecovery: false,
        estimationStatus: 'none',
      };
    } catch (error) {
      logger.error('ABSENCE_DETECTION', 'Failed to detect absence', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get existing active absence for user
   */
  private async getActiveAbsence(userId: string): Promise<AbsenceLog | null> {
    const { data, error } = await this.supabase
      .from('absence_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('absence_start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('ABSENCE_DETECTION', 'Failed to get active absence', { userId, error });
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      absenceStartDate: data.absence_start_date,
      absenceEndDate: data.absence_end_date,
      daysAbsent: data.days_absent,
      status: data.status,
      estimatedActivityData: data.estimated_activity_data,
      reconciledAt: data.reconciled_at,
      reconciliationId: data.reconciliation_id,
      reminderSentCount: data.reminder_sent_count,
      lastReminderSentAt: data.last_reminder_sent_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Get last activity timestamps from various sources
   */
  private async getLastActivityTimestamps(
    userId: string
  ): Promise<LastActivityTimestamps> {
    const [mealsResult, trainingResult, weightResult, bodyScanResult] =
      await Promise.allSettled([
        this.getLastMealTimestamp(userId),
        this.getLastTrainingTimestamp(userId),
        this.getLastWeightUpdateTimestamp(userId),
        this.getLastBodyScanTimestamp(userId),
      ]);

    const lastMealLogged =
      mealsResult.status === 'fulfilled' ? mealsResult.value : null;
    const lastTrainingLogged =
      trainingResult.status === 'fulfilled' ? trainingResult.value : null;
    const lastWeightUpdate =
      weightResult.status === 'fulfilled' ? weightResult.value : null;
    const lastBodyScan =
      bodyScanResult.status === 'fulfilled' ? bodyScanResult.value : null;

    // Find the most recent activity
    const timestamps = [
      lastMealLogged,
      lastTrainingLogged,
      lastWeightUpdate,
      lastBodyScan,
    ].filter((t): t is Date => t !== null);

    const lastAnyActivity =
      timestamps.length > 0
        ? new Date(Math.max(...timestamps.map((t) => t.getTime())))
        : null;

    return {
      lastMealLogged,
      lastTrainingLogged,
      lastWeightUpdate,
      lastBodyScan,
      lastAnyActivity,
    };
  }

  private async getLastMealTimestamp(userId: string): Promise<Date | null> {
    const { data } = await this.supabase
      .from('meals')
      .select('consumed_at')
      .eq('user_id', userId)
      .order('consumed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? new Date(data.consumed_at) : null;
  }

  private async getLastTrainingTimestamp(userId: string): Promise<Date | null> {
    const { data } = await this.supabase
      .from('training_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? new Date(data.created_at) : null;
  }

  private async getLastWeightUpdateTimestamp(userId: string): Promise<Date | null> {
    const { data } = await this.supabase
      .from('weight_updates_history')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? new Date(data.created_at) : null;
  }

  private async getLastBodyScanTimestamp(userId: string): Promise<Date | null> {
    const { data } = await this.supabase
      .from('body_scans')
      .select('scan_date')
      .eq('user_id', userId)
      .order('scan_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? new Date(data.scan_date) : null;
  }

  /**
   * Create a new absence log
   */
  private async createAbsenceLog(
    userId: string,
    absenceStartDate: Date
  ): Promise<AbsenceLog> {
    const daysAbsent = this.calculateDaysAbsent(absenceStartDate);
    console.log('📝 [ABSENCE_DETECTION] Creating absence log', { userId, daysAbsent });

    const { data, error } = await this.supabase
      .from('absence_logs')
      .insert({
        user_id: userId,
        absence_start_date: absenceStartDate.toISOString().split('T')[0],
        days_absent: daysAbsent,
        status: 'active',
        estimated_activity_data: {},
      })
      .select()
      .single();

    if (error) {
      logger.error('ABSENCE_DETECTION', 'Failed to create absence log', {
        userId,
        error,
      });
      throw error;
    }

    logger.info('ABSENCE_DETECTION', 'Absence log created', {
      userId,
      absenceLogId: data.id,
      daysAbsent,
    });

    return {
      id: data.id,
      userId: data.user_id,
      absenceStartDate: data.absence_start_date,
      absenceEndDate: data.absence_end_date,
      daysAbsent: data.days_absent,
      status: data.status,
      estimatedActivityData: data.estimated_activity_data,
      reconciledAt: data.reconciled_at,
      reconciliationId: data.reconciliation_id,
      reminderSentCount: data.reminder_sent_count,
      lastReminderSentAt: data.last_reminder_sent_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Calculate days absent from a start date
   */
  private calculateDaysAbsent(startDate: Date): number {
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    return Math.floor(diffTime / (24 * 60 * 60 * 1000));
  }

  /**
   * Get estimation status based on days absent
   */
  private getEstimationStatus(
    daysAbsent: number
  ): 'none' | 'soft_reminder' | 'active' | 'estimation' | 'max_reached' | 'hibernation' {
    if (daysAbsent >= 14) return 'hibernation';
    if (daysAbsent >= 7) return 'max_reached';
    if (daysAbsent >= 3) return 'estimation';
    if (daysAbsent >= 2) return 'active';
    if (daysAbsent >= 1) return 'soft_reminder';
    return 'none';
  }

  /**
   * Update absence log with current days absent
   */
  async updateAbsenceLog(absenceLogId: string): Promise<void> {
    const { data: log } = await this.supabase
      .from('absence_logs')
      .select('absence_start_date')
      .eq('id', absenceLogId)
      .single();

    if (!log) return;

    const daysAbsent = this.calculateDaysAbsent(new Date(log.absence_start_date));

    await this.supabase
      .from('absence_logs')
      .update({ days_absent: daysAbsent })
      .eq('id', absenceLogId);
  }

  /**
   * Mark absence as reconciled
   */
  async markAsReconciled(
    absenceLogId: string,
    reconciliationId: string
  ): Promise<void> {
    console.log('✅ [ABSENCE_DETECTION] Marking absence as reconciled', { absenceLogId, reconciliationId });
    const { error } = await this.supabase
      .from('absence_logs')
      .update({
        status: 'reconciled',
        reconciled_at: new Date().toISOString(),
        reconciliation_id: reconciliationId,
        absence_end_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', absenceLogId);

    if (error) {
      logger.error('ABSENCE_DETECTION', 'Failed to mark as reconciled', {
        absenceLogId,
        error,
      });
      throw error;
    }

    logger.info('ABSENCE_DETECTION', 'Absence marked as reconciled', {
      absenceLogId,
      reconciliationId,
    });
  }

  /**
   * Increment reminder count
   */
  async incrementReminderCount(absenceLogId: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment', {
      table_name: 'absence_logs',
      id: absenceLogId,
      column_name: 'reminder_sent_count',
    });

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: log } = await this.supabase
        .from('absence_logs')
        .select('reminder_sent_count')
        .eq('id', absenceLogId)
        .single();

      if (log) {
        await this.supabase
          .from('absence_logs')
          .update({
            reminder_sent_count: (log.reminder_sent_count || 0) + 1,
            last_reminder_sent_at: new Date().toISOString(),
          })
          .eq('id', absenceLogId);
      }
    } else {
      await this.supabase
        .from('absence_logs')
        .update({
          last_reminder_sent_at: new Date().toISOString(),
        })
        .eq('id', absenceLogId);
    }
  }
}
