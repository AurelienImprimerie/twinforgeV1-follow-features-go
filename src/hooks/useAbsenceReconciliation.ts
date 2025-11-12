import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/system/supabase/client';
import { useUserStore } from '@/system/store/userStore';
import { useToast } from '@/ui/components/ToastProvider';

interface ReconciliationParams {
  absenceId: string;
  currentWeight: number;
}

interface ReconciliationResult {
  success: boolean;
  xpAwarded: number;
  streakPreserved: boolean;
  coachMessages: Array<{
    type: 'encouragement' | 'advice' | 'celebration';
    message: string;
  }>;
}

export function useAbsenceReconciliation() {
  const { user } = useUserStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ReconciliationParams): Promise<ReconciliationResult> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // TODO: Implement actual reconciliation logic
      // For now, return placeholder success
      return {
        success: true,
        xpAwarded: 0,
        streakPreserved: false,
        coachMessages: [
          {
            type: 'encouragement',
            message: 'Bienvenue de retour! Continuons ensemble.',
          },
        ],
      };
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['absence-status'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });

      showToast(`Réconciliation réussie! +${data.xpAwarded} XP`, 'success');
    },
    onError: (error) => {
      console.error('[useAbsenceReconciliation] Error:', error);
      showToast('Erreur lors de la réconciliation', 'error');
    },
  });
}
