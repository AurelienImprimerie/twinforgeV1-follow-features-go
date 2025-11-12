# Index des Migrations - Système de Gaming

**Quick Reference:** Trouvez rapidement la migration dont vous avez besoin

---

## 🔍 Recherche par Fonctionnalité

### 🎮 Gamification Core

| Migration | Description | Priorité |
|-----------|-------------|----------|
| `20251108120000_add_gamification_system.sql` | ⭐ Tables base gamification | CRITIQUE |
| `20251110000000_add_xp_idempotence_and_auto_attribution.sql` | ⭐ Idempotence XP | CRITIQUE |
| `20251108164109_add_gamification_auto_init_trigger.sql` | Auto-init user | Recommandé |
| `20251115000000_fix_gamification_rls_policies.sql` | Fix RLS policies | Important |
| `20251108171208_remove_level_cap_and_add_backfill.sql` | Supprime level cap | Optionnel |
| `20251109022305_update_level_titles_forge_theme.sql` | Titres niveaux thème | Optionnel |

---

### ⚡ XP & Multiplicateurs

| Migration | Description | Priorité |
|-----------|-------------|----------|
| `20251111000000_sprint3_acceleration_progression.sql` | ⭐ Multiplicateurs progression | CRITIQUE |
| `20251112000000_sprint4_multiplicateurs_performance.sql` | ⭐ Bonus avancés | CRITIQUE |
| `20251110062118_fix_xp_attribution_audit_rls_insert_policy.sql` | Fix RLS audit XP | Important |
| `20251111011144_add_share_xp_tracking_and_timezone.sql` | XP partage + timezone | Optionnel |

---

### ✅ Actions Quotidiennes

| Migration | Description | Priorité |
|-----------|-------------|----------|
| `20251108175520_add_daily_actions_tracking_system.sql` | ⭐ Base tracking | CRITIQUE |
| `20251122000000_optimize_daily_actions_for_multiple_occurrences.sql` | ⭐ Actions multiples | CRITIQUE |
| `20251110213427_fix_daily_actions_add_occurrence_columns.sql` | Colonnes occurrences | Important |
| `20251110213514_add_daily_actions_rpc_functions_fixed.sql` | Fonctions RPC | Important |

---

### 📊 Prédictions & Scores

| Migration | Description | Priorité |
|-----------|-------------|----------|
| `20251107120000_add_transformation_scores_system.sql` | Score transformation | Recommandé |
| `20251108150000_add_transformation_predictions_system.sql` | Prédictions 30/60/90j | Recommandé |
| `20251108012245_20251108000000_add_intelligent_dashboard_v2_enhancements.sql` | Dashboard intelligent | Optionnel |
| `20251113000000_sprint5_ai_behavior_analysis.sql` | Analyse IA | Optionnel |

---

### 🏆 Records & Classement

| Migration | Description | Priorité |
|-----------|-------------|----------|
| `20251114000000_sprint6_records_and_leaderboard_system.sql` | ⭐ Système complet | Recommandé |
| `20251109120000_add_exercise_reference_table.sql` | Référence exercices | Recommandé |
| `20251109120000_simplify_records_and_leaderboard.sql` | Simplification | Important |
| `20251109035425_fix_leaderboard_system_v2.sql` | Fix classement v2 | Important |
| `20251109035540_enhance_leaderboard_display_name.sql` | Affichage noms | Optionnel |
| `20251109100000_fix_leaderboard_function_and_default_participation.sql` | Fix fonction | Important |
| `20251110120000_fix_leaderboard_function_and_populate.sql` | Populate rankings | Important |

---

### 📤 Partage Social

| Migration | Description | Priorité |
|-----------|-------------|----------|
| `20251110232805_add_transformation_card_shares_table.sql` | Partages cartes | Optionnel |
| `20251123000000_add_transformation_records_system.sql` | Records partagés | Optionnel |
| `20251110000000_enhance_records_sharing_system.sql` | Système partage | Optionnel |
| `20251110213539_add_transformation_records_trigger.sql` | Trigger records | Optionnel |
| `20251110213608_add_transformation_records_backfill_function.sql` | Backfill records | Optionnel |

---

## 🔢 Recherche par Numéro (Timestamp)

### Novembre 7, 2025
- `20251107120000` - Transformation scores system

### Novembre 8, 2025
- `20251108012245` - Dashboard intelligent v2
- `20251108025539` - Gamification system (duplicate)
- `20251108120000` - ⭐ Gamification system (base)
- `20251108150000` - Transformation predictions
- `20251108031518` - Transformation predictions (alt)
- `20251108164034` - Auto-init trigger v1
- `20251108164109` - Auto-init trigger v2 (recommandé)
- `20251108171208` - Remove level cap
- `20251108175520` - ⭐ Daily actions tracking

### Novembre 9, 2025
- `20251109022305` - Update level titles
- `20251109035425` - Fix leaderboard v2
- `20251109035540` - Enhance leaderboard names
- `20251109091916` - Fix leaderboard function (alt)
- `20251109100000` - Fix leaderboard function
- `20251109120000` (x2) - Exercise reference + simplify records

### Novembre 10, 2025
- `20251110000000` (x2) - ⭐ XP idempotence + enhance sharing
- `20251110014018` - Fix leaderboard populate (alt)
- `20251110062118` - Fix XP audit RLS
- `20251110120000` - Fix leaderboard populate
- `20251110213427` - Fix daily actions columns
- `20251110213514` - Daily actions RPC functions
- `20251110213539` - Transformation records trigger
- `20251110213608` - Transformation backfill
- `20251110232805` - Transformation card shares

