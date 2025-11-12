# Guide des Imports - Système de Gaming

**Version:** 3.0 | **Arborescence:** Novembre 2025

---

## 🎯 Nouveaux Chemins (v3.0)

### ⚠️ IMPORTANT: Changements d'Imports (Nov 2025)

```typescript
// ❌ ANCIENS CHEMINS (ne plus utiliser)
import { GamificationService } from '@/services/gamification';
import { useGamification } from '@/hooks/useGamification';
import { AbsenceService } from '@/services/absence';

// ✅ NOUVEAUX CHEMINS (Nov 2025)
import { GamificationService } from '@/services/dashboard/coeur';
import { useGamification } from '@/hooks/coeur/useGamification';
import { AbsenceDetectionService } from '@/services/dashboard/coeur/absence';
```

---

## 📦 Services (`/src/services/dashboard/coeur/`)

### Services Gamification Core

```typescript
// Service principal (CRUD gamification)
import { gamificationService } from '@/services/dashboard/coeur';
import { GamificationService } from '@/services/dashboard/coeur';

// Calculateurs
import { AdaptiveScoreCalculator } from '@/services/dashboard/coeur';
import { BonusXpCalculator } from '@/services/dashboard/coeur';
import { PhysicalQualitiesCalculator } from '@/services/dashboard/coeur';

// Score transformation
import { transformationScoreService } from '@/services/dashboard/coeur';
import { TransformationScoreService } from '@/services/dashboard/coeur';
```

### Services Prédictions

```typescript
// Prédictions
import { gamificationPredictionService } from '@/services/dashboard/coeur';
import { transformationPredictionService } from '@/services/dashboard/coeur';
import { gamificationLevelPredictionService } from '@/services/dashboard/coeur';
import { gamificationUniversalPredictionService } from '@/services/dashboard/coeur';
```

### Services Intelligence IA

```typescript
// Analyse IA
import { aiBehaviorAnalyzer } from '@/services/dashboard/coeur';
import { aiTransformationAnalyzer } from '@/services/dashboard/coeur';
import { actionQueueGenerator } from '@/services/dashboard/coeur';
```

### Services Absence

```typescript
// Import depuis sous-dossier absence/
import { AbsenceDetectionService } from '@/services/dashboard/coeur/absence';
import { AbsenceReconciliationService } from '@/services/dashboard/coeur/absence';
import { AbsenceRecoveryCoachingService } from '@/services/dashboard/coeur/absence';
import { AntiCheatValidationService } from '@/services/dashboard/coeur/absence';
import { EstimatedActivityService } from '@/services/dashboard/coeur/absence';

// Ou via barrel export
import {
  AbsenceDetectionService,
  AbsenceReconciliationService,
  type CoachMessage,
  type ReconciliationResult
} from '@/services/dashboard/coeur/absence';
```

### Types Services

```typescript
// Types gamification
import type {
  GamificationData,
  XpAwardResult,
  LevelMilestone
} from '@/services/dashboard/coeur';

// Types absence
import type {
  CoachMessage,
  ReconciliationResult,
  AbsenceDetectionResult
} from '@/services/dashboard/coeur/absence';
```

---

## 🪝 Hooks React (`/src/hooks/coeur/`)

### Hook Principal Gamification

```typescript
// Queries
import {
  useGamificationProgress,
  useRecentXpEvents,
  useLevelMilestone,
  useCurrentLevelTitle,
  useAllLevelMilestones,
  useWeightUpdateHistory,
  useXpStats
} from '@/hooks/coeur/useGamification';

// Mutations XP
import {
  useUpdateWeight,
  useAwardMealScanXp,
  useAwardCalorieGoalMetXp,
  useAwardTrainingSessionXp,
  useAwardBodyScanXp,
  useAwardFastingProtocolXp,
  useAwardWearableSyncXp
} from '@/hooks/coeur/useGamification';
```

### Hook Actions Quotidiennes

```typescript
import {
  useTodaysCompletedActions,
  useMarkActionCompleted,
  useIsActionCompletedToday,
  useActionOccurrenceCount,
  useDailyActionStats,
  useActionCombo,
  useTodayCompletionStats
} from '@/hooks/coeur/useDailyActionsTracking';
```

