/**
 * GamificationPredictionService
 *
 * Service de prédiction UNIVERSEL basé sur l'engagement et l'activité
 * Fonctionne pour TOUS les objectifs: fat_loss, muscle_gain, recomp
 * Ne dépend PAS uniquement de TransformationPredictionService
 */

import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';

export interface UniversalLevelPrediction {
  // Current state
  currentLevel: number;
  currentXp: number;
  totalXpEarned: number;

  // Predictions (3 timeframes)
  predictions: {
    thirtyDays: PredictionTimeframe;
    sixtyDays: PredictionTimeframe;
    ninetyDays: PredictionTimeframe;
  };

  // Best prediction (most relevant)
  primaryPrediction: PredictionTimeframe;

  // Activity metrics
  activityMetrics: {
    averageXpPerDay: number;
    last7DaysXp: number;
    last30DaysXp: number;
    currentStreak: number;
    totalActions: number;
  };

  // Confidence and quality
  confidenceScore: number;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';

  // Motivational
  motivationalMessage: string;
  nextMilestone: {
    level: number;
    xpNeeded: number;
    daysAtCurrentPace: number;
  };

  // User context
  objective: 'fat_loss' | 'muscle_gain' | 'recomp' | null;
  hasEnoughData: boolean;
}

export interface PredictionTimeframe {
  days: number;
  predictedLevel: number;
  predictedXp: number;
  xpToGain: number;
  levelsToGain: number;
  projectionMethod: 'conservative' | 'realistic' | 'optimistic';
}

class GamificationPredictionService {
  /**
   * Generate universal prediction based on activity, not weight goals
   */
  async predictLevel(userId: string): Promise<UniversalLevelPrediction | null> {
    try {
      logger.info('PREDICTION_V2', 'Generating universal level prediction', { userId });

      // Get current gamification progress
      const { data: gamificationProgress } = await supabase
        .from('user_gamification_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!gamificationProgress) {
        logger.warn('PREDICTION_V2', 'No gamification progress found', { userId });
        return null;
      }

      // Get user profile for objective
      const { data: profile } = await supabase
        .from('user_profile')
        .select('objective')
        .eq('user_id', userId)
        .maybeSingle();

      // Calculate activity metrics
      const activityMetrics = await this.calculateActivityMetrics(userId);

      // Check data quality
      const dataQuality = this.assessDataQuality(activityMetrics);
      const hasEnoughData = dataQuality !== 'poor';

      if (!hasEnoughData) {
        return this.buildLowDataPrediction(gamificationProgress, activityMetrics, profile?.objective);
      }

      // Generate predictions for 3 timeframes
      const thirtyDaysPrediction = this.projectLevel(
        gamificationProgress.total_xp_earned,
        activityMetrics.averageXpPerDay,
        30,
        'conservative'
      );

      const sixtyDaysPrediction = this.projectLevel(
        gamificationProgress.total_xp_earned,
        activityMetrics.averageXpPerDay,
        60,
        'realistic'
      );

      const ninetyDaysPrediction = this.projectLevel(
        gamificationProgress.total_xp_earned,
        activityMetrics.averageXpPerDay,
        90,
        'optimistic'
      );

      // Determine primary prediction based on user activity level
      const primaryPrediction = this.selectPrimaryPrediction(
        { thirtyDays: thirtyDaysPrediction, sixtyDays: sixtyDaysPrediction, ninetyDays: ninetyDaysPrediction },
        activityMetrics
      );

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(activityMetrics, dataQuality);

      // Generate motivational message
      const motivationalMessage = this.generateMotivationalMessage(
        primaryPrediction,
        gamificationProgress.current_level,
        profile?.objective || null,
        activityMetrics
      );

      // Calculate next milestone
      const nextMilestone = await this.calculateNextMilestone(
        gamificationProgress.current_level,
        gamificationProgress.total_xp_earned,
        activityMetrics.averageXpPerDay
      );

      const prediction: UniversalLevelPrediction = {
        currentLevel: gamificationProgress.current_level,
        currentXp: gamificationProgress.current_xp,
        totalXpEarned: gamificationProgress.total_xp_earned,
        predictions: {
          thirtyDays: thirtyDaysPrediction,
          sixtyDays: sixtyDaysPrediction,
          ninetyDays: ninetyDaysPrediction
        },
        primaryPrediction,
        activityMetrics,
        confidenceScore,
        dataQuality,
        motivationalMessage,
        nextMilestone,
        objective: profile?.objective || null,
        hasEnoughData
      };

      logger.info('PREDICTION_V2', 'Prediction generated successfully', {
        userId,
        primaryLevel: primaryPrediction.predictedLevel,
        confidence: confidenceScore,
        dataQuality
      });

      return prediction;

    } catch (error) {
      logger.error('PREDICTION_V2', 'Failed to generate prediction', { userId, error });
      return null;
    }
  }

