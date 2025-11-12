# Quick Start - Système de Gaming TwinForge

**Temps d'intégration:** ~30 minutes
**Difficulté:** ⭐⭐☆☆☆ (Intermédiaire)

---

## 🚀 Installation en 5 Minutes

### 1. Copier les Fichiers (3 dossiers)

```bash
# Copiez ces 3 dossiers dans votre projet:
src/services/dashboard/coeur/       # 13 fichiers + dossier absence
src/components/dashboard/widgets/coeur/  # 18 fichiers
src/hooks/coeur/                    # 6 fichiers
```

### 2. Appliquer les Migrations SQL

```sql
-- Ordre IMPORTANT (12 migrations minimum):
1. 20251108025539_add_gamification_system.sql
2. 20251111000000_sprint3_acceleration_progression.sql
3. 20251112000000_sprint4_multiplicateurs_performance.sql
4. 20251113000000_sprint5_ai_behavior_analysis.sql
5. 20251114000000_sprint6_records_and_leaderboard_system.sql
6. 20251120000000_add_absence_continuity_system_fixed.sql
7. 20251122000000_optimize_daily_actions_for_multiple_occurrences.sql
```

### 3. Ajouter le Widget au Dashboard

```tsx
import GamingProgressWidgetV3 from '@/components/dashboard/widgets/coeur/GamingProgressWidgetV3';

function Dashboard() {
  return (
    <div className="dashboard">
      <GamingProgressWidgetV3 />
    </div>
  );
}
```

✅ **C'est tout!** Le système est fonctionnel.

---

## 🎮 Intégrer XP dans vos Features (3 Patterns)

### Pattern 1: Attribution Simple

```typescript
import { useAwardMealScanXp } from '@/hooks/coeur/useGamification';

function MealScanPage() {
  const awardXp = useAwardMealScanXp();

  const handleScan = async () => {
    // Votre logique...
    const meal = await scanMeal();

    // Attribution XP (idempotente)
    await awardXp.mutateAsync();
  };
}
```

### Pattern 2: Attribution avec Métadata

```typescript
import { useAwardTrainingSessionXp } from '@/hooks/coeur/useGamification';

function TrainingPage() {
  const awardXp = useAwardTrainingSessionXp();

  const completeSession = async (sessionId: string) => {
    await saveSession(sessionId);

    // XP avec contexte
    const result = await awardXp.mutateAsync({ sessionId });

    if (result.leveledUp) {
      showCelebration('🎉 Level Up!');
    }
  };
}
```

### Pattern 3: Tracking Actions Multiples

```typescript
import { useMarkActionCompleted } from '@/hooks/coeur/useDailyActionsTracking';

function MealLogger() {
  const markCompleted = useMarkActionCompleted();

  const logMeal = async (mealNumber: number) => {
    await saveMeal();

    // Track occurrence (1er repas, 2ème repas, etc.)
    await markCompleted.mutateAsync({
      actionId: 'meal_scan',
      occurrenceNumber: mealNumber
    });
  };
}
```

---

## 📊 Afficher les Données Gaming (5 Hooks Essentiels)

### 1. État Gamification

```typescript
import { useGamificationProgress } from '@/hooks/coeur/useGamification';

function MyWidget() {
  const { data: gaming } = useGamificationProgress();

  return (
    <div>
      <h2>Niveau {gaming.currentLevel}</h2>
      <p>XP: {gaming.currentXp} / {gaming.xpToNextLevel}</p>
      <p>Streak: {gaming.currentStreak} jours 🔥</p>
    </div>
  );
}
```

### 2. Prédictions Universelles

```typescript
import { useUniversalPrediction } from '@/hooks/coeur/useUniversalPrediction';

function PredictionsPanel() {
  const { data: prediction } = useUniversalPrediction();

  return (
    <div>
      <h3>Dans 30 jours:</h3>
      <p>Niveau: {prediction.predictions.days30.estimatedLevel}</p>
      <p>Poids: {prediction.predictions.days30.estimatedWeight} kg</p>
    </div>
  );
}
```

