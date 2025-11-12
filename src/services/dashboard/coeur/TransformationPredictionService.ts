import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';

export interface WeightDataPoint {
  weight: number;
  date: string;
  daysSinceStart: number;
}

export interface InfluenceFactors {
  activityScore: number;
  consistencyScore: number;
  caloricBalanceScore: number;
  overallScore: number;
}

export interface PredictionScenario {
  date: string;
  daysFromNow: number;
  weeklyTrend: number;
}

export interface TransformationPrediction {
  id: string;
  userId: string;
  predictedDate: string;
  confidenceScore: number;
  currentWeight: number;
  targetWeight: number;
  weightToGo: number;
  weeklyTrend: number;
  daysToTarget: number;
  optimisticDate: string;
  pessimisticDate: string;
  dataPoints: number;
  influenceFactors: InfluenceFactors;
  recommendations: string[];
  isActive: boolean;
  predictionAccuracy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionMilestone {
  id: string;
  userId: string;
  predictionId: string;
  milestoneType: 'quarter_way' | 'halfway' | 'three_quarters' | 'achieved';
  milestoneWeight: number;
  predictedDate: string;
  actualDate: string | null;
  status: 'pending' | 'on_track' | 'ahead' | 'behind' | 'achieved';
  varianceDays: number;
  createdAt: string;
  achievedAt: string | null;
}

const CONFIDENCE_THRESHOLDS = {
  MIN_DATA_POINTS: 2,
  IDEAL_DATA_POINTS: 10,
  MAX_DAYS_LOOKBACK: 90,
  MIN_CONFIDENCE: 20,
  MAX_CONFIDENCE: 95
};

class TransformationPredictionService {
  /**
   * Generate a new transformation prediction for the user
   */
  async generatePrediction(userId: string): Promise<TransformationPrediction | null> {
    try {
      logger.info('PREDICTION', 'Generating transformation prediction', { userId });

      const { data: profile } = await supabase
        .from('user_profile')
        .select('weight_kg, target_weight_kg, objective')
        .eq('user_id', userId)
        .single();

      if (!profile?.weight_kg || !profile?.target_weight_kg) {
        logger.warn('PREDICTION', 'Missing weight or target weight', { userId });
        return null;
      }

      const currentWeight = profile.weight_kg;
      const targetWeight = profile.target_weight_kg;
      const objective = profile.objective;

      const weightHistory = await this.getWeightHistory(userId);

      if (weightHistory.length < CONFIDENCE_THRESHOLDS.MIN_DATA_POINTS) {
        logger.warn('PREDICTION', 'Insufficient weight data', {
          userId,
          dataPoints: weightHistory.length
        });
        return null;
      }

      const weeklyTrend = this.calculateWeeklyTrend(weightHistory);
      const influenceFactors = await this.calculateInfluenceFactors(userId);

      const adjustedTrend = this.adjustTrendWithFactors(weeklyTrend, influenceFactors, objective);

      if (Math.abs(adjustedTrend) < 0.01) {
        logger.warn('PREDICTION', 'Trend too close to zero, cannot predict', { userId, adjustedTrend });
        return null;
      }

      const weightToGo = targetWeight - currentWeight;
      const weeksToTarget = Math.abs(weightToGo / adjustedTrend);
      const daysToTarget = Math.round(weeksToTarget * 7);

      const scenarios = this.calculateScenarios(adjustedTrend, weightToGo, influenceFactors);

      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + daysToTarget);

      const confidenceScore = this.calculateConfidenceScore(
        weightHistory.length,
        influenceFactors,
        Math.abs(weeklyTrend)
      );

      const recommendations = this.generateRecommendations(
        influenceFactors,
        adjustedTrend,
        objective,
        daysToTarget
      );

      const { data, error } = await supabase
        .from('transformation_predictions')
        .insert({
          user_id: userId,
          predicted_date: predictedDate.toISOString(),
          confidence_score: confidenceScore,
          current_weight: currentWeight,
          target_weight: targetWeight,
          weight_to_go: weightToGo,
          weekly_trend: adjustedTrend,
          days_to_target: daysToTarget,
          optimistic_date: scenarios.optimistic.date,
          pessimistic_date: scenarios.pessimistic.date,
          data_points: weightHistory.length,
          influence_factors: influenceFactors,
          recommendations
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('PREDICTION', 'Prediction generated successfully', {
        userId,
        daysToTarget,
        confidenceScore,
        weeklyTrend: adjustedTrend
      });

      return this.mapPrediction(data);
    } catch (error) {
      logger.error('PREDICTION', 'Failed to generate prediction', { userId, error });
      throw error;
    }
  }

  /**
   * Get weight history from multiple sources: weight updates, body scans, profile updates
   */
  private async getWeightHistory(userId: string): Promise<WeightDataPoint[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIDENCE_THRESHOLDS.MAX_DAYS_LOOKBACK);

    const weightUpdates = await supabase
      .from('weight_updates_history')
      .select('new_weight, created_at')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: true });

