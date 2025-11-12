# Système de Prédiction TwinForge - Documentation Technique

**Version:** 1.0
**Date:** 10 Novembre 2025
**Statut:** Production Active
**Auteur:** Équipe Technique TwinForge

---

## 🎯 Vue d'Ensemble Technique

Le système de prédiction TwinForge est une suite d'algorithmes de machine learning et d'analyse statistique qui projette l'évolution future de l'utilisateur sur 3 dimensions: gaming (niveaux XP), transformation corporelle (poids, composition) et performance (force, endurance).

---

## 🏗️ Architecture Globale

### Services de Prédiction

```
Prediction System
├── Gaming Predictions
│   ├── GamificationPredictionService.ts (Niveaux futurs)
│   ├── GamificationLevelPredictionService.ts (Détails niveaux)
│   └── GamificationUniversalPredictionService.ts (Orchestrateur)
│
├── Transformation Predictions
│   ├── TransformationPredictionService.ts (Poids/corps)
│   ├── TransformationScoreService.ts (Scores transformation)
│   └── BodyProjectionService.ts (Projection 3D)
│
├── Intelligence Layers
│   ├── AITransformationAnalyzer.ts (Analyse IA transformations)
│   ├── AdaptiveScoreCalculator.ts (Multiplicateurs prédictifs)
│   └── PhysicalQualitiesCalculator.ts (Qualités physiques futures)
│
└── Utilities
    ├── ProjectionCalculator.ts (Calculs projections)
    └── UniversalPrediction.ts (Hook React unifié)
```

### Dépendances et Intégrations

```
Prediction System
    ↓ consomme
GamificationService (état actuel)
ActivityTrackingService (historique activités)
BodyScanService (scans 3D)
WeightTrackingService (historique poids)
NutritionTrackingService (calories, macros)
    ↓ alimente
GamingProgressWidget (affichage prédictions)
TransformationWidget (projections corporelles)
HEAD System (contexte utilisateur enrichi)
```

---

## 🔮 Service: GamificationUniversalPredictionService

**Localisation**: `src/services/dashboard/coeur/GamificationUniversalPredictionService.ts`

### Responsabilités

Orchestrateur principal qui génère prédictions unifiées (gaming + transformation) sur timeframes multiples.

### Méthode Principale

#### `generateUniversalPrediction(userId: string, timeframesDays: number[])`

**Signature complète**:
```typescript
async generateUniversalPrediction(
  userId: string,
  timeframesDays: number[] = [30, 60, 90]
): Promise<UniversalPredictionResult>
```

**Processus détaillé**:

1. **Récupération état actuel**
```typescript
const gamification = await GamificationService.getGamification(userId);
const weightHistory = await WeightService.getWeightHistory(userId, 90);
const activityHistory = await ActivityService.getActivityHistory(userId, 90);
```

2. **Calcul métriques de base**
```typescript
const avgDailyXp = calculateAvgDailyXp(activityHistory);
const weightVelocity = calculateWeightVelocity(weightHistory); // kg/semaine
const consistency = calculateConsistency(activityHistory); // 0-1
```

3. **Génération prédictions par timeframe**
```typescript
const predictions = {};
for (const days of timeframesDays) {
  predictions[days] = {
    level: await predictLevel(gamification, avgDailyXp, days),
    weight: await predictWeight(weightHistory, weightVelocity, days),
    confidence: calculateConfidence(consistency, days)
  };
}
```

4. **Calcul confiance globale**
```typescript
const globalConfidence = determineGlobalConfidence(
  consistency,
  dataPoints,
  volatility
);
```

**Retourne**:
```typescript
interface UniversalPredictionResult {
  predictions: {
    [timeframeDays: number]: {
      level: number;
      xp: number;
      levelTitle: string;
      weight: number;
      weightChange: number;
      confidence: 'low' | 'medium' | 'high';
    };
  };
  currentState: {
    level: number;
    xp: number;
    weight: number;
    avgDailyXp: number;
    weightVelocity: number;
  };
  confidence: 'low' | 'medium' | 'high';
  metadata: {
    dataPoints: number;
    consistencyScore: number;
    volatilityScore: number;
    lastUpdateDate: string;
  };
}
```

### Algorithmes de Confiance

#### `calculateConsistency(activityHistory: Activity[])`

Mesure régularité activités utilisateur.

**Formule**:
```typescript
// Écart-type normalisé des XP quotidiens
const dailyXp = activityHistory.map(day => day.totalXp);
const mean = average(dailyXp);
const stdDev = standardDeviation(dailyXp);
const consistency = 1 - (stdDev / mean); // 0-1

// Ajustement selon fréquence
const activeDays = dailyXp.filter(xp => xp > 0).length;
const totalDays = activityHistory.length;
const frequency = activeDays / totalDays;

return consistency * frequency;
```

