# Arborescence Complète - Système de Gaming TwinForge

**Version:** 3.0 | **Date:** Novembre 2025 | **Status:** Production

---

## 📦 Vue d'Ensemble

Le système de gaming TwinForge est maintenant **complètement organisé** dans des dossiers dédiés pour faciliter la copie vers d'autres projets Bolt.

### 🎯 4 Dossiers Principaux

```
1. src/services/dashboard/coeur/        (Services backend)
2. src/components/dashboard/widgets/coeur/  (Composants UI)
3. src/hooks/coeur/                     (Hooks React)
4. supabase/migrations/coeur/           (Migrations SQL)
```

---

## 📂 Arborescence Détaillée

### 1️⃣ Services Backend

```
src/services/dashboard/coeur/
├── index.ts                                    # Export barrel
│
├── GamificationService.ts                      # ⭐ Service CRUD principal
├── AdaptiveScoreCalculator.ts                  # Calcul XP + multiplicateurs
├── BonusXpCalculator.ts                        # Bonus intelligents
├── PhysicalQualitiesCalculator.ts             # Qualités physiques
├── TransformationScoreService.ts               # Score transformation
│
├── GamificationPredictionService.ts            # Prédictions niveaux
├── TransformationPredictionService.ts          # Prédictions poids/corps
├── GamificationLevelPredictionService.ts       # Détails niveaux futurs
├── GamificationUniversalPredictionService.ts   # Orchestrateur prédictions
│
├── AIBehaviorAnalyzer.ts                       # Analyse IA comportement
├── AITransformationAnalyzer.ts                 # Analyse IA transformation
├── ActionQueueGenerator.ts                     # Génération actions suggérées
│
└── absence/                                     # ⭐ Système d'absence
    ├── index.ts                                # Export barrel
    ├── AbsenceDetectionService.ts              # Détection inactivité
    ├── AbsenceReconciliationService.ts         # Orchestrateur réconciliation
    ├── AbsenceRecoveryCoachingService.ts       # Messages coaching
    ├── AntiCheatValidationService.ts           # Validation anti-triche
    └── EstimatedActivityService.ts             # Estimation activité

📊 Total: 18 fichiers (13 services + 5 absence)
```

### 2️⃣ Composants UI

```
src/components/dashboard/widgets/coeur/
├── GamingProgressWidget/                       # ⭐ Widget principal
│   ├── index.tsx                               # Orchestrateur
│   ├── types.ts                                # Types TypeScript
│   │
│   ├── components/                             # Sous-composants
│   │   ├── ActionCommandPanel.tsx              # Actions quotidiennes
│   │   ├── CelebrationEffect.tsx               # Animations celebration
│   │   ├── LevelProgressBar.tsx                # Barre progression
│   │   ├── PredictionTimeline.tsx              # Timeline prédictions
│   │   ├── StatsGrid.tsx                       # Grille stats
│   │   ├── UniversalPrediction.tsx             # Prédictions universelles
│   │   └── WeightUpdateSection.tsx             # Update poids + absence
│   │
│   ├── hooks/                                  # Hooks internes
│   │   ├── useGamingData.ts                    # Données gaming
│   │   └── useWeightUpdate.ts                  # Update poids
│   │
│   └── utils/                                  # Utilitaires
│       └── multipliers.ts                      # Calculs multiplicateurs
│
├── GamingProgressWidgetV3.tsx                  # Wrapper v3
├── GamingActionsWidget.tsx                     # Widget actions CTA
├── GamingProjectionAndStats.tsx                # Projections + stats
├── DailySummaryStats.tsx                       # Stats quotidiennes
├── GamificationBonusPanel.tsx                  # Panneau bonus
├── GamificationSkeleton.tsx                    # Loading skeleton
│
└── empty-states/
    └── EmptyGamificationState.tsx              # État vide

📊 Total: 18 fichiers (1 dossier principal + 7 composants + 10 sous-composants)
```

### 3️⃣ Hooks React

```
src/hooks/coeur/
├── useGamification.ts                          # ⭐ Hook principal
│   ├── Queries: useGamificationProgress, useXpStats, etc.
│   └── Mutations: useAwardMealScanXp, useUpdateWeight, etc.
│
├── useDailyActionsTracking.ts                  # ⭐ Hook actions quotidiennes
│   ├── useTodaysCompletedActions
│   ├── useMarkActionCompleted
│   └── useActionCombo
│
├── useTransformationPrediction.ts              # Prédictions transformation
├── useTransformationScore.ts                   # Score transformation
├── useUniversalPrediction.ts                   # Prédictions universelles
└── useFirstTimeBonus.ts                        # Bonus première fois

📊 Total: 6 fichiers
```

### 4️⃣ Migrations SQL

