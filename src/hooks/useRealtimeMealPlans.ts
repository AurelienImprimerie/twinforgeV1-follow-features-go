import { useEffect } from 'react';
import { supabase } from '../system/supabase/client';
import { useMealPlanStore } from '../system/store/mealPlanStore';
import logger from '../lib/utils/logger';

/**
 * Hook to listen for realtime updates to meal plans
 * Automatically refreshes the meal plans list when a new plan is saved
 */
export const useRealtimeMealPlans = (userId: string | undefined) => {
  const { loadAvailableInventories } = useMealPlanStore();

  useEffect(() => {
    if (!userId) return;

    logger.info('REALTIME_MEAL_PLANS', 'Setting up realtime subscription', {
      userId,
      timestamp: new Date().toISOString()
    });

    // Subscribe to meal_plans table for INSERT events
    const channel = supabase
      .channel('meal_plans_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meal_plans',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          logger.info('REALTIME_MEAL_PLANS', 'New meal plan detected', {
            planId: payload.new.id,
            weekNumber: payload.new.week_number,
            timestamp: new Date().toISOString()
          });

          // Refresh available inventories which will also update meal plans
          loadAvailableInventories();
        }
      )
      .subscribe((status) => {
        logger.info('REALTIME_MEAL_PLANS', 'Subscription status changed', {
          status,
          userId,
          timestamp: new Date().toISOString()
        });
      });

    // Cleanup subscription on unmount
    return () => {
      logger.info('REALTIME_MEAL_PLANS', 'Cleaning up realtime subscription', {
        userId,
        timestamp: new Date().toISOString()
      });
      supabase.removeChannel(channel);
    };
  }, [userId, loadAvailableInventories]);
};
