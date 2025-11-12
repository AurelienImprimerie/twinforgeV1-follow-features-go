/**
 * AntiCheatValidationService - Validates weight changes and detects suspicious patterns
 * Ensures absence reconciliation system integrity by preventing abuse
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '@/lib/utils/logger';

export interface WeightChangeValidation {
  isRealistic: boolean;
  coherenceScore: number; // 0-1, higher = more realistic
  validationFlags: string[];
  adjustedMultiplier: number; // Final XP multiplier after validation
  recommendation: string;
}

export interface ValidationContext {
  userId: string;
  daysAbsent: number;
  previousWeight?: number;
  newWeight: number;
  userObjective: string;
  estimatedActivity: any; // From absence_logs.estimated_activity_data
}

export class AntiCheatValidationService {
  private supabase: SupabaseClient;

  // Realistic weight change limits per week
  private readonly MAX_WEIGHT_LOSS_PER_WEEK = 1.0; // kg
  private readonly MAX_WEIGHT_GAIN_PER_WEEK = 0.5; // kg
  private readonly EXTREME_LOSS_THRESHOLD = 1.5; // kg/week
  private readonly EXTREME_GAIN_THRESHOLD = 0.8; // kg/week

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    console.log('✅ AntiCheatValidationService initialized');
  }

  /**
   * Validate weight change during absence reconciliation
   */
  async validateWeightChange(context: ValidationContext): Promise<WeightChangeValidation> {
    console.log('🔍 [ANTI_CHEAT] Starting weight validation', { userId: context.userId, daysAbsent: context.daysAbsent });
    try {
      logger.info('ANTI_CHEAT', 'Validating weight change', {
        userId: context.userId,
        daysAbsent: context.daysAbsent,
        previousWeight: context.previousWeight,
        newWeight: context.newWeight,
        objective: context.userObjective
      });

      const flags: string[] = [];
      let coherenceScore = 1.0;

      // If no previous weight, trust the new weight but with lower confidence
      if (!context.previousWeight) {
        console.log('⚠️ [ANTI_CHEAT] No previous weight found');
        logger.info('ANTI_CHEAT', 'No previous weight, accepting new weight with lower confidence');
        return {
          isRealistic: true,
          coherenceScore: 0.7,
          validationFlags: ['no_previous_weight'],
          adjustedMultiplier: 0.7,
          recommendation: 'Weight accepted but flagged for manual review'
        };
      }

      const weightDelta = context.newWeight - context.previousWeight;
      const weeks = context.daysAbsent / 7;
      console.log('📊 [ANTI_CHEAT] Weight delta calculated', { weightDelta, weeks });

      // Validate weight change rate
      const weeklyChange = Math.abs(weightDelta) / weeks;

      // Check for unrealistic changes
      if (weightDelta < 0) {
        // Weight loss
        if (weeklyChange > this.EXTREME_LOSS_THRESHOLD) {
          console.log('🚨 [ANTI_CHEAT] Extreme weight loss detected', { weeklyChange, threshold: this.EXTREME_LOSS_THRESHOLD });
          flags.push('extreme_weight_loss');
          coherenceScore *= 0.3;
        } else if (weeklyChange > this.MAX_WEIGHT_LOSS_PER_WEEK) {
          console.log('⚠️ [ANTI_CHEAT] High weight loss detected', { weeklyChange });
          flags.push('high_weight_loss');
          coherenceScore *= 0.6;
        }
      } else if (weightDelta > 0) {
        // Weight gain
        if (weeklyChange > this.EXTREME_GAIN_THRESHOLD) {
          console.log('🚨 [ANTI_CHEAT] Extreme weight gain detected', { weeklyChange, threshold: this.EXTREME_GAIN_THRESHOLD });
          flags.push('extreme_weight_gain');
          coherenceScore *= 0.3;
        } else if (weeklyChange > this.MAX_WEIGHT_GAIN_PER_WEEK) {
          console.log('⚠️ [ANTI_CHEAT] High weight gain detected', { weeklyChange });
          flags.push('high_weight_gain');
          coherenceScore *= 0.6;
        }
      }

      // Validate against user objective
      console.log('🎯 [ANTI_CHEAT] Validating against user objective', { objective: context.userObjective });
      const objectiveCheck = this.validateAgainstObjective(
        weightDelta,
        context.userObjective,
        weeks
      );
      coherenceScore *= objectiveCheck.multiplier;
      flags.push(...objectiveCheck.flags);

      // Check for suspicious patterns
      console.log('🔍 [ANTI_CHEAT] Checking for suspicious patterns');
      const patternCheck = await this.checkSuspiciousPatterns(context.userId, context.newWeight);
      coherenceScore *= patternCheck.multiplier;
      flags.push(...patternCheck.flags);

      // Validate against estimated activity
      console.log('⚙️ [ANTI_CHEAT] Validating against estimated activity');
      const activityCheck = this.validateAgainstEstimatedActivity(
        weightDelta,
        context.estimatedActivity,
        context.daysAbsent
      );
      coherenceScore *= activityCheck.multiplier;
      flags.push(...activityCheck.flags);

      // Check absence frequency (too many absences = suspicious)
      console.log('📅 [ANTI_CHEAT] Checking absence frequency');
      const frequencyCheck = await this.checkAbsenceFrequency(context.userId);
      coherenceScore *= frequencyCheck.multiplier;
      flags.push(...frequencyCheck.flags);

      // Final determination
      const isRealistic = coherenceScore >= 0.5;
      console.log('✅ [ANTI_CHEAT] Final validation result', { isRealistic, coherenceScore, flagsCount: flags.length });
      const adjustedMultiplier = this.calculateAdjustedMultiplier(
        coherenceScore,
        weightDelta,
        context.userObjective
      );

      const recommendation = this.generateRecommendation(
        coherenceScore,
        flags,
        weightDelta,
        context.userObjective
      );

      logger.info('ANTI_CHEAT', 'Validation complete', {
        userId: context.userId,
        isRealistic,
        coherenceScore,
        flagsCount: flags.length,
        adjustedMultiplier
      });

      return {
        isRealistic,
        coherenceScore: Math.max(0, Math.min(1, coherenceScore)),
        validationFlags: flags,
        adjustedMultiplier,
        recommendation
      };
    } catch (error) {
      logger.error('ANTI_CHEAT', 'Validation failed', {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error)
      });

      // On error, be conservative
      return {
        isRealistic: false,
        coherenceScore: 0.5,
        validationFlags: ['validation_error'],
        adjustedMultiplier: 0.5,
        recommendation: 'Manual review required due to validation error'
      };
    }
  }

  /**
   * Validate weight change against user objective
   */
  private validateAgainstObjective(
    weightDelta: number,
    objective: string,
    weeks: number
  ): { multiplier: number; flags: string[] } {
    const flags: string[] = [];
    let multiplier = 1.0;

    switch (objective) {
      case 'fat_loss':
        if (weightDelta > 0) {
          // Gaining weight during fat loss objective
          flags.push('weight_gain_during_fat_loss');
          multiplier = 0.6;
        } else if (weightDelta < 0) {
          // Good progress
          const weeklyLoss = Math.abs(weightDelta) / weeks;
          if (weeklyLoss >= 0.5 && weeklyLoss <= 1.0) {
            console.log('⭐ [ANTI_CHEAT] Excellent fat loss progress detected', { weeklyLoss });
            flags.push('excellent_fat_loss_progress');
            multiplier = 1.2; // Bonus for good progress
          }
        }
        break;

      case 'muscle_gain':
        if (weightDelta < 0) {
          // Losing weight during muscle gain objective
          flags.push('weight_loss_during_muscle_gain');
          multiplier = 0.6;
        } else if (weightDelta > 0) {
          // Good progress
          const weeklyGain = weightDelta / weeks;
          if (weeklyGain >= 0.2 && weeklyGain <= 0.5) {
            console.log('⭐ [ANTI_CHEAT] Excellent muscle gain progress detected', { weeklyGain });
            flags.push('excellent_muscle_gain_progress');
            multiplier = 1.2; // Bonus for good progress
          }
        }
        break;

      case 'maintenance':
        const weeklyChange = Math.abs(weightDelta) / weeks;
        if (weeklyChange <= 0.2) {
          flags.push('excellent_maintenance');
          multiplier = 1.1;
        } else if (weeklyChange > 0.5) {
          flags.push('significant_weight_change_during_maintenance');
          multiplier = 0.8;
        }
        break;

      case 'recomposition':
        // For recomp, we expect minimal weight change
        const weeklyRecompChange = Math.abs(weightDelta) / weeks;
        if (weeklyRecompChange <= 0.3) {
          flags.push('excellent_recomp_progress');
          multiplier = 1.15;
        } else if (weeklyRecompChange > 0.6) {
          flags.push('high_weight_change_during_recomp');
          multiplier = 0.75;
        }
        break;
    }

    return { multiplier, flags };
  }

  /**
   * Check for suspicious patterns in user history
   */
  private async checkSuspiciousPatterns(
    userId: string,
    newWeight: number
  ): Promise<{ multiplier: number; flags: string[] }> {
    const flags: string[] = [];
    let multiplier = 1.0;

    try {
      // Get recent absence reconciliations (last 90 days) to check for patterns
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

      const { data: recentReconciliations } = await this.supabase
        .from('absence_reconciliations')
        .select('new_weight_kg, weight_delta_kg, created_at')
        .eq('user_id', userId)
        .gte('created_at', ninetyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!recentReconciliations || recentReconciliations.length === 0) {
        // No history to check - neutral multiplier
        return { multiplier, flags };
      }

      // Check for yo-yo pattern (rapid weight fluctuations)
      const recentWeights = recentReconciliations.map(r => r.new_weight_kg);
      if (recentWeights.length >= 3) {
        const weightVariance = this.calculateVariance(recentWeights);

        if (weightVariance > 10) {
          flags.push('high_weight_variance_pattern');
          multiplier *= 0.8;
        }

        // Check if new weight is far from recent average
        const avgRecentWeight = recentWeights.reduce((sum, w) => sum + w, 0) / recentWeights.length;
        const deviationFromAvg = Math.abs(newWeight - avgRecentWeight);

        if (deviationFromAvg > 5) {
          flags.push('weight_far_from_recent_average');
          multiplier *= 0.85;
        }
      }

      // Check reconciliation frequency (too many reconciliations = suspicious)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: recentCount } = await this.supabase
        .from('absence_reconciliations')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo);

      if (recentCount && recentCount.length > 5) {
        flags.push('excessive_reconciliations');
        multiplier *= 0.9;
      }
    } catch (error) {
      logger.error('ANTI_CHEAT', 'Failed to check suspicious patterns', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return { multiplier, flags };
  }

  /**
   * Validate weight change against estimated activity during absence
   */
  private validateAgainstEstimatedActivity(
    weightDelta: number,
    estimatedActivity: any,
    daysAbsent: number
  ): { multiplier: number; flags: string[] } {
    const flags: string[] = [];
    let multiplier = 1.0;

    if (!estimatedActivity?.days || estimatedActivity.days.length === 0) {
      flags.push('no_activity_estimation');
      return { multiplier: 0.8, flags };
    }

    // Calculate expected weight change based on estimated calorie balance
    const totalCalorieBalance = estimatedActivity.days.reduce(
      (sum: number, day: any) => sum + ((day.estimated_calories_in || 0) - (day.estimated_calories_out || 0)),
      0
    );

    // 7700 calories = 1kg of body weight (approx)
    const expectedWeightChange = totalCalorieBalance / 7700;
    const actualWeightChange = weightDelta;

    const difference = Math.abs(actualWeightChange - expectedWeightChange);

    if (difference > 2) {
      flags.push('weight_change_inconsistent_with_estimated_activity');
      multiplier *= 0.7;
    } else if (difference > 1) {
      flags.push('moderate_inconsistency_with_activity');
      multiplier *= 0.85;
    } else if (difference < 0.5) {
      flags.push('excellent_consistency_with_activity');
      multiplier *= 1.1;
    }

    return { multiplier, flags };
  }

  /**
   * Check absence frequency to detect abuse
   */
  private async checkAbsenceFrequency(userId: string): Promise<{ multiplier: number; flags: string[] }> {
    const flags: string[] = [];
    let multiplier = 1.0;

    try {
      // Count absences in last 90 days
      const { count: absenceCount } = await this.supabase
        .from('absence_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('detected_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (absenceCount && absenceCount > 5) {
        flags.push('frequent_absences');
        multiplier *= 0.7;
      } else if (absenceCount && absenceCount > 3) {
        flags.push('moderate_absence_frequency');
        multiplier *= 0.85;
      }

      // Check for pattern of short absences (potential gaming the system)
      const { data: recentAbsences } = await this.supabase
        .from('absence_logs')
        .select('days_absent')
        .eq('user_id', userId)
        .order('detected_at', { ascending: false })
        .limit(5);

      if (recentAbsences && recentAbsences.length >= 3) {
        const allShortAbsences = recentAbsences.every(a => a.days_absent <= 3);
        if (allShortAbsences) {
          flags.push('pattern_of_short_absences');
          multiplier *= 0.8;
        }
      }
    } catch (error) {
      logger.error('ANTI_CHEAT', 'Failed to check absence frequency', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return { multiplier, flags };
  }

  /**
   * Calculate final adjusted multiplier for XP attribution
   */
  private calculateAdjustedMultiplier(
    coherenceScore: number,
    weightDelta: number,
    objective: string
  ): number {
    // Base multiplier from coherence (0.5-0.7 for estimated XP)
    let multiplier = 0.5 + (coherenceScore * 0.2);

    // Bonus for good progress aligned with objective
    if (objective === 'fat_loss' && weightDelta < 0) {
      const weeks = Math.abs(weightDelta) / 0.7; // Optimal loss rate
      if (weeks >= 0.5 && weeks <= 1.0) {
        multiplier += 0.1;
      }
    } else if (objective === 'muscle_gain' && weightDelta > 0) {
      const weeks = weightDelta / 0.35; // Optimal gain rate
      if (weeks >= 0.2 && weeks <= 0.5) {
        multiplier += 0.1;
      }
    }

    // Cap multiplier between 0.3 and 1.0
    return Math.max(0.3, Math.min(1.0, multiplier));
  }

  /**
   * Generate human-readable recommendation
   */
  private generateRecommendation(
    coherenceScore: number,
    flags: string[],
    weightDelta: number,
    objective: string
  ): string {
    if (coherenceScore >= 0.8) {
      return 'Excellent progress! Weight change is realistic and aligned with your objective.';
    } else if (coherenceScore >= 0.6) {
      return 'Good progress. Weight change appears reasonable with minor concerns.';
    } else if (coherenceScore >= 0.4) {
      return 'Weight change flagged for review. Some concerns detected but not blocking.';
    } else {
      return 'Significant concerns detected. Manual review recommended before full points attribution.';
    }
  }

  /**
   * Calculate variance for weight history
   */
  private calculateVariance(weights: number[]): number {
    if (weights.length === 0) return 0;

    const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const squaredDiffs = weights.map(w => Math.pow(w - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / weights.length;

    return Math.sqrt(variance);
  }
}