```
supabase/migrations/coeur/
├── README.md                                   # ⭐ Guide complet
├── INDEX.md                                    # ⭐ Quick reference
│
├── Base Gamification (8 fichiers)
│   ├── 20251108120000_add_gamification_system.sql
│   ├── 20251108164109_add_gamification_auto_init_trigger.sql
│   ├── 20251115000000_fix_gamification_rls_policies.sql
│   └── ...
│
├── XP & Attribution (3 fichiers)
│   ├── 20251110000000_add_xp_idempotence_and_auto_attribution.sql
│   └── ...
│
├── Actions Quotidiennes (4 fichiers)
│   ├── 20251108175520_add_daily_actions_tracking_system.sql
│   ├── 20251122000000_optimize_daily_actions_for_multiple_occurrences.sql
│   └── ...
│
├── Prédictions & IA (4 fichiers)
│   ├── 20251107120000_add_transformation_scores_system.sql
│   ├── 20251108150000_add_transformation_predictions_system.sql
│   └── ...
│
├── Records & Classement (9 fichiers)
│   ├── 20251114000000_sprint6_records_and_leaderboard_system.sql
│   └── ...
│
├── Partage Social (5 fichiers)
│   └── ...
│
└── Sprints Amélioration (4 fichiers)
    ├── 20251111000000_sprint3_acceleration_progression.sql
    ├── 20251112000000_sprint4_multiplicateurs_performance.sql
    └── ...

📊 Total: 37 fichiers (35 SQL + 2 docs)
```

---

## 📚 Documentation

```
docs/dashboard/coeur/
├── README.md                                   # ⭐ Index principal
├── QUICK_START.md                              # ⭐ Guide 30 minutes
├── ARBORESCENCE_ET_INTEGRATION.md              # Guide complet intégration
├── IMPORTS_REFERENCE.md                        # Référence imports v3.0
├── MIGRATIONS_SQL.md                           # Guide migrations SQL
├── GAMING_SYSTEM_TECHNICAL_DOC.md              # Doc technique
├── GAMING_SYSTEM_INNOVATION_DOC.md             # Vision produit
├── PREDICTION_SYSTEM_TECHNICAL_DOC.md          # Prédictions IA
└── PREDICTION_SYSTEM_INNOVATION_DOC.md         # Vision prédictions

📊 Total: 9 documents (4,857 lignes)
```

---

## 📊 Statistiques Complètes

### Code Source
- **Services:** 18 fichiers (13 core + 5 absence)
- **Composants:** 18 fichiers UI
- **Hooks:** 6 hooks React
- **Total Code:** 42 fichiers

### Migrations SQL
- **Migrations:** 35 fichiers SQL
- **Documentation:** 2 fichiers (README + INDEX)
- **Total SQL:** 37 fichiers

### Documentation
- **Guides:** 9 documents markdown
- **Lignes:** 4,857 lignes
- **Taille:** 148KB

### Total Système
- **Fichiers:** 88 (42 code + 37 SQL + 9 docs)
- **Tables DB:** 14+ tables Supabase
- **RLS Policies:** 50+ policies
- **Fonctions SQL:** 20+ fonctions

---

## 🎯 Copie vers Autres Projets

### Commande Unique pour Tout Copier

```bash
# Copier les 4 dossiers principaux
cp -r src/services/dashboard/coeur/ YOUR_PROJECT/src/services/dashboard/
cp -r src/components/dashboard/widgets/coeur/ YOUR_PROJECT/src/components/dashboard/widgets/
cp -r src/hooks/coeur/ YOUR_PROJECT/src/hooks/
cp -r supabase/migrations/coeur/ YOUR_PROJECT/supabase/migrations/

# Copier la documentation
cp -r docs/dashboard/coeur/ YOUR_PROJECT/docs/dashboard/
```

### Checklist Post-Copie

- [ ] Appliquer migrations SQL (voir `/migrations/coeur/README.md`)
- [ ] Vérifier build: `npm run build`
- [ ] Tester imports
- [ ] Tester widget gaming
- [ ] Tester attribution XP

---

## 🚀 Quick Start

### 1. Copier les 4 Dossiers

```bash
# Via terminal
cp -r src/services/dashboard/coeur/ YOUR_PROJECT/
cp -r src/components/dashboard/widgets/coeur/ YOUR_PROJECT/
cp -r src/hooks/coeur/ YOUR_PROJECT/
cp -r supabase/migrations/coeur/ YOUR_PROJECT/
```

### 2. Appliquer Migrations

```bash
cd YOUR_PROJECT
supabase db push  # Ou via Supabase Studio
```

### 3. Utiliser dans Dashboard

```tsx
import GamingProgressWidgetV3 from '@/components/dashboard/widgets/coeur/GamingProgressWidgetV3';

function Dashboard() {
  return <GamingProgressWidgetV3 />;
}
```

### 4. Intégrer XP dans Features

```tsx
import { useAwardMealScanXp } from '@/hooks/coeur/useGamification';

function MealScan() {
  const awardXp = useAwardMealScanXp();

  const handleScan = async () => {
    // Votre logique...
    await awardXp.mutateAsync();
  };
}
```

---

## 🔗 Liens Utiles

### Documentation Principale
- **Index:** `/docs/dashboard/coeur/README.md`
- **Quick Start:** `/docs/dashboard/coeur/QUICK_START.md`
- **Intégration:** `/docs/dashboard/coeur/ARBORESCENCE_ET_INTEGRATION.md`

### Migrations
- **Guide:** `/supabase/migrations/coeur/README.md`
- **Index:** `/supabase/migrations/coeur/INDEX.md`

### Code
- **Services:** `/src/services/dashboard/coeur/`
- **Composants:** `/src/components/dashboard/widgets/coeur/`
- **Hooks:** `/src/hooks/coeur/`

---

## 🎉 Système Complet & Prêt

✅ **88 fichiers organisés**
✅ **4 dossiers principaux**
✅ **9 documents de documentation**
✅ **35 migrations SQL avec guides**
✅ **Build vérifié et fonctionnel**
✅ **Prêt pour copie vers autres projets Bolt**

---

**Version:** 3.0 | **Date:** Novembre 2025 | **Status:** Production Active