**Interprétation**:
- `consistency > 0.7`: Très régulier → HIGH confidence
- `0.4 < consistency < 0.7`: Modérément régulier → MEDIUM confidence
- `consistency < 0.4`: Irrégulier → LOW confidence

#### `determineGlobalConfidence(consistency, dataPoints, volatility)`

Détermine niveau confiance final.

**Règles de décision**:
```typescript
if (dataPoints >= 20 && consistency > 0.7 && volatility < 0.3) {
  return 'high'; // >80% fiabilité
}

if (dataPoints >= 10 && consistency > 0.4 && volatility < 0.5) {
  return 'medium'; // 60-80% fiabilité
}

return 'low'; // <60% fiabilité
```

**Facteurs pondérés**:
- Nombre de jours de données: **40%**
- Consistance activités: **35%**
- Volatilité poids/XP: **25%**

---

## 📊 Service: TransformationPredictionService

**Localisation**: `src/services/dashboard/coeur/TransformationPredictionService.ts`

### Responsabilités

Prédiction transformation corporelle basée sur historique poids, nutrition, training et jeûne.

### Méthode Principale

#### `predictTransformation(userId: string, timeframeDays: number)`

**Processus**:

1. **Collecte données transformation**
```typescript
const weightHistory = await getWeightHistory(userId, 90);
const calorieHistory = await getCalorieHistory(userId, 90);
const trainingHistory = await getTrainingHistory(userId, 90);
const bodyScanHistory = await getBodyScanHistory(userId, 90);
```

2. **Calcul vélocité pondérée**
```typescript
// Régression linéaire avec pondération temporelle
const recentWeights = weightHistory.slice(-14); // 2 dernières semaines
const olderWeights = weightHistory.slice(0, -14);

const recentVelocity = calculateVelocity(recentWeights);
const olderVelocity = calculateVelocity(olderWeights);

// Pondération: 70% récent, 30% ancien
const weightedVelocity = (recentVelocity * 0.7) + (olderVelocity * 0.3);
```

3. **Projection poids futur**
```typescript
const weeksInTimeframe = timeframeDays / 7;
const predictedWeight = currentWeight + (weightedVelocity * weeksInTimeframe);
```

4. **Calcul marge d'erreur**
```typescript
// Basé sur volatilité historique
const weeklyChanges = calculateWeeklyChanges(weightHistory);
const stdDev = standardDeviation(weeklyChanges);
const marginOfError = stdDev * Math.sqrt(weeksInTimeframe);
```

5. **Estimation composition corporelle** (si body scans disponibles)
```typescript
if (bodyScanHistory.length >= 2) {
  const bodyFatVelocity = calculateBodyFatVelocity(bodyScanHistory);
  const muscleMassVelocity = calculateMuscleMassVelocity(bodyScanHistory);

  predictedBodyComposition = {
    bodyFat: currentBodyFat + (bodyFatVelocity * weeksInTimeframe),
    muscleMass: currentMuscleMass + (muscleMassVelocity * weeksInTimeframe)
  };
}
```

**Retourne**:
```typescript
interface TransformationPrediction {
  currentWeight: number;
  predictedWeight: number;
  weightChange: number;
  velocity: number; // kg/semaine
  confidence: 'low' | 'medium' | 'high';
  marginOfError: number;
  trend: 'losing' | 'gaining' | 'maintaining';
  predictedBodyComposition?: {
    bodyFat: number; // %
    bodyFatChange: number;
    muscleMass: number; // kg
    muscleMassChange: number;
  };
  metadata: {
    dataPoints: number;
    r2Score: number; // Qualité régression linéaire
    lastWeightDate: string;
  };
}
```

### Formules Mathématiques

#### Régression Linéaire Pondérée

```typescript
// Modèle: y = a*x + b
// Pondération: poids récents ont plus d'importance

function weightedLinearRegression(points: Point[], weights: number[]) {
  const n = points.length;
  let sumW = 0, sumWX = 0, sumWY = 0, sumWXY = 0, sumWX2 = 0;

  for (let i = 0; i < n; i++) {
    const w = weights[i];
    const x = points[i].x; // Jour
    const y = points[i].y; // Poids

    sumW += w;
    sumWX += w * x;
    sumWY += w * y;
    sumWXY += w * x * y;
    sumWX2 += w * x * x;
  }

  const a = (sumW * sumWXY - sumWX * sumWY) / (sumW * sumWX2 - sumWX * sumWX);
  const b = (sumWY - a * sumWX) / sumW;

  return { slope: a, intercept: b };
}
```

