# Migrations Système de Gaming (Coeur)

**Total:** 35 migrations SQL
**Dernière mise à jour:** Novembre 2025

---

## 📦 Organisation des Migrations

Ce dossier contient **toutes les migrations SQL** du système de gaming TwinForge, organisées chronologiquement.

### Catégories de Migrations

1. **Base Gamification** (8 fichiers)
2. **Actions Quotidiennes** (4 fichiers)
3. **Prédictions & Scores** (4 fichiers)
4. **Records & Classement** (9 fichiers)
5. **Sprints Amélioration** (4 fichiers)
6. **Partage Social** (3 fichiers)
7. **Fixes & Optimisations** (3 fichiers)

---

## 🎯 Ordre d'Application Recommandé

### Package Minimal (Core Gaming)

**6 migrations obligatoires pour fonctionnalités de base:**

```
1. 20251108120000_add_gamification_system.sql
   → Tables: user_gamification, xp_attribution_audit, gamification_level_milestones

2. 20251110000000_add_xp_idempotence_and_auto_attribution.sql
   → Idempotence XP + attribution automatique

3. 20251111000000_sprint3_acceleration_progression.sql
   → Multiplicateurs progression (streak, weekly active days)

4. 20251112000000_sprint4_multiplicateurs_performance.sql
   → Bonus multiplicateurs avancés

5. 20251108175520_add_daily_actions_tracking_system.sql
   → Tracking actions quotidiennes (base)

6. 20251122000000_optimize_daily_actions_for_multiple_occurrences.sql
   → Actions multiples par jour + combos
```

### Package Standard (+ Prédictions)

**Package Minimal + 4 migrations prédictions:**

```
7. 20251107120000_add_transformation_scores_system.sql
   → Score transformation (cohérence + momentum)

8. 20251108150000_add_transformation_predictions_system.sql
   → Prédictions poids/corps 30/60/90j

9. 20251108031518_20251108150000_add_transformation_predictions_system.sql
   → Version alternative/fix prédictions

10. 20251108012245_20251108000000_add_intelligent_dashboard_v2_enhancements.sql
    → Dashboard intelligent v2
```

### Package Complet (+ Records & Social)

**Package Standard + 9 migrations records/classement:**

```
11. 20251109120000_add_exercise_reference_table.sql
    → Référence exercices

12. 20251114000000_sprint6_records_and_leaderboard_system.sql
    → Records + classement système complet

13. 20251109120000_simplify_records_and_leaderboard.sql
    → Simplification records

14. 20251109035425_fix_leaderboard_system_v2.sql
    → Fix classement v2

15. 20251109035540_enhance_leaderboard_display_name.sql
    → Amélioration affichage noms

16-19. Fix leaderboard functions (4 migrations)

20. 20251110232805_add_transformation_card_shares_table.sql
    → Partage cartes transformation

21. 20251123000000_add_transformation_records_system.sql
    → Records transformation
```

---

## 📋 Liste Complète des Migrations

### Base Gamification (Nov 7-8, 2025)

```
20251107120000_add_transformation_scores_system.sql
20251108120000_add_gamification_system.sql
20251108025539_20251108120000_add_gamification_system.sql (duplicate)
20251108164034_add_gamification_auto_init_trigger.sql
20251108164109_add_gamification_auto_init_trigger.sql (version alt)
20251108171208_remove_level_cap_and_add_backfill.sql
20251109022305_update_level_titles_forge_theme.sql
20251115000000_fix_gamification_rls_policies.sql
```

### XP & Attribution (Nov 10, 2025)

```
20251110000000_add_xp_idempotence_and_auto_attribution.sql
20251110062118_fix_xp_attribution_audit_rls_insert_policy.sql
20251111011144_add_share_xp_tracking_and_timezone.sql
```

### Actions Quotidiennes (Nov 8-22, 2025)

```
20251108175520_add_daily_actions_tracking_system.sql
20251110213427_fix_daily_actions_add_occurrence_columns.sql
20251110213514_add_daily_actions_rpc_functions_fixed.sql
20251122000000_optimize_daily_actions_for_multiple_occurrences.sql
```

### Prédictions & IA (Nov 8, 2025)

```
20251108012245_20251108000000_add_intelligent_dashboard_v2_enhancements.sql
20251108031518_20251108150000_add_transformation_predictions_system.sql
20251108150000_add_transformation_predictions_system.sql
20251113000000_sprint5_ai_behavior_analysis.sql
```

### Records & Classement (Nov 9-14, 2025)

```
20251109120000_add_exercise_reference_table.sql
20251109120000_simplify_records_and_leaderboard.sql
20251109035425_fix_leaderboard_system_v2.sql
20251109035540_enhance_leaderboard_display_name.sql
20251109091916_20251109100000_fix_leaderboard_function_and_default_participation.sql
20251109100000_fix_leaderboard_function_and_default_participation.sql
20251110014018_20251110120000_fix_leaderboard_function_and_populate.sql
20251110120000_fix_leaderboard_function_and_populate.sql
20251114000000_sprint6_records_and_leaderboard_system.sql
```

