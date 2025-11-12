/**
 * BonusXpCalculator - Sprint 4
 *
 * Service pour calculer les scores de performance et vérifier l'éligibilité
 * aux bonus XP selon les règles configurables.
 */

import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';

interface BonusRule {
  id: string;
  rule_type: string;
  rule_name: string;
  description: string;
  condition: Record<string, any>;
  xp_reward: number;
  period: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  priority: number;
}

interface PerformanceScores {
  nutrition_score: number;
  training_score: number;
  consistency_score: number;
  progression_score: number;
  overall_score: number;
}

interface BonusEligibility {
  rule: BonusRule;
  eligible: boolean;
  currentProgress: number;
  requiredProgress: number;
  message: string;
}

export class BonusXpCalculator {
  private static instance: BonusXpCalculator;

  private constructor() {}

  static getInstance(): BonusXpCalculator {
    if (!BonusXpCalculator.instance) {
      BonusXpCalculator.instance = new BonusXpCalculator();
    }
    return BonusXpCalculator.instance;
  }

  /**
   * Récupère toutes les règles de bonus actives
   */
  async getActiveRules(period?: 'daily' | 'weekly' | 'monthly'): Promise<BonusRule[]> {
    try {
      let query = supabase
        .from('bonus_xp_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (period) {
        query = query.eq('period', period);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('BONUS_XP_CALCULATOR', 'Error fetching rules', { error });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('BONUS_XP_CALCULATOR', 'Exception fetching rules', { error });
      return [];
    }
  }

  /**
   * Calcule les scores de performance pour une période
   */
  async calculatePerformanceScores(
    userId: string,
    periodType: 'daily' | 'weekly' | 'monthly',
    startDate: string,
    endDate: string
  ): Promise<PerformanceScores | null> {
    try {
      const { data, error } = await supabase.rpc('calculate_overall_performance_score', {
        p_user_id: userId,
        p_period_type: periodType,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        logger.error('BONUS_XP_CALCULATOR', 'Error calculating scores', { userId, error });
        return null;
      }

      return data as PerformanceScores;
    } catch (error) {
      logger.error('BONUS_XP_CALCULATOR', 'Exception calculating scores', { userId, error });
      return null;
    }
  }

  /**
   * Vérifie nutrition bonus (streak repas loggés)
   */
  async checkNutritionBonus(
    userId: string,
    startDate: string,
    endDate: string,
    rule: BonusRule
  ): Promise<boolean> {
    try {
      const minDays = rule.condition.min_days || 7;
      const minMealsPerDay = rule.condition.min_meals_per_day || 1;

      // Récupérer les jours avec meals loggés
      const { data: meals, error } = await supabase
        .from('meals')
        .select('consumed_at')
        .eq('user_id', userId)
        .gte('consumed_at', new Date(startDate).toISOString())
        .lte('consumed_at', new Date(endDate).toISOString());

      if (error || !meals) {
        return false;
      }

      // Grouper par jour et compter
      const dayGroups = new Map<string, number>();
      meals.forEach((meal) => {
        const day = new Date(meal.consumed_at).toISOString().split('T')[0];
        dayGroups.set(day, (dayGroups.get(day) || 0) + 1);
      });

      // Compter jours avec au moins minMealsPerDay repas
      const validDays = Array.from(dayGroups.values()).filter((count) => count >= minMealsPerDay)
        .length;

      return validDays >= minDays;
    } catch (error) {
      logger.error('BONUS_XP_CALCULATOR', 'Error checking nutrition bonus', { userId, error });
      return false;
    }
  }

  /**
   * Vérifie training bonus (fréquence entraînements)
   */
  async checkTrainingBonus(
    userId: string,
    startDate: string,
    endDate: string,
    rule: BonusRule
  ): Promise<boolean> {
    try {
      const minSessions = rule.condition.min_sessions || 3;

      // Compter activités dans la période
      const { data: activities, error } = await supabase
        .from('biometric_activities')
        .select('id')
        .eq('user_id', userId)
        .gte('activity_date', startDate)
        .lte('activity_date', endDate);

      if (error || !activities) {
        return false;
      }

      return activities.length >= minSessions;
    } catch (error) {
      logger.error('BONUS_XP_CALCULATOR', 'Error checking training bonus', { userId, error });
      return false;
    }
  }

  /**
   * Vérifie consistency bonus (Perfect Days)
   */
  async checkConsistencyBonus(
    userId: string,
    startDate: string,
    endDate: string,
    rule: BonusRule
  ): Promise<boolean> {
    try {
      const minPerfectDays = rule.condition.min_perfect_days || 5;
      const consecutive = rule.condition.consecutive || false;

      // Récupérer Perfect Days dans la période
      const { data: perfectDays, error } = await supabase
        .from('perfect_days_tracking')
        .select('perfect_date')
        .eq('user_id', userId)
        .gte('perfect_date', startDate)
        .lte('perfect_date', endDate)
        .order('perfect_date', { ascending: true });

      if (error || !perfectDays) {
        return false;
      }

      if (!consecutive) {
        // Juste compter le nombre total
        return perfectDays.length >= minPerfectDays;
      }

      // Vérifier consécutivité
      if (perfectDays.length < minPerfectDays) {
        return false;
      }

      let consecutiveCount = 1;
      for (let i = 1; i < perfectDays.length; i++) {
        const prevDate = new Date(perfectDays[i - 1].perfect_date);
        const currDate = new Date(perfectDays[i].perfect_date);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          consecutiveCount++;
          if (consecutiveCount >= minPerfectDays) {
            return true;
          }
        } else {
          consecutiveCount = 1;
        }
      }

      return consecutiveCount >= minPerfectDays;
    } catch (error) {
      logger.error('BONUS_XP_CALCULATOR', 'Error checking consistency bonus', { userId, error });
      return false;
    }
  }

  /**
   * Vérifie l'éligibilité à un bonus XP spécifique
   */
  async checkBonusEligibility(
    userId: string,
    rule: BonusRule,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    switch (rule.rule_type) {
      case 'nutrition_streak':
        return this.checkNutritionBonus(userId, startDate, endDate, rule);

      case 'training_frequency':
        return this.checkTrainingBonus(userId, startDate, endDate, rule);

      case 'consistency':
      case 'weekly_perfect':
      case 'monthly_perfect':
        return this.checkConsistencyBonus(userId, startDate, endDate, rule);

      default:
        logger.warn('BONUS_XP_CALCULATOR', 'Unknown rule type', { ruleType: rule.rule_type });
        return false;
    }
  }

  /**
   * Calcule progression vers un bonus (pour affichage UI)
   */
  async calculateBonusProgress(
    userId: string,
    rule: BonusRule,
    startDate: string,
    endDate: string
  ): Promise<BonusEligibility> {
    try {
      let currentProgress = 0;
      let requiredProgress = 0;
      let message = '';

      switch (rule.rule_type) {
        case 'nutrition_streak': {
          const minDays = rule.condition.min_days || 7;
          requiredProgress = minDays;

          // Compter jours avec meals
          const { data: meals } = await supabase
            .from('meals')
            .select('consumed_at')
            .eq('user_id', userId)
            .gte('consumed_at', new Date(startDate).toISOString())
            .lte('consumed_at', new Date(endDate).toISOString());

          const dayGroups = new Set<string>();
          meals?.forEach((meal) => {
            const day = new Date(meal.consumed_at).toISOString().split('T')[0];
            dayGroups.add(day);
          });

          currentProgress = dayGroups.size;
          message = `${currentProgress}/${requiredProgress} jours avec repas loggés`;
          break;
        }

        case 'training_frequency': {
          const minSessions = rule.condition.min_sessions || 3;
          requiredProgress = minSessions;

          const { data: activities } = await supabase
            .from('biometric_activities')
            .select('id')
            .eq('user_id', userId)
            .gte('activity_date', startDate)
            .lte('activity_date', endDate);

          currentProgress = activities?.length || 0;
          message = `${currentProgress}/${requiredProgress} sessions complétées`;
          break;
        }

        case 'consistency':
        case 'weekly_perfect':
        case 'monthly_perfect': {
          const minPerfectDays = rule.condition.min_perfect_days || 5;
          requiredProgress = minPerfectDays;

          const { data: perfectDays } = await supabase
            .from('perfect_days_tracking')
            .select('id')
            .eq('user_id', userId)
            .gte('perfect_date', startDate)
            .lte('perfect_date', endDate);

          currentProgress = perfectDays?.length || 0;
          message = `${currentProgress}/${requiredProgress} Perfect Days`;
          break;
        }

        default:
          message = 'Type de bonus inconnu';
      }

      const eligible = await this.checkBonusEligibility(userId, rule, startDate, endDate);

      return {
        rule,
        eligible,
        currentProgress,
        requiredProgress,
        message,
      };
    } catch (error) {
      logger.error('BONUS_XP_CALCULATOR', 'Error calculating bonus progress', { userId, error });
      return {
        rule,
        eligible: false,
        currentProgress: 0,
        requiredProgress: 0,
        message: 'Erreur de calcul',
      };
    }
  }

  /**
   * Récupère l'historique des bonus pour un utilisateur
   */
  async getBonusHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_bonus_history')
        .select('*')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('BONUS_XP_CALCULATOR', 'Error fetching bonus history', { userId, error });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('BONUS_XP_CALCULATOR', 'Exception fetching bonus history', { userId, error });
      return [];
    }
  }

  /**
   * Attribue un bonus XP à un utilisateur
   */
  async awardBonus(
    userId: string,
    rule: BonusRule,
    startDate: string,
    endDate: string,
    performanceScore: number
  ): Promise<boolean> {
    try {
      // Vérifier si bonus déjà attribué pour cette période
      const { data: existing } = await supabase
        .from('user_bonus_history')
        .select('id')
        .eq('user_id', userId)
        .eq('rule_id', rule.id)
        .eq('period_start', startDate)
        .eq('period_end', endDate)
        .maybeSingle();

      if (existing) {
        logger.info('BONUS_XP_CALCULATOR', 'Bonus already awarded', {
          userId,
          ruleId: rule.id,
          period: `${startDate} to ${endDate}`,
        });
        return false;
      }

      // Enregistrer dans historique
      const { error: historyError } = await supabase.from('user_bonus_history').insert({
        user_id: userId,
        rule_id: rule.id,
        rule_name: rule.rule_name,
        xp_awarded: rule.xp_reward,
        period_start: startDate,
        period_end: endDate,
        performance_score: performanceScore,
        condition_details: rule.condition,
      });

      if (historyError) {
        logger.error('BONUS_XP_CALCULATOR', 'Error recording bonus history', {
          userId,
          error: historyError,
        });
        return false;
      }

      // Attribuer XP via award_xp
      const { error: xpError } = await supabase.rpc('award_xp', {
        p_user_id: userId,
        p_event_type: `bonus_${rule.rule_type}`,
        p_event_category: 'performance_bonus',
        p_base_xp: rule.xp_reward,
        p_event_metadata: {
          rule_id: rule.id,
          rule_name: rule.rule_name,
          period_start: startDate,
          period_end: endDate,
          performance_score: performanceScore,
        },
      });

      if (xpError) {
        logger.error('BONUS_XP_CALCULATOR', 'Error awarding XP', { userId, error: xpError });
        return false;
      }

      logger.info('BONUS_XP_CALCULATOR', 'Bonus awarded successfully', {
        userId,
        ruleName: rule.rule_name,
        xp: rule.xp_reward,
      });

      return true;
    } catch (error) {
      logger.error('BONUS_XP_CALCULATOR', 'Exception awarding bonus', { userId, error });
      return false;
    }
  }
}

export const bonusXpCalculator = BonusXpCalculator.getInstance();