**Poids temporels**:
```typescript
// Plus récent = plus important
function calculateTemporalWeights(n: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    const normalizedPosition = i / (n - 1); // 0 à 1
    return 0.5 + (normalizedPosition * 0.5); // 0.5 à 1.0
  });
}
```

#### Calcul R² (Qualité Régression)

```typescript
function calculateR2(actual: number[], predicted: number[]): number {
  const mean = average(actual);

  const ssRes = sum(actual.map((y, i) => Math.pow(y - predicted[i], 2)));
  const ssTot = sum(actual.map(y => Math.pow(y - mean, 2)));

  return 1 - (ssRes / ssTot); // 0-1, plus proche de 1 = meilleur fit
}
```

**Interprétation R²**:
- `R² > 0.8`: Excellent fit → HIGH confidence
- `0.5 < R² < 0.8`: Bon fit → MEDIUM confidence
- `R² < 0.5`: Fit faible → LOW confidence

---

## 🎮 Service: GamificationLevelPredictionService

**Localisation**: `src/services/dashboard/coeur/GamificationLevelPredictionService.ts`

### Responsabilités

Prédiction détaillée niveaux gaming futurs avec titres et seuils XP.

### Méthode Principale

#### `predictFutureLevels(currentGamification: Gamification, avgDailyXp: number, timeframeDays: number)`

**Processus**:

1. **Calcul XP futurs totaux**
```typescript
const currentXp = currentGamification.totalXpEarned;
const projectedXpGain = avgDailyXp * timeframeDays;
const futureXpTotal = currentXp + projectedXpGain;
```

2. **Détermination niveau futur**
```typescript
let futureLevel = currentGamification.currentLevel;
let xpAccumulated = currentGamification.currentXp;

while (xpAccumulated >= getXpForLevel(futureLevel + 1)) {
  xpAccumulated -= getXpForLevel(futureLevel + 1);
  futureLevel++;
}
```

3. **Extraction titre futur**
```typescript
const futureTitle = getLevelTitle(futureLevel);
```

4. **Timeline paliers intermédiaires**
```typescript
const milestones = [];
for (let lvl = currentLevel + 1; lvl <= futureLevel; lvl++) {
  const xpRequired = getXpForLevel(lvl);
  const daysToLevel = (xpRequired - currentXp) / avgDailyXp;

  milestones.push({
    level: lvl,
    title: getLevelTitle(lvl),
    estimatedDays: Math.ceil(daysToLevel),
    estimatedDate: addDays(new Date(), daysToLevel)
  });
}
```

**Retourne**:
```typescript
interface LevelPrediction {
  currentLevel: number;
  currentLevelTitle: string;
  futureLevel: number;
  futureLevelTitle: string;
  levelGain: number;
  projectedXpGain: number;
  futureXpTotal: number;
  milestones: {
    level: number;
    title: string;
    estimatedDays: number;
    estimatedDate: Date;
  }[];
  nextLevelIn: {
    days: number;
    xpNeeded: number;
  };
}
```

### Titres de Niveaux

**Mapping complet 100 niveaux**:
```typescript
const LEVEL_TITLES: Record<number, string> = {
  1: "Apprenti Braise",
  5: "Souffleur de Forge",
  10: "Marteleur d'Acier",
  15: "Batteur de Métal",
  20: "Forgeron de Bronze",
  25: "Maître du Feu",
  30: "Forgeron d'Argent",
  35: "Forgeron d'Or",
  40: "Maître des Lames",
  45: "Sculpteur de Métal",
  50: "Maître des Flammes",
  // ... jusqu'à niveau 100
  100: "Titan de l'Enclume"
};

function getLevelTitle(level: number): string {
  // Trouve titre du palier précédent le plus proche
  const milestones = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = milestones.length - 1; i >= 0; i--) {
    if (level >= milestones[i]) {
      return LEVEL_TITLES[milestones[i]];
    }
  }
  return LEVEL_TITLES[1];
}
```

---

## 📐 Service: BodyProjectionService

**Localisation**: `src/services/dashboard/suivi/BodyProjectionService.ts`

### Responsabilités

Génération projections corporelles 3D basées sur prédictions poids et historique body scans.

### Méthode Principale

#### `generateBodyProjection(userId: string, targetWeight: number, timeframeDays: number)`

**Processus**:

1. **Récupération scans historiques**
```typescript
const bodyScanHistory = await getBodyScanHistory(userId);
const latestScan = bodyScanHistory[0];
const previousScans = bodyScanHistory.slice(1);
```

