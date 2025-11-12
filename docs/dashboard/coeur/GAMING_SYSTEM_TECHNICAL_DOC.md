# Système de Gaming TwinForge - Documentation Technique

**Version:** 3.0
**Date:** 11 Novembre 2025
**Statut:** Production Active
**Auteur:** Équipe Technique TwinForge
**Dernière Mise à Jour:** Nouvelle Arborescence & Système d'Absence Intégré

---

## 🎯 Vue d'Ensemble Technique

Le système de gaming TwinForge est une architecture multi-services qui gère la gamification, les prédictions IA et les réconciliations d'absences. Il s'intègre avec toutes les forges (Training, Nutrition, Fasting, Body Scan) pour créer une expérience de progression unifiée.

**📂 Nouvelle Arborescence (Nov 2025):**
- Services: `/src/services/dashboard/coeur/` (+ sous-dossier `absence/`)
- Composants: `/src/components/dashboard/widgets/coeur/`
- Hooks: `/src/hooks/coeur/`

**📖 Voir aussi:** `ARBORESCENCE_ET_INTEGRATION.md` pour guide complet d'intégration

---

## 🏗️ Architecture Globale

### Services Principaux (`/src/services/dashboard/coeur/`)

```
src/services/dashboard/coeur/
├── GamificationService.ts              # ⭐ Service CRUD gamification principal
├── AdaptiveScoreCalculator.ts          # Calcul XP avec multiplicateurs dynamiques
├── BonusXpCalculator.ts                # Calculs bonus intelligents (streak, combo)
├── PhysicalQualitiesCalculator.ts      # Calcul qualités physiques (force, endurance, etc.)
├── TransformationScoreService.ts       # Score transformation global (cohérence + momentum)
│
├── GamificationPredictionService.ts    # Prédictions niveaux futurs
├── TransformationPredictionService.ts  # Prédictions poids/corps
├── GamificationLevelPredictionService.ts    # Détails paliers niveaux futurs
├── GamificationUniversalPredictionService.ts # ⭐ Orchestrateur prédictions universelles
│
├── AIBehaviorAnalyzer.ts               # Analyse comportement utilisateur par IA
├── AITransformationAnalyzer.ts         # Analyse transformation physique par IA
├── ActionQueueGenerator.ts             # Génération actions suggérées intelligentes
│
└── absence/                             # ⭐ Système d'Absence (NOUVEAU Nov 2025)
    ├── index.ts                         # Export barrel
    ├── AbsenceDetectionService.ts       # Détection inactivité utilisateur
    ├── AbsenceReconciliationService.ts  # Orchestrateur réconciliation XP
    ├── AbsenceRecoveryCoachingService.ts # Génération messages coaching
    ├── AntiCheatValidationService.ts    # Validation anti-triche (cohérence poids)
    └── EstimatedActivityService.ts      # Estimation activité pendant absence
```

### Composants UI (`/src/components/dashboard/widgets/coeur/`)

```
src/components/dashboard/widgets/coeur/
├── GamingProgressWidget/               # ⭐ Widget principal orchestrateur
│   ├── index.tsx                       # Point d'entrée principal
│   ├── types.ts                        # Types TypeScript
│   ├── components/                     # Sous-composants
│   │   ├── ActionCommandPanel.tsx      # Panneau actions quotidiennes
│   │   ├── CelebrationEffect.tsx       # Animations célébration level up
│   │   ├── LevelProgressBar.tsx        # Barre progression niveau
│   │   ├── PredictionTimeline.tsx      # Timeline prédictions visuelles
│   │   ├── StatsGrid.tsx               # Grille statistiques (XP, streak, etc.)
│   │   ├── UniversalPrediction.tsx     # Affichage prédictions universelles
│   │   └── WeightUpdateSection.tsx     # Section update poids + absence
│   ├── hooks/
│   │   ├── useGamingData.ts            # ⭐ Hook données gaming complètes
│   │   └── useWeightUpdate.ts          # Hook update poids + détection absence
│   └── utils/
│       └── multipliers.ts              # Calculs multiplicateurs streak/combo
│
├── GamingProgressWidgetV3.tsx          # Wrapper v3 (backward compat)
├── GamingActionsWidget.tsx             # Widget actions CTA quotidiennes
├── GamingProjectionAndStats.tsx        # Projections + statistiques combinées
├── DailySummaryStats.tsx               # Résumé stats quotidiennes
├── GamificationBonusPanel.tsx          # Panneau bonus/multiplicateurs
└── GamificationSkeleton.tsx            # Loading skeleton optimisé
```

