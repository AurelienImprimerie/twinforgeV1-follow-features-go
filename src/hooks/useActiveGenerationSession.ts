import { useState, useEffect } from 'react';
import { mealPlanProgressService } from '../system/services/mealPlanProgressService';
import logger from '../lib/utils/logger';

interface ActiveSessionInfo {
  hasActiveSession: boolean;
  currentStep: 'validation' | 'recipe_details_generating' | 'recipe_details_validation' | null;
  sessionId: string | null;
  updatedAt: string | null;
  isLoading: boolean;
}

export const useActiveGenerationSession = (userId: string | undefined) => {
  const [sessionInfo, setSessionInfo] = useState<ActiveSessionInfo>({
    hasActiveSession: false,
    currentStep: null,
    sessionId: null,
    updatedAt: null,
    isLoading: true
  });

  useEffect(() => {
    if (!userId) {
      setSessionInfo({
        hasActiveSession: false,
        currentStep: null,
        sessionId: null,
        updatedAt: null,
        isLoading: false
      });
      return;
    }

    const checkActiveSession = async () => {
      try {
        const summary = await mealPlanProgressService.getProgressSummary(userId);

        setSessionInfo({
          hasActiveSession: summary.hasSession,
          currentStep: summary.currentStep,
          sessionId: summary.sessionId,
          updatedAt: summary.updatedAt,
          isLoading: false
        });

        if (summary.hasSession) {
          logger.info('USE_ACTIVE_GENERATION_SESSION', 'Active session detected', {
            sessionId: summary.sessionId,
            currentStep: summary.currentStep,
            updatedAt: summary.updatedAt
          });
        }
      } catch (error) {
        logger.error('USE_ACTIVE_GENERATION_SESSION', 'Error checking active session', { error, userId });
        setSessionInfo({
          hasActiveSession: false,
          currentStep: null,
          sessionId: null,
          updatedAt: null,
          isLoading: false
        });
      }
    };

    checkActiveSession();

    const interval = setInterval(checkActiveSession, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  return sessionInfo;
};
