/*
  # Add Transformation Records Backfill Function
  
  1. Description
    Fonction pour générer rétroactivement les records de transformation
    à partir de l'historique des mises à jour de poids existantes
  
  2. Function
    - Parcourt l'historique des weight_updates pour un utilisateur
    - Applique detect_transformation_records pour chaque mise à jour
    - Génère les records manquants
    - Retourne un résumé des records créés
  
  3. Usage
    SELECT * FROM backfill_transformation_records('user-id');
    SELECT * FROM backfill_all_transformation_records(); -- For all users
  
  4. Security
    - SECURITY DEFINER pour accès contrôlé
    - Validation des paramètres
*/

-- Function to backfill for a single user
CREATE OR REPLACE FUNCTION backfill_transformation_records(
  p_user_id uuid
)
RETURNS TABLE(
  user_id uuid,
  weight_updates_processed integer,
  records_created integer,
  total_xp_awarded integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_weight_update record;
  v_objective text;
  v_records_created jsonb;
  v_total_records integer := 0;
  v_total_xp integer := 0;
  v_updates_count integer := 0;
BEGIN
  -- Get user objective
  SELECT objective INTO v_objective
  FROM user_profile
  WHERE user_profile.user_id = p_user_id;
  
  IF v_objective IS NULL THEN
    v_objective := 'fat_loss';
  END IF;
  
  -- Process each weight update in chronological order
  FOR v_weight_update IN
    SELECT wuh.new_weight, wuh.created_at
    FROM weight_updates_history wuh
    WHERE wuh.user_id = p_user_id
    ORDER BY wuh.created_at ASC
  LOOP
    v_updates_count := v_updates_count + 1;
    
    -- Detect and create transformation records
    v_records_created := detect_transformation_records(
      p_user_id,
      v_weight_update.new_weight,
      v_objective
    );
    
    -- Count records created
    IF jsonb_array_length(v_records_created) > 0 THEN
      v_total_records := v_total_records + jsonb_array_length(v_records_created);
      
      -- Sum XP awarded
      FOR i IN 0..jsonb_array_length(v_records_created) - 1 LOOP
        v_total_xp := v_total_xp + COALESCE(
          (v_records_created->i->>'xp_awarded')::integer, 
          0
        );
      END LOOP;
    END IF;
  END LOOP;
  
  -- Return summary
  RETURN QUERY SELECT
    p_user_id,
    v_updates_count,
    v_total_records,
    v_total_xp;
END;
$$;

-- Function to backfill for all users
CREATE OR REPLACE FUNCTION backfill_all_transformation_records()
RETURNS TABLE(
  user_id uuid,
  weight_updates_processed integer,
  records_created integer,
  total_xp_awarded integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Process each user who has weight updates
  FOR v_user_id IN
    SELECT DISTINCT wuh.user_id
    FROM weight_updates_history wuh
    ORDER BY wuh.user_id
  LOOP
    RETURN QUERY 
    SELECT * FROM backfill_transformation_records(v_user_id);
  END LOOP;
END;
$$;

-- Function to preview what would be created (dry run)
CREATE OR REPLACE FUNCTION preview_transformation_records(
  p_user_id uuid
)
RETURNS TABLE(
  milestone_type text,
  current_weight decimal,
  progress_percentage integer,
  would_create_record boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile record;
  v_latest_weight decimal;
  v_start_weight decimal;
  v_progress_pct integer;
BEGIN
  -- Get profile
  SELECT * INTO v_profile
  FROM user_profile
  WHERE user_id = p_user_id;
  
  IF NOT FOUND OR v_profile.target_weight_kg IS NULL THEN
    RAISE NOTICE 'User has no target weight set';
    RETURN;
  END IF;
  
  -- Get weights
  SELECT new_weight INTO v_latest_weight
  FROM weight_updates_history
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  SELECT new_weight INTO v_start_weight
  FROM weight_updates_history
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF v_start_weight IS NULL THEN
    v_start_weight := v_latest_weight;
  END IF;
  
  -- Calculate progress
  v_progress_pct := calculate_weight_progress_percentage(
    v_latest_weight,
    v_profile.target_weight_kg,
    v_start_weight
  );
  
  -- Show potential milestones
  RETURN QUERY
  SELECT 
    milestone::text,
    v_latest_weight,
    v_progress_pct,
    (v_progress_pct >= threshold AND NOT EXISTS(
      SELECT 1 FROM user_records
      WHERE user_records.user_id = p_user_id
        AND record_type = 'transformation'
        AND record_subtype = milestone
    )) as would_create
  FROM (VALUES
    ('weight_milestone_5pct', 5),
    ('weight_milestone_10pct', 10),
    ('weight_milestone_25pct', 25),
    ('weight_milestone_50pct', 50),
    ('weight_milestone_75pct', 75),
    ('weight_goal_achieved', 100)
  ) AS milestones(milestone, threshold);
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION backfill_transformation_records IS 
  'Backfills transformation records from weight update history for a single user';
  
COMMENT ON FUNCTION backfill_all_transformation_records IS 
  'Backfills transformation records for all users with weight history';
  
COMMENT ON FUNCTION preview_transformation_records IS 
  'Preview transformation records that would be created (dry run)';