### Hooks React (`/src/hooks/coeur/`)

```
src/hooks/coeur/
├── useGamification.ts                  # ⭐ Hook principal (queries + mutations XP)
├── useTransformationPrediction.ts      # Hook prédictions transformation
├── useTransformationScore.ts           # Hook score transformation global
├── useUniversalPrediction.ts           # Hook prédictions universelles
├── useDailyActionsTracking.ts          # ⭐ Hook tracking actions quotidiennes
└── useFirstTimeBonus.ts                # Hook bonus première fois (double XP)
```

### Base de Données

**Tables Principales**:
- `user_gamification` - État gamification par utilisateur
- `xp_attribution_audit` - Historique attribution XP (idempotence)
- `transformation_scores` - Scores de transformation calculés
- `user_absence_logs` - Logs d'absence et réconciliations
- `daily_actions_completion` - **[NOUVEAU v2.0]** Tracking actions quotidiennes multiples

---

## 📊 Service: GamificationService

**Localisation**: `src/services/dashboard/coeur/GamificationService.ts`

### Responsabilités

- Gestion complète état gamification utilisateur
- Calcul XP et progression de niveaux
- Attribution XP pour toutes actions (training, nutrition, fasting, body scan, poids)
- Synchronisation temps réel avec base de données

### Méthodes Clés

#### `getGamification(userId: string)`
Récupère l'état gamification complet d'un utilisateur.

**Retourne**:
```typescript
{
  userId: string;
  currentLevel: number;
  currentXp: number;
  totalXpEarned: number;
  currentStreakDays: number;
  longestStreakDays: number;
  perfectDaysCount: number;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `awardXp(userId: string, amount: number, source: string, metadata?: any)`
Attribue des XP à un utilisateur avec gestion idempotente.

**Paramètres**:
- `userId`: ID utilisateur
- `amount`: Montant XP brut (avant multiplicateurs)
- `source`: Source de l'XP (`'training_completed'`, `'meal_logged'`, `'weight_updated'`, etc.)
- `metadata`: Données contextuelles (optionnel)

**Processus**:
1. Vérification idempotence (via `xp_attribution_audit`)
2. Calcul multiplicateurs via `AdaptiveScoreCalculator`
3. Application XP finaux
4. Mise à jour niveau si seuils franchis
5. Vérification jours parfaits et streaks
6. Persistence en base

**Retourne**:
```typescript
{
  success: boolean;
  xpAwarded: number; // XP après multiplicateurs
  newLevel: number;
  leveledUp: boolean;
  multiplier: number;
  currentXp: number;
  xpToNextLevel: number;
}
```

#### `calculateXpForNextLevel(currentLevel: number)`
Calcule XP requis pour atteindre niveau suivant.

**Formule**:
```typescript
// Courbe exponentielle équilibrée
if (level <= 10) return 100 + (level - 1) * 100;
if (level <= 30) return 1000 + (level - 11) * 500;
if (level <= 60) return 10000 + (level - 31) * 1500;
return 55000 + (level - 61) * 4000;
```

#### `updateStreak(userId: string)`
Met à jour le streak de l'utilisateur selon dernière activité.

**Logique**:
- Si activité < 24h: Streak continue
- Si 24h < activité < 48h: Streak maintenu (grâce marge)
- Si activité > 48h: Streak réinitialisé

---

## 🎲 Service: AdaptiveScoreCalculator

**Localisation**: `src/services/dashboard/coeur/AdaptiveScoreCalculator.ts`

### Responsabilités

Calcul des multiplicateurs XP selon 4 facteurs contextuels.

### Les 4 Multiplicateurs

#### 1. Multiplicateur de Streak
```typescript
calculateStreakMultiplier(streakDays: number): number {
  if (streakDays >= 90) return 2.0;   // +100%
  if (streakDays >= 60) return 1.75;  // +75%
  if (streakDays >= 30) return 1.5;   // +50%
  if (streakDays >= 14) return 1.25;  // +25%
  if (streakDays >= 7) return 1.1;    // +10%
  return 1.0;                          // Standard
}
```

#### 2. Multiplicateur de Perfection
```typescript
calculatePerfectionMultiplier(isPerfectDay: boolean): number {
  return isPerfectDay ? 1.3 : 1.0; // +30% si jour parfait
}
```

**Jour Parfait** = Training + Nutrition + Fasting + Poids tous complétés

#### 3. Multiplicateur de Progression
```typescript
calculateProgressionMultiplier(user: UserData): number {
  const last7Days = analyzeActivityLast7Days(user);
  const last30Days = analyzeActivityLast30Days(user);

  if (last7Days.avgXp > last30Days.avgXp * 1.2) {
    return 1.2; // +20% si progression
  }
  return 1.0;
}
```

#### 4. Multiplicateur de Défis
```typescript
calculateChallengeMultiplier(action: Action): number {
  if (action.type === 'record_broken') return 1.5;     // +50%
  if (action.type === 'weekly_goal_met') return 1.25;  // +25%
  if (action.type === 'community_challenge') return 1.4; // +40%
  return 1.0;
}
```

### Méthode Principale

#### `calculateFinalMultiplier(context: MultiplierContext)`

**Calcul**:
```typescript
finalMultiplier =
  streakMultiplier ×
  perfectionMultiplier ×
  progressionMultiplier ×
  challengeMultiplier;

