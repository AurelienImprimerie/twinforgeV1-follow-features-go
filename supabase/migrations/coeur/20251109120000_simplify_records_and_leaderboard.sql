/*
  # Simplification Records et Classement

  ## Summary
  Simplification des systèmes de Records et Classement:
  - Participation automatique au classement pour tous les utilisateurs
  - Synchronisation automatique training_personal_records vers user_records
  - Fonction de calcul automatique des catégories et XP pour les training PRs

  ## 1. Modifications des Tables Existantes

  ### leaderboard_settings
  - Modifier is_participating DEFAULT à true (participation automatique)
  - Tous les utilisateurs existants passent à is_participating = true

  ## 2. Nouvelles Fonctions

  ### sync_training_pr_to_user_records
  Synchronise automatiquement les training PRs vers user_records avec calcul d'XP

  ### trigger_sync_training_pr
  Trigger automatique lors de l'insertion/update dans training_personal_records

  ### auto_create_leaderboard_settings
  Crée automatiquement leaderboard_settings avec is_participating=true pour nouveaux users

  ## 3. Optimisations

  ### Index
  - Index sur user_records (user_id, record_type, record_subtype) pour upserts rapides
  - Index sur leaderboard_entries (leaderboard_type, rank) pour classement XP

  ## 4. Sécurité
  - RLS maintenu sur toutes les tables
  - Politiques inchangées

  ## 5. Notes Importantes
  - Tous les utilisateurs existants deviennent participants automatiquement
  - Les training PRs génèrent automatiquement des user_records avec XP
  - L'anonymisation reste optionnelle via show_full_name
*/

-- ==================================================
-- 1. MODIFICATIONS DES TABLES EXISTANTES
-- ==================================================

-- Mettre is_participating à true par défaut pour tous les nouveaux utilisateurs
ALTER TABLE leaderboard_settings
  ALTER COLUMN is_participating SET DEFAULT true;

-- Mettre à jour tous les utilisateurs existants pour participer automatiquement
UPDATE leaderboard_settings
  SET is_participating = true
  WHERE is_participating = false;

-- Créer un index composite pour les upserts rapides dans user_records
CREATE INDEX IF NOT EXISTS idx_user_records_unique_record
  ON user_records(user_id, record_type, record_subtype);

-- Optimiser l'index du classement XP
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp_alltime_rank
  ON leaderboard_entries(leaderboard_type, rank)
  WHERE leaderboard_type = 'xp_alltime';

-- ==================================================
-- 2. FONCTION DE SYNCHRONISATION TRAINING PR
-- ==================================================

CREATE OR REPLACE FUNCTION sync_training_pr_to_user_records()
RETURNS TRIGGER AS $$
DECLARE
  v_category text;
  v_xp_awarded integer;
  v_improvement_percent numeric;
  v_record_subtype text;