2. **Calcul évolution morphologique**
```typescript
if (previousScans.length > 0) {
  const morphologyChanges = analyzeMorphologyEvolution(
    previousScans,
    latestScan
  );

  // Vélocité changements par zone
  velocities = {
    waist: calculateVelocity(scans.map(s => s.waist)),
    hips: calculateVelocity(scans.map(s => s.hips)),
    chest: calculateVelocity(scans.map(s => s.chest)),
    arms: calculateVelocity(scans.map(s => s.arms)),
    legs: calculateVelocity(scans.map(s => s.legs))
  };
}
```

3. **Projection mesures futures**
```typescript
const weeksInTimeframe = timeframeDays / 7;
const weightDelta = targetWeight - latestScan.weight;

// Projection proportionnelle au changement poids
projectedMeasurements = {
  waist: latestScan.waist + (velocities.waist * weeksInTimeframe),
  hips: latestScan.hips + (velocities.hips * weeksInTimeframe),
  chest: latestScan.chest + (velocities.chest * weeksInTimeframe),
  arms: latestScan.arms + (velocities.arms * weeksInTimeframe),
  legs: latestScan.legs + (velocities.legs * weeksInTimeframe),
  weight: targetWeight,
  bodyFat: projectBodyFat(latestScan.bodyFat, weightDelta),
  muscleMass: projectMuscleMass(latestScan.muscleMass, weightDelta)
};
```

4. **Génération payload 3D**
```typescript
const projectionPayload = {
  morphTargets: generateMorphTargets(projectedMeasurements),
  skinTone: latestScan.skinTone, // Préservé
  height: latestScan.height, // Invariant
  metadata: {
    timeframe: timeframeDays,
    confidence: calculateProjectionConfidence(bodyScanHistory),
    baselineDate: latestScan.createdAt
  }
};
```

**Retourne**:
```typescript
interface BodyProjection {
  current: BodyMeasurements;
  projected: BodyMeasurements;
  changes: {
    waist: number; // cm
    hips: number;
    chest: number;
    arms: number;
    legs: number;
    weight: number; // kg
    bodyFat: number; // %
    muscleMass: number; // kg
  };
  visualization: {
    morphTargets: MorphTargets;
    avatarUrl: string;
  };
  confidence: 'low' | 'medium' | 'high';
}
```

---

## 🎨 Hook React: useUniversalPrediction

**Localisation**: `src/hooks/useUniversalPrediction.ts`

### Responsabilités

Hook React unifié pour consommation prédictions dans composants UI.

### Utilisation

```typescript
const {
  prediction,
  loading,
  error,
  refresh,
  confidence,
  lastUpdate
} = useUniversalPrediction(timeframes);
```

**Paramètres**:
- `timeframes?: number[]` - Timeframes en jours (défaut: `[30, 60, 90]`)

**Retourne**:
```typescript
interface UseUniversalPredictionResult {
  prediction: UniversalPredictionResult | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  confidence: 'low' | 'medium' | 'high';
  lastUpdate: Date | null;
}
```

### Implémentation Interne

```typescript
export function useUniversalPrediction(timeframes = [30, 60, 90]) {
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['universal-prediction', user?.id, timeframes],
    queryFn: async () => {
      const service = new GamificationUniversalPredictionService(supabase);
      return await service.generateUniversalPrediction(user!.id, timeframes);
    },
    enabled: !!user?.id,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 jours
    refetchOnWindowFocus: false
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries(['universal-prediction', user?.id]);
  }, [queryClient, user?.id]);

  return {
    prediction: data || null,
    loading: isLoading,
    error: error as Error | null,
    refresh,
    confidence: data?.confidence || 'low',
    lastUpdate: data?.metadata.lastUpdateDate
      ? new Date(data.metadata.lastUpdateDate)
      : null
  };
}
```

---

## 🔗 Points d'Intégration

### Intégration Widget Gaming

```typescript
// Dans GamingProgressWidget
import { useUniversalPrediction } from '@/hooks';

const { prediction, confidence } = useUniversalPrediction();

// Affichage prédictions
<PredictionTimeline
  predictions={prediction?.predictions}
  confidence={confidence}
/>
```

### Intégration Widget Transformation

```typescript
// Dans TransformationWidget
import { TransformationPredictionService } from '@/services/dashboard/coeur';

const predictionService = new TransformationPredictionService(supabase);
const transformation = await predictionService.predictTransformation(userId, 90);

// Affichage projections
<BodyProjectionComparison
  current={transformation.currentWeight}
  projected={transformation.predictedWeight}
  confidence={transformation.confidence}
/>
```

### Intégration HEAD System

