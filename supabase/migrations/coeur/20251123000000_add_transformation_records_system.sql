/*
  # Système de Records de Transformation

  1. Description
    Système automatique de détection et création de records de transformation
    lors des mises à jour de poids. Les records sont créés uniquement pour les
    progressions significatives et génèrent des cartes partageables qui s'enrichissent
    au fil du temps.

  2. Types de Records de Transformation
    - `first_weight_update`: Premier enregistrement de poids
    - `weight_milestone_5pct`: Progression de 5% vers l'objectif
    - `weight_milestone_10pct`: Progression de 10% vers l'objectif
    - `weight_milestone_25pct`: Progression de 25% vers l'objectif
    - `weight_milestone_50pct`: Progression de 50% vers l'objectif
    - `weight_milestone_75pct`: Progression de 75% vers l'objectif
    - `weight_goal_achieved`: Objectif de poids atteint (100%)
    - `best_weekly_progress`: Meilleure progression hebdomadaire

  3. Catégories et XP
    - Minor (50 XP): 5%, 10% progression
    - Major (100 XP): 25%, 50% progression, meilleure progression hebdo
    - Epic (200 XP): 75% progression
    - Legendary (500 XP): Objectif atteint (100%)

  4. Détection Automatique
    La fonction améliorée `detect_transformation_records()` est appelée
    automatiquement lors de chaque mise à jour de poids pour détecter et
    créer les records appropriés.

  5. Génération de Cartes
    Les cartes de records de transformation utilisent le même système que
    les cartes de séances/exercices et s'enrichissent progressivement:
    - 1-2 updates: Carte basique (poids + objectif)
    - 3-5 updates: Carte avec mini graphique
    - 6-10 updates: Carte avec stats (perte moyenne, jours)
    - 10+ updates: Carte complète avec prédictions

  6. Sécurité
    - RLS déjà activé sur user_records (migration précédente)
    - Fonction SECURITY DEFINER pour accès contrôlé
    - Validation des données utilisateur
*/

-- ============================================
-- FONCTION: Calculer le pourcentage de progression
-- ============================================

CREATE OR REPLACE FUNCTION calculate_weight_progress_percentage(
  p_current_weight decimal,
  p_target_weight decimal,
  p_start_weight decimal
) RETURNS integer AS $$
DECLARE
  v_total_distance decimal;
  v_progress_distance decimal;
  v_percentage integer;
BEGIN
  -- Calculer la distance totale à parcourir
  v_total_distance := ABS(p_target_weight - p_start_weight);

  -- Si pas de distance, retourner 0
  IF v_total_distance = 0 THEN
    RETURN 0;
  END IF;

  -- Calculer la distance parcourue
  v_progress_distance := ABS(p_start_weight - p_current_weight);

  -- Calculer le pourcentage
  v_percentage := ROUND((v_progress_distance / v_total_distance) * 100)::integer;

  -- Limiter entre 0 et 100
  v_percentage := GREATEST(0, LEAST(100, v_percentage));

  RETURN v_percentage;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FONCTION: Détecter et créer les records de transformation
-- ============================================

CREATE OR REPLACE FUNCTION detect_transformation_records(
  p_user_id uuid,
  p_new_weight decimal,
  p_objective text
) RETURNS jsonb AS $$
DECLARE
  v_profile record;
  v_first_update record;
  v_weight_history record;
  v_progress_pct integer;
  v_record_type text;
  v_record_subtype text;
  v_record_category text;
  v_xp_bonus integer;
  v_records_created jsonb := '[]'::jsonb;
  v_record_result jsonb;
  v_weight_count integer;
  v_start_weight decimal;
  v_best_weekly_progress decimal;
  v_current_weekly_progress decimal;