### 3. Actions Quotidiennes

```typescript
import { useTodaysCompletedActions } from '@/hooks/coeur/useDailyActionsTracking';

function DailyProgress() {
  const { data: actions } = useTodaysCompletedActions();

  const mealScans = actions.filter(a => a.actionId === 'meal_scan').length;

  return <p>Repas scannés: {mealScans} / 3</p>;
}
```

### 4. Historique Poids

```typescript
import { useWeightUpdateHistory } from '@/hooks/coeur/useGamification';

function WeightChart() {
  const { data: history } = useWeightUpdateHistory(7); // 7 derniers

  return (
    <LineChart data={history} />
  );
}
```

### 5. Score Transformation

```typescript
import { useTransformationScore } from '@/hooks/coeur/useTransformationScore';

function TransformationCard() {
  const { data: score } = useTransformationScore();

  return (
    <div>
      <h3>Score: {score.totalScore}/100</h3>
      <p>Cohérence: {score.coherence}/33</p>
      <p>Momentum: {score.momentum}/33</p>
      <p>Qualités: {score.physicalQualities}/34</p>
    </div>
  );
}
```

---

## 🎯 Cas d'Usage Courants

### Cas 1: Bouton "Scanner un Repas"

```tsx
function ScanMealButton() {
  const awardXp = useAwardMealScanXp();
  const markAction = useMarkActionCompleted();

  const handleScan = async () => {
    // 1. Scanner repas
    const meal = await scanMeal();

    // 2. Marquer action complétée (tracking)
    await markAction.mutateAsync({
      actionId: 'meal_scan',
      occurrenceNumber: 1 // ou dynamique
    });

    // 3. Attribuer XP
    const result = await awardXp.mutateAsync();

    // 4. Feedback
    showToast(`+${result.xpAwarded} XP!`);
  };

  return (
    <button onClick={handleScan}>
      Scanner un Repas
    </button>
  );
}
```

### Cas 2: Page "Terminer Entraînement"

```tsx
function CompleteTrainingButton({ sessionId }: { sessionId: string }) {
  const awardXp = useAwardTrainingSessionXp();

  const handleComplete = async () => {
    // 1. Sauvegarder session
    await saveTrainingSession(sessionId);

    // 2. Attribuer XP (idempotent avec sessionId)
    const result = await awardXp.mutateAsync({ sessionId });

    // 3. Animation si level up
    if (result.leveledUp) {
      playLevelUpAnimation();
      showToast(`🎉 Niveau ${result.newLevel}!`);
    }
  };

  return (
    <button onClick={handleComplete}>
      Terminer l'Entraînement
    </button>
  );
}
```

### Cas 3: Widget "Objectif Calories"

```tsx
function CalorieGoalWidget() {
  const awardXp = useAwardCalorieGoalMetXp();
  const [goalMet, setGoalMet] = useState(false);

  useEffect(() => {
    checkDailyGoal().then(met => {
      if (met && !goalMet) {
        setGoalMet(true);
        awardXp.mutateAsync(); // Auto-award XP
      }
    });
  }, []);

  return (
    <div>
      {goalMet ? (
        <div className="success">✅ Objectif atteint! +50 XP</div>
      ) : (
        <div>En cours...</div>
      )}
    </div>
  );
}
```

### Cas 4: Update Poids avec Absence

```tsx
import { useWeightUpdate } from '@/components/dashboard/widgets/coeur/GamingProgressWidget/hooks/useWeightUpdate';

function WeightTracker() {
  const {
    weight,
    handleWeightChange,
    handleWeightSubmit,
    hasActiveAbsence,
    pendingXp,
    coachMessages
  } = useWeightUpdate(weightHistory);

  return (
    <div>
      {hasActiveAbsence && (
        <Alert>
          ⚠️ Absence détectée: {pendingXp} XP en attente!
        </Alert>
      )}

      <input
        type="number"
        value={weight}
        onChange={e => handleWeightChange(+e.target.value)}
      />

      <button onClick={handleWeightSubmit}>
        Valider le Poids
      </button>

      {coachMessages.map(msg => (
        <CoachMessage key={msg.type} message={msg} />
      ))}
    </div>
  );
}
```

