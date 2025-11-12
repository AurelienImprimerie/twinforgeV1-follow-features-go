/*
  # Fix Leaderboard System

  ## Corrections

  1. **Fonction update_leaderboard**
     - Corrige `up.birth_date` → `up.birthdate` (nom correct de la colonne)
     - Permet au classement de fonctionner

  2. **Participation par défaut**
     - Change `is_participating` par défaut de `false` → `true`
     - Les nouveaux utilisateurs apparaissent automatiquement dans le classement
     - Ils peuvent se retirer via les paramètres si souhaité (opt-out)

  ## Raison du bug

  La colonne dans `user_profile` s'appelle `birthdate` mais la fonction utilisait `birth_date`.
  Par défaut, `is_participating` était à `false`, donc personne n'apparaissait dans le classement.
*/

-- ============================================
-- 1. Corriger la fonction update_leaderboard
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
    -- Classement XP total (CORRECTION: birthdate au lieu de birth_date)
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        COALESCE(ls.anonymized_name, up.display_name, 'Anonymous') as display_name,
        CASE WHEN ls.show_age THEN EXTRACT(YEAR FROM AGE(up.birthdate)) ELSE NULL END as age,
        ugp.total_xp_earned as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_xp = true
      ORDER BY ugp.total_xp_earned DESC
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
    -- Classement par niveau (CORRECTION: birthdate au lieu de birth_date)
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        COALESCE(ls.anonymized_name, up.display_name, 'Anonymous') as display_name,
        CASE WHEN ls.show_age THEN EXTRACT(YEAR FROM AGE(up.birthdate)) ELSE NULL END as age,
        ugp.current_level as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_level = true
      ORDER BY ugp.current_level DESC, ugp.current_xp DESC
    ) LOOP
      v_rank := v_rank + 1;
      INSERT INTO leaderboard_entries (
        user_id, display_name, age, leaderboard_type, period,
        period_start, period_end, rank, score, score_unit
      ) VALUES (
        v_entry.user_id, v_entry.display_name, v_entry.age,
        p_leaderboard_type, p_period, p_period_start, p_period_end,
        v_rank, v_entry.score, 'Niveau'
      );
    END LOOP;

  ELSIF p_leaderboard_type = 'streak' THEN
    -- Classement par série (CORRECTION: birthdate au lieu de birth_date)
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        COALESCE(ls.anonymized_name, up.display_name, 'Anonymous') as display_name,
        CASE WHEN ls.show_age THEN EXTRACT(YEAR FROM AGE(up.birthdate)) ELSE NULL END as age,
        ugp.current_streak_days as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_streak = true
      ORDER BY ugp.current_streak_days DESC
    ) LOOP
      v_rank := v_rank + 1;
      INSERT INTO leaderboard_entries (
        user_id, display_name, age, leaderboard_type, period,
        period_start, period_end, rank, score, score_unit
      ) VALUES (
        v_entry.user_id, v_entry.display_name, v_entry.age,
        p_leaderboard_type, p_period, p_period_start, p_period_end,
        v_rank, v_entry.score, 'Jours'
      );
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Changer le défaut de is_participating
-- ============================================

-- Modifier la colonne pour que par défaut ce soit TRUE (opt-out au lieu de opt-in)
ALTER TABLE leaderboard_settings
  ALTER COLUMN is_participating SET DEFAULT true;

-- Mettre à jour les utilisateurs existants qui ont is_participating = false
-- pour qu'ils participent par défaut (ils peuvent opt-out s'ils veulent)
UPDATE leaderboard_settings
SET is_participating = true, updated_at = NOW()
WHERE is_participating = false;

-- ============================================
-- 3. Recalculer le leaderboard
-- ============================================

-- Recalculer tous les classements
SELECT update_leaderboard('xp_alltime', 'alltime', NULL, NULL);
SELECT update_leaderboard('level', 'alltime', NULL, NULL);
SELECT update_leaderboard('streak', 'alltime', NULL, NULL);