  /**
   * Calculate activity metrics from XP events
   */
  private async calculateActivityMetrics(userId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data: events } = await supabase
      .from('xp_events_log')
      .select('final_xp, event_date')
      .eq('user_id', userId)
      .gte('event_date', thirtyDaysAgo.toISOString());

    const { data: progress } = await supabase
      .from('user_gamification_progress')
      .select('current_streak_days')
      .eq('user_id', userId)
      .maybeSingle();

    const last7DaysXp = (events || [])
      .filter(e => new Date(e.event_date) >= sevenDaysAgo)
      .reduce((sum, e) => sum + e.final_xp, 0);

    const last30DaysXp = (events || []).reduce((sum, e) => sum + e.final_xp, 0);

    const averageXpPerDay = last30DaysXp > 0 ? Math.round(last30DaysXp / 30) : 0;

    return {
      averageXpPerDay,
      last7DaysXp,
      last30DaysXp,
      currentStreak: progress?.current_streak_days || 0,
      totalActions: events?.length || 0
    };
  }

  /**
   * Assess data quality based on activity
   */
  private assessDataQuality(metrics: any): 'excellent' | 'good' | 'fair' | 'poor' {
    if (metrics.totalActions >= 30 && metrics.averageXpPerDay >= 50) {
      return 'excellent';
    }
    if (metrics.totalActions >= 15 && metrics.averageXpPerDay >= 30) {
      return 'good';
    }
    if (metrics.totalActions >= 7 && metrics.averageXpPerDay >= 10) {
      return 'fair';
    }
    return 'poor';
  }

  /**
   * Project level at future date based on current pace
   */
  private projectLevel(
    currentTotalXp: number,
    averageXpPerDay: number,
    days: number,
    method: 'conservative' | 'realistic' | 'optimistic'
  ): PredictionTimeframe {
    // Apply multiplier based on method
    let multiplier = 1.0;
    if (method === 'conservative') multiplier = 0.8;
    if (method === 'optimistic') multiplier = 1.2;

    const projectedXpGain = Math.round(averageXpPerDay * days * multiplier);
    const projectedTotalXp = currentTotalXp + projectedXpGain;
    const predictedLevel = this.calculateLevelFromXp(projectedTotalXp);
    const currentLevel = this.calculateLevelFromXp(currentTotalXp);

    return {
      days,
      predictedLevel,
      predictedXp: projectedTotalXp,
      xpToGain: projectedXpGain,
      levelsToGain: predictedLevel - currentLevel,
      projectionMethod: method
    };
  }

  /**
   * Calculate level from total XP (same logic as database)
   */
  private calculateLevelFromXp(totalXp: number): number {
    let level = 1;
    let xpNeeded = 0;

    // Levels 1-10: 100 XP per level
    for (let i = 1; i <= 10; i++) {
      xpNeeded += 100;
      if (totalXp >= xpNeeded) {
        level = i + 1;
      } else {
        return level;
      }
    }

    // Levels 11-25: 150 XP per level
    for (let i = 11; i <= 25; i++) {
      xpNeeded += 150;
      if (totalXp >= xpNeeded) {
        level = i + 1;
      } else {
        return level;
      }
    }

    // Levels 26-50: 200 XP per level
    for (let i = 26; i <= 50; i++) {
      xpNeeded += 200;
      if (totalXp >= xpNeeded) {
        level = i + 1;
      } else {
        return level;
      }
    }

    // Levels 51-75: 300 XP per level
    for (let i = 51; i <= 75; i++) {
      xpNeeded += 300;
      if (totalXp >= xpNeeded) {
        level = i + 1;
      } else {
        return level;
      }
    }

    // Levels 76-100: 500 XP per level
    for (let i = 76; i <= 100; i++) {
      xpNeeded += 500;
      if (totalXp >= xpNeeded) {
        level = i + 1;
      } else {
        return level;
      }
    }

    // Beyond 100: exponential
    let xpPerLevel = 600;
    while (level <= 999999) {
      if (level > 100 && (level - 100) % 10 === 0) {
        xpPerLevel += 50;
      }
      xpNeeded += xpPerLevel;
      if (totalXp >= xpNeeded) {
        level++;
      } else {
        return level;
      }
    }

    return level;
  }

  /**
   * Select most relevant prediction as primary
   */
  private selectPrimaryPrediction(
    predictions: { thirtyDays: PredictionTimeframe; sixtyDays: PredictionTimeframe; ninetyDays: PredictionTimeframe },
    metrics: any
  ): PredictionTimeframe {
    // High activity users: 30 days
    if (metrics.averageXpPerDay >= 100) {
      return predictions.thirtyDays;
    }
    // Medium activity: 60 days
    if (metrics.averageXpPerDay >= 50) {
      return predictions.sixtyDays;
    }
    // Low activity: 90 days
    return predictions.ninetyDays;
  }

  /**
   * Calculate confidence score 0-100
   */
  private calculateConfidenceScore(metrics: any, quality: string): number {
    let score = 0;

    // Base on data quality
    if (quality === 'excellent') score += 50;
    else if (quality === 'good') score += 35;
    else if (quality === 'fair') score += 20;
    else score += 5;

    // Bonus for streak
    if (metrics.currentStreak >= 7) score += 20;
    else if (metrics.currentStreak >= 3) score += 10;

    // Bonus for consistency
    if (metrics.averageXpPerDay >= 100) score += 30;
    else if (metrics.averageXpPerDay >= 50) score += 20;
    else if (metrics.averageXpPerDay >= 30) score += 10;

    return Math.min(100, score);
  }

  /**
   * Generate motivational message
   */
  private generateMotivationalMessage(
    prediction: PredictionTimeframe,
    currentLevel: number,
    objective: string | null,
    metrics: any
  ): string {
    const levelsToGain = prediction.levelsToGain;
    const timeframe = prediction.days;

    if (levelsToGain >= 20) {
      return `Progression MASSIVE en vue! Tu vas gagner ${levelsToGain} niveaux d'ici ${Math.round(timeframe/30)} mois. C'est ÉNORME!`;
    }

    if (levelsToGain >= 10) {
      return `Excellent rythme! Tu vas monter de ${levelsToGain} niveaux en ${Math.round(timeframe/30)} mois. Continue comme ça!`;
    }

    if (levelsToGain >= 5) {
      return `Belle progression! ${levelsToGain} niveaux en ${Math.round(timeframe/30)} mois, c'est solide!`;
    }

    if (metrics.averageXpPerDay < 30) {
      return `Augmente ton activité quotidienne pour progresser plus vite! ${levelsToGain} niveaux en ${Math.round(timeframe/30)} mois.`;
    }

    return `Progression constante! Tu vas gagner ${levelsToGain} niveaux. Chaque action compte!`;
  }

  /**
   * Calculate next milestone info
   */
  private async calculateNextMilestone(
    currentLevel: number,
    currentTotalXp: number,
    averageXpPerDay: number
  ) {
    const nextLevel = currentLevel + 1;
    const nextLevelXp = this.getXpForLevel(nextLevel);
    const xpNeeded = nextLevelXp - currentTotalXp;
    const daysAtCurrentPace = averageXpPerDay > 0 ? Math.ceil(xpNeeded / averageXpPerDay) : 999;

    return {
      level: nextLevel,
      xpNeeded,
      daysAtCurrentPace
    };
  }

  /**
   * Get total XP needed for a level
   */
  private getXpForLevel(level: number): number {
    let totalXp = 0;

    // Levels 1-10
    totalXp += Math.min(level - 1, 10) * 100;

    // Levels 11-25
    if (level > 10) {
      totalXp += Math.min(level - 10, 15) * 150;
    }

    // Levels 26-50
    if (level > 25) {
      totalXp += Math.min(level - 25, 25) * 200;
    }

    // Levels 51-75
    if (level > 50) {
      totalXp += Math.min(level - 50, 25) * 300;
    }

    // Levels 76-100
    if (level > 75) {
      totalXp += Math.min(level - 75, 25) * 500;
    }

    // Beyond 100
    if (level > 100) {
      let xpPerLevel = 600;
      for (let i = 101; i <= level; i++) {
        if ((i - 100) % 10 === 0) {
          xpPerLevel += 50;
        }
        totalXp += xpPerLevel;
      }
    }

    return totalXp;
  }

  /**
   * Build prediction when not enough data
   */
  private buildLowDataPrediction(
    gamificationProgress: any,
    metrics: any,
    objective: string | null
  ): UniversalLevelPrediction {
    const conservativePrediction: PredictionTimeframe = {
      days: 30,
      predictedLevel: gamificationProgress.current_level + 2,
      predictedXp: gamificationProgress.total_xp_earned + 200,
      xpToGain: 200,
      levelsToGain: 2,
      projectionMethod: 'conservative'
    };

    return {
      currentLevel: gamificationProgress.current_level,
      currentXp: gamificationProgress.current_xp,
      totalXpEarned: gamificationProgress.total_xp_earned,
      predictions: {
        thirtyDays: conservativePrediction,
        sixtyDays: { ...conservativePrediction, days: 60, levelsToGain: 4, predictedLevel: gamificationProgress.current_level + 4 },
        ninetyDays: { ...conservativePrediction, days: 90, levelsToGain: 6, predictedLevel: gamificationProgress.current_level + 6 }
      },
      primaryPrediction: conservativePrediction,
      activityMetrics: metrics,
      confidenceScore: 15,
      dataQuality: 'poor',
      motivationalMessage: 'Continue d\'enregistrer tes actions pour une prédiction plus précise!',
      nextMilestone: {
        level: gamificationProgress.current_level + 1,
        xpNeeded: 100,
        daysAtCurrentPace: 999
      },
      objective,
      hasEnoughData: false
    };
  }
}

export const gamificationPredictionService = new GamificationPredictionService();

// Legacy export for backward compatibility
export const gamificationPredictionV2Service = gamificationPredictionService;
