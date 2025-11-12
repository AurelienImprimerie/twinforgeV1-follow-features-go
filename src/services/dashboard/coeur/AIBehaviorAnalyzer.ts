/**
 * AIBehaviorAnalyzer - Sprint 5
 *
 * Service d'analyse comportementale intelligente avec GPT-4
 * Analyse nutrition, training, consistency, progression sur 7/30 jours
 */

import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';

export interface BehaviorScores {
  nutritionScore: number;
  trainingScore: number;
  consistencyScore: number;
  progressionScore: number;
  overallScore: number;
}

export interface UserBehaviorData {
  userId: string;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  nutrition: {
    mealsLogged: number;
    totalDays: number;
    calorieGoalHits: number;
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
    targetCalories: number;
    targetProtein: number;
  };
  training: {
    sessionsCompleted: number;
    totalMinutes: number;
    avgIntensity: number;
    disciplines: string[];
  };
  consistency: {
    perfectDays: number;
    streakDays: number;
    missedDays: number;
  };
  progression: {
    weightChange: number;
    strengthGains: number;
    enduranceGains: number;
  };
  profile: {
    goal: string;
    experience: string;
    preferences: string[];
  };
}

export interface AIRecommendation {
  analysis: string;
  strengths: string[];
  improvements: string[];
  actionableTips: string[];
  motivationalMessage: string;
  bonusXpAwarded: number;
  qualityRating: 'excellent' | 'good' | 'fair' | 'needs_improvement';
}

export class AIBehaviorAnalyzer {
  private static instance: AIBehaviorAnalyzer;

  private constructor() {}

  static getInstance(): AIBehaviorAnalyzer {
    if (!AIBehaviorAnalyzer.instance) {
      AIBehaviorAnalyzer.instance = new AIBehaviorAnalyzer();
    }
    return AIBehaviorAnalyzer.instance;
  }

  /**
   * Analyse comportement utilisateur sur période donnée
   */
  async analyzeUserBehavior(
    userId: string,
    periodDays: 7 | 30 = 7
  ): Promise<UserBehaviorData | null> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const [nutritionData, trainingData, consistencyData, progressionData, profileData] =
        await Promise.all([
          this.getNutritionData(userId, startDateStr, endDateStr),
          this.getTrainingData(userId, startDateStr, endDateStr),
          this.getConsistencyData(userId, startDateStr, endDateStr),
          this.getProgressionData(userId, startDateStr, endDateStr),
          this.getProfileData(userId),
        ]);