### Novembre 11, 2025
- `20251111000000` - ⭐ Sprint 3: Acceleration progression
- `20251111011144` - Share XP tracking + timezone

### Novembre 12, 2025
- `20251112000000` - ⭐ Sprint 4: Multiplicateurs performance

### Novembre 13, 2025
- `20251113000000` - Sprint 5: AI behavior analysis

### Novembre 14, 2025
- `20251114000000` - Sprint 6: Records & leaderboard

### Novembre 15, 2025
- `20251115000000` - Fix gamification RLS policies

### Novembre 22, 2025
- `20251122000000` - ⭐ Optimize daily actions (multiple occurrences)

### Novembre 23, 2025
- `20251123000000` - Transformation records system

---

## 🎯 Recherche par Mot-Clé

### "gamification"
- `20251108120000_add_gamification_system.sql` ⭐
- `20251108164034_add_gamification_auto_init_trigger.sql`
- `20251115000000_fix_gamification_rls_policies.sql`

### "xp"
- `20251110000000_add_xp_idempotence_and_auto_attribution.sql` ⭐
- `20251110062118_fix_xp_attribution_audit_rls_insert_policy.sql`
- `20251111011144_add_share_xp_tracking_and_timezone.sql`

### "daily_actions"
- `20251108175520_add_daily_actions_tracking_system.sql` ⭐
- `20251110213427_fix_daily_actions_add_occurrence_columns.sql`
- `20251110213514_add_daily_actions_rpc_functions_fixed.sql`
- `20251122000000_optimize_daily_actions_for_multiple_occurrences.sql` ⭐

### "prediction"
- `20251108150000_add_transformation_predictions_system.sql`
- `20251108031518_20251108150000_add_transformation_predictions_system.sql`

### "leaderboard" / "records"
- `20251109035425_fix_leaderboard_system_v2.sql`
- `20251109120000_simplify_records_and_leaderboard.sql`
- `20251114000000_sprint6_records_and_leaderboard_system.sql`

### "transformation"
- `20251107120000_add_transformation_scores_system.sql`
- `20251108150000_add_transformation_predictions_system.sql`
- `20251110232805_add_transformation_card_shares_table.sql`
- `20251123000000_add_transformation_records_system.sql`

### "sprint"
- `20251111000000_sprint3_acceleration_progression.sql` ⭐
- `20251112000000_sprint4_multiplicateurs_performance.sql` ⭐
- `20251113000000_sprint5_ai_behavior_analysis.sql`
- `20251114000000_sprint6_records_and_leaderboard_system.sql`

---

## 🚀 Packages Pré-Configurés

### Package 1: Core Minimal (6 migrations)
```
20251108120000_add_gamification_system.sql
20251110000000_add_xp_idempotence_and_auto_attribution.sql
20251111000000_sprint3_acceleration_progression.sql
20251112000000_sprint4_multiplicateurs_performance.sql
20251108175520_add_daily_actions_tracking_system.sql
20251122000000_optimize_daily_actions_for_multiple_occurrences.sql
```

### Package 2: Standard + Prédictions (10 migrations)
```
Package 1 +
20251107120000_add_transformation_scores_system.sql
20251108150000_add_transformation_predictions_system.sql
20251108164109_add_gamification_auto_init_trigger.sql
20251115000000_fix_gamification_rls_policies.sql
```

### Package 3: Complet + Records (16 migrations)
```
Package 2 +
20251109120000_add_exercise_reference_table.sql
20251114000000_sprint6_records_and_leaderboard_system.sql
20251109120000_simplify_records_and_leaderboard.sql
20251109035425_fix_leaderboard_system_v2.sql
20251109100000_fix_leaderboard_function_and_default_participation.sql
20251110120000_fix_leaderboard_function_and_populate.sql
```

---

## 🔧 Recherche par Problème

### "XP not awarded"
→ `20251110000000_add_xp_idempotence_and_auto_attribution.sql`
→ `20251110062118_fix_xp_attribution_audit_rls_insert_policy.sql`

### "Leaderboard not showing"
→ `20251114000000_sprint6_records_and_leaderboard_system.sql`
→ `20251109035425_fix_leaderboard_system_v2.sql`
→ `20251110120000_fix_leaderboard_function_and_populate.sql`

### "Actions not tracked"
→ `20251108175520_add_daily_actions_tracking_system.sql`
→ `20251122000000_optimize_daily_actions_for_multiple_occurrences.sql`

### "Predictions not showing"
→ `20251107120000_add_transformation_scores_system.sql`
→ `20251108150000_add_transformation_predictions_system.sql`

### "Level stuck / not progressing"
→ `20251108171208_remove_level_cap_and_add_backfill.sql`
→ `20251111000000_sprint3_acceleration_progression.sql`

### "RLS permission denied"
→ `20251115000000_fix_gamification_rls_policies.sql`
→ `20251110062118_fix_xp_attribution_audit_rls_insert_policy.sql`

---

## 📚 Ressources

- **README complet:** `README.md` (dans ce dossier)
- **Guide migrations:** `/docs/dashboard/coeur/MIGRATIONS_SQL.md`
- **Guide technique:** `/docs/dashboard/coeur/GAMING_SYSTEM_TECHNICAL_DOC.md`
- **Quick Start:** `/docs/dashboard/coeur/QUICK_START.md`

---

**Total:** 35 migrations | **Core requis:** 6 | **Optionnels:** 29
