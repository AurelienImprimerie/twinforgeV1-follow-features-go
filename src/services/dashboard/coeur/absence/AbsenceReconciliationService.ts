/**
 * AbsenceReconciliationService - Main orchestrator for absence reconciliation flow
 * Coordinates detection, estimation, validation, and XP attribution
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '@/lib/utils/logger';
import { AbsenceDetectionService } from './AbsenceDetectionService';
import { EstimatedActivityService } from './EstimatedActivityService';
import { AntiCheatValidationService } from './AntiCheatValidationService';
import { AbsenceRecoveryCoachingService } from './AbsenceRecoveryCoachingService';
import type { RecoveryContext } from './AbsenceRecoveryCoachingService';

export interface ReconciliationResult {
  success: boolean;
  reconciliationId?: string;
  totalPendingXp: number;
  totalAwardedXp: number;
  bonusXp: number;
  weightDelta: number;
  coherenceScore: number;
  coachMessages: any[];
  error?: string;
}

export interface WeightUpdatePayload {
  userId: string;
  newWeight: number;
  timestamp?: Date;
}

export class AbsenceReconciliationService {
  private supabase: SupabaseClient;
  private detectionService: AbsenceDetectionService;
  private activityService: EstimatedActivityService;
  private validationService: AntiCheatValidationService;
  private coachingService: AbsenceRecoveryCoachingService;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.detectionService = new AbsenceDetectionService(supabase);
    this.activityService = new EstimatedActivityService(supabase);
    this.validationService = new AntiCheatValidationService(supabase);
    this.coachingService = new AbsenceRecoveryCoachingService(supabase);
    console.log('✅ AbsenceReconciliationService initialized with all sub-services');
  }

  /**
   * Main reconciliation flow when user updates weight after absence
   */
  async reconcileAbsence(payload: WeightUpdatePayload): Promise<ReconciliationResult> {
    console.log('🎯 [ABSENCE_RECONCILIATION] ========== STARTING RECONCILIATION ==========', { userId: payload.userId });
    try {
      logger.info('ABSENCE_RECONCILIATION', 'Starting absence reconciliation', {
        userId: payload.userId,
        newWeight: payload.newWeight
      });

      // 1. Check for active absence
      console.log('🔍 [ABSENCE_RECONCILIATION] Step 1: Detecting absence');
      const absenceDetection = await this.detectionService.detectAbsence(payload.userId);

      if (!absenceDetection.hasActiveAbsence || !absenceDetection.absenceLog) {
        console.log('ℹ️ [ABSENCE_RECONCILIATION] No active absence found, aborting');
        logger.info('ABSENCE_RECONCILIATION', 'No active absence found', { userId: payload.userId });
        return {
          success: false,
          totalPendingXp: 0,
          totalAwardedXp: 0,
          bonusXp: 0,
          weightDelta: 0,
          coherenceScore: 1.0,
          coachMessages: [],
          error: 'No active absence to reconcile'
        };
      }

      const absenceLog = absenceDetection.absenceLog;

      // 2. Get user profile and previous weight
      console.log('📋 [ABSENCE_RECONCILIATION] Step 2: Fetching user profile');
      const profile = await this.getUserProfile(payload.userId);
      if (!profile) {
        throw new Error('User profile not found');
      }

      const previousWeight = profile.weight_kg;
      console.log('⚠️ [ABSENCE_RECONCILIATION] Previous weight', { previousWeight });

      // 3. Get pending XP rewards
      console.log('🎁 [ABSENCE_RECONCILIATION] Step 3: Fetching pending XP');
      const pendingXp = await this.getPendingXpRewards(payload.userId, absenceLog.id);
      const totalPendingXp = pendingXp.reduce((sum, xp) => sum + xp.final_xp, 0);
      console.log('💰 [ABSENCE_RECONCILIATION] Total pending XP', { totalPendingXp, rewardsCount: pendingXp.length });

      // 4. Validate weight change with anti-cheat
      console.log('🔒 [ABSENCE_RECONCILIATION] Step 4: Anti-cheat validation');
      const validation = await this.validationService.validateWeightChange({
        userId: payload.userId,
        daysAbsent: absenceDetection.daysAbsent,
        previousWeight,
        newWeight: payload.newWeight,
        userObjective: profile.objective || 'maintenance',
        estimatedActivity: absenceLog.estimated_activity_data
      });

      logger.info('ABSENCE_RECONCILIATION', 'Weight validation complete', {
        userId: payload.userId,
        isRealistic: validation.isRealistic,
        coherenceScore: validation.coherenceScore,
        flagsCount: validation.validationFlags.length
      });

      // 5. Calculate final XP with multipliers
      console.log('📊 [ABSENCE_RECONCILIATION] Step 5: Calculating final XP');
      const finalMultiplier = validation.adjustedMultiplier;
      const totalAwardedXp = Math.round(totalPendingXp * finalMultiplier);
      console.log('✨ [ABSENCE_RECONCILIATION] XP calculation', { finalMultiplier, totalAwardedXp });

      // 6. Calculate bonus XP for good progress
      console.log('🎁 [ABSENCE_RECONCILIATION] Step 6: Calculating bonus XP');
      const bonusXp = this.calculateBonusXp(
        payload.newWeight - (previousWeight || payload.newWeight),
        profile.objective || 'maintenance',
        validation.coherenceScore
      );
      console.log('🎉 [ABSENCE_RECONCILIATION] Bonus XP calculated', { bonusXp });

      // 7. Create reconciliation record
      console.log('📝 [ABSENCE_RECONCILIATION] Step 7: Creating reconciliation record');
      const reconciliationId = await this.createReconciliationRecord({
        userId: payload.userId,
        absenceLogId: absenceLog.id,
        previousWeight,
        newWeight: payload.newWeight,
        weightDelta: payload.newWeight - (previousWeight || payload.newWeight),
        userObjective: profile.objective || 'maintenance',
        isPositiveProgress: this.isPositiveProgress(
          payload.newWeight - (previousWeight || payload.newWeight),
          profile.objective || 'maintenance'
        ),
        progressQualityScore: validation.coherenceScore,
        totalPendingXp,
        totalAwardedXp,
        bonusXp,
        finalMultiplier,
        isRealistic: validation.isRealistic,
        coherenceScore: validation.coherenceScore,
        validationFlags: validation.validationFlags
      });
      console.log('✅ [ABSENCE_RECONCILIATION] Reconciliation record created', { reconciliationId });

      // 8. Award XP to gamification system
      console.log('🎮 [ABSENCE_RECONCILIATION] Step 8: Awarding XP to gamification');
      await this.awardXpToGamification(
        payload.userId,
        totalAwardedXp + bonusXp,
        'absence_reconciliation'
      );
      console.log('✅ [ABSENCE_RECONCILIATION] XP awarded to gamification');

      // 9. Update pending XP rewards status
      console.log('💾 [ABSENCE_RECONCILIATION] Step 9: Marking XP as awarded');
      await this.markPendingXpAsAwarded(
        pendingXp.map(xp => xp.id),
        totalAwardedXp,
        finalMultiplier
      );
      console.log('✅ [ABSENCE_RECONCILIATION] Pending XP marked as awarded');

      // 10. Update absence log status
      console.log('💾 [ABSENCE_RECONCILIATION] Step 10: Marking absence as reconciled');
      await this.markAbsenceAsReconciled(absenceLog.id, reconciliationId);

      // 11. Update user weight
      console.log('⚠️ [ABSENCE_RECONCILIATION] Step 11: Updating user weight');
      await this.updateUserWeight(payload.userId, payload.newWeight);

      // 12. Generate coaching messages
      console.log('💬 [ABSENCE_RECONCILIATION] Step 12: Generating coaching messages');
      const recoveryContext: RecoveryContext = {
        userId: payload.userId,
        userName: profile.display_name,
        daysAbsent: absenceDetection.daysAbsent,
        pendingXp: totalPendingXp,
        userObjective: profile.objective || 'maintenance',
        lastWeightUpdate: new Date(),
        hasBodyScan: await this.hasBodyScan(payload.userId),
        lastBodyScanDate: await this.getLastBodyScanDate(payload.userId),
        hasAvatar: !!profile.avatar_url,
        lastAvatarUpdate: profile.last_avatar_regeneration_at ? new Date(profile.last_avatar_regeneration_at) : undefined
      };

      const coachMessages = await this.coachingService.generateWelcomeBackMessage(recoveryContext);
      console.log('✅ [ABSENCE_RECONCILIATION] Coach messages generated', { count: coachMessages.length });

      // Add progress celebration
      const celebration = await this.coachingService.generateProgressCelebration(
        recoveryContext,
        payload.newWeight - (previousWeight || payload.newWeight),
        totalAwardedXp + bonusXp,
        validation.coherenceScore
      );
      coachMessages.unshift(celebration);

      console.log('✅ [ABSENCE_RECONCILIATION] ========== RECONCILIATION COMPLETE ==========', {
        reconciliationId,
        totalAwardedXp: totalAwardedXp + bonusXp,
        coherenceScore: validation.coherenceScore
      });
      logger.info('ABSENCE_RECONCILIATION', 'Reconciliation complete', {
        userId: payload.userId,
        reconciliationId,
        totalAwardedXp: totalAwardedXp + bonusXp,
        coherenceScore: validation.coherenceScore
      });

      return {
        success: true,
        reconciliationId,
        totalPendingXp,
        totalAwardedXp,
        bonusXp,
        weightDelta: payload.newWeight - (previousWeight || payload.newWeight),
        coherenceScore: validation.coherenceScore,
        coachMessages
      };
    } catch (error) {
      logger.error('ABSENCE_RECONCILIATION', 'Reconciliation failed', {
        userId: payload.userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        totalPendingXp: 0,
        totalAwardedXp: 0,
        bonusXp: 0,
        weightDelta: 0,
        coherenceScore: 0,
        coachMessages: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check subscription status and absences for user
   */
  async shouldTriggerAbsenceEstimation(userId: string): Promise<boolean> {
    console.log('🔍 [ABSENCE_RECONCILIATION] Checking if should trigger estimation', { userId });
    try {
      // Check subscription status
      const { data: subscription } = await this.supabase
        .from('user_subscriptions')
        .select('status, plan_type')
        .eq('user_id', userId)
        .maybeSingle();

      if (!subscription || subscription.status !== 'active') {
        logger.info('ABSENCE_RECONCILIATION', 'User has no active subscription', { userId });
        return false;
      }

      // Check if already has active absence
      const existingAbsence = await this.detectionService.getActiveAbsence(userId);
      if (existingAbsence) {
        logger.info('ABSENCE_RECONCILIATION', 'User already has active absence', { userId });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('ABSENCE_RECONCILIATION', 'Failed to check estimation trigger', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Get pending XP rewards for user
   */
  private async getPendingXpRewards(userId: string, absenceLogId: string) {
    const { data, error } = await this.supabase
      .from('pending_xp_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('absence_log_id', absenceLogId)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  }

  /**
   * Create reconciliation record
   */
  private async createReconciliationRecord(data: any): Promise<string> {
    const { data: record, error } = await this.supabase
      .from('absence_reconciliations')
      .insert({
        user_id: data.userId,
        absence_log_id: data.absenceLogId,
        previous_weight_kg: data.previousWeight,
        new_weight_kg: data.newWeight,
        weight_delta_kg: data.weightDelta,
        user_objective: data.userObjective,
        is_positive_progress: data.isPositiveProgress,
        progress_quality_score: data.progressQualityScore,
        total_pending_xp: data.totalPendingXp,
        total_awarded_xp: data.totalAwardedXp,
        bonus_xp: data.bonusXp,
        final_multiplier: data.finalMultiplier,
        is_realistic: data.isRealistic,
        coherence_score: data.coherenceScore,
        validation_flags: data.validationFlags
      })
      .select('id')
      .single();

    if (error) throw error;
    return record.id;
  }

  /**
   * Award XP to gamification system using idempotent function
   */
  private async awardXpToGamification(userId: string, xp: number, eventType: string): Promise<void> {
    console.log('🎮 [ABSENCE_RECONCILIATION] Awarding XP', { userId, xp, eventType });

    // Use the idempotent XP award function from the database
    // This prevents duplicate XP awards and handles all gamification updates
    const { data, error } = await this.supabase.rpc('award_xp_idempotent', {
      p_user_id: userId,
      p_event_type: eventType,
      p_event_category: 'general', // Must use 'general' - 'absence' is not in the check constraint
      p_base_xp: xp,
      p_source_table: 'absence_rewards',
      p_source_record_id: userId, // Use userId as source since we're reconciling multiple rewards
      p_event_metadata: {
        source: 'absence_reconciliation',
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      logger.error('ABSENCE_RECONCILIATION', 'Failed to award XP', {
        userId,
        xp,
        error: error.message
      });
      throw error;
    }

    console.log('✅ [ABSENCE_RECONCILIATION] XP awarded successfully', { result: data });
  }

  /**
   * Mark pending XP as awarded
   */
  private async markPendingXpAsAwarded(
    rewardIds: string[],
    awardedXp: number,
    multiplier: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('pending_xp_rewards')
      .update({
        status: 'awarded',
        awarded_at: new Date().toISOString(),
        awarded_xp: awardedXp,
        award_multiplier: multiplier
      })
      .in('id', rewardIds);

    if (error) throw error;
  }

  /**
   * Mark absence as reconciled
   */
  private async markAbsenceAsReconciled(absenceLogId: string, reconciliationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('absence_logs')
      .update({
        status: 'reconciled',
        reconciled_at: new Date().toISOString(),
        reconciliation_id: reconciliationId
      })
      .eq('id', absenceLogId);

    if (error) throw error;
  }

  /**
   * Update user weight in profile
   */
  private async updateUserWeight(userId: string, newWeight: number): Promise<void> {
    const { error } = await this.supabase
      .from('user_profile')
      .update({
        weight_kg: newWeight,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Get user profile
   */
  private async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profile')
      .select('weight_kg, objective, display_name, avatar_url, last_avatar_regeneration_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Calculate bonus XP for good progress
   */
  private calculateBonusXp(weightDelta: number, objective: string, coherenceScore: number): number {
    let bonusXp = 0;

    // Only award bonus for high coherence (realistic progress)
    if (coherenceScore < 0.7) return 0;

    const weeks = Math.abs(weightDelta) / 0.7; // Assume weekly rate

    switch (objective) {
      case 'fat_loss':
        if (weightDelta < 0 && weeks >= 0.5 && weeks <= 1.0) {
          bonusXp = Math.round(Math.abs(weightDelta) * 50); // 50 XP per kg lost optimally
        }
        break;

      case 'muscle_gain':
        if (weightDelta > 0 && weeks >= 0.2 && weeks <= 0.5) {
          bonusXp = Math.round(weightDelta * 75); // 75 XP per kg gained optimally
        }
        break;

      case 'maintenance':
        if (Math.abs(weightDelta) <= 0.5) {
          bonusXp = 100; // Flat bonus for maintaining weight
        }
        break;

      case 'recomposition':
        if (Math.abs(weightDelta) <= 0.3) {
          bonusXp = 150; // Recomp is hardest, bigger bonus
        }
        break;
    }

    return bonusXp;
  }

  /**
   * Check if progress is positive based on objective
   */
  private isPositiveProgress(weightDelta: number, objective: string): boolean {
    switch (objective) {
      case 'fat_loss':
        return weightDelta < 0;
      case 'muscle_gain':
        return weightDelta > 0;
      case 'maintenance':
        return Math.abs(weightDelta) <= 0.5;
      case 'recomposition':
        return Math.abs(weightDelta) <= 0.3;
      default:
        return true;
    }
  }

  /**
   * Check if user has body scan
   */
  private async hasBodyScan(userId: string): Promise<boolean> {
    const { count } = await this.supabase
      .from('body_scans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    return (count || 0) > 0;
  }

  /**
   * Get last body scan date
   */
  private async getLastBodyScanDate(userId: string): Promise<Date | undefined> {
    const { data } = await this.supabase
      .from('body_scans')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? new Date(data.created_at) : undefined;
  }
}
