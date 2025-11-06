/**
 * MealPlanDataCollector - Collect all meal plan data for user
 * Aggregates generated meal plans, nutritional summaries, and planning stats
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '../../../../lib/utils/logger';
import type { MealPlanKnowledge, MealPlanSummary } from '../../types';

export class MealPlanDataCollector {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async collect(userId: string): Promise<MealPlanKnowledge> {
    try {
      logger.info('MEAL_PLAN_COLLECTOR', 'Starting meal plan data collection', { userId });

      const [activePlansResult, recentPlansResult, statsResult] = await Promise.allSettled([
        this.collectActivePlans(userId),
        this.collectRecentPlans(userId),
        this.collectStats(userId)
      ]);

      const activePlans = activePlansResult.status === 'fulfilled' ? activePlansResult.value : [];
      const recentPlans = recentPlansResult.status === 'fulfilled' ? recentPlansResult.value : [];
      const stats = statsResult.status === 'fulfilled' ? statsResult.value : { total: 0, completed: 0, avgWeekly: 0 };

      // Find current week plan
      const now = new Date();
      const currentWeekPlan = activePlans.find(plan => {
        const startDate = new Date(plan.startDate);
        const endDate = new Date(plan.endDate);
        return now >= startDate && now <= endDate;
      }) || null;

      const lastPlanDate = recentPlans.length > 0 ? recentPlans[0].createdAt : null;
      const hasData = recentPlans.length > 0;

      logger.info('MEAL_PLAN_COLLECTOR', 'Meal plan data collected', {
        userId,
        activePlansCount: activePlans.length,
        recentPlansCount: recentPlans.length,
        hasCurrentWeekPlan: !!currentWeekPlan,
        totalGenerated: stats.total,
        totalCompleted: stats.completed,
        hasData
      });

      return {
        activePlans,
        recentPlans,
        currentWeekPlan,
        totalPlansGenerated: stats.total,
        totalPlansCompleted: stats.completed,
        lastPlanDate,
        averageWeeklyPlans: stats.avgWeekly,
        hasActivePlan: activePlans.length > 0,
        hasData
      };
    } catch (error) {
      logger.error('MEAL_PLAN_COLLECTOR', 'Failed to collect meal plan data', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Collect active meal plans (not archived, status = active or draft)
   */
  private async collectActivePlans(userId: string): Promise<MealPlanSummary[]> {
    const { data: plans, error } = await this.supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .in('status', ['active', 'draft'])
      .order('start_date', { ascending: false })
      .limit(10);

    if (error) {
      logger.error('MEAL_PLAN_COLLECTOR', 'Failed to load active plans', { userId, error });
      return [];
    }

    if (!plans || plans.length === 0) {
      return [];
    }

    return plans.map(plan => this.mapPlanToSummary(plan));
  }

  /**
   * Collect recent meal plans (last 30 days)
   */
  private async collectRecentPlans(userId: string): Promise<MealPlanSummary[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: plans, error } = await this.supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      logger.error('MEAL_PLAN_COLLECTOR', 'Failed to load recent plans', { userId, error });
      return [];
    }

    if (!plans || plans.length === 0) {
      return [];
    }

    return plans.map(plan => this.mapPlanToSummary(plan));
  }

  /**
   * Collect statistics
   */
  private async collectStats(userId: string): Promise<{
    total: number;
    completed: number;
    avgWeekly: number;
  }> {
    // Total plans generated
    const { count: totalCount } = await this.supabase
      .from('meal_plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Completed plans
    const { count: completedCount } = await this.supabase
      .from('meal_plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Calculate average weekly plans (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { count: recent90DaysCount } = await this.supabase
      .from('meal_plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', ninetyDaysAgo.toISOString());

    const avgWeekly = recent90DaysCount ? Number(((recent90DaysCount / 90) * 7).toFixed(1)) : 0;

    return {
      total: totalCount || 0,
      completed: completedCount || 0,
      avgWeekly
    };
  }

  /**
   * Map database plan to MealPlanSummary
   */
  private mapPlanToSummary(plan: any): MealPlanSummary {
    const planData = plan.plan_data || {};
    const nutritionalSummary = plan.nutritional_summary || {};

    return {
      id: plan.id,
      sessionId: plan.session_id,
      title: plan.title || 'Plan de Repas',
      weekNumber: plan.week_number || 1,
      startDate: plan.start_date,
      endDate: plan.end_date,
      status: plan.status || 'active',
      isArchived: plan.is_archived || false,
      batchCookingEnabled: plan.batch_cooking_enabled || false,
      aiExplanation: plan.ai_explanation,
      nutritionalSummary: {
        totalCalories: nutritionalSummary.totalCalories,
        totalProtein: nutritionalSummary.totalProtein,
        totalCarbs: nutritionalSummary.totalCarbs,
        totalFats: nutritionalSummary.totalFats,
        averageCaloriesPerDay: nutritionalSummary.averageCaloriesPerDay
      },
      planData,
      inventorySessionId: plan.inventory_session_id,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at
    };
  }
}
