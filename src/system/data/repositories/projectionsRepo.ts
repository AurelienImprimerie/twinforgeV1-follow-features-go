import { supabase } from '../../supabase/client';
import logger from '../../../lib/utils/logger';
import type { ProjectionParams } from '../../../hooks/useProjectionCalculator';

export interface SavedProjection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  base_scan_id?: string;
  nutrition_quality: number;
  sport_intensity: number;
  duration_key: string;
  projected_pear_figure: number;
  projected_bodybuilder_size: number;
  fat_change: number;
  muscle_change: number;
  projected_morph_values?: Record<string, number>;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectionInput {
  name: string;
  description?: string;
  baseScanId?: string;
  params: ProjectionParams;
  projectedPearFigure: number;
  projectedBodybuilderSize: number;
  fatChange: number;
  muscleChange: number;
  projectedMorphValues: Record<string, number>;
}

export const projectionsRepo = {
  /**
   * Récupérer toutes les projections de l'utilisateur
   */
  async getUserProjections(userId: string): Promise<SavedProjection[]> {
    logger.debug('PROJECTIONS_REPO', 'Fetching user projections', { userId });

    const { data, error } = await supabase
      .from('body_projections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('PROJECTIONS_REPO', 'Error fetching projections', { error: error.message, userId });
      throw error;
    }

    logger.info('PROJECTIONS_REPO', 'Projections fetched successfully', {
      userId,
      count: data?.length || 0
    });

    return data || [];
  },

  /**
   * Récupérer les projections favorites de l'utilisateur
   */
  async getFavoriteProjections(userId: string): Promise<SavedProjection[]> {
    logger.debug('PROJECTIONS_REPO', 'Fetching favorite projections', { userId });

    const { data, error } = await supabase
      .from('body_projections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('PROJECTIONS_REPO', 'Error fetching favorite projections', { error: error.message, userId });
      throw error;
    }

    return data || [];
  },

  /**
   * Créer une nouvelle projection
   */
  async createProjection(userId: string, input: CreateProjectionInput): Promise<SavedProjection> {
    logger.debug('PROJECTIONS_REPO', 'Creating projection', { userId, name: input.name });

    const projectionData = {
      user_id: userId,
      name: input.name,
      description: input.description,
      base_scan_id: input.baseScanId,
      nutrition_quality: input.params.nutritionQuality,
      sport_intensity: input.params.sportIntensity,
      duration_key: input.params.duration,
      projected_pear_figure: input.projectedPearFigure,
      projected_bodybuilder_size: input.projectedBodybuilderSize,
      fat_change: input.fatChange,
      muscle_change: input.muscleChange,
      projected_morph_values: input.projectedMorphValues,
      is_favorite: false,
      // Valeurs par défaut pour les anciennes colonnes (compatibilité)
      activity_level: input.params.sportIntensity || 3,
      caloric_balance: 0,
      time_period_months: input.params.duration === '3_months' ? 3 :
                         input.params.duration === '6_months' ? 6 :
                         input.params.duration === '1_year' ? 12 : 36
    };

    const { data, error } = await supabase
      .from('body_projections')
      .insert(projectionData)
      .select()
      .single();

    if (error) {
      logger.error('PROJECTIONS_REPO', 'Error creating projection', { error: error.message, userId });
      throw error;
    }

    logger.info('PROJECTIONS_REPO', 'Projection created successfully', {
      userId,
      projectionId: data.id,
      name: input.name
    });

    return data;
  },

  /**
   * Mettre à jour une projection existante
   */
  async updateProjection(projectionId: string, updates: Partial<CreateProjectionInput>): Promise<SavedProjection> {
    logger.debug('PROJECTIONS_REPO', 'Updating projection', { projectionId });

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.params) {
      updateData.nutrition_quality = updates.params.nutritionQuality;
      updateData.sport_intensity = updates.params.sportIntensity;
      updateData.duration_key = updates.params.duration;
    }
    if (updates.projectedPearFigure !== undefined) updateData.projected_pear_figure = updates.projectedPearFigure;
    if (updates.projectedBodybuilderSize !== undefined) updateData.projected_bodybuilder_size = updates.projectedBodybuilderSize;
    if (updates.fatChange !== undefined) updateData.fat_change = updates.fatChange;
    if (updates.muscleChange !== undefined) updateData.muscle_change = updates.muscleChange;
    if (updates.projectedMorphValues !== undefined) updateData.projected_morph_values = updates.projectedMorphValues;

    const { data, error } = await supabase
      .from('body_projections')
      .update(updateData)
      .eq('id', projectionId)
      .select()
      .single();

    if (error) {
      logger.error('PROJECTIONS_REPO', 'Error updating projection', { error: error.message, projectionId });
      throw error;
    }

    logger.info('PROJECTIONS_REPO', 'Projection updated successfully', { projectionId });

    return data;
  },

  /**
   * Basculer le statut favori d'une projection
   */
  async toggleFavorite(projectionId: string, isFavorite: boolean): Promise<void> {
    logger.debug('PROJECTIONS_REPO', 'Toggling favorite', { projectionId, isFavorite });

    const { error } = await supabase
      .from('body_projections')
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .eq('id', projectionId);

    if (error) {
      logger.error('PROJECTIONS_REPO', 'Error toggling favorite', { error: error.message, projectionId });
      throw error;
    }

    logger.info('PROJECTIONS_REPO', 'Favorite toggled successfully', { projectionId, isFavorite });
  },

  /**
   * Supprimer une projection
   */
  async deleteProjection(projectionId: string): Promise<void> {
    logger.debug('PROJECTIONS_REPO', 'Deleting projection', { projectionId });

    const { error } = await supabase
      .from('body_projections')
      .delete()
      .eq('id', projectionId);

    if (error) {
      logger.error('PROJECTIONS_REPO', 'Error deleting projection', { error: error.message, projectionId });
      throw error;
    }

    logger.info('PROJECTIONS_REPO', 'Projection deleted successfully', { projectionId });
  }
};