Le HEAD collecte automatiquement prédictions via `TransformationPredictionDataCollector`:

```typescript
const context = await brainCore.getContext();
console.log(context.user.transformation.predictions);
// {
//   weight: { current: 78, predicted90d: 73.5 },
//   confidence: 'high',
//   level: { current: 18, predicted90d: 35 }
// }
```

---

## 📊 Base de Données

### Table: transformation_scores

Stockage scores transformation calculés périodiquement.

```sql
CREATE TABLE transformation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  score numeric(10,2) NOT NULL,
  category text NOT NULL, -- 'weight', 'level', 'bodycomposition'
  timeframe_days integer, -- 30, 60, 90
  confidence_level text, -- 'low', 'medium', 'high'
  metadata jsonb, -- { predicted_value, current_value, velocity, r2_score }
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_transform_scores_user_category
ON transformation_scores(user_id, category, created_at DESC);
```

### Table: prediction_cache

Cache prédictions pour éviter recalculs fréquents.

```sql
CREATE TABLE prediction_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  prediction_type text NOT NULL, -- 'universal', 'transformation', 'level'
  timeframe_days integer NOT NULL,
  prediction_data jsonb NOT NULL,
  confidence_level text,
  valid_until timestamptz NOT NULL, -- Expiration cache
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_prediction_cache_unique
ON prediction_cache(user_id, prediction_type, timeframe_days);
```

---

## 🧪 Tests et Validation

### Tests Unitaires Algorithmes

```typescript
describe('TransformationPredictionService', () => {
  it('should predict weight loss correctly', async () => {
    const weightHistory = generateMockWeightHistory({
      startWeight: 80,
      endWeight: 75,
      days: 30,
      velocity: -0.25 // kg/semaine
    });

    const prediction = await service.predictTransformation(userId, 90);

    expect(prediction.predictedWeight).toBeCloseTo(71.75, 1); // ±1 kg
    expect(prediction.velocity).toBeCloseTo(-0.25, 2);
    expect(prediction.trend).toBe('losing');
  });

  it('should calculate confidence correctly', () => {
    const consistentData = generateConsistentData(30);
    const inconsistentData = generateInconsistentData(30);

    const conf1 = calculateConfidence(consistentData);
    const conf2 = calculateConfidence(inconsistentData);

    expect(conf1).toBe('high');
    expect(conf2).toBe('low');
  });
});
```

### Tests Intégration

```typescript
describe('UniversalPrediction Integration', () => {
  it('should generate predictions across all timeframes', async () => {
    const result = await universalService.generateUniversalPrediction(
      userId,
      [30, 60, 90]
    );

    expect(result.predictions).toHaveProperty('30');
    expect(result.predictions).toHaveProperty('60');
    expect(result.predictions).toHaveProperty('90');
    expect(result.confidence).toMatch(/low|medium|high/);
  });
});
```

---

## 🚀 Performance et Optimisations

### Stratégie de Cache

**Cache prédictions 24h**:
```typescript
const cacheKey = `predictions:${userId}:${timeframe}`;
const cached = await redis.get(cacheKey);
if (cached && !forceRefresh) return JSON.parse(cached);

const fresh = await generatePredictions(userId, timeframe);
await redis.set(cacheKey, JSON.stringify(fresh), 'EX', 86400); // 24h
```

**Invalidation sélective**:
- Nouveau poids logué → Invalide prédictions transformation
- Nouvelle activité → Invalide prédictions gaming
- Nouveau body scan → Invalide projections 3D

### Calculs Asynchrones

```typescript
// Génération prédictions en background
async function refreshPredictionsBackground(userId: string) {
  // Non-bloquant
  setTimeout(async () => {
    await GamificationUniversalPredictionService
      .generateUniversalPrediction(userId, [30, 60, 90]);
  }, 0);
}
```

---

## 📚 Références Additionnelles

**Services connexes**:
- `src/services/dashboard/coeur/` - Services prédiction gaming
- `src/services/dashboard/suivi/` - Services prédiction transformation
- `src/hooks/useUniversalPrediction.ts` - Hook React principal
- `src/components/dashboard/widgets/GamingProgressWidget/` - Affichage prédictions

**Documentation liée**:
- `/docs/dashboard/coeur/PREDICTION_SYSTEM_INNOVATION_DOC.md` - Doc innovation
- `/docs/dashboard/coeur/GAMING_SYSTEM_TECHNICAL_DOC.md` - Intégration gaming
- `/docs/head/ARCHITECTURE.md` - Intégration HEAD

---

**Maintenu par:** Équipe Technique TwinForge
**Dernière mise à jour:** 10 Novembre 2025
**Version:** 1.0
