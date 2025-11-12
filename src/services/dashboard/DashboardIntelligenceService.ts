import { supabase } from '../../system/supabase/client';
import logger from '../../lib/utils/logger';
import { brainCore } from '../../system/head';
import type { BrainContext } from '../../system/head/types';

export interface TransformationObjective {
  id: string;
  userId: string;
  objectiveType: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'health_optimization' | 'body_recomposition';
  targetValue: number;
  targetUnit: string;
  targetDate: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface AITransformationAnalysis {
  id: string;
  userId: string;
  analysisType: 'weekly_summary' | 'monthly_review' | 'milestone_check' | 'on_demand';
  periodStart: string;
  periodEnd: string;
  aiInsights: {
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
    motivationalMessage: string;
  };
  transformationScore: number;
  forgeScores: {
    training: { score: number; details: string };
    nutrition: { score: number; details: string };
    bodyScan: { score: number; details: string };
    fasting: { score: number; details: string };
    wearable: { score: number; details: string };
    consistency: { score: number; details: string };
  };
  tokensConsumed: number;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface DailyConsistency {
  id: string;
  userId: string;
  trackingDate: string;
  trainingCompleted: boolean;
  nutritionLogged: boolean;
  fastingProtocolFollowed: boolean;
  bodyScanUpdated: boolean;
  wearableSynced: boolean;
  consistencyScore: number;
  streakDays: number;
  createdAt: string;
}

export interface DashboardAction {
  id: string;
  userId: string;
  actionType: 'quick_win' | 'milestone' | 'routine' | 'challenge' | 'urgent';
  actionCategory: 'training' | 'nutrition' | 'body_scan' | 'fasting' | 'wearable' | 'general';
  title: string;
  description: string;
  priorityScore: number;
  estimatedImpact: number;
  estimatedTimeMinutes: number;
  tokensRequired: number;
  isCompleted: boolean;
  completedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  metadata: Record<string, any>;
}

class DashboardIntelligenceService {
  async getActiveObjective(userId: string): Promise<TransformationObjective | null> {
    try {
      const { data, error } = await supabase
        .from('user_transformation_objectives')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        objectiveType: data.objective_type,
        targetValue: data.target_value,
        targetUnit: data.target_unit,
        targetDate: data.target_date,
        priority: data.priority,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: data.metadata || {}
      };
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to get active objective', { userId, error });
      throw error;
    }
  }

  async setActiveObjective(
    userId: string,
    objectiveData: {
      objectiveType: TransformationObjective['objectiveType'];
      targetValue: number;
      targetUnit: string;
      targetDate: string;
      priority: number;
      metadata?: Record<string, any>;
    }
  ): Promise<TransformationObjective> {
    try {
      const existingActive = await supabase
        .from('user_transformation_objectives')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (existingActive.error) throw existingActive.error;

      const { data, error } = await supabase
        .from('user_transformation_objectives')
        .insert({
          user_id: userId,
          objective_type: objectiveData.objectiveType,
          target_value: objectiveData.targetValue,
          target_unit: objectiveData.targetUnit,
          target_date: objectiveData.targetDate,
          priority: objectiveData.priority,
          is_active: true,
          metadata: objectiveData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('DASHBOARD_INTELLIGENCE', 'Set active objective', { userId, objectiveType: objectiveData.objectiveType });

      return {
        id: data.id,
        userId: data.user_id,
        objectiveType: data.objective_type,
        targetValue: data.target_value,
        targetUnit: data.target_unit,
        targetDate: data.target_date,
        priority: data.priority,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: data.metadata || {}
      };
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to set active objective', { userId, error });
      throw error;
    }
  }

  async getLatestAnalysis(userId: string): Promise<AITransformationAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('ai_transformation_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        analysisType: data.analysis_type,
        periodStart: data.period_start,
        periodEnd: data.period_end,
        aiInsights: data.ai_insights,
        transformationScore: data.transformation_score,
        forgeScores: data.forge_scores,
        tokensConsumed: data.tokens_consumed,
        createdAt: data.created_at,
        metadata: data.metadata || {}
      };
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to get latest analysis', { userId, error });
      throw error;
    }
  }

  async getTodayConsistency(userId: string): Promise<DailyConsistency | null> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_consistency_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('tracking_date', today)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        logger.debug('DASHBOARD_INTELLIGENCE', 'No consistency data for today, computing from Brain context', { userId });
        return await this.computeTodayConsistencyFromContext(userId);
      }