// Exemple: 1.5 × 1.3 × 1.2 × 1.5 = 3.51× !
```

**Contexte Requis**:
```typescript
interface MultiplierContext {
  streakDays: number;
  isPerfectDay: boolean;
  userHistory: ActivityHistory;
  actionType: string;
  metadata?: any;
}
```

---

## 🔮 Service: GamificationUniversalPredictionService

**Localisation**: `src/services/dashboard/coeur/GamificationUniversalPredictionService.ts`

### Responsabilités

Orchestrateur qui génère les 3 types de prédictions (niveau, poids, transformation).

### Méthode Principale

#### `generateUniversalPrediction(userId: string, timeframesDays: number[])`

**Timeframes typiques**: `[30, 60, 90]` jours

**Processus**:
1. Récupère état gamification actuel
2. Analyse historique XP (30 derniers jours)
3. Calcule XP quotidien moyen
4. Appelle `GamificationLevelPredictionService` pour niveaux futurs
5. Appelle `TransformationPredictionService` pour poids/corps futurs
6. Calcule niveau de confiance global

**Retourne**:
```typescript
{
  predictions: {
    30: { level, xp, weight, confidence },
    60: { level, xp, weight, confidence },
    90: { level, xp, weight, confidence }
  },
  currentState: {
    level: number,
    xp: number,
    weight: number,
    avgDailyXp: number
  },
  confidence: 'low' | 'medium' | 'high',
  metadata: {
    dataPoints: number,
    consistencyScore: number,
    lastUpdateDate: string
  }
}
```

### Calcul du Niveau de Confiance

```typescript
calculateConfidence(history: XpHistory): ConfidenceLevel {
  const dataPoints = history.length;
  const consistency = calculateStdDev(history.dailyXp);

  if (dataPoints >= 20 && consistency < 0.3) return 'high';
  if (dataPoints >= 10 && consistency < 0.5) return 'medium';
  return 'low';
}
```

**Facteurs**:
- Nombre de jours de données (min 10 pour `medium`, 20 pour `high`)
- Consistance XP quotidien (écart-type < 0.3 pour `high`)
- Régularité des activités

---

## 🔮 Service: TransformationPredictionService

**Localisation**: `src/services/dashboard/coeur/TransformationPredictionService.ts`

### Responsabilités

Prédiction transformation corporelle (poids, composition) basée sur historique.

### Méthode Principale

#### `predictTransformation(userId: string, timeframeDays: number)`

**Processus**:
1. Récupère historique poids (30-90 derniers jours)
2. Calcule vélocité moyenne (kg/semaine)
3. Analyse tendance (perte/gain/stable)
4. Projette poids futur avec marge d'erreur
5. Estime composition corporelle si body scans disponibles

**Retourne**:
```typescript
{
  currentWeight: number;
  predictedWeight: number;
  weightChange: number;
  velocity: number; // kg/semaine
  confidence: 'low' | 'medium' | 'high';
  marginOfError: number;
  trend: 'losing' | 'gaining' | 'maintaining';
  projectedBodyComposition?: {
    bodyFat: number;
    muscleMass: number;
  };
}
```

### Formule de Prédiction

```typescript
// Régression linéaire simple
predictedWeight = currentWeight + (velocity × weeksInTimeframe);