### Hook Prédictions

```typescript
// Prédictions transformation
import {
  useActivePrediction,
  usePredictionHistory,
  usePredictionMilestones,
  useGeneratePrediction,
  useUpdateMilestoneStatus
} from '@/hooks/coeur/useTransformationPrediction';

// Score transformation
import { useTransformationScore } from '@/hooks/coeur/useTransformationScore';

// Prédictions universelles
import { useUniversalPrediction } from '@/hooks/coeur/useUniversalPrediction';
```

### Hook First Time Bonus

```typescript
import {
  useFirstTimeBonusStatus,
  useIsFirstTimeBonusAvailable,
  claimFirstTimeBonus
} from '@/hooks/coeur/useFirstTimeBonus';
```

### Hooks Absence (root hooks/)

```typescript
// Ces hooks restent dans /src/hooks/
import { useAbsenceStatus } from '@/hooks/useAbsenceStatus';
import { useAbsenceReconciliation } from '@/hooks/useAbsenceReconciliation';
```

---

## 🎨 Composants UI (`/src/components/dashboard/widgets/coeur/`)

### Widget Principal

```typescript
// Widget principal (recommandé)
import GamingProgressWidgetV3 from '@/components/dashboard/widgets/coeur/GamingProgressWidgetV3';

// Ou version sub-folder
import GamingProgressWidget from '@/components/dashboard/widgets/coeur/GamingProgressWidget';
```

### Widgets Complémentaires

```typescript
// Actions quotidiennes
import GamingActionsWidget from '@/components/dashboard/widgets/coeur/GamingActionsWidget';

// Projections et stats
import GamingProjectionAndStats from '@/components/dashboard/widgets/coeur/GamingProjectionAndStats';

// Stats quotidiennes
import DailySummaryStats from '@/components/dashboard/widgets/coeur/DailySummaryStats';

// Panneau bonus
import GamificationBonusPanel from '@/components/dashboard/widgets/coeur/GamificationBonusPanel';

// Skeleton loading
import GamificationSkeleton from '@/components/dashboard/widgets/coeur/GamificationSkeleton';
```

### Sous-Composants (GamingProgressWidget/)

```typescript
// Composants internes
import ActionCommandPanel from '@/components/dashboard/widgets/coeur/GamingProgressWidget/components/ActionCommandPanel';
import CelebrationEffect from '@/components/dashboard/widgets/coeur/GamingProgressWidget/components/CelebrationEffect';
import LevelProgressBar from '@/components/dashboard/widgets/coeur/GamingProgressWidget/components/LevelProgressBar';
import PredictionTimeline from '@/components/dashboard/widgets/coeur/GamingProgressWidget/components/PredictionTimeline';
import StatsGrid from '@/components/dashboard/widgets/coeur/GamingProgressWidget/components/StatsGrid';
import UniversalPrediction from '@/components/dashboard/widgets/coeur/GamingProgressWidget/components/UniversalPrediction';
import WeightUpdateSection from '@/components/dashboard/widgets/coeur/GamingProgressWidget/components/WeightUpdateSection';
```

### Hooks Internes Widget

```typescript
// Hooks spécifiques widget
import { useGamingData } from '@/components/dashboard/widgets/coeur/GamingProgressWidget/hooks/useGamingData';
import { useWeightUpdate } from '@/components/dashboard/widgets/coeur/GamingProgressWidget/hooks/useWeightUpdate';
```

### Empty States

```typescript
import EmptyGamificationState from '@/components/dashboard/widgets/coeur/empty-states/EmptyGamificationState';
```

---

## 🔗 Composants Absence (hors coeur/)

```typescript
// Ces composants restent dans /src/components/absence/
import PendingXpWidget from '@/components/absence/PendingXpWidget';
import ReconciliationSuccessMessage from '@/components/absence/ReconciliationSuccessMessage';
import AbsenceCoachingMessages from '@/components/absence/AbsenceCoachingMessages';
```

---

## 📋 Exemples d'Imports Complets

### Exemple 1: Page avec Attribution XP

