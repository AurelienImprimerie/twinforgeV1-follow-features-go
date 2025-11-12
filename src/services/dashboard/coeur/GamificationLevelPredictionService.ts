/**
 * GamificationLevelPredictionService
 *
 * Predicts the gamification level a user will reach when they achieve their target weight.
 * Integrates with TransformationPredictionService to provide timeline and confidence scores.
 */

import { supabase } from '@/system/supabase/client';
import { transformationPredictionService } from './TransformationPredictionService';
import logger from '@/lib/utils/logger';

export interface LevelPrediction {
  // Current state
  currentLevel: number;
  currentXp: number;

  // Target prediction
  predictedLevelAtTarget: number;
  levelsToGain: number;
  totalXpNeeded: number;
  xpPerWeek: number;

  // Timeline
  weeksToTarget: number;
  daysToTarget: number;
  monthsToTarget: number;
  estimatedDate: string;

  // Confidence and scenarios
  confidenceScore: number;
  optimisticLevel: number;
  pessimisticLevel: number;

  // Motivational context
  motivationalMessage: string;
  progressPercentage: number;

  // Requirements
  weightToGo: number;
  currentWeight: number;
  targetWeight: number;

  hasEnoughData: boolean;
}

export interface XpProjection {
  currentXp: number;
  projectedXpAtTarget: number;
  xpGainNeeded: number;
  averageXpPerDay: number;
}

class GamificationLevelPredictionService {
  /**
   * Generate a complete level prediction for a user
   */
  async predictLevel(userId: string): Promise<LevelPrediction | null> {
    try {
      logger.info('LEVEL_PREDICTION', 'Generating level prediction', { userId });

      // Get current gamification progress
      const { data: gamificationProgress } = await supabase
        .from('user_gamification_progress')
        .select('current_level, current_xp, total_xp_earned')
        .eq('user_id', userId)
        .maybeSingle();

      if (!gamificationProgress) {
        logger.warn('LEVEL_PREDICTION', 'No gamification progress found', { userId });
        return null;
      }

      // Get transformation prediction
      const transformationPrediction = await transformationPredictionService.getActivePrediction(userId);

      if (!transformationPrediction) {
        logger.warn('LEVEL_PREDICTION', 'No transformation prediction available', { userId });
        return null;
      }

      // Not enough data for prediction
      if (transformationPrediction.confidenceScore < 20 || transformationPrediction.dataPoints < 3) {
        return this.buildLowConfidencePrediction(gamificationProgress, transformationPrediction);
      }

      // Calculate XP projection
      const xpProjection = await this.calculateXpProjection(
        userId,
        transformationPrediction.daysToTarget,
        gamificationProgress.total_xp_earned
      );

      // Calculate predicted level at target weight
      const predictedLevel = this.calculateLevelFromXp(xpProjection.projectedXpAtTarget);
      const levelsToGain = predictedLevel - gamificationProgress.current_level;

      // Calculate scenarios
      const optimisticDays = Math.round(transformationPrediction.daysToTarget * 0.7);
      const pessimisticDays = Math.round(transformationPrediction.daysToTarget * 1.3);

      const optimisticXp = gamificationProgress.total_xp_earned + (xpProjection.averageXpPerDay * optimisticDays);
      const pessimisticXp = gamificationProgress.total_xp_earned + (xpProjection.averageXpPerDay * pessimisticDays);

      const optimisticLevel = this.calculateLevelFromXp(optimisticXp);
      const pessimisticLevel = this.calculateLevelFromXp(pessimisticXp);

      // Generate motivational message
      const motivationalMessage = this.generateMotivationalMessage(
        levelsToGain,
        transformationPrediction.daysToTarget,
        transformationPrediction.confidenceScore
      );

      // Calculate progress percentage
      const progressPercentage = this.calculateProgressPercentage(
        transformationPrediction.currentWeight,
        transformationPrediction.targetWeight,
        transformationPrediction.weightToGo
      );

      const prediction: LevelPrediction = {
        currentLevel: gamificationProgress.current_level,
        currentXp: gamificationProgress.current_xp,
        predictedLevelAtTarget: predictedLevel,
        levelsToGain,
        totalXpNeeded: xpProjection.xpGainNeeded,
        xpPerWeek: xpProjection.averageXpPerDay * 7,
        weeksToTarget: Math.round(transformationPrediction.daysToTarget / 7),
        daysToTarget: transformationPrediction.daysToTarget,
        monthsToTarget: Math.round(transformationPrediction.daysToTarget / 30),
        estimatedDate: transformationPrediction.predictedDate,
        confidenceScore: transformationPrediction.confidenceScore,
        optimisticLevel,
        pessimisticLevel,
        motivationalMessage,
        progressPercentage,
        weightToGo: transformationPrediction.weightToGo,
        currentWeight: transformationPrediction.currentWeight,
        targetWeight: transformationPrediction.targetWeight,
        hasEnoughData: true
      };

      logger.info('LEVEL_PREDICTION', 'Level prediction generated successfully', {
        userId,
        predictedLevel,
        levelsToGain,
        daysToTarget: transformationPrediction.daysToTarget
      });

      return prediction;
    } catch (error) {
      logger.error('LEVEL_PREDICTION', 'Failed to generate level prediction', { userId, error });
      throw error;
    }
  }