// Marge d'erreur basée sur variance historique
marginOfError = stdDev(weeklyChanges) × sqrt(weeksInTimeframe);
```

---

## 🚫 Service: AbsenceReconciliationService

**Localisation**: `src/services/absence/AbsenceReconciliationService.ts`

### Responsabilités

Gestion complète du cycle de vie des absences et réconciliation XP.

### Cycle de Réconciliation

#### Étape 1: Détection
`AbsenceDetectionService.detectAbsence(userId)`

**Seuils**:
- 24h: Soft reminder (pas d'action)
- 48h: Absence active détectée
- 72h: Estimation XP activée
- 7 jours: Maximum estimation
- 14 jours: Hibernation (pas d'estimation)

#### Étape 2: Estimation
`AbsenceDetectionService.estimateXpDuringAbsence(userId, days)`

**Calcul**:
```typescript
avgDailyXp = calculateAvgXpLast30Days(userId);
estimatedXp = avgDailyXp × daysAbsent × 0.5; // 50% des XP habituels
```

**Pourquoi 50%**:
- Pénalité légère pour absence
- Encourage retour sans décourager
- Équilibre entre fairness et générosité

#### Étape 3: Réconciliation
`AbsenceReconciliationService.reconcileAbsence(userId, weightUpdate)`

**Processus**:
1. Vérifie absence active existante
2. Validation mise à jour poids (anti-triche)
3. Attribution XP estimés (50%)
4. Préservation streak si < 7 jours
5. Génération messages coaching personnalisés
6. Mise à jour état absence (status: `reconciled`)

**Retourne**:
```typescript
{
  success: boolean;
  xpRecovered: number;
  streakPreserved: boolean;
  newLevel?: number;
  leveledUp: boolean;
  messages: CoachMessage[];
}
```

### Validation Anti-Triche

```typescript
validateWeightUpdate(currentWeight, newWeight, daysAbsent): boolean {
  const maxChangePerDay = 0.3; // kg
  const maxAllowedChange = maxChangePerDay × daysAbsent;
  const actualChange = Math.abs(newWeight - currentWeight);

  if (actualChange > maxAllowedChange × 1.5) {
    return false; // Changement suspect
  }
  return true;
}
```

---

## 🎨 Widget: GamingProgressWidget

**Localisation**: `src/components/dashboard/widgets/GamingProgressWidget/`

### Architecture Modulaire

```
GamingProgressWidget/
├── index.tsx (Orchestrateur principal)
├── types.ts (Types TypeScript)
├── hooks/
│   ├── useGamingData.ts (Récupération données)
│   └── useWeightUpdate.ts (Gestion mise à jour poids)
├── components/
│   ├── LevelProgressBar.tsx (Barre progression)
│   ├── StatsGrid.tsx (Grille statistiques)
│   ├── PredictionTimeline.tsx (Timeline prédictions)
│   ├── WeightUpdateSection.tsx (Section poids)
│   ├── ActionCommandPanel.tsx (Panel actions)
│   ├── CelebrationEffect.tsx (Effet célébration)
│   └── UniversalPrediction.tsx (Affichage prédictions)
└── utils/
    └── multipliers.ts (Utilitaires multiplicateurs)
