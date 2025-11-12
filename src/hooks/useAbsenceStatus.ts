import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/system/supabase/client';
import { useUserStore } from '@/system/store/userStore';

interface AbsenceStatus {
  hasActiveAbsence: boolean;
  absenceId: string | null;
  daysAbsent: number;
  estimatedXp: number;
  absenceStartDate: string | null;
}

export function useAbsenceStatus() {
  const { user } = useUserStore();

  return useQuery({
    queryKey: ['absence-status', user?.id],
    queryFn: async (): Promise<AbsenceStatus> => {
      if (!user?.id) {
        return {
          hasActiveAbsence: false,
          absenceId: null,
          daysAbsent: 0,
          estimatedXp: 0,
          absenceStartDate: null,
        };
      }

      const { data, error } = await supabase
        .from('user_absence_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('absence_start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return {
          hasActiveAbsence: false,
          absenceId: null,
          daysAbsent: 0,
          estimatedXp: 0,
          absenceStartDate: null,
        };
      }

      return {
        hasActiveAbsence: true,
        absenceId: data.id,
        daysAbsent: data.days_absent || 0,
        estimatedXp: data.estimated_activity_data?.estimatedXp || 0,
        absenceStartDate: data.absence_start_date,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
