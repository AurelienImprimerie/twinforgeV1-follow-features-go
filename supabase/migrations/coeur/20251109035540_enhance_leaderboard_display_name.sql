/*
  # Amélioration du Display Name pour Leaderboard

  ## Résumé
  Utilise le display_name de user_profile si disponible, sinon email
*/

-- ============================================
-- 1. UPDATE: Fonction Refresh avec User Profile
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
        ELSE COALESCE(up.display_name, SPLIT_PART(u.email, '@', 1))
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
  LEFT JOIN user_profile up ON up.user_id = g.user_id
  LEFT JOIN leaderboard_settings ls ON ls.user_id = g.user_id
  WHERE g.total_xp_earned > 0
  ORDER BY g.total_xp_earned DESC, g.current_level DESC;

END;
$$;

-- Refresh le classement avec les nouveaux noms
SELECT refresh_leaderboard_xp_alltime();