```

### Hook: useGamingData

**Responsabilité**: Chargement données gamification, prédictions, projections corporelles.

**Utilisation**:
```typescript
const {
  gamification,
  gamificationLoading,
  prediction,
  bodyProjection,
  weightHistory,
  levelInfo,
  futureLevelTitles,
  levelProgress
} = useGamingData();
```

**Sources de données**:
- `GamificationService` pour état actuel
- `GamificationUniversalPredictionService` pour prédictions
- `BodyProjectionService` pour projection corporelle
- Historique poids depuis `body_scans` et `weight_updates`

### Hook: useWeightUpdate

**Responsabilité**: Gestion mise à jour poids avec réconciliation absences.

**Utilisation**:
```typescript
const {
  weight,
  showValidationModal,
  validationResult,
  showCelebration,
  coachMessages,
  hasActiveAbsence,
  pendingXp,
  isReconciling,
  handleWeightSubmit,
  confirmWeightUpdate
} = useWeightUpdate(weightHistory, onReconciliationSuccess);
```

**Flux**:
1. User modifie input poids → `handleWeightSubmit()`
2. Validation changement (modal si > 5% ou < 30 jours)
3. Si absence détectée → `AbsenceReconciliationService.reconcileAbsence()`
4. Sinon → Update standard poids + attribution XP
5. Célébration si level up
6. Messages coaching affichés

---

## 🔗 Points d'Intégration

### Intégration avec Forges

**Training**:
```typescript
// Après complétion séance
await GamificationService.awardXp(userId, 50, 'training_completed', {
  discipline: 'force',
  duration: 60,
  exercisesCount: 8
});
```

**Nutrition**:
```typescript
// Après log repas
await GamificationService.awardXp(userId, 10, 'meal_logged', {
  mealType: 'breakfast',
  calories: 450
});
```

**Fasting**:
```typescript
// Après fin jeûne
await GamificationService.awardXp(userId, 30, 'fasting_completed', {
  protocol: '16:8',
  duration: 16
});
```

**Body Scan**:
```typescript
// Après scan 3D
await GamificationService.awardXp(userId, 100, 'body_scan_completed', {
  scanType: 'full'
});
```

**Weight Update**:
```typescript
// Après mise à jour poids
await GamificationService.awardXp(userId, 20, 'weight_updated', {
  previousWeight: 85,
  newWeight: 84.5
});
```

### Intégration avec HEAD System

Le système gaming est collecté par le HEAD via `GamificationDataCollector`:

```typescript
// HEAD collecte automatiquement
const context = await brainCore.getContext();
console.log(context.user.gaming.currentLevel);
console.log(context.user.gaming.prediction);
```

**Données exposées au HEAD**:
- État gamification complet
- Prédictions universelles
- Historique XP récent
- Absences actives
- Streaks et multiplicateurs

---

## 📊 Base de Données

### Table: user_gamification

**Colonnes principales**:
```sql
CREATE TABLE user_gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  current_level integer DEFAULT 1,
  current_xp integer DEFAULT 0,
  total_xp_earned bigint DEFAULT 0,
  current_streak_days integer DEFAULT 0,
  longest_streak_days integer DEFAULT 0,
  perfect_days_count integer DEFAULT 0,
  last_activity_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Table: xp_attribution_audit

**But**: Idempotence des attributions XP (évite doublons).

**Colonnes principales**:
```sql
CREATE TABLE xp_attribution_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  source text NOT NULL,
  xp_amount integer NOT NULL,
  multiplier numeric(10,2),
  final_xp integer NOT NULL,
  source_id text, -- ID de la ressource source (training_session_id, meal_id, etc.)
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Index unique pour idempotence
CREATE UNIQUE INDEX idx_xp_audit_source
ON xp_attribution_audit(user_id, source, source_id)
WHERE source_id IS NOT NULL;
```