    const bodyScans = await supabase
      .from('body_scans')
      .select('weight, created_at')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: true });

    const weightPoints: Map<string, number> = new Map();

    (weightUpdates.data || []).forEach((update) => {
      const dateKey = update.created_at.split('T')[0];
      weightPoints.set(dateKey, update.new_weight);
    });

    (bodyScans.data || []).forEach((scan) => {
      const dateKey = scan.created_at.split('T')[0];
      if (scan.weight && !weightPoints.has(dateKey)) {
        weightPoints.set(dateKey, scan.weight);
      }
    });

    const sortedDates = Array.from(weightPoints.keys()).sort();
    const startDate = sortedDates.length > 0 ? new Date(sortedDates[0]) : new Date();

    return sortedDates.map((dateStr) => {
      const date = new Date(dateStr);
      const daysSinceStart = Math.floor(
        (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        weight: weightPoints.get(dateStr)!,
        date: dateStr,
        daysSinceStart
      };
    });
  }

  /**
   * Calculate weekly weight trend using linear regression
   */
  private calculateWeeklyTrend(weightHistory: WeightDataPoint[]): number {
    if (weightHistory.length < 2) return 0;

    const n = weightHistory.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    weightHistory.forEach((point) => {
      const x = point.daysSinceStart;
      const y = point.weight;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    const weeklyTrend = slope * 7;

    return Number(weeklyTrend.toFixed(2));
  }

  /**
   * Calculate influence factors from user activity
   */
  private async calculateInfluenceFactors(userId: string): Promise<InfluenceFactors> {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [activityCount, trainingCount, mealCount, gamificationData] = await Promise.all([
      supabase
        .from('biometric_activities')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('timestamp', last30Days.toISOString()),

      supabase
        .from('training_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', last30Days.toISOString()),

      supabase
        .from('meals')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('consumed_at', last30Days.toISOString()),

      supabase
        .from('user_gamification_progress')
        .select('current_streak_days')
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    const activityScore = Math.min(
      100,
      Math.round(((activityCount.count || 0) + (trainingCount.count || 0)) * 3.33)
    );

    const consistencyScore = Math.min(
      100,
      Math.round((gamificationData.data?.current_streak_days || 0) * 3.33)
    );

    const caloricBalanceScore = Math.min(100, Math.round((mealCount.count || 0) * 3.33));

    const overallScore = Math.round(
      (activityScore * 0.4 + consistencyScore * 0.35 + caloricBalanceScore * 0.25)
    );

    return {
      activityScore,
      consistencyScore,
      caloricBalanceScore,
      overallScore
    };
  }

  /**
   * Adjust weekly trend based on influence factors
   */
  private adjustTrendWithFactors(
    baseTrend: number,
    factors: InfluenceFactors,
    objective?: string
  ): number {
    const factorMultiplier = 0.7 + (factors.overallScore / 100) * 0.6;

    let adjustedTrend = baseTrend * factorMultiplier;

    if (objective === 'fat_loss' && adjustedTrend > 0) {
      adjustedTrend *= 0.7;
    } else if (objective === 'muscle_gain' && adjustedTrend < 0) {
      adjustedTrend *= 0.7;
    }

    return Number(adjustedTrend.toFixed(2));
  }

  /**
   * Calculate optimistic and pessimistic scenarios
   */
  private calculateScenarios(
    realisticTrend: number,
    weightToGo: number,
    factors: InfluenceFactors
  ): {
    optimistic: PredictionScenario;
    pessimistic: PredictionScenario;
  } {
    const optimisticMultiplier = 1.3;
    const pessimisticMultiplier = 0.7;

    const optimisticTrend = realisticTrend * optimisticMultiplier;
    const pessimisticTrend = realisticTrend * pessimisticMultiplier;

    const optimisticDays = Math.round(Math.abs(weightToGo / optimisticTrend) * 7);
    const pessimisticDays = Math.round(Math.abs(weightToGo / pessimisticTrend) * 7);

    const optimisticDate = new Date();
    optimisticDate.setDate(optimisticDate.getDate() + optimisticDays);

    const pessimisticDate = new Date();
    pessimisticDate.setDate(pessimisticDate.getDate() + pessimisticDays);

    return {
      optimistic: {
        date: optimisticDate.toISOString(),
        daysFromNow: optimisticDays,
        weeklyTrend: optimisticTrend
      },
      pessimistic: {
        date: pessimisticDate.toISOString(),
        daysFromNow: pessimisticDays,
        weeklyTrend: pessimisticTrend
      }
    };
  }

  /**
   * Calculate confidence score based on data quality and factors
   */
  private calculateConfidenceScore(
    dataPoints: number,
    factors: InfluenceFactors,
    trendMagnitude: number
  ): number {
    let confidence = CONFIDENCE_THRESHOLDS.MIN_CONFIDENCE;

    const dataQuality = Math.min(
      100,
      (dataPoints / CONFIDENCE_THRESHOLDS.IDEAL_DATA_POINTS) * 100
    );
    confidence += dataQuality * 0.3;

    confidence += factors.overallScore * 0.3;

    if (trendMagnitude > 0.1 && trendMagnitude < 1.5) {
      confidence += 20;
    } else if (trendMagnitude >= 1.5) {
      confidence += 10;
    }

    return Math.min(CONFIDENCE_THRESHOLDS.MAX_CONFIDENCE, Math.round(confidence));
  }

  /**
   * Generate AI-driven recommendations
   */
  private generateRecommendations(
    factors: InfluenceFactors,
    weeklyTrend: number,
    objective?: string,
    daysToTarget?: number
  ): string[] {
    const recommendations: string[] = [];

    if (factors.activityScore < 50) {
      recommendations.push(
        'Augmentez votre fréquence d\'entraînement pour accélérer vos résultats'
      );
    }

    if (factors.consistencyScore < 50) {
      recommendations.push('Maintenez une routine régulière pour améliorer la constance');
    }

    if (factors.caloricBalanceScore < 50) {
      recommendations.push('Suivez vos repas plus régulièrement pour mieux gérer vos calories');
    }

    if (Math.abs(weeklyTrend) < 0.2) {
      if (objective === 'fat_loss') {
        recommendations.push('Créez un déficit calorique plus important pour perdre du poids');
      } else if (objective === 'muscle_gain') {
        recommendations.push('Augmentez votre surplus calorique pour gagner en masse musculaire');
      }
    }

    if (Math.abs(weeklyTrend) > 1.2) {
      recommendations.push(
        'Ralentissez le rythme pour une transformation plus durable et saine'
      );
    }

    if (daysToTarget && daysToTarget > 365) {
      recommendations.push('Considérez ajuster votre objectif pour le rendre plus atteignable');
    }

    if (factors.overallScore > 75) {
      recommendations.push('Excellent travail! Maintenez cette dynamique pour atteindre votre objectif');
    }

    return recommendations;
  }

  /**
   * Get active prediction for user
   */
  async getActivePrediction(userId: string): Promise<TransformationPrediction | null> {
    try {
      const { data, error } = await supabase
        .from('transformation_predictions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return this.mapPrediction(data);
    } catch (error) {
      logger.error('PREDICTION', 'Failed to get active prediction', { userId, error });
      throw error;
    }
  }

  /**
   * Get prediction history for user
   */
  async getPredictionHistory(userId: string, limit: number = 10): Promise<TransformationPrediction[]> {
    try {
      const { data, error } = await supabase
        .from('transformation_predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(this.mapPrediction);
    } catch (error) {
      logger.error('PREDICTION', 'Failed to get prediction history', { userId, error });
      throw error;
    }
  }

  /**
   * Get prediction milestones
   */
  async getPredictionMilestones(predictionId: string): Promise<PredictionMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('prediction_milestones')
        .select('*')
        .eq('prediction_id', predictionId)
        .order('predicted_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((milestone) => ({
        id: milestone.id,
        userId: milestone.user_id,
        predictionId: milestone.prediction_id,
        milestoneType: milestone.milestone_type,
        milestoneWeight: milestone.milestone_weight,
        predictedDate: milestone.predicted_date,
        actualDate: milestone.actual_date,
        status: milestone.status,
        varianceDays: milestone.variance_days,
        createdAt: milestone.created_at,
        achievedAt: milestone.achieved_at
      }));
    } catch (error) {
      logger.error('PREDICTION', 'Failed to get prediction milestones', { predictionId, error });
      throw error;
    }
  }

  /**
   * Update milestone statuses based on current weight
   */
  async updateMilestoneStatus(userId: string, currentWeight: number, targetWeight: number): Promise<void> {
    try {
      await supabase.rpc('update_milestone_status', {
        p_user_id: userId,
        p_current_weight: currentWeight,
        p_target_weight: targetWeight
      });

      logger.info('PREDICTION', 'Milestone status updated', { userId, currentWeight });
    } catch (error) {
      logger.error('PREDICTION', 'Failed to update milestone status', { userId, error });
      throw error;
    }
  }

  /**
   * Map database record to TransformationPrediction
   */
  private mapPrediction(data: any): TransformationPrediction {
    return {
      id: data.id,
      userId: data.user_id,
      predictedDate: data.predicted_date,
      confidenceScore: data.confidence_score,
      currentWeight: data.current_weight,
      targetWeight: data.target_weight,
      weightToGo: data.weight_to_go,
      weeklyTrend: data.weekly_trend,
      daysToTarget: data.days_to_target,
      optimisticDate: data.optimistic_date,
      pessimisticDate: data.pessimistic_date,
      dataPoints: data.data_points,
      influenceFactors: data.influence_factors,
      recommendations: data.recommendations,
      isActive: data.is_active,
      predictionAccuracy: data.prediction_accuracy,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const transformationPredictionService = new TransformationPredictionService();
