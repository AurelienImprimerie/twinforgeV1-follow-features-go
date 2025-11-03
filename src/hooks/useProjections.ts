import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../system/store/userStore';
import { projectionsRepo, type SavedProjection, type CreateProjectionInput } from '../system/data/repositories/projectionsRepo';
import logger from '../lib/utils/logger';

/**
 * Hook pour gérer les projections morphologiques sauvegardées
 */
export function useProjections() {
  const { profile } = useUserStore();
  const queryClient = useQueryClient();
  const userId = profile?.userId;

  // Query pour récupérer toutes les projections
  const {
    data: projections,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projections', userId],
    queryFn: () => projectionsRepo.getUserProjections(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query pour récupérer uniquement les projections favorites
  const {
    data: favoriteProjections,
    isLoading: isLoadingFavorites
  } = useQuery({
    queryKey: ['projections-favorites', userId],
    queryFn: () => projectionsRepo.getFavoriteProjections(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Mutation pour créer une projection
  const createProjectionMutation = useMutation({
    mutationFn: (input: CreateProjectionInput) => {
      if (!userId) throw new Error('User not authenticated');
      return projectionsRepo.createProjection(userId, input);
    },
    onSuccess: () => {
      logger.info('USE_PROJECTIONS', 'Projection created, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['projections', userId] });
      queryClient.invalidateQueries({ queryKey: ['projections-favorites', userId] });
    },
    onError: (error) => {
      logger.error('USE_PROJECTIONS', 'Error creating projection', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Mutation pour mettre à jour une projection
  const updateProjectionMutation = useMutation({
    mutationFn: ({ projectionId, updates }: { projectionId: string; updates: Partial<CreateProjectionInput> }) => {
      return projectionsRepo.updateProjection(projectionId, updates);
    },
    onSuccess: () => {
      logger.info('USE_PROJECTIONS', 'Projection updated, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['projections', userId] });
      queryClient.invalidateQueries({ queryKey: ['projections-favorites', userId] });
    },
    onError: (error) => {
      logger.error('USE_PROJECTIONS', 'Error updating projection', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Mutation pour basculer le favori
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ projectionId, isFavorite }: { projectionId: string; isFavorite: boolean }) => {
      return projectionsRepo.toggleFavorite(projectionId, isFavorite);
    },
    onMutate: async ({ projectionId, isFavorite }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['projections', userId] });
      await queryClient.cancelQueries({ queryKey: ['projections-favorites', userId] });

      const previousProjections = queryClient.getQueryData<SavedProjection[]>(['projections', userId]);

      if (previousProjections) {
        queryClient.setQueryData<SavedProjection[]>(
          ['projections', userId],
          previousProjections.map(p =>
            p.id === projectionId ? { ...p, is_favorite: isFavorite } : p
          )
        );
      }

      return { previousProjections };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProjections) {
        queryClient.setQueryData(['projections', userId], context.previousProjections);
      }
      logger.error('USE_PROJECTIONS', 'Error toggling favorite', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projections', userId] });
      queryClient.invalidateQueries({ queryKey: ['projections-favorites', userId] });
    }
  });

  // Mutation pour supprimer une projection
  const deleteProjectionMutation = useMutation({
    mutationFn: (projectionId: string) => {
      return projectionsRepo.deleteProjection(projectionId);
    },
    onSuccess: () => {
      logger.info('USE_PROJECTIONS', 'Projection deleted, invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['projections', userId] });
      queryClient.invalidateQueries({ queryKey: ['projections-favorites', userId] });
    },
    onError: (error) => {
      logger.error('USE_PROJECTIONS', 'Error deleting projection', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return {
    // Data
    projections: projections || [],
    favoriteProjections: favoriteProjections || [],

    // Loading states
    isLoading,
    isLoadingFavorites,

    // Error
    error,

    // Mutations
    createProjection: createProjectionMutation.mutate,
    updateProjection: updateProjectionMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
    deleteProjection: deleteProjectionMutation.mutate,

    // Mutation states
    isCreating: createProjectionMutation.isPending,
    isUpdating: updateProjectionMutation.isPending,
    isDeleting: deleteProjectionMutation.isPending,

    // Refetch
    refetch
  };
}