### Table: transformation_scores

**But**: Stockage scores de transformation calculés périodiquement.

**Colonnes principales**:
```sql
CREATE TABLE transformation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  score numeric(10,2) NOT NULL,
  category text NOT NULL,
  timeframe_days integer,
  confidence_level text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

### Table: user_absence_logs

**But**: Tracking absences et réconciliations.

**Colonnes principales**:
```sql
CREATE TABLE user_absence_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  absence_start_date date NOT NULL,
  absence_end_date date,
  days_absent integer,
  status text DEFAULT 'active', -- active, reconciled, expired
  estimated_activity_data jsonb,
  reconciled_at timestamptz,
  reconciliation_id uuid,
  reminder_sent_count integer DEFAULT 0,
  last_reminder_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Table: daily_actions_completion **[NOUVEAU v2.0]**

**But**: Tracking des actions quotidiennes avec support pour occurrences multiples.

**Philosophie v2.0**:
- Permet aux utilisateurs de scanner plusieurs repas par jour
- Logger plusieurs activités physiques dans la journée
- Les XP ne sont accordés que pour la première occurrence
- Les occurrences suivantes sont trackées pour encourager l'engagement

**Colonnes principales**:
```sql
CREATE TABLE daily_actions_completion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  action_date date DEFAULT CURRENT_DATE NOT NULL,
  action_id text NOT NULL, -- 'meal-scan', 'activity-log', 'fasting-log'
  completed_at timestamptz DEFAULT now() NOT NULL,
  xp_earned integer DEFAULT 0 NOT NULL,
  is_first_of_day boolean DEFAULT false NOT NULL, -- Première occurrence du jour
  occurrence_number integer DEFAULT 1 NOT NULL, -- Numéro d'occurrence (1, 2, 3...)
  xp_awarded boolean DEFAULT false NOT NULL, -- XP accordés pour cette occurrence
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index pour requêtes rapides
CREATE INDEX idx_daily_actions_user_date_action_occurrence
  ON daily_actions_completion(user_id, action_date, action_id, created_at DESC);
```

**Actions supportées**:
- `meal-scan`: Scanner un repas (10 XP première fois)
- `activity-log`: Logger une activité (20 XP première fois)
- `fasting-log`: Logger un jeûne (15 XP première fois)
- `training-start`: Démarrer un entraînement (60 XP première fois)
- `body-scan-3d`: Scanner corporel 3D (150 XP première fois)

**Exemples d'utilisation**:
```typescript
// Premier scan de repas du jour → 10 XP
await markDailyActionCompletedV2('meal-scan', 10);
// { was_newly_completed: true, xp_awarded: 10, occurrence_number: 1 }

// Deuxième scan de repas du jour → 0 XP mais tracké
await markDailyActionCompletedV2('meal-scan', 10);
// { was_newly_completed: false, xp_awarded: 0, occurrence_number: 2 }

// Troisième scan de repas du jour → 0 XP mais tracké
await markDailyActionCompletedV2('meal-scan', 10);
// { was_newly_completed: false, xp_awarded: 0, occurrence_number: 3 }
```

**Fonctions Database v2.0**:

```sql
-- Marquer une action comme complétée (support multi-occurrences)
CREATE FUNCTION mark_daily_action_completed_v2(
  p_action_id text,
  p_xp_earned integer
) RETURNS TABLE(
  action_id text,
  was_newly_completed boolean,
  xp_awarded integer,
  occurrence_number integer,
  is_first_of_day boolean,
  total_occurrences_today integer
);

-- Récupérer nombre d'occurrences d'une action aujourd'hui
CREATE FUNCTION get_daily_action_occurrences(
  p_action_id text
) RETURNS integer;

-- Récupérer statistiques complètes des actions quotidiennes
CREATE FUNCTION get_daily_action_stats() RETURNS TABLE(
  action_id text,
  first_completed_at timestamptz,
  total_occurrences integer,
  xp_earned_total integer,
  is_completed_today boolean
);

-- Vérifier si un combo est débloqué
CREATE FUNCTION check_action_combo(
  p_action_ids text[]
) RETURNS TABLE(
  combo_name text,
  combo_achieved boolean,
  actions_completed integer,
  actions_required integer
);
```