BEGIN
  -- Calculer le pourcentage d'amélioration
  IF NEW.improvement IS NOT NULL THEN
    v_improvement_percent := ABS(NEW.improvement);
  ELSE
    v_improvement_percent := NULL;
  END IF;

  -- Déterminer la catégorie selon l'amélioration
  IF NEW.previous_record IS NULL THEN
    -- Premier record: major (100 XP)
    v_category := 'major';
    v_xp_awarded := 100;
  ELSIF v_improvement_percent IS NULL THEN
    -- Pas d'amélioration connue: minor (50 XP)
    v_category := 'minor';
    v_xp_awarded := 50;
  ELSIF v_improvement_percent > 20 THEN
    -- Amélioration > 20%: legendary (500 XP)
    v_category := 'legendary';
    v_xp_awarded := 500;
  ELSIF v_improvement_percent > 10 THEN
    -- Amélioration 10-20%: epic (200 XP)
    v_category := 'epic';
    v_xp_awarded := 200;
  ELSIF v_improvement_percent >= 5 THEN
    -- Amélioration 5-10%: major (100 XP)
    v_category := 'major';
    v_xp_awarded := 100;
  ELSE
    -- Amélioration < 5%: minor (50 XP)
    v_category := 'minor';
    v_xp_awarded := 50;
  END IF;

  -- Construire le record_subtype comme "discipline - exercise"
  v_record_subtype := NEW.discipline || ' - ' || NEW.exercise_name;

  -- Insérer ou mettre à jour dans user_records
  INSERT INTO user_records (
    user_id,
    record_type,
    record_category,
    record_subtype,
    value,
    previous_value,
    unit,
    achieved_at,
    context_data,
    xp_awarded,
    xp_category,
    is_shared,
    share_count
  ) VALUES (
    NEW.user_id,
    'training_pr',
    v_category,
    v_record_subtype,
    NEW.value,
    NEW.previous_record,
    NEW.unit,
    NEW.achieved_at,
    jsonb_build_object(
      'discipline', NEW.discipline,
      'exercise_name', NEW.exercise_name,
      'record_type', NEW.record_type,
      'session_id', NEW.session_id,
      'improvement_percent', NEW.improvement,
      'source', 'training_personal_records',
      'training_pr_id', NEW.id
    ),
    v_xp_awarded,
    v_category,
    false,
    0
  )
  ON CONFLICT (user_id, record_type, record_subtype)
  DO UPDATE SET
    record_category = v_category,
    value = NEW.value,
    previous_value = NEW.previous_record,
    unit = NEW.unit,
    achieved_at = NEW.achieved_at,
    context_data = jsonb_build_object(
      'discipline', NEW.discipline,
      'exercise_name', NEW.exercise_name,
      'record_type', NEW.record_type,
      'session_id', NEW.session_id,
      'improvement_percent', NEW.improvement,
      'source', 'training_personal_records',
      'training_pr_id', NEW.id
    ),
    xp_awarded = v_xp_awarded,
    xp_category = v_category,
    updated_at = now();

  -- Attribuer l'XP via le système de gamification (si disponible)
  BEGIN
    PERFORM award_xp(
      p_user_id := NEW.user_id,
      p_xp_amount := v_xp_awarded,
      p_action_type := 'training_record',
      p_action_details := jsonb_build_object(
        'record_name', v_record_subtype,
        'record_category', v_category,
        'exercise_name', NEW.exercise_name,
        'discipline', NEW.discipline
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Si la fonction award_xp n'existe pas ou échoue, on continue quand même
      NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- 3. TRIGGER AUTOMATIQUE POUR TRAINING PR SYNC
-- ==================================================

DROP TRIGGER IF EXISTS trigger_sync_training_pr ON training_personal_records;

CREATE TRIGGER trigger_sync_training_pr
  AFTER INSERT OR UPDATE ON training_personal_records
  FOR EACH ROW
  EXECUTE FUNCTION sync_training_pr_to_user_records();

-- ==================================================
-- 4. AUTO-CRÉATION LEADERBOARD SETTINGS
-- ==================================================

CREATE OR REPLACE FUNCTION auto_create_leaderboard_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer automatiquement leaderboard_settings avec participation activée
  INSERT INTO leaderboard_settings (
    user_id,
    is_participating,
    show_full_name,
    show_age,
    anonymized_name,
    participate_xp,
    participate_level,
    participate_streak,
    participate_transformation
  ) VALUES (
    NEW.id,
    true,  -- Participation automatique
    false, -- Nom masqué par défaut pour la confidentialité
    true,
    'Utilisateur #' || substring(NEW.id::text from 1 for 8),
    true,
    true,
    true,
    false  -- Transformation reste opt-in (données sensibles)
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement les settings lors de la création d'un user
DROP TRIGGER IF EXISTS trigger_auto_create_leaderboard_settings ON auth.users;

CREATE TRIGGER trigger_auto_create_leaderboard_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_leaderboard_settings();

-- ==================================================
-- 5. FONCTION UTILITAIRE DE SYNCHRONISATION BATCH
-- ==================================================

CREATE OR REPLACE FUNCTION batch_sync_training_prs_to_user_records(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  synced_count integer,
  total_xp_awarded integer
) AS $$
DECLARE
  v_synced_count integer := 0;
  v_total_xp integer := 0;
  v_pr RECORD;
BEGIN
  -- Synchroniser tous les training PRs (optionnellement pour un utilisateur spécifique)
  FOR v_pr IN
    SELECT * FROM training_personal_records
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
    ORDER BY achieved_at DESC
  LOOP
    -- Déclencher manuellement la synchronisation
    PERFORM sync_training_pr_to_user_records()
    FROM training_personal_records
    WHERE id = v_pr.id;

    v_synced_count := v_synced_count + 1;
  END LOOP;

  -- Calculer le total XP attribué
  SELECT COALESCE(SUM(xp_awarded), 0) INTO v_total_xp
  FROM user_records
  WHERE record_type = 'training_pr'
    AND (p_user_id IS NULL OR user_id = p_user_id);

  RETURN QUERY SELECT v_synced_count, v_total_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- 6. SYNCHRONISATION INITIALE (OPTIONNEL)
-- ==================================================

-- Commenté par défaut, à exécuter manuellement si besoin de sync initiale
-- SELECT * FROM batch_sync_training_prs_to_user_records();

-- ==================================================
-- 7. COMMENTAIRES ET DOCUMENTATION
-- ==================================================

COMMENT ON FUNCTION sync_training_pr_to_user_records() IS
  'Synchronise automatiquement les training personal records vers user_records avec calcul d''XP basé sur l''amélioration';

COMMENT ON FUNCTION auto_create_leaderboard_settings() IS
  'Crée automatiquement les paramètres de classement avec participation activée pour tous les nouveaux utilisateurs';

COMMENT ON FUNCTION batch_sync_training_prs_to_user_records(uuid) IS
  'Fonction utilitaire pour synchroniser en batch tous les training PRs manquants vers user_records';

COMMENT ON TRIGGER trigger_sync_training_pr ON training_personal_records IS
  'Déclenche la synchronisation automatique vers user_records à chaque nouveau training PR';

COMMENT ON TRIGGER trigger_auto_create_leaderboard_settings ON auth.users IS
  'Crée automatiquement les paramètres de classement pour chaque nouvel utilisateur';
