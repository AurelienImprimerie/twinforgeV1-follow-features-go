/**
 * EstimatedActivityService
 * Calculates user activity patterns and generates estimates for absence periods
 *
 * Features:
 * - Analyzes last 30 days of activity
 * - Calculates averages for calories, training, XP
 * - Generates realistic daily estimates with variation
 * - Creates pending XP rewards (50-70% of normal)
 * - Updates user_activity_tracking table
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '@/lib/utils/logger';

export interface ActivityPattern {
  // Nutrition averages
  avgDailyCaloriesIn: number;
  avgDailyCaloriesOut: number;
  avgDailyProteinG: number;
  avgDailyCarbsG: number;
  avgDailyFatG: number;

  // Training averages
  avgWeeklyTrainingSessions: number;
  avgTrainingDurationMinutes: number;
  mostCommonDisciplines: string[];

  // Nutrition patterns
  avgMealsPerDay: number;
  mostCommonMealTimes: string[];

  // Scanning patterns
  avgMealScansPerWeek: number;
  avgBodyScansPerMonth: number;

  // XP patterns
  avgDailyXp: number;
  avgWeeklyXp: number;

  // Data quality
  dataPointsCount: number;
  isSufficientData: boolean;
}

export interface DailyEstimate {
  date: string;
  estimatedCaloriesIn: number;
  estimatedCaloriesOut: number;
  estimatedXp: number;
  confidenceScore: number;
  variation: number; // Random variation applied (0.9-1.1)
}

export interface AbsenceEstimation {
  days: DailyEstimate[];
  totalEstimatedXp: number;
  estimationMethod: 'historical_average' | 'fallback_default' | 'insufficient_data';
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  confidenceScore: number;
}

export class EstimatedActivityService {
  private supabase: SupabaseClient;

  private readonly MIN_DATA_POINTS = 7; // At least 7 days of data
  private readonly ANALYSIS_PERIOD_DAYS = 30; // Analyze last 30 days
  private readonly ESTIMATION_MULTIPLIER_MIN = 0.50; // 50% of normal XP
  private readonly ESTIMATION_MULTIPLIER_MAX = 0.70; // 70% of normal XP
  private readonly VARIATION_MIN = 0.90; // -10% daily variation
  private readonly VARIATION_MAX = 1.10; // +10% daily variation

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    console.log('✅ EstimatedActivityService initialized');
  }

  /**
   * Calculate and update user activity patterns
   */
  async calculateActivityPattern(userId: string): Promise<ActivityPattern> {
    console.log('📊 [ESTIMATED_ACTIVITY] Calculating activity pattern', { userId });
    try {
      logger.info('ESTIMATED_ACTIVITY', 'Calculating activity pattern', { userId });

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.ANALYSIS_PERIOD_DAYS);
      const cutoffISO = cutoffDate.toISOString();

      const [
        nutritionData,
        trainingData,
        xpData,
        mealsCountData,
        bodyScanCountData,
      ] = await Promise.all([
        this.getNutritionAverages(userId, cutoffISO),
        this.getTrainingAverages(userId, cutoffISO),
        this.getXpAverages(userId, cutoffISO),
        this.getMealsCount(userId, cutoffISO),
        this.getBodyScansCount(userId, cutoffISO),
      ]);

      const dataPointsCount = await this.countActiveDataDays(userId, cutoffISO);
      const isSufficientData = dataPointsCount >= this.MIN_DATA_POINTS;
      console.log('📈 [ESTIMATED_ACTIVITY] Data points collected', { dataPointsCount, isSufficientData });

      const pattern: ActivityPattern = {
        ...nutritionData,
        ...trainingData,
        ...xpData,
        avgMealsPerDay: mealsCountData.avgMealsPerDay,
        mostCommonMealTimes: mealsCountData.mostCommonMealTimes,
        avgMealScansPerWeek: mealsCountData.avgMealsPerDay * 7,
        avgBodyScansPerMonth: bodyScanCountData,
        dataPointsCount,
        isSufficientData,
      };

      // Store in database
      await this.storeActivityPattern(userId, pattern);

      logger.info('ESTIMATED_ACTIVITY', 'Activity pattern calculated', {
        userId,
        dataPointsCount,
        isSufficientData,
        avgDailyXp: pattern.avgDailyXp,
      });

      return pattern;
    } catch (error) {
      logger.error('ESTIMATED_ACTIVITY', 'Failed to calculate activity pattern', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Generate estimated activity for absence period
   */
  async generateAbsenceEstimation(
    userId: string,
    absenceStartDate: Date,
    daysAbsent: number
  ): Promise<AbsenceEstimation> {
    console.log('🎯 [ESTIMATED_ACTIVITY] Starting absence estimation', { userId, daysAbsent });
    try {
      logger.info('ESTIMATED_ACTIVITY', 'Generating absence estimation', {
        userId,
        daysAbsent,
      });

      // Get or calculate activity pattern
      let pattern = await this.getStoredActivityPattern(userId);
      if (!pattern || !pattern.isSufficientData) {
        pattern = await this.calculateActivityPattern(userId);
      }

      // Limit estimation to 14 days max
      const estimationDays = Math.min(daysAbsent, 14);
      console.log('⏱️ [ESTIMATED_ACTIVITY] Estimation days limited', { requested: daysAbsent, actual: estimationDays });

      // Generate daily estimates with variation
      const dailyEstimates: DailyEstimate[] = [];
      let totalEstimatedXp = 0;

      for (let i = 0; i < estimationDays; i++) {
        const date = new Date(absenceStartDate);
        date.setDate(date.getDate() + i);

        const variation = this.getRandomVariation();
        const estimatedXp = Math.round(pattern.avgDailyXp * variation);
        const confidenceScore = this.calculateConfidenceScore(pattern, i, estimationDays);

        const estimate: DailyEstimate = {
          date: date.toISOString().split('T')[0],
          estimatedCaloriesIn: Math.round(pattern.avgDailyCaloriesIn * variation),
          estimatedCaloriesOut: Math.round(pattern.avgDailyCaloriesOut * variation),
          estimatedXp,
          confidenceScore,
          variation,
        };

        dailyEstimates.push(estimate);
        totalEstimatedXp += estimatedXp;
      }

      // Determine estimation method and data quality
      const estimationMethod = pattern.isSufficientData
        ? 'historical_average'
        : pattern.dataPointsCount > 0
          ? 'fallback_default'
          : 'insufficient_data';

      const dataQuality = this.determineDataQuality(pattern);

      const estimation: AbsenceEstimation = {
        days: dailyEstimates,
        totalEstimatedXp,
        estimationMethod,
        dataQuality,
        confidenceScore: this.calculateOverallConfidence(pattern, estimationDays),
      };

      logger.info('ESTIMATED_ACTIVITY', 'Absence estimation generated', {
        userId,
        estimationDays,
        totalEstimatedXp,
        dataQuality,
      });

      return estimation;
    } catch (error) {
      logger.error('ESTIMATED_ACTIVITY', 'Failed to generate absence estimation', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create pending XP rewards for absence period
   */
  async createPendingXpRewards(
    userId: string,
    absenceLogId: string,
    estimation: AbsenceEstimation
  ): Promise<void> {
    console.log('🎁 [ESTIMATED_ACTIVITY] Creating pending XP rewards', { userId, absenceLogId });
    try {
      logger.info('ESTIMATED_ACTIVITY', 'Creating pending XP rewards', {
        userId,
        absenceLogId,
        totalXp: estimation.totalEstimatedXp,
      });

      const multiplier = this.getEstimationMultiplier(estimation.dataQuality);

      const pendingRewards = estimation.days.map((day) => ({
        user_id: userId,
        absence_log_id: absenceLogId,
        base_estimated_xp: day.estimatedXp,
        multiplier: multiplier,
        final_xp: Math.round(day.estimatedXp * multiplier),
        event_type: 'absence_estimation',
        event_category: 'general' as const,
        event_date: day.date,
        event_metadata: {
          confidence_score: day.confidenceScore,
          variation: day.variation,
          estimated_calories_in: day.estimatedCaloriesIn,
          estimated_calories_out: day.estimatedCaloriesOut,
        },
        status: 'pending' as const,
      }));

      const { error } = await this.supabase
        .from('pending_xp_rewards')
        .insert(pendingRewards);
      console.log('✅ [ESTIMATED_ACTIVITY] Pending XP rewards inserted', { count: pendingRewards.length });

      if (error) {
        logger.error('ESTIMATED_ACTIVITY', 'Failed to create pending XP rewards', {
          userId,
          error,
        });
        throw error;
      }

      logger.info('ESTIMATED_ACTIVITY', 'Pending XP rewards created', {
        userId,
        count: pendingRewards.length,
        totalPendingXp: pendingRewards.reduce((sum, r) => sum + r.final_xp, 0),
      });
    } catch (error) {
      logger.error('ESTIMATED_ACTIVITY', 'Failed to create pending XP rewards', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get nutrition averages from meals
   */
  private async getNutritionAverages(userId: string, cutoffISO: string) {
    const { data: meals } = await this.supabase
      .from('meals')
      .select('total_calories, protein_g, carbs_g, fat_g, consumed_at')
      .eq('user_id', userId)
      .gte('consumed_at', cutoffISO);

    if (!meals || meals.length === 0) {
      return {
        avgDailyCaloriesIn: 2000,
        avgDailyCaloriesOut: 2400,
        avgDailyProteinG: 100,
        avgDailyCarbsG: 200,
        avgDailyFatG: 70,
      };
    }

    const totalCalories = meals.reduce((sum, m) => sum + (m.total_calories || 0), 0);
    const totalProtein = meals.reduce((sum, m) => sum + (m.protein_g || 0), 0);
    const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs_g || 0), 0);
    const totalFat = meals.reduce((sum, m) => sum + (m.fat_g || 0), 0);

    // Get unique days
    const uniqueDays = new Set(
      meals.map((m) => new Date(m.consumed_at).toISOString().split('T')[0])
    ).size;

    const daysCount = Math.max(uniqueDays, 1);

    return {
      avgDailyCaloriesIn: Math.round(totalCalories / daysCount),
      avgDailyCaloriesOut: Math.round((totalCalories / daysCount) * 1.2), // Estimate TDEE
      avgDailyProteinG: Math.round(totalProtein / daysCount),
      avgDailyCarbsG: Math.round(totalCarbs / daysCount),
      avgDailyFatG: Math.round(totalFat / daysCount),
    };
  }

  /**
   * Get training averages
   */
  private async getTrainingAverages(userId: string, cutoffISO: string) {
    const { data: sessions } = await this.supabase
      .from('training_sessions')
      .select('discipline, created_at')
      .eq('user_id', userId)
      .gte('created_at', cutoffISO);

    if (!sessions || sessions.length === 0) {
      return {
        avgWeeklyTrainingSessions: 0,
        avgTrainingDurationMinutes: 0,
        mostCommonDisciplines: [],
      };
    }

    const disciplineCounts = sessions.reduce(
      (acc, s) => {
        acc[s.discipline] = (acc[s.discipline] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommonDisciplines = Object.entries(disciplineCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([discipline]) => discipline);

    const weeksCount = Math.ceil(
      (Date.now() - new Date(cutoffISO).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    return {
      avgWeeklyTrainingSessions: parseFloat(
        (sessions.length / Math.max(weeksCount, 1)).toFixed(2)
      ),
      avgTrainingDurationMinutes: 60, // Default estimate
      mostCommonDisciplines,
    };
  }

  /**
   * Get XP averages
   */
  private async getXpAverages(userId: string, cutoffISO: string) {
    const { data: xpEvents } = await this.supabase
      .from('xp_events_log')
      .select('final_xp, event_date')
      .eq('user_id', userId)
      .gte('event_date', cutoffISO);

    if (!xpEvents || xpEvents.length === 0) {
      return {
        avgDailyXp: 50,
        avgWeeklyXp: 350,
      };
    }

    const totalXp = xpEvents.reduce((sum, e) => sum + e.final_xp, 0);
    const uniqueDays = new Set(
      xpEvents.map((e) => new Date(e.event_date).toISOString().split('T')[0])
    ).size;

    const daysCount = Math.max(uniqueDays, 1);

    return {
      avgDailyXp: Math.round(totalXp / daysCount),
      avgWeeklyXp: Math.round((totalXp / daysCount) * 7),
    };
  }

  /**
   * Get meals count and timing patterns
   */
  private async getMealsCount(userId: string, cutoffISO: string) {
    const { data: meals } = await this.supabase
      .from('meals')
      .select('consumed_at')
      .eq('user_id', userId)
      .gte('consumed_at', cutoffISO);

    if (!meals || meals.length === 0) {
      return {
        avgMealsPerDay: 3,
        mostCommonMealTimes: ['08:00', '13:00', '20:00'],
      };
    }

    const uniqueDays = new Set(
      meals.map((m) => new Date(m.consumed_at).toISOString().split('T')[0])
    ).size;

    const mealTimes = meals.map((m) => {
      const date = new Date(m.consumed_at);
      return `${String(date.getHours()).padStart(2, '0')}:00`;
    });

    const timeCounts = mealTimes.reduce(
      (acc, time) => {
        acc[time] = (acc[time] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommonMealTimes = Object.entries(timeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([time]) => time);

    return {
      avgMealsPerDay: parseFloat((meals.length / Math.max(uniqueDays, 1)).toFixed(2)),
      mostCommonMealTimes,
    };
  }

  /**
   * Get body scans count
   */
  private async getBodyScansCount(userId: string, cutoffISO: string): Promise<number> {
    const { count } = await this.supabase
      .from('body_scans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('scan_date', cutoffISO);

    return count || 0;
  }

  /**
   * Count days with at least one activity
   */
  private async countActiveDataDays(userId: string, cutoffISO: string): Promise<number> {
    const [mealsResult, trainingResult, xpResult] = await Promise.all([
      this.supabase
        .from('meals')
        .select('consumed_at')
        .eq('user_id', userId)
        .gte('consumed_at', cutoffISO),
      this.supabase
        .from('training_sessions')
        .select('created_at')
        .eq('user_id', userId)
        .gte('created_at', cutoffISO),
      this.supabase
        .from('xp_events_log')
        .select('event_date')
        .eq('user_id', userId)
        .gte('event_date', cutoffISO),
    ]);

    const allDates = new Set<string>();

    if (mealsResult.data) {
      mealsResult.data.forEach((m) =>
        allDates.add(new Date(m.consumed_at).toISOString().split('T')[0])
      );
    }

    if (trainingResult.data) {
      trainingResult.data.forEach((t) =>
        allDates.add(new Date(t.created_at).toISOString().split('T')[0])
      );
    }

    if (xpResult.data) {
      xpResult.data.forEach((x) =>
        allDates.add(new Date(x.event_date).toISOString().split('T')[0])
      );
    }

    return allDates.size;
  }

  /**
   * Store activity pattern in database
   */
  private async storeActivityPattern(
    userId: string,
    pattern: ActivityPattern
  ): Promise<void> {
    console.log('💾 [ESTIMATED_ACTIVITY] Storing activity pattern', { userId });
    const { error } = await this.supabase.from('user_activity_tracking').upsert({
      user_id: userId,
      avg_daily_calories_in: pattern.avgDailyCaloriesIn,
      avg_daily_calories_out: pattern.avgDailyCaloriesOut,
      avg_daily_protein_g: pattern.avgDailyProteinG,
      avg_daily_carbs_g: pattern.avgDailyCarbsG,
      avg_daily_fat_g: pattern.avgDailyFatG,
      avg_weekly_training_sessions: pattern.avgWeeklyTrainingSessions,
      avg_training_duration_minutes: pattern.avgTrainingDurationMinutes,
      most_common_disciplines: pattern.mostCommonDisciplines,
      avg_meals_per_day: pattern.avgMealsPerDay,
      most_common_meal_times: pattern.mostCommonMealTimes,
      avg_meal_scans_per_week: pattern.avgMealScansPerWeek,
      avg_body_scans_per_month: pattern.avgBodyScansPerMonth,
      avg_daily_xp: pattern.avgDailyXp,
      avg_weekly_xp: pattern.avgWeeklyXp,
      calculation_date: new Date().toISOString(),
      data_points_count: pattern.dataPointsCount,
      is_sufficient_data: pattern.isSufficientData,
    });

    if (error) {
      logger.error('ESTIMATED_ACTIVITY', 'Failed to store activity pattern', {
        userId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get stored activity pattern
   */
  private async getStoredActivityPattern(
    userId: string
  ): Promise<ActivityPattern | null> {
    const { data } = await this.supabase
      .from('user_activity_tracking')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) return null;

    return {
      avgDailyCaloriesIn: parseFloat(data.avg_daily_calories_in),
      avgDailyCaloriesOut: parseFloat(data.avg_daily_calories_out),
      avgDailyProteinG: parseFloat(data.avg_daily_protein_g),
      avgDailyCarbsG: parseFloat(data.avg_daily_carbs_g),
      avgDailyFatG: parseFloat(data.avg_daily_fat_g),
      avgWeeklyTrainingSessions: parseFloat(data.avg_weekly_training_sessions),
      avgTrainingDurationMinutes: data.avg_training_duration_minutes,
      mostCommonDisciplines: data.most_common_disciplines,
      avgMealsPerDay: parseFloat(data.avg_meals_per_day),
      mostCommonMealTimes: data.most_common_meal_times,
      avgMealScansPerWeek: parseFloat(data.avg_meal_scans_per_week),
      avgBodyScansPerMonth: parseFloat(data.avg_body_scans_per_month),
      avgDailyXp: parseFloat(data.avg_daily_xp),
      avgWeeklyXp: parseFloat(data.avg_weekly_xp),
      dataPointsCount: data.data_points_count,
      isSufficientData: data.is_sufficient_data,
    };
  }

  /**
   * Get random variation between 0.9 and 1.1
   */
  private getRandomVariation(): number {
    return (
      this.VARIATION_MIN +
      Math.random() * (this.VARIATION_MAX - this.VARIATION_MIN)
    );
  }

  /**
   * Calculate confidence score for a specific day
   */
  private calculateConfidenceScore(
    pattern: ActivityPattern,
    dayIndex: number,
    totalDays: number
  ): number {
    let score = 1.0;

    // Reduce confidence for insufficient data
    if (!pattern.isSufficientData) {
      score *= 0.6;
    } else if (pattern.dataPointsCount < 14) {
      score *= 0.8;
    }

    // Reduce confidence as days progress
    const dayFactor = 1 - dayIndex / (totalDays * 2);
    score *= Math.max(dayFactor, 0.5);

    return Math.max(Math.min(score, 1.0), 0.3);
  }

  /**
   * Calculate overall confidence for estimation
   */
  private calculateOverallConfidence(
    pattern: ActivityPattern,
    estimationDays: number
  ): number {
    let confidence = 1.0;

    if (!pattern.isSufficientData) {
      confidence *= 0.6;
    } else if (pattern.dataPointsCount < 14) {
      confidence *= 0.8;
    }

    // Longer absence = lower confidence
    if (estimationDays > 7) {
      confidence *= 0.7;
    } else if (estimationDays > 3) {
      confidence *= 0.85;
    }

    return Math.max(Math.min(confidence, 1.0), 0.3);
  }

  /**
   * Determine data quality based on pattern
   */
  private determineDataQuality(
    pattern: ActivityPattern
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (!pattern.isSufficientData) return 'poor';
    if (pattern.dataPointsCount >= 21) return 'excellent';
    if (pattern.dataPointsCount >= 14) return 'good';
    return 'fair';
  }

  /**
   * Get estimation multiplier based on data quality
   */
  private getEstimationMultiplier(dataQuality: 'excellent' | 'good' | 'fair' | 'poor'): number {
    switch (dataQuality) {
      case 'excellent':
        return 0.70; // 70% for excellent data
      case 'good':
        return 0.65; // 65% for good data
      case 'fair':
        return 0.60; // 60% for fair data
      case 'poor':
        return 0.50; // 50% for poor data
    }
  }
}