**Système de Combos v2.0**:

Les combos récompensent visuellement les utilisateurs qui font plusieurs actions dans la journée:

- **Nutrition Warrior**: Scanner 3 repas dans la journée → Badge Or Nutrition
- **Perfect Day**: Compléter toutes les actions quotidiennes → Badge Jour Parfait
- **Active Tracker**: Logger 2 activités ou plus → Badge Actif

Les combos n'accordent pas de XP supplémentaires mais offrent:
- Badges visuels dans l'interface
- Animations de célébration
- Messages d'encouragement personnalisés
- Indicateurs de progression en temps réel

---

## 🔐 Row Level Security

Toutes les tables ont RLS activée avec policies restrictives:

```sql
-- Exemple pour user_gamification
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification"
  ON user_gamification FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification"
  ON user_gamification FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 🧪 Tests et Validation

### Scénarios de Test Clés

**Test 1: Attribution XP avec multiplicateurs**
```typescript
// Vérifier calcul multiplicateurs corrects
const result = await GamificationService.awardXp(
  userId,
  50,
  'training_completed'
);
expect(result.multiplier).toBeGreaterThan(1.0);
expect(result.xpAwarded).toBe(50 * result.multiplier);
```

**Test 2: Idempotence XP**
```typescript
// Même action deux fois ne doit attribuer qu'une fois
await GamificationService.awardXp(userId, 50, 'training', { id: 'session-1' });
await GamificationService.awardXp(userId, 50, 'training', { id: 'session-1' });

const gamification = await GamificationService.getGamification(userId);
expect(gamification.totalXpEarned).toBe(50); // Pas 100
```

**Test 3: Réconciliation après absence**
```typescript
// Simuler absence 5 jours puis réconciliation
await simulateAbsence(userId, 5);
const result = await AbsenceReconciliationService.reconcileAbsence(
  userId,
  { weight: 84.5 }
);
expect(result.xpRecovered).toBeGreaterThan(0);
expect(result.streakPreserved).toBe(true); // < 7 jours
```

**Test 4: Prédictions niveau confiance**
```typescript
// Avec peu de données → confidence LOW
await seedXpHistory(userId, 5); // 5 jours seulement
const pred1 = await PredictionService.generatePrediction(userId, 90);
expect(pred1.confidence).toBe('low');

// Avec données complètes → confidence HIGH
await seedXpHistory(userId, 30); // 30 jours
const pred2 = await PredictionService.generatePrediction(userId, 90);
expect(pred2.confidence).toBe('high');
```

---

## 🚀 Performance et Optimisations

### Cache Strategy

**XP Quotidien Moyen**: Cache 6h
```typescript
const cacheKey = `avg_daily_xp:${userId}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;

const avg = await calculateAvgDailyXp(userId);
await cache.set(cacheKey, avg, 6 * 60 * 60); // 6h
```

**Prédictions**: Cache 24h
```typescript
const cacheKey = `predictions:${userId}:${timeframe}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;

const predictions = await generatePredictions(userId, timeframe);
await cache.set(cacheKey, predictions, 24 * 60 * 60); // 24h
```

### Requêtes Optimisées

**Récupération état complet**: Une seule requête
```typescript
// Au lieu de 4 requêtes séparées
const [gamification, prediction, bodyProjection, weightHistory] = await Promise.all([
  GamificationService.getGamification(userId),
  PredictionService.getLatestPrediction(userId),
  BodyProjectionService.getLatestProjection(userId),
  WeightService.getWeightHistory(userId, 90)
]);
```

**Indices Database**:
```sql
-- Index pour performances XP audit
CREATE INDEX idx_xp_audit_user_created
ON xp_attribution_audit(user_id, created_at DESC);

