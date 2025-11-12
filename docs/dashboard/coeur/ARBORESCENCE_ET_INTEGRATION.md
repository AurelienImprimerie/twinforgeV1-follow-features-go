# Système de Gaming TwinForge - Arborescence & Guide d'Intégration

**Version:** 3.0
**Date:** 11 Novembre 2025
**Statut:** Production Active

---

## 📁 Arborescence Complète du Système

### 1. Services Core (`/src/services/dashboard/coeur/`)

```
src/services/dashboard/coeur/
├── index.ts                                  # Export barrel principal
│
├── GamificationService.ts                    # ⭐ Service CRUD gamification
├── AdaptiveScoreCalculator.ts               # Calcul XP avec multiplicateurs
├── BonusXpCalculator.ts                      # Calculs bonus intelligents
├── PhysicalQualitiesCalculator.ts           # Qualités physiques
├── TransformationScoreService.ts             # Score transformation global
│
├── GamificationPredictionService.ts          # Prédictions niveaux
├── TransformationPredictionService.ts        # Prédictions transformation
├── GamificationLevelPredictionService.ts     # Détails niveaux futurs
├── GamificationUniversalPredictionService.ts # ⭐ Orchestrateur prédictions
│
├── AIBehaviorAnalyzer.ts                     # Analyse IA comportement
├── AITransformationAnalyzer.ts               # Analyse IA transformation
├── ActionQueueGenerator.ts                   # Génération actions suggérées
│
└── absence/                                   # ⭐ Système d'absence (NOUVEAU)
    ├── index.ts
    ├── AbsenceDetectionService.ts            # Détection inactivité
    ├── AbsenceReconciliationService.ts       # Réconciliation XP
    ├── AbsenceRecoveryCoachingService.ts     # Messages coaching
    ├── AntiCheatValidationService.ts         # Validation anti-triche
    └── EstimatedActivityService.ts           # Estimation activité
```

### 2. Composants UI (`/src/components/dashboard/widgets/coeur/`)

```
src/components/dashboard/widgets/coeur/
├── GamingProgressWidget/                     # ⭐ Widget principal
│   ├── index.tsx                             # Orchestrateur
│   ├── types.ts                              # Types TypeScript
│   ├── components/
│   │   ├── ActionCommandPanel.tsx            # Panneau actions quotidiennes
│   │   ├── CelebrationEffect.tsx             # Animations célébration
│   │   ├── LevelProgressBar.tsx              # Barre progression niveau
│   │   ├── PredictionTimeline.tsx            # Timeline prédictions
│   │   ├── StatsGrid.tsx                     # Grille statistiques
│   │   ├── UniversalPrediction.tsx           # Prédictions universelles
│   │   └── WeightUpdateSection.tsx           # Section update poids
│   ├── hooks/
│   │   ├── useGamingData.ts                  # ⭐ Hook données gaming
│   │   └── useWeightUpdate.ts                # Hook update poids + absence
│   └── utils/
│       └── multipliers.ts                    # Calculs multiplicateurs
│
├── GamingProgressWidgetV3.tsx                # Version v3 (wrapper)
├── GamingActionsWidget.tsx                   # Widget actions CTA
├── GamingProjectionAndStats.tsx              # Projections + stats
├── DailySummaryStats.tsx                     # Stats quotidiennes
├── GamificationBonusPanel.tsx                # Panneau bonus
├── GamificationSkeleton.tsx                  # Loading skeleton
│
└── empty-states/
    └── EmptyGamificationState.tsx            # État vide gaming
```

### 3. Hooks React (`/src/hooks/coeur/`)

```
src/hooks/coeur/
├── useGamification.ts                        # ⭐ Hook principal gamification
├── useTransformationPrediction.ts            # Hook prédictions transformation
├── useTransformationScore.ts                 # Hook score transformation
├── useUniversalPrediction.ts                 # Hook prédictions universelles
├── useDailyActionsTracking.ts                # ⭐ Hook actions quotidiennes
└── useFirstTimeBonus.ts                      # Hook bonus première fois
```

