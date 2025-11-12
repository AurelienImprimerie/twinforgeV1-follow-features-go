import logger from '../../../../lib/utils/logger';
import type { RecipeGenerationPipelineState } from '../types';

export const createRecipeActions = (
  set: (partial: Partial<RecipeGenerationPipelineState>) => void,
  get: () => RecipeGenerationPipelineState
) => ({
  saveRecipes: async () => {
    const state = get();

    logger.info('RECIPE_GENERATION_PIPELINE', 'Saving recipes to database', {
      sessionId: state.currentSessionId,
      recipeCount: state.recipeCandidates.length,
      timestamp: new Date().toISOString()
    });

    try {
      const { supabase } = await import('../../../supabase/client');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User must be authenticated to save recipes');
      }

      const sessionId = state.currentSessionId;

      if (!sessionId) {
        throw new Error('No active session found. Please restart recipe generation.');
      }

      // Verify session exists in database
      const { data: existingSession, error: sessionCheckError } = await supabase
        .from('recipe_sessions')
        .select('id')
        .eq('id', sessionId)
        .single();

      if (sessionCheckError || !existingSession) {
        logger.error('RECIPE_GENERATION_PIPELINE', 'Session not found in database', {
          sessionId,
          error: sessionCheckError?.message,
          timestamp: new Date().toISOString()
        });
        throw new Error('Recipe session not found. Please restart recipe generation.');
      }

      // Save recipes to database
      const recipesToSave = state.recipeCandidates
        .filter(recipe => recipe.status === 'ready')
        .map(recipe => ({
          session_id: sessionId,
          user_id: user.id,
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time_min: recipe.prepTimeMin,
          cook_time_min: recipe.cookTimeMin,
          servings: recipe.servings,
          dietary_tags: recipe.dietaryTags,
          nutritional_info: recipe.nutritionalInfo,
          image_url: recipe.imageUrl,
          image_signature: recipe.imageSignature,
          reasons: recipe.reasons
        }));

      if (recipesToSave.length === 0) {
        throw new Error('No recipes ready to save');
      }

      const { error: recipesError } = await supabase
        .from('recipes')
        .insert(recipesToSave);

      if (recipesError) {
        logger.error('RECIPE_GENERATION_PIPELINE', 'Failed to insert recipes', {
          sessionId,
          error: recipesError.message,
          code: recipesError.code,
          details: recipesError.details,
          timestamp: new Date().toISOString()
        });

        // Update session status to error
        await supabase
          .from('recipe_sessions')
          .update({ status: 'error' })
          .eq('id', sessionId);

        throw recipesError;
      }

      // Update session with completion status and selected recipe IDs
      const recipeIds = state.recipeCandidates.map(r => r.id);
      const { error: updateError } = await supabase
        .from('recipe_sessions')
        .update({
          selected_recipe_ids: recipeIds,
          status: 'completed'
        })
        .eq('id', sessionId);

      if (updateError) {
        logger.warn('RECIPE_GENERATION_PIPELINE', 'Failed to update session status', {
          sessionId,
          error: updateError.message,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('RECIPE_GENERATION_PIPELINE', 'Recipes saved successfully', {
        sessionId,
        savedCount: recipesToSave.length,
        timestamp: new Date().toISOString()
      });

      // Reset pipeline after save
      get().resetPipeline();

    } catch (error) {
      logger.error('RECIPE_GENERATION_PIPELINE', 'Failed to save recipes', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  discardRecipes: () => {
    logger.info('RECIPE_GENERATION_PIPELINE', 'Discarding recipes', {
      sessionId: get().currentSessionId,
      recipeCount: get().recipeCandidates.length,
      timestamp: new Date().toISOString()
    });

    set({
      recipeCandidates: [],
      currentStep: 'configuration',
      simulatedOverallProgress: 0,
      loadingState: 'idle',
      loadingMessage: ''
    });
  },

  updateRecipeImageUrlInCandidates: (
    recipeId: string,
    imageUrl?: string,
    isGeneratingImage: boolean = false,
    hasError: boolean = false
  ) => {
    const currentCandidates = get().recipeCandidates;
    const updatedCandidates = currentCandidates.map(recipe => {
      if (recipe.id === recipeId) {
        return {
          ...recipe,
          imageUrl,
          isGeneratingImage,
          imageGenerationError: hasError
        };
      }
      return recipe;
    });
    set({ recipeCandidates: updatedCandidates });
  }
});
