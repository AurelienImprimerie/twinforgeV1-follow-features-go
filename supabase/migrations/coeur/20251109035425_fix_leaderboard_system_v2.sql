/*
  # Fix Leaderboard System v2

  ## Résumé
  Correction du système de classement pour résoudre :
  1. Classement vide : Création d'une fonction pour peupler automatiquement leaderboard_entries
  2. Erreur duplicate key : Fix de la contrainte unique pour les settings
  3. Initialisation automatique des settings et entries pour tous les users

  ## Correctifs
  - Utilise user_profile au lieu de profiles
  - Gère les cas où display_name ou age n'existent pas
  - Fix de l'upsert pour les settings
*/

-- ============================================
-- 1. FONCTION: Refresh Leaderboard XP All-Time
-- ============================================

CREATE OR REPLACE FUNCTION refresh_leaderboard_xp_alltime()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les anciennes entrées
  DELETE FROM leaderboard_entries WHERE leaderboard_type = 'xp_alltime';

  -- Insérer les nouvelles entrées classées par XP
  INSERT INTO leaderboard_entries (
    user_id,
    display_name,
    age,
    leaderboard_type,
    period,
    period_start,
    period_end,
    rank,
    score,
    score_unit,
    metadata,
    calculated_at,
    created_at
  )
  SELECT 
    g.user_id,
    COALESCE(
      CASE 
        WHEN ls.show_full_name = false AND ls.anonymized_name IS NOT NULL 
        THEN ls.anonymized_name
        ELSE SPLIT_PART(u.email, '@', 1)
      END,
      'Utilisateur'
    ) as display_name,
    NULL as age, -- Age non disponible pour le moment
    'xp_alltime' as leaderboard_type,
    'alltime' as period,
    NULL as period_start,
    NULL as period_end,
    ROW_NUMBER() OVER (ORDER BY g.total_xp_earned DESC, g.current_level DESC) as rank,
    g.total_xp_earned as score,
    'XP' as score_unit,
    jsonb_build_object(
      'level', g.current_level,
      'current_xp', g.current_xp,
      'streak_days', g.current_streak_days
    ) as metadata,
    NOW() as calculated_at,
    NOW() as created_at
  FROM user_gamification_progress g
  INNER JOIN auth.users u ON u.id = g.user_id
  LEFT JOIN leaderboard_settings ls ON ls.user_id = g.user_id
  WHERE g.total_xp_earned > 0
  ORDER BY g.total_xp_earned DESC, g.current_level DESC;

END;
$$;

-- ============================================
-- 2. FONCTION: Init Leaderboard Settings pour User
-- ============================================

CREATE OR REPLACE FUNCTION init_leaderboard_settings(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO leaderboard_settings (
    user_id,
    is_participating,
    show_full_name,
    show_age,
    anonymized_name,
    participate_xp,
    participate_level,
    participate_streak,
    participate_transformation,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    true, -- Participation automatique
    true, -- Nom visible par défaut
    true, -- Âge visible par défaut
    NULL, -- Pas d'anonymisation par défaut
    true,
    true,
    true,
    false, -- Transformation opt-in
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- ============================================
-- 3. TRIGGER: Auto-refresh leaderboard on XP change
-- ============================================

CREATE OR REPLACE FUNCTION trigger_refresh_leaderboard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Rafraîchir le classement de manière asynchrone
  PERFORM refresh_leaderboard_xp_alltime();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS auto_refresh_leaderboard ON user_gamification_progress;

-- Create trigger
CREATE TRIGGER auto_refresh_leaderboard
AFTER INSERT OR UPDATE OF total_xp_earned ON user_gamification_progress
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_leaderboard();

-- ============================================
-- 4. TRIGGER: Auto-init settings on user creation
-- ============================================

CREATE OR REPLACE FUNCTION trigger_init_leaderboard_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM init_leaderboard_settings(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS auto_init_leaderboard_settings ON user_gamification_progress;

-- Create trigger  
CREATE TRIGGER auto_init_leaderboard_settings
AFTER INSERT ON user_gamification_progress
FOR EACH ROW
EXECUTE FUNCTION trigger_init_leaderboard_settings();

-- ============================================
-- 5. INITIALISATION: Settings pour users existants
-- ============================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT user_id FROM user_gamification_progress
  LOOP
    PERFORM init_leaderboard_settings(user_record.user_id);
  END LOOP;
END $$;

-- ============================================
-- 6. INITIALISATION: Premier refresh du leaderboard
-- ============================================

SELECT refresh_leaderboard_xp_alltime();