---

## 🔧 Configuration Avancée (Optionnel)

### Personnaliser les Multiplicateurs

```typescript
// src/services/dashboard/coeur/AdaptiveScoreCalculator.ts

// Modifier les paliers streak (ligne ~150)
const getStreakMultiplier = (streak: number) => {
  if (streak >= 30) return 2.5;  // ← Changez ici
  if (streak >= 21) return 2.0;
  if (streak >= 14) return 1.8;
  // ...
};
```

### Ajouter une Nouvelle Action XP

```typescript
// 1. Ajouter dans migration SQL
INSERT INTO xp_values (action_type, base_xp, category)
VALUES ('custom_action', 25, 'special');

// 2. Créer hook dans useGamification.ts
export function useAwardCustomActionXp() {
  return useMutation({
    mutationFn: async () => {
      return gamificationService.awardXp(
        userId,
        'custom_action',
        { /* metadata */ }
      );
    }
  });
}

// 3. Utiliser
const awardXp = useAwardCustomActionXp();
await awardXp.mutateAsync();
```

### Personnaliser UI du Widget

```tsx
// Wrapper avec vos propres styles
import GamingProgressWidgetV3 from '@/components/dashboard/widgets/coeur/GamingProgressWidgetV3';

function MyCustomGamingWidget() {
  return (
    <div className="my-custom-container">
      <h1>Ma Progression</h1>
      <GamingProgressWidgetV3 />
    </div>
  );
}
```

---

## 📋 Checklist Validation

Après intégration, validez ces points:

### Tests Fonctionnels

- [ ] Widget gaming s'affiche correctement
- [ ] Attribution XP fonctionne (observer table `xp_attribution_audit`)
- [ ] Level up se déclenche au bon moment
- [ ] Streak incrémente chaque jour actif
- [ ] Actions multiples trackées correctement
- [ ] Prédictions s'affichent (après 3+ jours données)
- [ ] Absence détectée après 3+ jours inactifs
- [ ] Réconciliation fonctionne au retour

### Tests Techniques

- [ ] Build sans erreurs
- [ ] Aucune erreur console navigateur
- [ ] React Query devtools montrent les queries
- [ ] Tables Supabase créées (12 tables)
- [ ] RLS policies actives
- [ ] Pas de doublons XP (idempotence)

### Tests UI/UX

- [ ] Animations fluides
- [ ] Toasts de célébration
- [ ] Skeleton loading
- [ ] Responsive mobile
- [ ] Mode performance fonctionne

---

## 🐛 Dépannage Express

### Erreur: "Table user_gamification does not exist"
→ Appliquer migration `20251108025539_add_gamification_system.sql`

### Erreur: "XP not awarded"
→ Vérifier `userId` dans session Supabase + RLS policies

### Erreur: "Cannot read property 'currentLevel' of undefined"
→ Ajouter vérification `if (!gaming) return null;` avant render

### Erreur: "Import '@/services/dashboard/coeur' failed"
→ Vérifier alias `@` dans `vite.config.ts` ou `tsconfig.json`

### Warning: "Predictions confidence: low"
→ Normal avec < 7 jours de données. Confidence augmente avec historique.

---

## 📚 Ressources Complémentaires

- `ARBORESCENCE_ET_INTEGRATION.md` - Guide complet
- `GAMING_SYSTEM_TECHNICAL_DOC.md` - Détails techniques
- `PREDICTION_SYSTEM_TECHNICAL_DOC.md` - Algorithmes prédictions
- Code source des hooks - Exemples avancés

---

## 🎉 Résultat Final

✅ Système de progression complet en 30 minutes
✅ 6+ actions avec XP automatique
✅ Multiplicateurs intelligents
✅ Prédictions IA
✅ Gestion absence
✅ Widget clé-en-main

**Bon gaming! 🎮🔥**