      return {
        userId,
        period: {
          startDate: startDateStr,
          endDate: endDateStr,
          days: periodDays,
        },
        nutrition: nutritionData,
        training: trainingData,
        consistency: consistencyData,
        progression: progressionData,
        profile: profileData,
      };
    } catch (error) {
      logger.error('AI_BEHAVIOR_ANALYZER', 'Error analyzing user behavior', { userId, error });
      return null;
    }
  }

  /**
   * Calcule les 4 scores comportementaux (0-100)
   */
  calculateBehaviorScores(data: UserBehaviorData): BehaviorScores {
    const nutritionScore = this.calculateNutritionScore(data.nutrition);
    const trainingScore = this.calculateTrainingScore(data.training);
    const consistencyScore = this.calculateConsistencyScore(data.consistency);
    const progressionScore = this.calculateProgressionScore(data.progression);

    const weights = this.getWeightsByGoal(data.profile.goal);
    const overallScore =
      nutritionScore * weights.nutrition +
      trainingScore * weights.training +
      consistencyScore * weights.consistency +
      progressionScore * weights.progression;

    return {
      nutritionScore,
      trainingScore,
      consistencyScore,
      progressionScore,
      overallScore: Math.round(overallScore),
    };
  }

  /**
   * Génère recommandation IA avec GPT-4
   */
  async generateBonusRecommendation(
    data: UserBehaviorData,
    scores: BehaviorScores
  ): Promise<AIRecommendation | null> {
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-behavior-analysis', {
        body: {
          behaviorData: data,
          scores,
        },
      });

      if (error) {
        logger.error('AI_BEHAVIOR_ANALYZER', 'Error generating AI recommendation', { error });
        return null;
      }

      return result;
    } catch (error) {
      logger.error('AI_BEHAVIOR_ANALYZER', 'Error calling AI analysis function', { error });
      return null;
    }
  }

  /**
   * Attribue bonus XP intelligent basé sur analyse IA
   */
  async awardIntelligentBonus(
    userId: string,
    recommendation: AIRecommendation,
    scores: BehaviorScores,
    periodStart: string,
    periodEnd: string
  ): Promise<boolean> {
    try {
      const { data: existing } = await supabase
        .from('user_ai_analysis_history')
        .select('id')
        .eq('user_id', userId)
        .eq('period_start', periodStart)
        .eq('period_end', periodEnd)
        .maybeSingle();

      if (existing) {
        logger.warn('AI_BEHAVIOR_ANALYZER', 'AI bonus already awarded for this period', {
          userId,
          periodStart,
          periodEnd,
        });
        return false;
      }

      const { error: historyError } = await supabase.from('user_ai_analysis_history').insert({
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        nutrition_score: scores.nutritionScore,
        training_score: scores.trainingScore,
        consistency_score: scores.consistencyScore,
        progression_score: scores.progressionScore,
        overall_score: scores.overallScore,
        xp_awarded: recommendation.bonusXpAwarded,
        quality_rating: recommendation.qualityRating,
        analysis: recommendation.analysis,
        strengths: recommendation.strengths,
        improvements: recommendation.improvements,
        actionable_tips: recommendation.actionableTips,
        motivational_message: recommendation.motivationalMessage,
      });

      if (historyError) {
        logger.error('AI_BEHAVIOR_ANALYZER', 'Error recording AI analysis', {
          userId,
          error: historyError,
        });
        return false;
      }

      if (recommendation.bonusXpAwarded > 0) {
        const { error: xpError } = await supabase.rpc('award_xp', {
          p_user_id: userId,
          p_event_type: 'bonus_ai_intelligent',
          p_event_category: 'ai_performance_bonus',
          p_base_xp: recommendation.bonusXpAwarded,
          p_event_metadata: {
            quality_rating: recommendation.qualityRating,
            overall_score: scores.overallScore,
            period_start: periodStart,
            period_end: periodEnd,
          },
        });

        if (xpError) {
          logger.error('AI_BEHAVIOR_ANALYZER', 'Error awarding AI bonus XP', {
            userId,
            error: xpError,
          });
          return false;
        }
      }

      logger.info('AI_BEHAVIOR_ANALYZER', 'AI bonus awarded successfully', {
        userId,
        xpAwarded: recommendation.bonusXpAwarded,
        qualityRating: recommendation.qualityRating,
      });

      return true;
    } catch (error) {
      logger.error('AI_BEHAVIOR_ANALYZER', 'Error awarding intelligent bonus', { userId, error });
      return false;
    }
  }

  /**
   * Récupère dernière analyse IA pour l'utilisateur
   */
  async getLatestAnalysis(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('user_ai_analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('AI_BEHAVIOR_ANALYZER', 'Error fetching latest analysis', { userId, error });
        return null;
      }

      return data;
    } catch (error) {
      logger.error('AI_BEHAVIOR_ANALYZER', 'Error getting latest analysis', { userId, error });
      return null;
    }
  }

  /**
   * Récupère historique analyses IA
   */
  async getAnalysisHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_ai_analysis_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('AI_BEHAVIOR_ANALYZER', 'Error fetching analysis history', { userId, error });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('AI_BEHAVIOR_ANALYZER', 'Error getting analysis history', { userId, error });
      return [];
    }
  }

  private async getNutritionData(userId: string, startDate: string, endDate: string): Promise<any> {
    const { data: meals } = await supabase
      .from('meals')
      .select('consumed_at, calories, protein, carbs, fats')
      .eq('user_id', userId)
      .gte('consumed_at', new Date(startDate).toISOString())
      .lte('consumed_at', new Date(endDate).toISOString());

    const { data: goals } = await supabase
      .from('calorie_goals')
      .select('*')
      .eq('user_id', userId)
      .gte('goal_date', startDate)
      .lte('goal_date', endDate);

    const dayGroups = new Map<string, any[]>();
    meals?.forEach((meal) => {
      const day = new Date(meal.consumed_at).toISOString().split('T')[0];
      if (!dayGroups.has(day)) {
        dayGroups.set(day, []);
      }
      dayGroups.get(day)?.push(meal);
    });

    const totalDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let calorieGoalHits = 0;

    dayGroups.forEach((dayMeals, day) => {
      const dayTotal = dayMeals.reduce(
        (sum, m) => ({
          calories: sum.calories + (m.calories || 0),
          protein: sum.protein + (m.protein || 0),
          carbs: sum.carbs + (m.carbs || 0),
          fats: sum.fats + (m.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

      totalCalories += dayTotal.calories;
      totalProtein += dayTotal.protein;
      totalCarbs += dayTotal.carbs;
      totalFats += dayTotal.fats;

      const goal = goals?.find((g) => g.goal_date === day);
      if (goal && Math.abs(dayTotal.calories - goal.target_calories) < goal.target_calories * 0.1) {
        calorieGoalHits++;
      }
    });

    const daysWithMeals = dayGroups.size;
    const avgGoal = goals?.reduce((sum, g) => sum + g.target_calories, 0) / (goals?.length || 1) || 2000;
    const avgProteinTarget = avgGoal * 0.3 / 4;

    return {
      mealsLogged: meals?.length || 0,
      totalDays,
      calorieGoalHits,
      avgCalories: daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0,
      avgProtein: daysWithMeals > 0 ? Math.round(totalProtein / daysWithMeals) : 0,
      avgCarbs: daysWithMeals > 0 ? Math.round(totalCarbs / daysWithMeals) : 0,
      avgFats: daysWithMeals > 0 ? Math.round(totalFats / daysWithMeals) : 0,
      targetCalories: Math.round(avgGoal),
      targetProtein: Math.round(avgProteinTarget),
    };
  }

  private async getTrainingData(userId: string, startDate: string, endDate: string): Promise<any> {
    const { data: activities } = await supabase
      .from('biometric_activities')
      .select('activity_date, duration_minutes, activity_type, intensity_level')
      .eq('user_id', userId)
      .gte('activity_date', startDate)
      .lte('activity_date', endDate);

    const totalMinutes = activities?.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) || 0;
    const avgIntensity =
      activities?.reduce((sum, a) => {
        const intensity = a.intensity_level === 'high' ? 8 : a.intensity_level === 'medium' ? 5 : 3;
        return sum + intensity;
      }, 0) / (activities?.length || 1) || 0;

    const disciplines = [...new Set(activities?.map((a) => a.activity_type) || [])];

    return {
      sessionsCompleted: activities?.length || 0,
      totalMinutes,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      disciplines,
    };
  }

  private async getConsistencyData(userId: string, startDate: string, endDate: string): Promise<any> {
    const { data: perfectDays } = await supabase
      .from('perfect_days_tracking')
      .select('perfect_date')
      .eq('user_id', userId)
      .gte('perfect_date', startDate)
      .lte('perfect_date', endDate);

    const totalDays = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      perfectDays: perfectDays?.length || 0,
      streakDays: perfectDays?.length || 0,
      missedDays: totalDays - (perfectDays?.length || 0),
    };
  }

  private async getProgressionData(userId: string, startDate: string, endDate: string): Promise<any> {
    const { data: scans } = await supabase
      .from('body_scans')
      .select('scan_date, weight')
      .eq('user_id', userId)
      .gte('scan_date', startDate)
      .lte('scan_date', endDate)
      .order('scan_date', { ascending: true });

    const weightChange = scans && scans.length >= 2 ? (scans[scans.length - 1].weight || 0) - (scans[0].weight || 0) : 0;

    return {
      weightChange: Math.round(weightChange * 10) / 10,
      strengthGains: 0,
      enduranceGains: 0,
    };
  }

  private async getProfileData(userId: string): Promise<any> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('fitness_goal, experience_level, dietary_preferences')
      .eq('id', userId)
      .maybeSingle();

    return {
      goal: profile?.fitness_goal || 'general_fitness',
      experience: profile?.experience_level || 'beginner',
      preferences: profile?.dietary_preferences || [],
    };
  }

  private calculateNutritionScore(nutrition: any): number {
    const consistencyScore = (nutrition.mealsLogged / (nutrition.totalDays * 3)) * 40;
    const accuracyScore = (nutrition.calorieGoalHits / nutrition.totalDays) * 40;
    const macroScore =
      nutrition.avgProtein >= nutrition.targetProtein * 0.8 &&
      nutrition.avgProtein <= nutrition.targetProtein * 1.2
        ? 20
        : 10;

    return Math.min(Math.round(consistencyScore + accuracyScore + macroScore), 100);
  }

  private calculateTrainingScore(training: any): number {
    const frequencyScore = Math.min((training.sessionsCompleted / 5) * 50, 50);
    const volumeScore = Math.min((training.totalMinutes / 150) * 30, 30);
    const intensityScore = (training.avgIntensity / 10) * 20;

    return Math.min(Math.round(frequencyScore + volumeScore + intensityScore), 100);
  }

  private calculateConsistencyScore(consistency: any): number {
    const perfectDayScore = (consistency.perfectDays / consistency.streakDays) * 60;
    const adherenceScore = (1 - consistency.missedDays / (consistency.perfectDays + consistency.missedDays)) * 40;

    return Math.min(Math.round(perfectDayScore + adherenceScore), 100);
  }

  private calculateProgressionScore(progression: any): number {
    const weightScore = Math.abs(progression.weightChange) > 0 ? 50 : 25;
    const performanceScore = 50;

    return Math.min(Math.round(weightScore + performanceScore), 100);
  }

  private getWeightsByGoal(goal: string): {
    nutrition: number;
    training: number;
    consistency: number;
    progression: number;
  } {
    switch (goal) {
      case 'weight_loss':
        return { nutrition: 0.4, training: 0.25, consistency: 0.25, progression: 0.1 };
      case 'muscle_gain':
        return { nutrition: 0.35, training: 0.35, consistency: 0.2, progression: 0.1 };
      case 'endurance':
        return { nutrition: 0.3, training: 0.4, consistency: 0.2, progression: 0.1 };
      default:
        return { nutrition: 0.35, training: 0.3, consistency: 0.25, progression: 0.1 };
    }
  }
}

export const aiBehaviorAnalyzer = AIBehaviorAnalyzer.getInstance();
