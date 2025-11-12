/**
 * DashboardTabsLayout - 4 Onglets Dashboard
 * Architecture: TwinGame | Suivi | Records | Classement
 *
 * Chaque onglet contient:
 * - Son widget principal spécifique
 * - Les boutons CTA appropriés (intégrés ou séparés selon l'onglet)
 *
 * Note: L'onglet "Suivi" a ses actions intégrées dans le CalorieBalanceWidgetV3
 */

import React, { useState } from 'react';
import Tabs from '@/ui/tabs/TabsComponent';
import GamingProgressWidgetV3 from './widgets/coeur/GamingProgressWidgetV3';
import DailySummaryStats from './widgets/coeur/DailySummaryStats';
import GamingProjectionAndStats from './widgets/coeur/GamingProjectionAndStats';
import CalorieBalanceWidgetV3 from './widgets/CalorieBalanceWidgetV3';
import RecordsWidgetSimplified from './widgets/RecordsWidgetSimplified';
import LeaderboardWidgetSimplified from './widgets/LeaderboardWidgetSimplified';
import PendingXpWidget from '@/components/absence/PendingXpWidget';
import ReconciliationSuccessMessage from '@/components/absence/ReconciliationSuccessMessage';
import { useGamingData } from './widgets/coeur/GamingProgressWidget/hooks/useGamingData';
import { calculateStreakMultiplier } from './widgets/coeur/GamingProgressWidget/utils/multipliers';
import { scrollToSection } from '@/utils/navigationUtils';
import { useAbsenceStatus } from '@/hooks/useAbsenceStatus';
import type { CoachMessage } from '@/services/dashboard/coeur/absence/AbsenceRecoveryCoachingService';
import CoeurTabSkeleton from './widgets/skeletons/CoeurTabSkeleton';

export function DashboardTabsLayout() {
  // State for success message after reconciliation
  const [successMessages, setSuccessMessages] = useState<CoachMessage[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch gaming data for stats and projection components
  const {
    gamification,
    gamificationLoading,
    prediction,
    bodyProjection,
    futureLevelTitles
  } = useGamingData();

  // Check absence status
  const { data: absenceStatus } = useAbsenceStatus();

  const streakMultiplier = gamification ? calculateStreakMultiplier(gamification.currentStreakDays) : 1;

  // Handle reconciliation success (triggered from child components)
  const handleReconciliationSuccess = (messages: CoachMessage[]) => {
    setSuccessMessages(messages);
    setShowSuccessMessage(true);
  };

  return (
    <Tabs defaultValue="twingame" forgeContext="dashboard" className="w-full">
      {/* Tabs Navigation */}
      <Tabs.List role="tablist" aria-label="Dashboard Navigation">
        <Tabs.Trigger value="twingame" icon="Hammer">
          Coeur
        </Tabs.Trigger>
        <Tabs.Trigger value="suivi" icon="Activity">
          Suivi
        </Tabs.Trigger>
        <Tabs.Trigger value="records" icon="Award">
          Records
        </Tabs.Trigger>
        <Tabs.Trigger value="classement" icon="Trophy">
          Classement
        </Tabs.Trigger>
      </Tabs.List>

      {/* TwinGame Tab - Gamification Pure - Coeur */}
      <Tabs.Panel value="twingame">
        {gamificationLoading ? (
          <CoeurTabSkeleton />
        ) : (
        <div className="space-y-6">
          {/* Success Message after reconciliation - replaces PendingXpWidget temporarily */}
          {showSuccessMessage && successMessages.length > 0 && (
            <ReconciliationSuccessMessage
              coachMessages={successMessages}
              onDismiss={() => {
                setShowSuccessMessage(false);
                setSuccessMessages([]);
              }}
              autoHideDuration={8000}
            />
          )}

          {/* Pending XP Widget - Alerte visuelle pour XP en attente (avant réconciliation) */}
          {!showSuccessMessage && absenceStatus?.hasActiveAbsence && (
            <PendingXpWidget
              onCtaClick={() => {
                // Scroll to weight update section in GamingProgressWidget
                scrollToSection('weight-update-section');
              }}
            />
          )}

          {/* Gaming Progress Widget - Tableau de bord d'actions */}
          <GamingProgressWidgetV3 onReconciliationSuccess={handleReconciliationSuccess} />

          {/* Daily Summary Stats - 3 résumés dans une glass card */}
          {gamification && !gamificationLoading && (
            <DailySummaryStats
              averageDailyXp={prediction?.averageDailyXp || 0}
              trendDirection={prediction?.trend || 'stable'}
              streakMultiplier={streakMultiplier}
              currentStreakDays={gamification.currentStreakDays}
              longestStreakDays={gamification.longestStreakDays}
            />
          )}

          {/* Gaming Projection and Stats - Projection + statistiques visuelles */}
          {prediction && !gamificationLoading && (
            <GamingProjectionAndStats
              prediction={prediction}
              bodyProjection={bodyProjection}
              futureLevelTitles={futureLevelTitles}
            />
          )}
        </div>
        )}
      </Tabs.Panel>

      {/* Suivi du jour Tab - PLACEHOLDER */}
      <Tabs.Panel value="suivi">
        <div className="space-y-6">
          <CalorieBalanceWidgetV3 />
        </div>
      </Tabs.Panel>

      {/* Records Tab - PLACEHOLDER */}
      <Tabs.Panel value="records">
        <div className="space-y-6">
          <RecordsWidgetSimplified />
        </div>
      </Tabs.Panel>

      {/* Classement Tab - PLACEHOLDER */}
      <Tabs.Panel value="classement">
        <div className="space-y-6">
          <LeaderboardWidgetSimplified />
        </div>
      </Tabs.Panel>
    </Tabs>
  );
}
