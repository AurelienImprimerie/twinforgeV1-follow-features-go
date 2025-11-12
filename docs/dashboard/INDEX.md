# TwinForge Dashboard - Documentation Centrale

**Version:** 1.0
**Date:** 10 Novembre 2025
**Statut:** Production Active

---

## 📚 Vue d'Ensemble

Cette documentation centralise tous les systèmes du tableau de bord TwinForge. Chaque système majeur dispose de deux documentations complémentaires:
- **Innovation DOC**: Vision marketing, différenciation, bénéfices utilisateur
- **Technical DOC**: Architecture, services, intégrations, points clés techniques

---

## 🎯 Systèmes Documentés

### Onglet Cœur (Gaming & Prédictions)

**1. Système de Gaming**
- [Innovation DOC](./coeur/GAMING_SYSTEM_INNOVATION_DOC.md)
- [Technical DOC](./coeur/GAMING_SYSTEM_TECHNICAL_DOC.md)

**Résumé**: Système de gamification avec XP adaptatifs, 4 multiplicateurs contextuels, 100 niveaux avec titres thématiques, système de réconciliation des absences.

**Services clés**:
- `GamificationService` - CRUD et attribution XP
- `AdaptiveScoreCalculator` - Calcul multiplicateurs
- `BonusXpCalculator` - Bonus intelligents
- `AbsenceReconciliationService` - Gestion absences

**2. Système de Prédiction**
- [Innovation DOC](./coeur/PREDICTION_SYSTEM_INNOVATION_DOC.md)
- [Technical DOC](./coeur/PREDICTION_SYSTEM_TECHNICAL_DOC.md)

**Résumé**: Prédictions IA multi-dimensionnelles (gaming, transformation corporelle, performance) avec niveau de confiance dynamique et projections 3D.

**Services clés**:
- `GamificationUniversalPredictionService` - Orchestrateur prédictions
- `TransformationPredictionService` - Prédictions poids/corps
- `BodyProjectionService` - Projections 3D
- `GamificationLevelPredictionService` - Prédictions niveaux

### Système de Records et Partage

**3. Système de Records**
- [Innovation DOC](./records/RECORDS_SYSTEM_INNOVATION_DOC.md)
- [Technical DOC](./records/RECORDS_SYSTEM_TECHNICAL_DOC.md)

**Résumé**: Détection automatique records (sessions, exercices, transformation), génération cartes premium IA, partage social optimisé 1-clic.

**Services clés**:
- `RecordsService` - CRUD records
- `CardGenerationService` - Génération cartes visuelles
- `RecordEnrichmentService` - Enrichissement données
- `TrainingRecordsSyncService` - Sync training → records

---

## 🏆 Système de Classement (Leaderboard)

### Innovation & Marketing

**Vision**: Classement communautaire qui transforme la progression individuelle en compétition amicale tout en préservant vie privée.

**Fonctionnalités clés**:
- Classement XP total temps réel
- Anonymisation optionnelle
- Participation automatique
- Top 100 utilisateurs
- Rang personnel affiché

**Différenciation**:
- Vs apps classiques: Anonymisation intelligente, participation opt-out au lieu opt-in
- Gamification sociale sans pression
- Motivation par comparaison saine

**Métriques**:
- Taux consultation: 3.8×/semaine
- Taux anonymisation: 42% (équilibré)
- Impact motivation: +15% XP gagnés

### Technical Documentation

**Service**: `LeaderboardService` (`src/services/dashboard/classement/LeaderboardService.ts`)

**Méthodes clés**:

```typescript
// Récupération classement (limite 100)
getLeaderboard(category: 'xp_alltime', limit: number): Promise<LeaderboardEntry[]>

// Rang utilisateur spécifique
getUserRankInLeaderboard(userId: string, category: string): Promise<{ rank: number }>

// Paramètres anonymisation
updateLeaderboardSettings(userId: string, settings: LeaderboardSettings): Promise<void>
```

**Table Database**: `user_gamification` (réutilisée)
**Index**: `idx_gamification_xp_total` pour performances

