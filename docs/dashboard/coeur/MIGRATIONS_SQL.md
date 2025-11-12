# Migrations SQL - Système de Gaming

**Version:** 3.0 | **Date:** Novembre 2025

---

## 📋 Liste des Migrations (Ordre d'Application)

### Sprint 1-2: Base Gamification (Tables Core)

#### 1. `20251108025539_20251108120000_add_gamification_system.sql`
**Statut:** ✅ CRITIQUE - Base système

**Tables créées:**
- `user_gamification` - État gamification utilisateur
- `xp_attribution_audit` - Audit XP (idempotence)
- `gamification_level_milestones` - Paliers niveaux
- `xp_values` - Valeurs XP par action

**Fonctionnalités:**
- Attribution XP idempotente
- Calcul niveaux automatique
- Tracking streak jours actifs
- Perfect days counter

**Triggers:**
- Auto-init gamification sur nouveau user
- Level up automatique sur XP seuil

---

#### 2. `20251109120000_add_exercise_reference_table.sql`
**Statut:** ⚠️ Optionnel (si records système)

**Tables créées:**
- `exercise_reference` - Référence exercices training

**Fonctionnalités:**
- Catégorisation exercices (force, endurance, etc.)
- Mapping illustrations
- Métadonnées exercices

---

### Sprint 3: Accélération Progression

#### 3. `20251111000000_sprint3_acceleration_progression.sql`
**Statut:** ✅ IMPORTANT - Multiplicateurs

**Ajouts:**
- Colonne `weekly_active_days` dans `user_gamification`
- Fonction `update_weekly_active_days()`
- Trigger auto-calcul jours actifs/semaine

**Fonctionnalités:**
- Multiplicateur basé jours actifs hebdo
- Bonus +10% par jour actif
- Calcul automatique chaque update

---

### Sprint 4: Multiplicateurs Performance

#### 4. `20251112000000_sprint4_multiplicateurs_performance.sql`
**Statut:** ✅ IMPORTANT - Bonus avancés

**Ajouts:**
- Colonne `bonus_multipliers` (JSONB) dans `user_gamification`
- Tracking multiplicateurs dynamiques

**Fonctionnalités:**
- Streak multiplier (x1.0 → x2.5)
- Weekly active multiplier
- First-time bonus tracking
- Combo detection

---

### Sprint 5: Analyse IA Comportement

#### 5. `20251113000000_sprint5_ai_behavior_analysis.sql`
**Statut:** 🔵 Optionnel (si IA activée)

**Tables créées:**
- `ai_behavior_analyses` - Analyses IA comportement
- `ai_behavior_insights` - Insights générés par IA

**Fonctionnalités:**
- Analyse patterns comportement
- Suggestions actions personnalisées
- Détection anomalies
- Prédictions engagement

---

### Sprint 6: Records & Classement

#### 6. `20251114000000_sprint6_records_and_leaderboard_system.sql`
**Statut:** ✅ RECOMMANDÉ - Social gaming

**Tables créées:**
- `training_records` - Records exercices personnels
- `leaderboard_participants` - Participation classement
- `leaderboard_rankings` - Rankings calculés

**Fonctionnalités:**
- Records personnels par exercice
- Classement global/local
- Opt-in/opt-out classement
- Fonctions calcul ranking

---

### Sprint 7: Prédictions Transformation

#### 7. `20251107120000_add_transformation_scores_system.sql`
**Statut:** ✅ RECOMMANDÉ - Prédictions

**Tables créées:**
- `transformation_scores` - Scores transformation
- `transformation_predictions` - Prédictions poids/corps

**Fonctionnalités:**
- Score cohérence (alimentation, training, poids)
- Score momentum (vitesse progression)
- Prédictions 30/60/90 jours
- Confiance adaptative

---

#### 8. `20251108150000_add_transformation_predictions_system.sql`
**Statut:** ✅ RECOMMANDÉ - Prédictions avancées

**Ajouts:**
- Table `gamification_predictions` - Prédictions niveaux futurs
- Fonction `generate_transformation_prediction()`
- Algorithmes régression linéaire

**Fonctionnalités:**
- Prédiction niveau à 30/60/90j
- Prédiction poids cible
- Timeline visuelle milestones
- Mise à jour quotidienne auto

---

### Sprint 8: Système d'Absence

#### 9. `20251120000000_add_absence_continuity_system_fixed.sql`
**Statut:** ✅ CRITIQUE - Continuité utilisateur

**Tables créées:**
- `absence_logs` - Logs périodes d'absence
- `absence_reconciliation` - Réconciliations XP
- `estimated_activity` - Estimations activité

**Fonctionnalités:**
- Détection absence auto (3+ jours)
- Estimation XP manquants
- Réconciliation intelligente
- Validation anti-triche (cohérence poids)
- Messages coaching retour

---

### Sprint 9: Actions Quotidiennes

#### 10. `20251108175520_add_daily_actions_tracking_system.sql`
**Statut:** ✅ IMPORTANT - Tracking actions

**Tables créées:**
- `daily_actions_tracking` - Tracking actions quotidiennes

**Fonctionnalités:**
- Track 1 occurrence par action/jour
- Détection completion
- État reset automatique minuit

---

#### 11. `20251122000000_optimize_daily_actions_for_multiple_occurrences.sql`
**Statut:** ✅ CRITIQUE - Actions multiples

**Modifications:**
- Colonne `occurrence_number` (permet multiples/jour)
- Colonne `max_daily_occurrences`
- Index optimisés
- RPC `mark_daily_action_completed_v2()`

