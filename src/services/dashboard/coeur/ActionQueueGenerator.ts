import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';
import timezoneService from '@/system/services/TimezoneService';
import type { BrainContext } from '@/system/head/types';
import type { TransformationObjective, DashboardAction } from '../DashboardIntelligenceService';
import type { AdaptiveScores } from './AdaptiveScoreCalculator';

interface ActionGenerationRequest {
  userId: string;
  brainContext: BrainContext;
  objective: TransformationObjective | null;
  adaptiveScores: AdaptiveScores;
  currentStreak: number;
}

interface ActionTemplate {
  type: 'quick_win' | 'milestone' | 'routine' | 'challenge' | 'urgent';
  category: 'training' | 'nutrition' | 'body_scan' | 'fasting' | 'wearable' | 'general';
  title: string;
  description: string;
  priorityScore: number;
  estimatedImpact: number;
  estimatedTimeMinutes: number;
  tokensRequired: number;
  condition: (context: BrainContext, objective: TransformationObjective | null, scores: AdaptiveScores, streak?: number, userId?: string) => boolean | Promise<boolean>;
  expiresInHours?: number;
  metadata?: Record<string, any>;
}

class ActionQueueGenerator {
  private actionTemplates: ActionTemplate[] = [
    {
      type: 'urgent',
      category: 'training',
      title: 'Reprendre l\'entraînement',
      description: 'Tu n\'as pas fait de séance depuis plus de 7 jours. Une courte session de 20 minutes peut relancer ta dynamique.',
      priorityScore: 95,
      estimatedImpact: 80,
      estimatedTimeMinutes: 20,
      tokensRequired: 0,
      condition: async (context, objective, scores, streak, userId) => {
        if (!context.training.lastSessionDate) return false;
        const userNow = await timezoneService.convertToUserTime(userId, new Date());
        const daysSince = Math.floor((userNow.getTime() - new Date(context.training.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= 7;
      },
      expiresInHours: 48
    },
    {
      type: 'quick_win',
      category: 'training',
      title: 'Générer ta séance du jour',
      description: 'Utilise le coach IA pour créer une séance adaptée à ton niveau et tes objectifs.',
      priorityScore: 85,
      estimatedImpact: 90,
      estimatedTimeMinutes: 2,
      tokensRequired: 200,
      condition: (context, objective) => {
        if (objective?.objectiveType === 'muscle_gain' || objective?.objectiveType === 'strength') {
          return context.training.weeklySessionsCount < 3;
        }
        return context.training.weeklySessionsCount < 2;
      },
      expiresInHours: 24
    },
    {
      type: 'routine',
      category: 'nutrition',
      title: 'Scanner ton déjeuner',
      description: 'Prends 30 secondes pour scanner ton repas et suivre tes apports nutritionnels.',
      priorityScore: 75,
      estimatedImpact: 70,
      estimatedTimeMinutes: 1,
      tokensRequired: 0,
      condition: async (context, objective, scores, streak, userId) => {
        const userNow = await timezoneService.convertToUserTime(userId, new Date());
        const now = userNow.getHours();
        return now >= 11 && now <= 14 && context.nutrition.scanFrequency < 21;
      },
      expiresInHours: 3
    },
    {
      type: 'quick_win',
      category: 'nutrition',
      title: 'Générer ton plan repas de la semaine',
      description: 'Le coach IA peut créer un plan repas personnalisé basé sur tes objectifs et préférences.',
      priorityScore: 80,
      estimatedImpact: 85,
      estimatedTimeMinutes: 3,
      tokensRequired: 500,
      condition: (context) => !context.nutrition.mealPlans.hasActivePlan,
      expiresInHours: 72
    },
    {
      type: 'milestone',
      category: 'body_scan',
      title: 'Faire ton premier scan corporel',
      description: 'Crée ton avatar 3D et commence à suivre ton évolution physique avec précision.',
      priorityScore: 90,
      estimatedImpact: 95,
      estimatedTimeMinutes: 5,
      tokensRequired: 300,
      condition: (context) => !context.bodyScan.hasData || context.bodyScan.totalScans === 0,
      expiresInHours: 168
    },
    {
      type: 'routine',
      category: 'body_scan',
      title: 'Mettre à jour ton scan corporel',
      description: 'Il est temps de refaire un scan pour suivre tes progrès. Cela ne prend que 3 minutes.',
      priorityScore: 70,
      estimatedImpact: 75,
      estimatedTimeMinutes: 3,
      tokensRequired: 300,
condition: async (context, objective, scores, streak, userId) => {
        if (!context.bodyScan.lastScanDate) return false;
        const userNow = await timezoneService.convertToUserTime(userId, new Date());
        const daysSince = Math.floor((userNow.getTime() - new Date(context.bodyScan.lastScanDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= 14;
      },
      expiresInHours: 72
    },
    {
      type: 'quick_win',
      category: 'fasting',
      title: 'Démarrer un protocole de jeûne',
      description: 'Le jeûne intermittent peut accélérer tes résultats. Configure ton premier protocole.',
      priorityScore: 70,
      estimatedImpact: 80,
      estimatedTimeMinutes: 2,
      tokensRequired: 0,
      condition: (context, objective) => {
        if (objective?.objectiveType === 'muscle_gain') return false;
        return !context.fasting.hasData;
      },
      expiresInHours: 96
    },
    {
      type: 'challenge',
      category: 'fasting',
      title: 'Challenge: 7 jours de jeûne 16:8',
      description: 'Relève le défi de suivre un protocole 16:8 pendant 7 jours consécutifs.',
      priorityScore: 65,
      estimatedImpact: 85,
      estimatedTimeMinutes: 0,
      tokensRequired: 0,
      condition: (context, objective) => {
        if (objective?.objectiveType === 'muscle_gain') return false;
        return context.fasting.hasData && context.fasting.currentStreak < 7;
      },
      expiresInHours: 168
    },
    {
      type: 'milestone',
      category: 'wearable',
      title: 'Connecter ton wearable',
      description: 'Synchronise ta montre connectée pour un suivi automatique de tes activités.',
      priorityScore: 85,
      estimatedImpact: 90,
      estimatedTimeMinutes: 5,
      tokensRequired: 0,
      condition: (context) => !context.activity.hasData,
      expiresInHours: 168
    },
    {
      type: 'routine',
      category: 'wearable',
      title: 'Synchroniser tes données',
      description: 'Assure-toi que tes données d\'activité sont à jour pour un suivi optimal.',
      priorityScore: 60,
      estimatedImpact: 60,
      estimatedTimeMinutes: 1,
      tokensRequired: 0,
      condition: async (context, objective, scores, streak, userId) => {
        if (!context.activity.lastActivityDate) return false;
        const userNow = await timezoneService.convertToUserTime(userId, new Date());
        const daysSince = Math.floor((userNow.getTime() - new Date(context.activity.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= 2;
      },
      expiresInHours: 24
    },
    {
      type: 'challenge',
      category: 'general',
      title: 'Streak de 7 jours',
      description: 'Maintiens une consistance de 60%+ pendant 7 jours consécutifs pour débloquer des bonus.',
      priorityScore: 80,
      estimatedImpact: 75,
      estimatedTimeMinutes: 0,
      tokensRequired: 0,
      condition: (context, objective, scores, streak) => streak >= 3 && streak < 7,
      expiresInHours: 168
    },
    {
      type: 'milestone',
      category: 'general',
      title: 'Définir ton objectif de transformation',
      description: 'Configure ton objectif principal pour que le système adapte tous tes recommandations.',
      priorityScore: 100,
      estimatedImpact: 100,
      estimatedTimeMinutes: 3,
      tokensRequired: 0,
      condition: (context, objective) => !objective,
      expiresInHours: 240
    },
    {
      type: 'quick_win',
      category: 'nutrition',
      title: 'Scanner ton frigo',
      description: 'Scanne le contenu de ton frigo pour obtenir des recettes personnalisées.',
      priorityScore: 70,
      estimatedImpact: 75,
      estimatedTimeMinutes: 3,
      tokensRequired: 200,
      condition: (context) => !context.nutrition.fridgeScans.hasInventory,
      expiresInHours: 72
    }
  ];

  async generateActions(request: ActionGenerationRequest): Promise<DashboardAction[]> {
    try {
      logger.info('ACTION_QUEUE', 'Generating action queue', { userId: request.userId });

      if (!request.brainContext || !request.adaptiveScores) {
        logger.warn('ACTION_QUEUE', 'Missing brain context or adaptive scores, using fallback', {
          userId: request.userId
        });
        return await this.generateFallbackActions(request);
      }

      await this.cleanupExpiredActions(request.userId);

      const applicableActions: ActionTemplate[] = [];
      for (const template of this.actionTemplates) {
        try {
          const isApplicable = await Promise.resolve(
            template.condition(
              request.brainContext,
              request.objective,
              request.adaptiveScores,
              request.currentStreak,
              request.userId
            )
          );
          if (isApplicable) {
            applicableActions.push(template);
          }
        } catch (err) {
          logger.warn('ACTION_QUEUE', 'Template condition error', { template: template.title, error: err });
        }
      }

      applicableActions.sort((a, b) => b.priorityScore - a.priorityScore);

      const existingActions = await this.getExistingActionTitles(request.userId);

      const newActions = applicableActions.filter(
        (action) => !existingActions.includes(action.title)
      );

      let actionsToInsert = newActions.slice(0, 5);

      if (actionsToInsert.length < 3) {
        logger.info('ACTION_QUEUE', 'Insufficient actions from templates, calling AI', {
          userId: request.userId,
          templateCount: actionsToInsert.length
        });

        try {
          const aiActions = await this.callAIActionGeneration(request);
          if (aiActions && aiActions.length > 0) {
            return aiActions;
          }
        } catch (aiError) {
          logger.error('ACTION_QUEUE', 'AI generation failed, using template fallback', { error: aiError });
        }
      }

      if (actionsToInsert.length === 0) {
        logger.info('ACTION_QUEUE', 'No new actions to generate', { userId: request.userId });
        return [];
      }

      // Build insert data with timezone-aware expiration dates
      const insertData = [];
      for (const template of actionsToInsert) {
        let expiresAt: string | null = null;

        if (template.expiresInHours) {
          const userNow = await timezoneService.convertToUserTime(request.userId, new Date());
          const expiryDate = new Date(userNow.getTime() + template.expiresInHours * 60 * 60 * 1000);
          const expiryUTC = await timezoneService.convertToUTC(request.userId, expiryDate);
          expiresAt = expiryUTC.toISOString();
        }

        insertData.push({
          user_id: request.userId,
          action_type: template.type,
          action_category: template.category,
          title: template.title,
          description: template.description,
          priority_score: template.priorityScore,
          estimated_impact: template.estimatedImpact,
          estimated_time_minutes: template.estimatedTimeMinutes,
          tokens_required: template.tokensRequired,
          expires_at: expiresAt,
          metadata: template.metadata || {}
        });
      }

      const { data, error } = await supabase
        .from('dashboard_actions_queue')
        .insert(insertData)
        .select();

      if (error) throw error;

      logger.info('ACTION_QUEUE', 'Actions generated successfully', {
        userId: request.userId,
        count: data.length
      });

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
      logger.error('ACTION_QUEUE', 'Failed to generate actions', { error, request });
      return await this.generateFallbackActions(request);
    }
  }

  private async getExistingActionTitles(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('dashboard_actions_queue')
        .select('title')
        .eq('user_id', userId)
        .eq('is_completed', false);

      if (error) throw error;

      return (data || []).map((action) => action.title);
    } catch (error) {
      logger.error('ACTION_QUEUE', 'Failed to get existing action titles', { error });
      return [];
    }
  }

  private async cleanupExpiredActions(userId: string): Promise<void> {
    try {
      // Use user's timezone for expiration checks
      const userNow = await timezoneService.convertToUserTime(userId, new Date());
      const now = userNow.toISOString();

      const { error } = await supabase
        .from('dashboard_actions_queue')
        .delete()
        .eq('user_id', userId)
        .eq('is_completed', false)
        .not('expires_at', 'is', null)
        .lt('expires_at', now);

      if (error) throw error;

      logger.debug('ACTION_QUEUE', 'Expired actions cleaned up', { userId });
    } catch (error) {
      logger.error('ACTION_QUEUE', 'Failed to cleanup expired actions', { error });
    }
  }

  async regenerateQueue(
    userId: string,
    brainContext: BrainContext,
    objective: TransformationObjective | null,
    adaptiveScores: AdaptiveScores,
    currentStreak: number
  ): Promise<DashboardAction[]> {
    try {
      await supabase
        .from('dashboard_actions_queue')
        .delete()
        .eq('user_id', userId)
        .eq('is_completed', false);

      return await this.generateActions({
        userId,
        brainContext,
        objective,
        adaptiveScores,
        currentStreak
      });
    } catch (error) {
      logger.error('ACTION_QUEUE', 'Failed to regenerate queue', { error });
      throw error;
    }
  }

  private async callAIActionGeneration(request: ActionGenerationRequest): Promise<DashboardAction[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-dashboard-actions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            brainContext: request.brainContext,
            objective: request.objective,
            adaptiveScores: request.adaptiveScores,
            currentStreak: request.currentStreak
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI generation failed');
      }

      const result = await response.json();

      if (result.actions && result.actions.length > 0) {
        const { data, error } = await supabase
          .from('dashboard_actions_queue')
          .select('*')
          .eq('user_id', request.userId)
          .eq('is_completed', false)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        return (data || []).map((action) => ({
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
      }

      return [];
    } catch (error) {
      logger.error('ACTION_QUEUE', 'AI action generation failed', { error });
      throw error;
    }
  }

  private async generateFallbackActions(request: ActionGenerationRequest): Promise<DashboardAction[]> {
    try {
      const fallbackTemplates = [
        {
          type: 'milestone' as const,
          category: 'general' as const,
          title: 'Définir ton objectif de transformation',
          description: 'Configure ton objectif principal pour optimiser tes recommandations.',
          priorityScore: 100,
          estimatedImpact: 100,
          estimatedTimeMinutes: 3,
          tokensRequired: 0
        },
        {
          type: 'quick_win' as const,
          category: 'training' as const,
          title: 'Générer ta première séance',
          description: 'Utilise le coach IA pour créer une séance adaptée.',
          priorityScore: 85,
          estimatedImpact: 90,
          estimatedTimeMinutes: 2,
          tokensRequired: 200
        },
        {
          type: 'milestone' as const,
          category: 'body_scan' as const,
          title: 'Créer ton avatar 3D',
          description: 'Fais ton premier scan corporel pour suivre ton évolution.',
          priorityScore: 90,
          estimatedImpact: 95,
          estimatedTimeMinutes: 5,
          tokensRequired: 300
        }
      ];

      const existingActions = await this.getExistingActionTitles(request.userId);
      const newFallbacks = fallbackTemplates.filter(
        (action) => !existingActions.includes(action.title)
      );

      if (newFallbacks.length === 0) {
        return [];
      }

      // Build insert data with timezone-aware expiration (168 hours = 1 week)
      const userNow = await timezoneService.convertToUserTime(request.userId, new Date());
      const expiryDate = new Date(userNow.getTime() + 168 * 60 * 60 * 1000);
      const expiryUTC = await timezoneService.convertToUTC(request.userId, expiryDate);
      const expiresAtStr = expiryUTC.toISOString();

      const insertData = newFallbacks.map((template) => ({
        user_id: request.userId,
        action_type: template.type,
        action_category: template.category,
        title: template.title,
        description: template.description,
        priority_score: template.priorityScore,
        estimated_impact: template.estimatedImpact,
        estimated_time_minutes: template.estimatedTimeMinutes,
        tokens_required: template.tokensRequired,
        expires_at: expiresAtStr,
        metadata: {}
      }));

      const { data, error } = await supabase
        .from('dashboard_actions_queue')
        .insert(insertData)
        .select();

      if (error) throw error;

      logger.info('ACTION_QUEUE', 'Fallback actions generated', {
        userId: request.userId,
        count: data.length
      });

      return (data || []).map((action) => ({
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
      logger.error('ACTION_QUEUE', 'Fallback generation failed', { error });
      return [];
    }
  }
}

export const actionQueueGenerator = new ActionQueueGenerator();
