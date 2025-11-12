/*
  # Fix Leaderboard Function and Populate Data

  ## Summary
  Correction de la fonction update_leaderboard() pour utiliser le bon nom de colonne (birthdate au lieu de birth_date)
  et initialisation du classement pour tous les utilisateurs existants.

  ## 1. Corrections
  - Corriger birth_date -> birthdate dans la fonction update_leaderboard()
  - Améliorer la gestion du display_name (fallback sur anonymized_name ou 'Anonyme')
  - Optimiser les requêtes avec de meilleurs index

  ## 2. Initialisation
  - Peupler leaderboard_entries pour tous les utilisateurs existants
  - Créer des index pour améliorer les performances

  ## 3. Notes Importantes
  - Cette migration corrige un bug critique qui empêchait l'affichage de tous les utilisateurs
  - Le classement est maintenant correctement initialisé avec tous les utilisateurs participants
*/

-- ============================================
-- 1. CORRECTION DE LA FONCTION update_leaderboard
-- ============================================

CREATE OR REPLACE FUNCTION update_leaderboard(
  p_leaderboard_type text,
  p_period text,
  p_period_start date DEFAULT NULL,
  p_period_end date DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_entry record;
  v_rank integer := 0;
BEGIN
  -- Supprimer anciennes entrées pour cette période
  DELETE FROM leaderboard_entries
  WHERE leaderboard_type = p_leaderboard_type
    AND period = p_period
    AND (p_period_start IS NULL OR period_start = p_period_start);

  -- Calculer classement selon type
  IF p_leaderboard_type = 'xp_alltime' THEN
    -- Classement XP total
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        -- Utiliser anonymized_name si show_full_name = false, sinon display_name, sinon 'Anonyme'
        CASE
          WHEN ls.show_full_name = false AND ls.anonymized_name IS NOT NULL THEN ls.anonymized_name
          WHEN up.display_name IS NOT NULL THEN up.display_name
          ELSE 'Utilisateur #' || substring(ugp.user_id::text from 1 for 8)
        END as display_name,
        CASE
          WHEN ls.show_age = true AND up.birthdate IS NOT NULL
          THEN EXTRACT(YEAR FROM AGE(up.birthdate))::integer
          ELSE NULL
        END as age,
        ugp.total_xp_earned as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_xp = true
      ORDER BY ugp.total_xp_earned DESC, ugp.user_id ASC -- Tri secondaire par user_id pour cohérence
    ) LOOP
      v_rank := v_rank + 1;
      INSERT INTO leaderboard_entries (
        user_id, display_name, age, leaderboard_type, period,
        period_start, period_end, rank, score, score_unit
      ) VALUES (
        v_entry.user_id, v_entry.display_name, v_entry.age,
        p_leaderboard_type, p_period, p_period_start, p_period_end,
        v_rank, v_entry.score, 'XP'
      );
    END LOOP;

  ELSIF p_leaderboard_type = 'level' THEN
    -- Classement par niveau
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        CASE
          WHEN ls.show_full_name = false AND ls.anonymized_name IS NOT NULL THEN ls.anonymized_name
          WHEN up.display_name IS NOT NULL THEN up.display_name
          ELSE 'Utilisateur #' || substring(ugp.user_id::text from 1 for 8)
        END as display_name,
        CASE
          WHEN ls.show_age = true AND up.birthdate IS NOT NULL
          THEN EXTRACT(YEAR FROM AGE(up.birthdate))::integer
          ELSE NULL
        END as age,
        ugp.current_level as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_level = true
      ORDER BY ugp.current_level DESC, ugp.current_xp DESC, ugp.user_id ASC
    ) LOOP
      v_rank := v_rank + 1;
      INSERT INTO leaderboard_entries (
        user_id, display_name, age, leaderboard_type, period,
        rank, score, score_unit
      ) VALUES (
        v_entry.user_id, v_entry.display_name, v_entry.age,
        p_leaderboard_type, 'alltime',
        v_rank, v_entry.score, 'Level'
      );
    END LOOP;

  ELSIF p_leaderboard_type = 'streak' THEN
    -- Classement par série active
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        CASE
          WHEN ls.show_full_name = false AND ls.anonymized_name IS NOT NULL THEN ls.anonymized_name
          WHEN up.display_name IS NOT NULL THEN up.display_name
          ELSE 'Utilisateur #' || substring(ugp.user_id::text from 1 for 8)
        END as display_name,
        CASE
          WHEN ls.show_age = true AND up.birthdate IS NOT NULL
          THEN EXTRACT(YEAR FROM AGE(up.birthdate))::integer
          ELSE NULL
        END as age,
        ugp.current_streak_days as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_streak = true
      ORDER BY ugp.current_streak_days DESC, ugp.user_id ASC
    ) LOOP
      v_rank := v_rank + 1;
      INSERT INTO leaderboard_entries (
        user_id, display_name, age, leaderboard_type, period,
        rank, score, score_unit
      ) VALUES (
        v_entry.user_id, v_entry.display_name, v_entry.age,
        p_leaderboard_type, 'alltime',
        v_rank, v_entry.score, 'jours'
      );
    END LOOP;
  END IF;

  -- Raise notice pour logs
  RAISE NOTICE 'Leaderboard updated: type=%, period=%, entries=%', p_leaderboard_type, p_period, v_rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. OPTIMISATION DES INDEX
-- ============================================

-- Index composite pour améliorer les performances des requêtes de classement
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type_rank_calc
  ON leaderboard_entries(leaderboard_type, rank, calculated_at DESC);

-- Index pour les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_type
  ON leaderboard_entries(user_id, leaderboard_type);

-- Index sur leaderboard_settings pour optimiser les jointures
CREATE INDEX IF NOT EXISTS idx_leaderboard_settings_participation
  ON leaderboard_settings(user_id, is_participating, participate_xp)
  WHERE is_participating = true;

-- Index sur user_gamification_progress pour les tris
CREATE INDEX IF NOT EXISTS idx_user_gamification_progress_xp
  ON user_gamification_progress(total_xp_earned DESC);

CREATE INDEX IF NOT EXISTS idx_user_gamification_progress_level
  ON user_gamification_progress(current_level DESC, current_xp DESC);

CREATE INDEX IF NOT EXISTS idx_user_gamification_progress_streak
  ON user_gamification_progress(current_streak_days DESC);

-- ============================================
-- 3. INITIALISATION DU CLASSEMENT
-- ============================================

-- Peupler le classement XP pour tous les utilisateurs existants
SELECT update_leaderboard('xp_alltime', 'alltime', NULL, NULL);

-- Optionnel: Peupler également les autres types de classement
-- SELECT update_leaderboard('level', 'alltime', NULL, NULL);
-- SELECT update_leaderboard('streak', 'alltime', NULL, NULL);

-- ============================================
-- 4. COMMENTAIRES
-- ============================================

COMMENT ON FUNCTION update_leaderboard(text, text, date, date) IS
  'Mise à jour du classement avec correction du nom de colonne birthdate et meilleure gestion du display_name';

COMMENT ON INDEX idx_leaderboard_entries_type_rank_calc IS
  'Index composite pour optimiser les requêtes de classement par type et rang';

COMMENT ON INDEX idx_leaderboard_settings_participation IS
  'Index partiel pour optimiser les jointures avec seulement les utilisateurs participants';