```typescript
import { useState } from 'react';
import { useAwardMealScanXp } from '@/hooks/coeur/useGamification';
import { useMarkActionCompleted } from '@/hooks/coeur/useDailyActionsTracking';
import { useToast } from '@/ui/components/ToastProvider';

function MealScanPage() {
  const awardXp = useAwardMealScanXp();
  const markAction = useMarkActionCompleted();
  const { showToast } = useToast();

  const handleScan = async () => {
    // Logique scan...

    // Mark action
    await markAction.mutateAsync({
      actionId: 'meal_scan',
      occurrenceNumber: 1
    });

    // Award XP
    const result = await awardXp.mutateAsync();

    showToast({
      title: `+${result.xpAwarded} XP!`,
      type: 'success'
    });
  };
}
```

### Exemple 2: Widget Dashboard avec Gaming

```typescript
import GamingProgressWidgetV3 from '@/components/dashboard/widgets/coeur/GamingProgressWidgetV3';
import GamingActionsWidget from '@/components/dashboard/widgets/coeur/GamingActionsWidget';
import { useGamificationProgress } from '@/hooks/coeur/useGamification';
import { useAbsenceStatus } from '@/hooks/useAbsenceStatus';

function DashboardPage() {
  const { data: gaming, isLoading } = useGamificationProgress();
  const { data: absence } = useAbsenceStatus();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {absence?.hasActiveAbsence && (
        <PendingXpWidget pendingXp={absence.pendingXp} />
      )}

      <GamingProgressWidgetV3 />
      <GamingActionsWidget />

      <p>Niveau actuel: {gaming.currentLevel}</p>
    </div>
  );
}
```

### Exemple 3: Service Direct (Usage Avancé)

```typescript
import { supabase } from '@/system/supabase/client';
import { gamificationService } from '@/services/dashboard/coeur';
import { AbsenceReconciliationService } from '@/services/dashboard/coeur/absence';

async function manualXpAward(userId: string) {
  // Via service direct (non recommandé, utiliser hooks)
  const result = await gamificationService.awardXp(
    userId,
    50, // baseXp
    'custom_action',
    { reason: 'special_event' }
  );

  return result;
}

async function reconcileUserAbsence(userId: string, newWeight: number) {
  const reconciliationService = new AbsenceReconciliationService(supabase);

  const result = await reconciliationService.reconcileAbsence({
    userId,
    newWeight
  });

  return result;
}
```

---

## 🔄 Migration depuis Ancienne Arborescence

### Script de Remplacement Automatique

```bash
# Remplacer imports services
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's|@/services/gamification|@/services/dashboard/coeur|g'

# Remplacer imports hooks
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's|@/hooks/useGamification|@/hooks/coeur/useGamification|g'

# Remplacer imports absence
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's|@/services/absence|@/services/dashboard/coeur/absence|g'
```

### Checklist Migration Manuelle

- [ ] Remplacer tous `@/services/gamification` → `@/services/dashboard/coeur`
- [ ] Remplacer tous `@/hooks/useGamification` → `@/hooks/coeur/useGamification`
- [ ] Remplacer tous `@/services/absence` → `@/services/dashboard/coeur/absence`
- [ ] Vérifier build sans erreurs: `npm run build`
- [ ] Tester fonctionnalités gaming dans UI

---

## 🎯 Raccourcis Fréquents

### Top 5 Imports les Plus Utilisés

```typescript
// 1. Hook principal gamification
import { useGamificationProgress } from '@/hooks/coeur/useGamification';

// 2. Attribution XP meal scan
import { useAwardMealScanXp } from '@/hooks/coeur/useGamification';

// 3. Widget principal
import GamingProgressWidgetV3 from '@/components/dashboard/widgets/coeur/GamingProgressWidgetV3';

// 4. Tracking actions
import { useMarkActionCompleted } from '@/hooks/coeur/useDailyActionsTracking';

// 5. Update poids avec absence
import { useWeightUpdate } from '@/components/dashboard/widgets/coeur/GamingProgressWidget/hooks/useWeightUpdate';
```

---

## 📚 Ressources Complémentaires

- **Structure complète:** `ARBORESCENCE_ET_INTEGRATION.md`
- **Guide démarrage:** `QUICK_START.md`
- **API technique:** `GAMING_SYSTEM_TECHNICAL_DOC.md`

---

**Dernière mise à jour:** Novembre 2025 (v3.0)