  /**
   * Calculate XP projection based on historical data and timeline
   */
  private async calculateXpProjection(
    userId: string,
    daysToTarget: number,
    currentTotalXp: number
  ): Promise<XpProjection> {
    // Get XP earned in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentEvents } = await supabase
      .from('xp_events_log')
      .select('final_xp')
      .eq('user_id', userId)
      .gte('event_date', thirtyDaysAgo.toISOString());

    const recentXp = (recentEvents || []).reduce((sum, event) => sum + event.final_xp, 0);
    const averageXpPerDay = recentXp / 30;

    // Project XP at target based on current rate
    const projectedXpGain = Math.round(averageXpPerDay * daysToTarget);
    const projectedXpAtTarget = currentTotalXp + projectedXpGain;

    return {
      currentXp: currentTotalXp,
      projectedXpAtTarget,
      xpGainNeeded: projectedXpGain,
      averageXpPerDay
    };
  }

  /**
   * Calculate level from total XP using the same logic as the database function
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

    // Beyond level 100: Exponential curve (600 base, +50 every 10 levels)
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
   * Generate motivational message based on prediction data
   */
  private generateMotivationalMessage(
    levelsToGain: number,
    daysToTarget: number,
    confidenceScore: number
  ): string {
    const monthsToTarget = Math.round(daysToTarget / 30);

    if (confidenceScore >= 75) {
      if (levelsToGain >= 50) {
        return `Transformation MASSIVE en vue! Tu vas gagner ${levelsToGain} niveaux d'ici ${monthsToTarget} mois. C'est ÉNORME!`;
      } else if (levelsToGain >= 20) {
        return `Excellent rythme! Tu vas monter de ${levelsToGain} niveaux en ${monthsToTarget} mois. Continue comme ça!`;
      } else if (levelsToGain >= 10) {
        return `Belle progression! ${levelsToGain} niveaux en ${monthsToTarget} mois, c'est solide!`;
      } else {
        return `Progression constante! Tu vas gagner ${levelsToGain} niveaux. Chaque action compte!`;
      }
    } else if (confidenceScore >= 50) {
      return `Sur la bonne voie! Continue d'enregistrer tes actions pour une prédiction plus précise.`;
    } else {
      return `Début prometteur! Plus tu utilises l'app, plus la prédiction sera précise.`;
    }
  }

  /**
   * Calculate progress percentage towards target
   */
  private calculateProgressPercentage(
    currentWeight: number,
    targetWeight: number,
    weightToGo: number
  ): number {
    const totalWeightChange = Math.abs(targetWeight - currentWeight);
    const weightProgress = totalWeightChange - Math.abs(weightToGo);
    const percentage = (weightProgress / totalWeightChange) * 100;
    return Math.max(0, Math.min(100, Math.round(percentage)));
  }

  /**
   * Build a low-confidence prediction when not enough data is available
   */
  private buildLowConfidencePrediction(
    gamificationProgress: any,
    transformationPrediction: any
  ): LevelPrediction {
    return {
      currentLevel: gamificationProgress.current_level,
      currentXp: gamificationProgress.current_xp,
      predictedLevelAtTarget: gamificationProgress.current_level + 5, // Conservative estimate
      levelsToGain: 5,
      totalXpNeeded: 500,
      xpPerWeek: 50,
      weeksToTarget: transformationPrediction.daysToTarget / 7,
      daysToTarget: transformationPrediction.daysToTarget,
      monthsToTarget: Math.round(transformationPrediction.daysToTarget / 30),
      estimatedDate: transformationPrediction.predictedDate,
      confidenceScore: transformationPrediction.confidenceScore,
      optimisticLevel: gamificationProgress.current_level + 7,
      pessimisticLevel: gamificationProgress.current_level + 3,
      motivationalMessage: 'Continue d\'enregistrer tes actions pour une prédiction plus précise!',
      progressPercentage: 0,
      weightToGo: transformationPrediction.weightToGo,
      currentWeight: transformationPrediction.currentWeight,
      targetWeight: transformationPrediction.targetWeight,
      hasEnoughData: false
    };
  }

  /**
   * Get or generate level prediction for a user
   */
  async getOrGeneratePrediction(userId: string): Promise<LevelPrediction | null> {
    try {
      // Try to get existing prediction first
      const prediction = await this.predictLevel(userId);

      // If no prediction exists or transformation prediction is missing, generate one
      if (!prediction) {
        logger.info('LEVEL_PREDICTION', 'No prediction available, attempting to generate transformation prediction', { userId });

        // Try to generate transformation prediction first
        await transformationPredictionService.generatePrediction(userId);

        // Try again
        return await this.predictLevel(userId);
      }

      return prediction;
    } catch (error) {
      logger.error('LEVEL_PREDICTION', 'Failed to get or generate prediction', { userId, error });
      return null;
    }
  }
}

export const gamificationLevelPredictionService = new GamificationLevelPredictionService();