**Widget**: `LeaderboardWidgetSimplified` (`src/components/dashboard/widgets/LeaderboardWidgetSimplified.tsx`)

**Features**:
- Affichage top 100 avec pagination
- Highlight utilisateur courant
- Toggle anonymisation in-app
- Refresh manuel
- Empty state pour nouveaux users

---

## 🚫 Système de Gestion des Absences

### Innovation & Marketing

**Vision**: Les absences ne pénalisent plus. Système intelligent qui estime vos activités manquantes et vous permet de récupérer XP au retour.

**Fonctionnalités clés**:

**Détection Automatique**:
- 24h: Soft reminder (pas d'action)
- 48h: Absence active détectée
- 72h: Estimation XP activée
- 7j: Maximum estimation
- 14j+: Hibernation

**Réconciliation Intelligente**:
- Estimation XP = 50% moyenne quotidienne
- Validation poids anti-triche (max ±0.3 kg/jour)
- Préservation streak si < 7 jours
- Messages coaching adaptatifs selon durée
- Attribution XP récupérés instantanée

**Messages Coach Personnalisés**:
- 2-3 jours: "Content de te revoir!"
- 4-7 jours: "Reprenons ensemble progressivement"
- 8-14 jours: "Pas de pression, on y va étape par étape"
- 14+ jours: "Bienvenue! Recommençons en douceur"

**Métriques**:
- Taux retour après absence: 89% (< 7j)
- XP récupérés moyens: 375 XP (5 jours)
- Satisfaction: 92% apprécient système

### Technical Documentation

**Services**:
- `AbsenceDetectionService` - Détection inactivité (`src/services/absence/AbsenceDetectionService.ts`)
- `AbsenceReconciliationService` - Réconciliation XP (`src/services/absence/AbsenceReconciliationService.ts`)
- `AbsenceRecoveryCoachingService` - Messages coaching (`src/services/absence/AbsenceRecoveryCoachingService.ts`)

**Méthodes clés**:

```typescript
// Détection absence
AbsenceDetectionService.detectAbsence(userId): Promise<AbsenceDetectionResult>

// Estimation XP période
estimateXpDuringAbsence(userId, daysAbsent): Promise<{ estimatedXp: number }>

// Réconciliation
AbsenceReconciliationService.reconcileAbsence(userId, weightUpdate): Promise<ReconciliationResult>
```

**Table Database**: `user_absence_logs`
```sql
CREATE TABLE user_absence_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  absence_start_date date,
  absence_end_date date,
  days_absent integer,
  status text, -- 'active' | 'reconciled' | 'expired'
  estimated_activity_data jsonb,
  reconciled_at timestamptz,
  ...
);
```

**Intégration Widget**: `GamingProgressWidget` affiche:
- Notification absence active
- XP en attente récupérables
- Interface mise à jour poids avec réconciliation
- Messages coaching post-réconciliation

---

## 📊 Système de Suivi (Tracking)

### Innovation & Marketing

**Vision**: Centralisation intelligente de toutes vos métriques (training, nutrition, fasting, body scan) avec insights IA.

**Fonctionnalités clés**:
- Dashboard unifié toutes métriques
- Insights patterns comportementaux IA
- Alertes proactives déviations objectifs
- Corrélations multi-forges automatiques
- Timeline transformation visuelle

**Différenciation**:
- Vs apps classiques: Silos séparés (training ≠ nutrition ≠ poids)
- TwinForge: Vue holistique unifiée
- IA détecte connexions cachées (ex: mauvais sommeil → baisse perf)

**Cas d'usage**: User voit dans Suivi que ses semaines avec jeûne 16:8 corrèlent +12% performance training. Ajuste stratégie en conséquence.

### Technical Documentation

**Service**: `CalorieTrackingService` - Service principal suivi (`src/services/dashboard/suivi/CalorieTrackingService/`)

**Architecture modulaire**:
```
CalorieTrackingService/
├── CalorieTrackingServiceOrchestrator.ts (Orchestrateur)
├── aggregators/ (Agrégation données)
│   ├── BalanceAggregator.ts
│   ├── HistoryAggregator.ts
│   └── StatsAggregator.ts
├── calculators/ (Calculs métriques)
│   ├── BMRCalculator.ts
│   ├── TDEECalculator.ts
│   ├── NEATCalculator.ts
│   └── TargetCaloriesCalculator.ts
├── data/ (Providers données)
│   ├── CaloriesInProvider.ts
│   ├── ActivityCaloriesProvider.ts
│   ├── TrainingCaloriesProvider.ts
│   └── FastingBonusProvider.ts
└── utils/
    └── metValues.ts (Tables MET)
```

**Méthodes clés**:
```typescript
// Bilan calorique quotidien
getCalorieBalance(userId, date): Promise<CalorieBalance>

// Historique période
getCalorieHistory(userId, days): Promise<CalorieHistory[]>

// Statistiques agrégées
getCalorieStats(userId, period): Promise<CalorieStats>
```

**Widgets associés**:
- `CalorieBalanceWidget` - Suivi calories/macros
- `GamingProgressWidget` - Intégration suivi poids
- `DailySummaryStats` - Stats quotidiennes

---

## 🔗 Intégrations Cross-Systèmes

### Gaming ↔ Records
- Record battu → Attribution XP bonus (+50%)
- Multiplicateur défi appliqué automatiquement
- Célébration synchronisée

### Prédiction ↔ Gaming
- Prédictions niveaux futurs basées XP quotidien
- Confidence recalculée après chaque activité
- Ajustements stratégiques suggérés si écart objectifs

### Records ↔ Partage Social
- Génération carte automatique après record
- URL trackées pour attribution signups
- Gamification: XP bonus si X partages

### Absences ↔ Gaming
- Streak préservé si réconciliation < 7j
- XP récupérés (50% estimation)
- Pas de pénalité, juste récupération partielle

### Suivi ↔ HEAD System
- HEAD collecte toutes métriques suivi
- Contexte enrichi pour chat IA
- Coaching proactif selon déviations détectées

---

## 📊 Tables Database Principales

**user_gamification**: État gamification utilisateur
**xp_attribution_audit**: Historique XP (idempotence)
**transformation_scores**: Scores transformation
**user_absence_logs**: Logs absences et réconciliations
**user_records**: Records génériques
**training_records**: Records training spécifiques
**training_session_shares**: Partages sessions
**prediction_cache**: Cache prédictions

---

## 🎨 Widgets Dashboard

**GamingProgressWidget**: Progression gaming, prédictions, actions
**RecordsWidget**: 3 catégories records avec navigation onglets
**LeaderboardWidget**: Classement communautaire top 100
**CalorieBalanceWidget**: Suivi calories et macros
**DailySummaryStats**: Statistiques quotidiennes

---

## 🚀 Performance

**Cache Strategy**:
- Prédictions: 24h cache
- Illustrations: 30j cache
- Records: Invalidation sélective
- XP moyenne quotidienne: 6h cache

**Optimisations**:
- Lazy loading cartes (génération on-demand)
- Batch loading records (Promise.all)
- Indices database sur colonnes fréquentes
- Requêtes parallèles non-bloquantes

---

## 📚 Références

**Code Source**:
- `/src/services/dashboard/coeur/` - Services gaming/prédiction
- `/src/services/dashboard/records/` - Services records
- `/src/services/dashboard/classement/` - Service leaderboard
- `/src/services/absence/` - Services absences
- `/src/services/dashboard/suivi/` - Services tracking
- `/src/components/dashboard/widgets/` - Tous widgets

**Documentation Technique**:
- `/docs/central/AUDIT_AGENTS_IA_COMPLET.md` - Agents IA
- `/docs/head/` - Système HEAD
- `/docs/training/` - Forge Training
- `/docs/forgeculinaire/` - Forge Culinaire

---

**Maintenu par:** Équipe TwinForge
**Dernière mise à jour:** 10 Novembre 2025
**Version:** 1.0