BEGIN
  -- Récupérer le profil utilisateur
  SELECT * INTO v_profile
  FROM user_profile
  WHERE user_id = p_user_id;

  IF NOT FOUND OR v_profile.target_weight_kg IS NULL THEN
    RETURN v_records_created;
  END IF;

  -- Compter le nombre de mises à jour de poids
  SELECT COUNT(*) INTO v_weight_count
  FROM weight_updates_history
  WHERE user_id = p_user_id;

  -- RECORD 1: First Weight Update (si c'est la première mise à jour)
  IF v_weight_count = 1 THEN
    v_record_result := jsonb_build_object(
      'record_type', 'transformation',
      'record_subtype', 'first_weight_update',
      'record_category', 'minor',
      'value', p_new_weight,
      'unit', 'kg',
      'xp_awarded', 50,
      'context_data', jsonb_build_object(
        'milestone_type', 'first_update',
        'weight', p_new_weight,
        'target_weight', v_profile.target_weight_kg,
        'objective', p_objective
      )
    );

    -- Insérer le record
    INSERT INTO user_records (
      user_id, record_type, record_category, record_subtype,
      value, unit, context_data, xp_awarded, xp_category
    ) VALUES (
      p_user_id, 'transformation', 'minor', 'first_weight_update',
      p_new_weight, 'kg', v_record_result->'context_data', 50, 'minor'
    );

    v_records_created := v_records_created || jsonb_build_array(v_record_result);
  END IF;

  -- Récupérer le poids de départ (première mise à jour)
  SELECT new_weight INTO v_start_weight
  FROM weight_updates_history
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  -- Si pas de poids de départ, utiliser le poids actuel
  IF v_start_weight IS NULL THEN
    v_start_weight := p_new_weight;
  END IF;

  -- Calculer le pourcentage de progression
  v_progress_pct := calculate_weight_progress_percentage(
    p_new_weight,
    v_profile.target_weight_kg,
    v_start_weight
  );

  -- RECORDS 2-7: Milestones de progression (5%, 10%, 25%, 50%, 75%, 100%)
  -- Vérifier chaque milestone et créer un record si atteint
  DECLARE
    v_milestone_pct integer;
    v_milestone_name text;
    v_milestone_category text;
    v_milestone_xp integer;
    v_milestone_exists boolean;
  BEGIN
    -- Définir les milestones
    FOR v_milestone_pct, v_milestone_name, v_milestone_category, v_milestone_xp IN
      VALUES
        (5, 'weight_milestone_5pct', 'minor', 50),
        (10, 'weight_milestone_10pct', 'minor', 50),
        (25, 'weight_milestone_25pct', 'major', 100),
        (50, 'weight_milestone_50pct', 'major', 100),
        (75, 'weight_milestone_75pct', 'epic', 200),
        (100, 'weight_goal_achieved', 'legendary', 500)
    LOOP
      -- Vérifier si la progression atteint ou dépasse ce milestone
      IF v_progress_pct >= v_milestone_pct THEN
        -- Vérifier si ce record n'existe pas déjà
        SELECT EXISTS(
          SELECT 1 FROM user_records
          WHERE user_id = p_user_id
            AND record_type = 'transformation'
            AND record_subtype = v_milestone_name
        ) INTO v_milestone_exists;

        IF NOT v_milestone_exists THEN
          -- Créer le record de milestone
          v_record_result := jsonb_build_object(
            'record_type', 'transformation',
            'record_subtype', v_milestone_name,
            'record_category', v_milestone_category,
            'value', v_progress_pct,
            'unit', '%',
            'xp_awarded', v_milestone_xp,
            'context_data', jsonb_build_object(
              'milestone_type', 'progress_percentage',
              'progress_percentage', v_progress_pct,
              'current_weight', p_new_weight,
              'target_weight', v_profile.target_weight_kg,
              'start_weight', v_start_weight,
              'weight_lost_gained', ABS(p_new_weight - v_start_weight),
              'objective', p_objective
            )
          );

          -- Insérer le record
          INSERT INTO user_records (
            user_id, record_type, record_category, record_subtype,
            value, unit, context_data, xp_awarded, xp_category
          ) VALUES (
            p_user_id, 'transformation', v_milestone_category, v_milestone_name,
            v_progress_pct, '%', v_record_result->'context_data', v_milestone_xp, v_milestone_category
          );

          -- Attribuer les XP via la fonction award_xp
          PERFORM award_xp(
            p_user_id,
            'transformation_milestone',
            'general',
            v_milestone_xp,
            jsonb_build_object(
              'milestone_type', v_milestone_name,
              'progress_percentage', v_progress_pct,
              'current_weight', p_new_weight
            )
          );

          v_records_created := v_records_created || jsonb_build_array(v_record_result);
        END IF;
      END IF;
    END LOOP;
  END;

  -- RECORD 8: Best Weekly Progress (uniquement si progression significative)
  -- Calculer la progression hebdomadaire actuelle
  IF v_weight_count >= 2 THEN
    -- Récupérer la mise à jour précédente (environ 7 jours avant)
    SELECT
      ABS(p_new_weight - wuh.new_weight) as weekly_progress
    INTO v_current_weekly_progress
    FROM weight_updates_history wuh
    WHERE wuh.user_id = p_user_id
      AND wuh.created_at >= NOW() - INTERVAL '9 days'
      AND wuh.created_at <= NOW() - INTERVAL '5 days'
    ORDER BY wuh.created_at DESC
    LIMIT 1;

    -- Vérifier si c'est un record de meilleure progression hebdo
    IF v_current_weekly_progress IS NOT NULL AND v_current_weekly_progress >= 0.5 THEN
      -- Récupérer le meilleur record existant
      SELECT value INTO v_best_weekly_progress
      FROM user_records
      WHERE user_id = p_user_id
        AND record_type = 'transformation'
        AND record_subtype = 'best_weekly_progress'
      ORDER BY value DESC
      LIMIT 1;

      -- Si nouveau record ou amélioration
      IF v_best_weekly_progress IS NULL OR v_current_weekly_progress > v_best_weekly_progress THEN
        -- Vérifier la direction selon l'objectif
        DECLARE
          v_is_positive_progress boolean := false;
        BEGIN
          IF p_objective = 'fat_loss' THEN
            -- Pour fat_loss, vérifier que le poids a diminué
            SELECT p_new_weight < wuh.new_weight INTO v_is_positive_progress
            FROM weight_updates_history wuh
            WHERE wuh.user_id = p_user_id
              AND wuh.created_at >= NOW() - INTERVAL '9 days'
            ORDER BY wuh.created_at DESC
            LIMIT 1;
          ELSIF p_objective = 'muscle_gain' THEN
            -- Pour muscle_gain, vérifier que le poids a augmenté
            SELECT p_new_weight > wuh.new_weight INTO v_is_positive_progress
            FROM weight_updates_history wuh
            WHERE wuh.user_id = p_user_id
              AND wuh.created_at >= NOW() - INTERVAL '9 days'
            ORDER BY wuh.created_at DESC
            LIMIT 1;
          END IF;

          -- Créer le record seulement si c'est une progression positive
          IF v_is_positive_progress THEN
            v_record_result := jsonb_build_object(
              'record_type', 'transformation',
              'record_subtype', 'best_weekly_progress',
              'record_category', 'major',
              'value', v_current_weekly_progress,
              'unit', 'kg',
              'xp_awarded', 100,
              'context_data', jsonb_build_object(
                'milestone_type', 'weekly_progress',
                'weekly_change', v_current_weekly_progress,
                'current_weight', p_new_weight,
                'previous_best', v_best_weekly_progress,
                'objective', p_objective
              )
            );

            -- Insérer le record
            INSERT INTO user_records (
              user_id, record_type, record_category, record_subtype,
              value, previous_value, unit, context_data, xp_awarded, xp_category
            ) VALUES (
              p_user_id, 'transformation', 'major', 'best_weekly_progress',
              v_current_weekly_progress, v_best_weekly_progress, 'kg',
              v_record_result->'context_data', 100, 'major'
            );

            -- Attribuer les XP
            PERFORM award_xp(
              p_user_id,
              'best_weekly_progress',
              'general',
              100,
              v_record_result->'context_data'
            );

            v_records_created := v_records_created || jsonb_build_array(v_record_result);
          END IF;
        END;
      END IF;
    END IF;
  END IF;

  RETURN v_records_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FONCTION: Amélioration de detect_and_save_record pour transformation
-- ============================================

-- Recréer la fonction detect_and_save_record avec support transformation
DROP FUNCTION IF EXISTS detect_and_save_record(uuid, text, text, numeric, text, jsonb);

CREATE OR REPLACE FUNCTION detect_and_save_record(
  p_user_id uuid,
  p_record_type text,
  p_record_subtype text,
  p_value numeric,
  p_unit text,
  p_context_data jsonb DEFAULT '{}'
) RETURNS jsonb AS $$
DECLARE
  v_previous_record record;
  v_is_new_record boolean := false;
  v_record_category text;
  v_xp_bonus integer := 0;
  v_new_record_id uuid;
  v_result jsonb;
BEGIN
  -- Récupérer l'ancien record
  SELECT * INTO v_previous_record
  FROM user_records
  WHERE user_id = p_user_id
    AND record_type = p_record_type
    AND record_subtype = p_record_subtype
  ORDER BY achieved_at DESC
  LIMIT 1;

  -- Déterminer si nouveau record selon type
  IF p_record_type = 'weight' THEN
    IF p_record_subtype = 'lowest_weight' THEN
      v_is_new_record := (v_previous_record.value IS NULL OR p_value < v_previous_record.value);
    ELSIF p_record_subtype = 'highest_weight' THEN
      v_is_new_record := (v_previous_record.value IS NULL OR p_value > v_previous_record.value);
    END IF;
  ELSIF p_record_type IN ('streak', 'training_pr', 'calorie_deficit') THEN
    v_is_new_record := (v_previous_record.value IS NULL OR p_value > v_previous_record.value);
  ELSIF p_record_type = 'transformation' THEN
    -- Pour transformation, les records sont gérés par detect_transformation_records
    v_is_new_record := true;
  END IF;

  -- Si nouveau record, déterminer catégorie et XP
  IF v_is_new_record THEN
    -- Catégorie selon type et valeur
    IF p_record_type = 'streak' AND p_value >= 100 THEN
      v_record_category := 'legendary';
      v_xp_bonus := 500;
    ELSIF p_record_type = 'streak' AND p_value >= 30 THEN
      v_record_category := 'epic';
      v_xp_bonus := 200;
    ELSIF p_record_type = 'transformation' THEN
      -- Pour transformation, catégorie et XP sont dans context_data
      v_record_category := COALESCE((p_context_data->>'category')::text, 'minor');
      v_xp_bonus := COALESCE((p_context_data->>'xp_awarded')::integer, 50);
    ELSE
      v_record_category := 'minor';
      v_xp_bonus := 50;
    END IF;

    -- Insérer nouveau record
    INSERT INTO user_records (
      user_id, record_type, record_category, record_subtype,
      value, previous_value, unit, context_data,
      xp_awarded, xp_category
    ) VALUES (
      p_user_id, p_record_type, v_record_category, p_record_subtype,
      p_value, v_previous_record.value, p_unit, p_context_data,
      v_xp_bonus, v_record_category
    ) RETURNING id INTO v_new_record_id;

    -- Attribution XP via fonction existante (sauf si déjà fait pour transformation)
    IF p_record_type != 'transformation' THEN
      PERFORM award_xp(
        p_user_id,
        'record_achieved',
        'general',
        v_xp_bonus,
        jsonb_build_object(
          'record_id', v_new_record_id,
          'record_type', p_record_type,
          'record_subtype', p_record_subtype,
          'record_category', v_record_category,
          'value', p_value
        )
      );
    END IF;

    v_result := jsonb_build_object(
      'is_new_record', true,
      'record_id', v_new_record_id,
      'category', v_record_category,
      'xp_awarded', v_xp_bonus,
      'previous_value', v_previous_record.value,
      'new_value', p_value
    );
  ELSE
    v_result := jsonb_build_object('is_new_record', false);
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION calculate_weight_progress_percentage IS 'Calcule le pourcentage de progression vers l''objectif de poids';
COMMENT ON FUNCTION detect_transformation_records IS 'Détecte et crée automatiquement les records de transformation lors de mise à jour de poids';