**Fonctionnalités:**
- Track plusieurs scans repas/jour
- Track plusieurs activités/jour
- Bonus first-time (x2 XP)
- Combos automatiques

---

### Sprint 10: Transformations Partagées

#### 12. `20251123000000_add_transformation_records_system.sql`
**Statut:** 🔵 Optionnel (si partage social)

**Tables créées:**
- `transformation_records` - Records transformations
- `transformation_card_shares` - Partages cartes transformation

**Fonctionnalités:**
- Capture milestones transformation
- Génération cartes visuelles
- Partage social
- XP bonus partage

---

## 📦 Packages de Migration Recommandés

### Package Minimal (Fonctionnel à 100%)
```sql
1. add_gamification_system.sql
2. sprint3_acceleration_progression.sql
3. sprint4_multiplicateurs_performance.sql
4. sprint6_records_and_leaderboard_system.sql
5. add_absence_continuity_system_fixed.sql
6. optimize_daily_actions_for_multiple_occurrences.sql
```

**Résultat:** Système gaming complet sans prédictions IA

---

### Package Standard (Recommandé)
```sql
Package Minimal +
7. add_transformation_scores_system.sql
8. add_transformation_predictions_system.sql
```

**Résultat:** Système gaming + prédictions transformation

---

### Package Complet (Toutes Fonctionnalités)
```sql
Package Standard +
9. sprint5_ai_behavior_analysis.sql
10. add_transformation_records_system.sql
11. add_exercise_reference_table.sql
```

**Résultat:** Système gaming + IA + social + records

---

## 🔧 Application des Migrations

### Méthode 1: Supabase CLI (Recommandée)

```bash
# Via CLI locale
supabase db push

# Ou migration spécifique
supabase migration up
```

### Méthode 2: Supabase Studio

1. Ouvrir Supabase Studio
2. Aller dans "SQL Editor"
3. Copier/coller contenu migration
4. Exécuter

### Méthode 3: MCP Tool (si disponible)

```typescript
mcp__supabase__apply_migration({
  filename: "add_gamification_system.sql",
  content: "..."
});
```

---

## ✅ Vérification Post-Migration

### 1. Tables Créées

```sql
-- Vérifier tables existantes
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%gamification%'
OR table_name LIKE '%absence%'
OR table_name LIKE '%daily_actions%';
```

**Attendu (package minimal):**
- user_gamification
- xp_attribution_audit
- gamification_level_milestones
- absence_logs
- absence_reconciliation
- daily_actions_tracking

---

### 2. RLS Policies Actives

```sql
-- Vérifier RLS activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_gamification', 'xp_attribution_audit');
```

**Attendu:** `rowsecurity = true` pour toutes tables

---

### 3. Triggers Fonctionnels

```sql
-- Lister triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Attendu (minimum):**
- `init_user_gamification_trigger` sur `profiles`
- `update_weekly_active_days_trigger` sur `user_gamification`

---

### 4. Test Fonctionnel

```sql
-- Test attribution XP
SELECT * FROM user_gamification WHERE user_id = 'YOUR_USER_ID';
SELECT * FROM xp_attribution_audit WHERE user_id = 'YOUR_USER_ID';
```

---

## 🐛 Dépannage Migrations

### Erreur: "table already exists"

**Cause:** Migration déjà appliquée

**Solution:**
```sql
-- Vérifier état migrations
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;
```

---

### Erreur: "permission denied for schema public"

**Cause:** Permissions insuffisantes

**Solution:**
```sql
-- Via Supabase Studio en tant que postgres user
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

---

### Erreur: "function does not exist"

**Cause:** Dépendances manquantes (migrations précédentes)

**Solution:** Appliquer migrations dans l'ordre strict

---

### Erreur: "duplicate key violates unique constraint"

**Cause:** Données existantes conflictuelles

**Solution:**
```sql
-- Nettoyer données test si nécessaire
TRUNCATE TABLE user_gamification CASCADE;
TRUNCATE TABLE xp_attribution_audit CASCADE;
```

⚠️ **ATTENTION:** Ne jamais faire en production!

---

## 📊 Schéma des Dépendances

```
Base (Sprint 1-2)
├── user_gamification (table core)
├── xp_attribution_audit (idempotence)
└── gamification_level_milestones (niveaux)

↓

Multiplicateurs (Sprint 3-4)
├── weekly_active_days (accélération)
└── bonus_multipliers (bonus avancés)

↓

Prédictions (Sprint 7-8)
├── transformation_scores (scoring)
├── transformation_predictions (prédictions poids)
└── gamification_predictions (prédictions niveaux)

↓

Absence (Sprint 8)
├── absence_logs (détection)
├── absence_reconciliation (réconciliation)
└── estimated_activity (estimation)

↓

Actions (Sprint 9-10)
├── daily_actions_tracking (tracking simple)
└── occurrence_number (tracking multiple)

↓

Social (Sprint 10+)
├── training_records (records perso)
├── leaderboard_participants (classement)
└── transformation_records (partage)
```

---

## 🎯 Résumé Rapide

**Minimum requis:** 6 migrations (package minimal)
**Recommandé:** 8 migrations (package standard)
**Complet:** 12 migrations (toutes fonctionnalités)

**Temps application:** ~5 minutes (package minimal)

**Prochaine étape:** Voir `QUICK_START.md` pour intégration code

---

**Questions?** Consulter `ARBORESCENCE_ET_INTEGRATION.md` → Section "Dépannage & FAQ"