### Partage Social (Nov 10-23, 2025)

```
20251110000000_enhance_records_sharing_system.sql
20251110213539_add_transformation_records_trigger.sql
20251110213608_add_transformation_records_backfill_function.sql
20251110232805_add_transformation_card_shares_table.sql
20251123000000_add_transformation_records_system.sql
```

### Sprints Amélioration (Nov 11-12, 2025)

```
20251111000000_sprint3_acceleration_progression.sql
20251112000000_sprint4_multiplicateurs_performance.sql
20251113000000_sprint5_ai_behavior_analysis.sql
20251114000000_sprint6_records_and_leaderboard_system.sql
```

---

## 🔧 Application des Migrations

### Méthode 1: Ordre Chronologique Complet

```bash
# Applique toutes les 35 migrations dans l'ordre
supabase db push
```

### Méthode 2: Package Minimal Seulement

```bash
# Applique 6 migrations core
supabase migration up 20251108120000_add_gamification_system.sql
supabase migration up 20251110000000_add_xp_idempotence_and_auto_attribution.sql
supabase migration up 20251111000000_sprint3_acceleration_progression.sql
supabase migration up 20251112000000_sprint4_multiplicateurs_performance.sql
supabase migration up 20251108175520_add_daily_actions_tracking_system.sql
supabase migration up 20251122000000_optimize_daily_actions_for_multiple_occurrences.sql
```

### Méthode 3: Via Supabase Studio

1. Ouvrir Supabase Studio
2. SQL Editor
3. Copier/coller contenu migration
4. Exécuter

---

## 📊 Tables Créées

### Tables Principales (Core)

- `user_gamification` - État gamification utilisateur
- `xp_attribution_audit` - Audit attribution XP (idempotence)
- `gamification_level_milestones` - Paliers niveaux
- `daily_actions_tracking` - Tracking actions quotidiennes

### Tables Prédictions

- `transformation_scores` - Scores transformation
- `transformation_predictions` - Prédictions poids/corps
- `gamification_predictions` - Prédictions niveaux

### Tables Records & Classement

- `exercise_reference` - Référence exercices
- `training_records` - Records personnels
- `leaderboard_participants` - Participants classement
- `leaderboard_rankings` - Rankings calculés

### Tables Partage Social

- `training_session_shares` - Partages sessions training
- `transformation_card_shares` - Partages cartes transformation
- `transformation_records` - Records transformation

### Tables IA

- `ai_behavior_analyses` - Analyses comportement IA
- `ai_behavior_insights` - Insights générés IA

---

## ⚠️ Notes Importantes

### Duplicates / Versions Alternatives

Certaines migrations existent en 2 versions:

```
20251108120000_add_gamification_system.sql
20251108025539_20251108120000_add_gamification_system.sql
→ Choisir UNE des deux (contenu identique)

20251108164034_add_gamification_auto_init_trigger.sql
20251108164109_add_gamification_auto_init_trigger.sql
→ Version 164109 plus récente (recommandée)
```

### Dépendances

Les migrations **doivent être appliquées dans l'ordre chronologique** (par timestamp).

Certaines migrations dépendent d'autres:
- Actions multiples dépend de actions tracking base
- Records dépend de exercise_reference
- Prédictions dépendent de transformation_scores

---

## 🐛 Dépannage

### Erreur: "relation already exists"

**Cause:** Migration déjà appliquée

**Solution:**
```sql
-- Vérifier migrations appliquées
SELECT * FROM supabase_migrations.schema_migrations
WHERE version LIKE '202511%'
ORDER BY version;
```

### Erreur: "function already exists"

**Cause:** Duplicate trigger/function dans migration alternative

**Solution:** Appliquer seulement la version la plus récente

### Erreur: "foreign key constraint"

**Cause:** Dépendance manquante (migration précédente non appliquée)

**Solution:** Appliquer toutes les migrations dans l'ordre chronologique

---

## 📚 Documentation Complémentaire

- **Guide complet:** `/docs/dashboard/coeur/MIGRATIONS_SQL.md`
- **Architecture:** `/docs/dashboard/coeur/GAMING_SYSTEM_TECHNICAL_DOC.md`
- **Quick Start:** `/docs/dashboard/coeur/QUICK_START.md`

---

## 📊 Statistiques

- **Total migrations:** 35
- **Migrations core:** 6 (minimum requis)
- **Migrations optionnelles:** 29
- **Tables créées:** 14+
- **Triggers créés:** 8+
- **RLS Policies:** 50+
- **Fonctions SQL:** 20+

---

**Dernière mise à jour:** Novembre 2025
**Version système:** 3.0
**Statut:** Production Active