-- Index pour historique transformations
CREATE INDEX idx_transform_scores_user_created
ON transformation_scores(user_id, created_at DESC);
```

---

## 📚 Références Additionnelles

**Services connexes**:
- `src/services/dashboard/coeur/` - Tous services gaming
- `src/services/absence/` - Services gestion absences
- `src/hooks/useGamification.ts` - Hook React principal
- `src/components/dashboard/widgets/GamingProgressWidget/` - Widget UI

**Documentation liée**:
- `/docs/central/AUDIT_AGENTS_IA_COMPLET.md` - Agents IA dashboard
- `/docs/head/ARCHITECTURE.md` - Intégration HEAD system
- `/docs/dashboard/coeur/GAMING_SYSTEM_INNOVATION_DOC.md` - Doc innovation

---

**Maintenu par:** Équipe Technique TwinForge
**Dernière mise à jour:** 22 Novembre 2025
**Version:** 2.0

---

## 🆕 Nouveautés Version 2.0

### Système d'Actions Multiples

**Changements majeurs**:
- ❌ **Ancien système**: Les boutons étaient bloqués après la première action
- ✅ **Nouveau système**: Les utilisateurs peuvent effectuer une action autant de fois qu'ils le souhaitent

**Bénéfices**:
- Scanner petit-déjeuner, déjeuner, dîner et collations illimités
- Logger plusieurs sessions d'activité physique dans la journée
- Encouragement visuel via badges de comptage (2x, 3x, etc.)
- Messages motivants personnalisés selon le nombre d'occurrences

### Hooks React v2.0

**Nouveaux hooks disponibles**:

```typescript
// Hook pour compter les occurrences d'une action
import { useActionOccurrenceCount } from '@/hooks/useDailyActionsTracking';
const mealScanCount = useActionOccurrenceCount('meal-scan');
// Retourne: 0, 1, 2, 3... (nombre de fois scanné aujourd'hui)

// Hook pour statistiques détaillées
import { useDailyActionStats } from '@/hooks/useDailyActionsTracking';
const { data: stats } = useDailyActionStats();
// Retourne: Array<{ action_id, total_occurrences, xp_earned_total, ... }>

// Hook pour vérifier combos
import { useActionCombo } from '@/hooks/useDailyActionsTracking';
const { data: combo } = useActionCombo(['meal-scan', 'activity-log', 'fasting-log']);
// Retourne: { combo_achieved: boolean, actions_completed: number, ... }
```

### Composants UI v2.0

**ActionCommandPanel**:
- Retrait du `disabled` sur les boutons d'actions quotidiennes
- Badge avec compteur d'occurrences (ex: "2x", "3x")
- Messages d'encouragement dynamiques
- Indicateur "premières actions" vs "totales"

**CalorieTrackingActionsPanel**:
- Support illimité pour scanner plusieurs repas
- Messages d'encouragement spécifiques par action
- Double compteur: premières complétées + total aujourd'hui

**GamingActionsWidget**:
- Support complet pour actions répétées
- Animations célébrant chaque occurrence
- Messages adaptatifs selon le nombre d'occurrences

**ActionComboWidget** [NOUVEAU]:
- Widget dédié aux combos visuels
- Barres de progression en temps réel
- Animations de déblocage de badges
- Système de récompenses visuelles

### Migration Database

**Fichier**: `20251122000000_optimize_daily_actions_for_multiple_occurrences.sql`

**Changements**:
- Retrait de la contrainte `UNIQUE(user_id, action_date, action_id)`
- Ajout des colonnes `is_first_of_day`, `occurrence_number`, `xp_awarded`
- Nouvelles fonctions pour gérer les occurrences multiples
- Vue matérialisée pour statistiques rapides

**Rétrocompatibilité**:
- Migration automatique des données existantes
- Fonction `get_todays_completed_actions()` mise à jour
- Anciens composants continueront de fonctionner