      return {
        id: data.id,
        userId: data.user_id,
        trackingDate: data.tracking_date,
        trainingCompleted: data.training_completed,
        nutritionLogged: data.nutrition_logged,
        fastingProtocolFollowed: data.fasting_protocol_followed,
        bodyScanUpdated: data.body_scan_updated,
        wearableSynced: data.wearable_synced,
        consistencyScore: data.consistency_score,
        streakDays: data.streak_days,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to get today consistency', { userId, error });
      return await this.computeTodayConsistencyFromContext(userId);
    }
  }

  private async computeTodayConsistencyFromContext(userId: string): Promise<DailyConsistency | null> {
    try {
      if (!brainCore.isInitialized()) {
        return null;
      }

      const context = await brainCore.getContext();
      const today = context.user?.today;

      if (!today) {
        return null;
      }

      const activities = [
        today.hasTraining && today.trainingSessions?.length > 0,
        today.hasNutrition && today.meals?.length > 0,
        today.hasFasting && today.fastingSession,
        today.hasBodyScan && today.bodyScans?.length > 0,
        today.hasActivity && today.activities?.length > 0
      ];

      const completedActivities = activities.filter(Boolean).length;
      const totalActivities = 5;
      const consistencyScore = Math.round((completedActivities / totalActivities) * 100);

      return {
        id: '',
        userId,
        trackingDate: new Date().toISOString().split('T')[0],
        trainingCompleted: today.hasTraining && today.trainingSessions?.length > 0,
        nutritionLogged: today.hasNutrition && today.meals?.length > 0,
        fastingProtocolFollowed: today.hasFasting && !!today.fastingSession,
        bodyScanUpdated: today.hasBodyScan && today.bodyScans?.length > 0,
        wearableSynced: today.hasActivity && today.activities?.length > 0,
        consistencyScore,
        streakDays: 0,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to compute consistency from context', { userId, error });
      return null;
    }
  }

  async updateTodayConsistency(
    userId: string,
    updates: Partial<{
      trainingCompleted: boolean;
      nutritionLogged: boolean;
      fastingProtocolFollowed: boolean;
      bodyScanUpdated: boolean;
      wearableSynced: boolean;
    }>
  ): Promise<DailyConsistency> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const existing = await this.getTodayConsistency(userId);

      if (existing) {
        const { data, error } = await supabase
          .from('daily_consistency_tracking')
          .update(updates)
          .eq('user_id', userId)
          .eq('tracking_date', today)
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          userId: data.user_id,
          trackingDate: data.tracking_date,
          trainingCompleted: data.training_completed,
          nutritionLogged: data.nutrition_logged,
          fastingProtocolFollowed: data.fasting_protocol_followed,
          bodyScanUpdated: data.body_scan_updated,
          wearableSynced: data.wearable_synced,
          consistencyScore: data.consistency_score,
          streakDays: data.streak_days,
          createdAt: data.created_at
        };
      } else {
        const { data, error } = await supabase
          .from('daily_consistency_tracking')
          .insert({
            user_id: userId,
            tracking_date: today,
            ...updates
          })
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          userId: data.user_id,
          trackingDate: data.tracking_date,
          trainingCompleted: data.training_completed,
          nutritionLogged: data.nutrition_logged,
          fastingProtocolFollowed: data.fasting_protocol_followed,
          bodyScanUpdated: data.body_scan_updated,
          wearableSynced: data.wearable_synced,
          consistencyScore: data.consistency_score,
          streakDays: data.streak_days,
          createdAt: data.created_at
        };
      }
    } catch (error: any) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to update today consistency', { userId, error });

      if (error?.code === 'PGRST204') {
        logger.warn('DASHBOARD_INTELLIGENCE', 'Table schema mismatch - returning default consistency', { userId });
        return {
          id: '',
          userId,
          trackingDate: new Date().toISOString().split('T')[0],
          trainingCompleted: updates.trainingCompleted || false,
          nutritionLogged: updates.nutritionLogged || false,
          fastingProtocolFollowed: updates.fastingProtocolFollowed || false,
          bodyScanUpdated: updates.bodyScanUpdated || false,
          wearableSynced: updates.wearableSynced || false,
          consistencyScore: 0,
          streakDays: 0,
          createdAt: new Date().toISOString()
        };
      }

      throw error;
    }
  }

  async getCurrentStreak(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_current_streak', {
        p_user_id: userId
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to get current streak', { userId, error });
      return 0;
    }
  }

  async getActiveActions(userId: string, limit: number = 10): Promise<DashboardAction[]> {
    try {
      const { data, error } = await supabase
        .from('dashboard_actions_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('priority_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data) return [];

      return data.map((action) => ({
        id: action.id,
        userId: action.user_id,
        actionType: action.action_type,
        actionCategory: action.action_category,
        title: action.title,
        description: action.description,
        priorityScore: action.priority_score,
        estimatedImpact: action.estimated_impact,
        estimatedTimeMinutes: action.estimated_time_minutes,
        tokensRequired: action.tokens_required,
        isCompleted: action.is_completed,
        completedAt: action.completed_at,
        expiresAt: action.expires_at,
        createdAt: action.created_at,
        metadata: action.metadata || {}
      }));
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to get active actions', { userId, error });
      throw error;
    }
  }

  async completeAction(userId: string, actionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dashboard_actions_queue')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', actionId)
        .eq('user_id', userId);

      if (error) throw error;

      logger.info('DASHBOARD_INTELLIGENCE', 'Action completed', { userId, actionId });
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to complete action', { userId, actionId, error });
      throw error;
    }
  }

  async dismissAction(userId: string, actionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dashboard_actions_queue')
        .delete()
        .eq('id', actionId)
        .eq('user_id', userId);

      if (error) throw error;

      logger.info('DASHBOARD_INTELLIGENCE', 'Action dismissed', { userId, actionId });
    } catch (error) {
      logger.error('DASHBOARD_INTELLIGENCE', 'Failed to dismiss action', { userId, actionId, error });
      throw error;
    }
  }

  async getBrainContext(): Promise<BrainContext> {
    if (!brainCore.isInitialized()) {
      throw new Error('Brain not initialized');
    }

    return await brainCore.getContext();
  }
}

export const dashboardIntelligenceService = new DashboardIntelligenceService();
