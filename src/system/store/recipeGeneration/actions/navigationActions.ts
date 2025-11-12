import logger from '../../../../lib/utils/logger';
import type { RecipeGenerationPipelineState, RecipeGenerationStep } from '../types';
import { RECIPE_GENERATION_STEPS } from '../constants';

export const createNavigationActions = (
  set: (partial: Partial<RecipeGenerationPipelineState>) => void,
  get: () => RecipeGenerationPipelineState
) => ({
  startPipeline: async () => {
    try {
      // Import Supabase client
      const { supabase } = await import('../../../supabase/client');

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User must be authenticated to start recipe generation');
      }

      // Create session in Supabase
      const { data: newSession, error: sessionError } = await supabase
        .from('recipe_sessions')
        .insert({
          user_id: user.id,
          inventory_final: [],
          status: 'pending'
        })
        .select('id')
        .single();

      if (sessionError || !newSession) {
        logger.error('RECIPE_GENERATION_PIPELINE', 'Failed to create recipe session in Supabase', {
          error: sessionError?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
        throw new Error('Failed to create recipe session');
      }

      const sessionId = newSession.id;

      logger.info('RECIPE_GENERATION_PIPELINE', 'Starting new pipeline with Supabase session', {
        sessionId,
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      set({
        currentStep: 'configuration',
        isActive: true,
        currentSessionId: sessionId,
        simulatedOverallProgress: 0,
        recipeCandidates: [],
        loadingState: 'idle',
        loadingMessage: ''
      });
    } catch (error) {
      logger.error('RECIPE_GENERATION_PIPELINE', 'Failed to start pipeline', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      // Fallback: create local session ID (will fail on save but allows user to continue)
      const fallbackSessionId = crypto.randomUUID();

      set({
        currentStep: 'configuration',
        isActive: true,
        currentSessionId: fallbackSessionId,
        simulatedOverallProgress: 0,
        recipeCandidates: [],
        loadingState: 'idle',
        loadingMessage: ''
      });

      throw error;
    }
  },

  goToStep: (step: RecipeGenerationStep) => {
    const stepData = RECIPE_GENERATION_STEPS.find(s => s.id === step);

    logger.info('RECIPE_GENERATION_PIPELINE', 'Navigating to step', {
      step,
      sessionId: get().currentSessionId,
      timestamp: new Date().toISOString()
    });

    set({
      currentStep: step,
      simulatedOverallProgress: stepData?.startProgress || 0
    });
  },

  resetPipeline: () => {
    logger.info('RECIPE_GENERATION_PIPELINE', 'Resetting pipeline', {
      sessionId: get().currentSessionId,
      timestamp: new Date().toISOString()
    });

    set({
      currentStep: 'configuration',
      isActive: false,
      currentSessionId: null,
      simulatedOverallProgress: 0,
      recipeCandidates: [],
      loadingState: 'idle',
      loadingMessage: '',
      config: {
        selectedInventoryId: null,
        recipeCount: 4
      }
    });
  }
});