### 4. Migrations SQL (`/supabase/migrations/`)

**Migrations Critiques (dans l'ordre):**

1. `20251108025539_20251108120000_add_gamification_system.sql` - Tables de base
2. `20251111000000_sprint3_acceleration_progression.sql` - Accélération progression
3. `20251112000000_sprint4_multiplicateurs_performance.sql` - Multiplicateurs
4. `20251113000000_sprint5_ai_behavior_analysis.sql` - Analyse IA
5. `20251114000000_sprint6_records_and_leaderboard_system.sql` - Records/Classement
6. `20251120000000_add_absence_continuity_system_fixed.sql` - ⭐ Système d'absence
7. `20251122000000_optimize_daily_actions_for_multiple_occurrences.sql` - Actions multiples

---

## 🔌 Guide d'Intégration Rapide

### Étape 1: Copier les Fichiers

**Fichiers OBLIGATOIRES:**

```bash
# Services (13 fichiers + dossier absence)
src/services/dashboard/coeur/

# Composants (18 fichiers)
src/components/dashboard/widgets/coeur/

# Hooks (6 fichiers)
src/hooks/coeur/

# Migrations SQL (12 fichiers minimum)
supabase/migrations/2025110*.sql
supabase/migrations/2025111*.sql
supabase/migrations/2025112*.sql
```

### Étape 2: Appliquer les Migrations

```bash
# Via Supabase CLI
supabase db push

# Ou via MCP tool
mcp__supabase__apply_migration --filename="..." --content="..."
```

### Étape 3: Intégrer dans votre Dashboard

```tsx
// 1. Import du widget principal
import GamingProgressWidgetV3 from '@/components/dashboard/widgets/coeur/GamingProgressWidgetV3';

// 2. Utiliser dans votre page
function DashboardPage() {
  return (
    <div>
      <GamingProgressWidgetV3 />
    </div>
  );
}
```

---

## 🎮 Points d'Intégration Critiques

### 1. Attribution XP sur Actions

**Pour intégrer XP dans vos features existantes:**

```typescript
import { useAwardMealScanXp } from '@/hooks/coeur/useGamification';

function MealScanPage() {
  const awardMealScanXp = useAwardMealScanXp();

  const handleMealScan = async () => {
    // Votre logique de scan...

    // Attribution XP automatique
    await awardMealScanXp.mutateAsync();
  };
}
```

**Actions disponibles:**
- `useAwardMealScanXp()` - Scanner un repas
- `useAwardCalorieGoalMetXp()` - Atteindre objectif calorique
- `useAwardTrainingSessionXp()` - Terminer entraînement
- `useAwardBodyScanXp()` - Scanner corps 3D
- `useAwardFastingProtocolXp()` - Terminer jeûne
- `useAwardWearableSyncXp()` - Sync wearable

### 2. Tracking Actions Quotidiennes

**Pour marquer une action comme complétée:**

```typescript
import { useMarkActionCompleted } from '@/hooks/coeur/useDailyActionsTracking';

function MyFeature() {
  const markCompleted = useMarkActionCompleted();

  const handleAction = async () => {
    await markCompleted.mutateAsync({
      actionId: 'meal_scan',
      occurrenceNumber: 1 // 1er scan, 2ème scan, etc.
    });
  };
}
```

**Actions trackées:**
- `meal_scan` (multiple/jour)
- `activity_log` (multiple/jour)
- `training_session` (1/jour)
- `body_scan` (1/jour)
- `fasting_protocol` (1/jour)
- `wearable_sync` (1/jour)

### 3. Mise à Jour du Poids avec Réconciliation

**Le hook gère automatiquement l'absence:**

```typescript
import { useWeightUpdate } from '@/components/dashboard/widgets/coeur/GamingProgressWidget/hooks/useWeightUpdate';

function WeightTracker() {
  const {
    weight,
    handleWeightChange,
    handleWeightSubmit,
    hasActiveAbsence,
    pendingXp
  } = useWeightUpdate(weightHistory);

  // Si hasActiveAbsence = true, le système utilise automatiquement
  // la réconciliation d'absence au lieu du flow normal
}
```

### 4. Affichage des Prédictions

```typescript
import { useUniversalPrediction } from '@/hooks/coeur/useUniversalPrediction';

function PredictionsPanel() {
  const { data: prediction } = useUniversalPrediction();

  if (prediction) {
    console.log('Niveau estimé dans 30j:', prediction.predictions.days30.estimatedLevel);
    console.log('Poids estimé dans 30j:', prediction.predictions.days30.estimatedWeight);
  }
}
```

### 5. Intégration avec Brain/IA

**Le système s'intègre automatiquement avec le Brain si présent:**

```typescript
// Dans GamificationDataCollector.ts
import { gamificationService } from '@/services/dashboard/coeur';

async function collectGamificationData(userId: string) {
  const data = await gamificationService.getGamificationProgress(userId);
  return {
    currentLevel: data.currentLevel,
    currentXp: data.currentXp,
    streak: data.streak,
    // ... envoyé au Brain pour contexte IA
  };
}
```

---

## 🔧 Configuration Requise

### Variables d'Environnement

**Aucune variable supplémentaire requise!** Le système utilise:
- `VITE_SUPABASE_URL` (déjà configuré)
- `VITE_SUPABASE_ANON_KEY` (déjà configuré)

### Dépendances NPM

**Déjà incluses dans votre projet:**
- `@tanstack/react-query` - Gestion état serveur
- `@supabase/supabase-js` - Client Supabase
- `framer-motion` - Animations
- `lucide-react` - Icônes

### Tables Supabase Requises

**Créées par les migrations:**
- `user_gamification` - État gamification
- `xp_attribution_audit` - Audit XP (idempotence)
- `gamification_level_milestones` - Paliers niveaux
- `transformation_predictions` - Prédictions transformation
- `gamification_predictions` - Prédictions niveaux
- `daily_actions_tracking` - Tracking actions quotidiennes
- `absence_logs` - Logs d'absence
- `absence_reconciliation` - Réconciliations

---

## 🎯 Fonctionnalités Clés

### 1. Attribution XP Idempotente

**Sécurité:** Impossible d'attribuer XP deux fois pour la même action
```typescript
// Base XP + Multiplicateurs dynamiques
const xp = baseXp * streakMultiplier * weeklyActiveMultiplier * firstTimeBonus;
```

### 2. Multiplicateurs Intelligents

- **Streak Multiplier:** x1.0 → x2.5 (max 30 jours)
- **Weekly Active Days:** +10% par jour actif/semaine
- **First Time Bonus:** x2.0 sur première occurrence
- **Combo Actions:** Bonus si plusieurs actions/jour

### 3. Système d'Absence Automatique

- Détection automatique après 3+ jours inactifs
- Estimation XP manquants basée sur historique
- Validation anti-triche (cohérence poids)
- Réconciliation au retour utilisateur

### 4. Prédictions IA Multi-niveaux

- Prédiction niveau à 30/60/90 jours
- Prédiction poids à 30/60/90 jours
- Confiance adaptative (high/medium/low)
- Timeline visuelle des milestones

### 5. Actions Multiples & Combos

- Tracker plusieurs occurrences d'une action/jour
- Détection combos automatique (ex: 3 repas scannés + training)
- Bonus XP sur combos
- Badges visuels

---

## 🚀 Workflows d'Intégration Typiques

### Workflow 1: Ajouter XP à une Feature Existante

```typescript
// 1. Import hook
import { useAwardTrainingSessionXp } from '@/hooks/coeur/useGamification';

// 2. Utiliser dans composant
function TrainingSession() {
  const awardXp = useAwardTrainingSessionXp();

  const completeSession = async (sessionId: string) => {
    // Logique métier...
    await saveSession(sessionId);

    // Attribution XP
    const result = await awardXp.mutateAsync({ sessionId });

    if (result.leveledUp) {
      showLevelUpAnimation();
    }
  };
}
```

### Workflow 2: Afficher État Gaming dans un Widget

```typescript
import { useGamificationProgress } from '@/hooks/coeur/useGamification';

function MyCustomWidget() {
  const { data: gaming, isLoading } = useGamificationProgress();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h2>Niveau {gaming.currentLevel}</h2>
      <ProgressBar value={gaming.currentXp} max={gaming.xpToNextLevel} />
      <p>Streak: {gaming.currentStreak} jours 🔥</p>
    </div>
  );
}
```

### Workflow 3: Réconciliation d'Absence Manuelle

```typescript
import { useAbsenceReconciliation } from '@/hooks/useAbsenceReconciliation';

function WeightUpdateForm() {
  const reconcile = useAbsenceReconciliation();

  const handleWeightUpdate = async (newWeight: number) => {
    const result = await reconcile.mutateAsync({ newWeight });

    // Afficher messages coaching
    result.coachMessages.forEach(msg => {
      showToast(msg.message, msg.type);
    });
  };
}
```

---

## 📊 Schéma des Flux de Données

```
┌─────────────────┐
│  User Action    │ (Meal Scan, Training, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Award XP Hook   │ useAwardMealScanXp(), etc.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gaming Service  │ GamificationService.awardXp()
└────────┬────────┘
         │
         ├──► AdaptiveScoreCalculator (calcul XP)
         ├──► BonusXpCalculator (bonus)
         ├──► xp_attribution_audit (idempotence)
         │
         ▼
┌─────────────────┐
│ user_gamification│ UPDATE currentXp, currentLevel
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ React Query     │ Invalidation cache + refetch
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ UI Updates      │ Animation, Toast, Widget refresh
└─────────────────┘
```

---

## 🔍 Dépannage & FAQ

### Q1: "XP not awarded after action"

**Vérifiez:**
1. Migration `xp_attribution_audit` appliquée?
2. RLS policies activées sur `user_gamification`?
3. `userId` valide dans session Supabase?
4. Logs dans `xp_attribution_audit` table

### Q2: "Predictions not showing"

**Vérifiez:**
1. Au moins 3 jours de données historiques?
2. Table `transformation_predictions` existe?
3. Edge function `generate-predictions` déployée?

### Q3: "Absence reconciliation not triggering"

**Vérifiez:**
1. Au moins 3 jours d'inactivité?
2. Table `absence_logs` existe?
3. `useAbsenceStatus()` hook appelé?

### Q4: "Build errors with imports"

**Solution:**
```typescript
// ✅ Correct
import { GamificationService } from '@/services/dashboard/coeur';
import { useGamification } from '@/hooks/coeur/useGamification';

// ❌ Incorrect (old paths)
import { GamificationService } from '@/services/gamification';
```

---

## 📝 Checklist d'Intégration Complète

- [ ] Copier dossier `/services/dashboard/coeur/`
- [ ] Copier dossier `/components/dashboard/widgets/coeur/`
- [ ] Copier dossier `/hooks/coeur/`
- [ ] Appliquer 12 migrations SQL
- [ ] Vérifier build sans erreurs
- [ ] Tester attribution XP sur une action
- [ ] Vérifier affichage widget gaming
- [ ] Tester réconciliation absence
- [ ] Vérifier prédictions IA
- [ ] Tester actions multiples/jour
- [ ] Valider RLS policies
- [ ] Tester animations et celebratio ns

---

## 🎉 Résultat Final

Une fois intégré, vous aurez:

✅ Système de progression gamifié complet
✅ Attribution XP automatique sur 6+ actions
✅ Multiplicateurs intelligents (streak, combos)
✅ Prédictions IA à 30/60/90 jours
✅ Gestion absence automatique
✅ Widget dashboard clé-en-main
✅ Hooks React prêts à l'emploi
✅ Animations et célébrations
✅ Classement et records
✅ 100% sécurisé avec RLS

---

**Prochaines Étapes:**
1. Lire `GAMING_SYSTEM_TECHNICAL_DOC.md` pour détails techniques
2. Voir `PREDICTION_SYSTEM_TECHNICAL_DOC.md` pour prédictions IA
3. Consulter code source des hooks pour exemples avancés
