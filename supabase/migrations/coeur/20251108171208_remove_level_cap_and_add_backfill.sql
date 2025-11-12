/*
  # Remove Level 100 Cap & Add Historical XP Backfill

  ## Summary
  Complete overhaul of the gamification system to support unlimited progression
  and retroactive XP attribution for existing user data.

  ## 1. Schema Changes

  ### user_gamification_progress
  - Remove CHECK constraint limiting level to 100
  - Update to support levels up to 999999

  ### level_milestones
  - Remove CHECK constraint limiting milestones to 100
  - Support dynamic generation of milestones beyond level 100

  ## 2. New Functions

  ### calculate_level_from_xp_unlimited(xp bigint)
  Replaces old function with unlimited level support using exponential curve

  ### get_xp_for_level_unlimited(level integer)
  Calculates total XP needed for any level up to 999999

  ### generate_dynamic_milestone(level integer)
  Auto-generates milestone data for levels beyond 100

  ### backfill_historical_gamification_xp(p_user_id uuid)
  Scans all existing data and retroactively awards XP for past actions

  ## 3. XP Attribution Rules

  Historical actions that grant XP:
  - Body scans: 25 XP each
  - Meals logged: 10 XP each
  - Training sessions: 60 XP each
  - Fasting protocols: 35 XP each
  - Biometric activities: 15 XP each

  ## 4. Important Notes

  - Backfill function should be run ONCE per user
  - Historical XP events are marked with metadata flag 'historical_backfill: true'
  - Streaks are NOT applied to historical data (multiplier = 1.0)
  - Level calculation is recalculated after backfill
  - This migration does NOT automatically run backfill (manual execution required)
*/

-- ============================================
-- DROP OLD CONSTRAINTS
-- ============================================

-- Drop the level cap constraint on user_gamification_progress
ALTER TABLE user_gamification_progress
DROP CONSTRAINT IF EXISTS user_gamification_progress_current_level_check;

-- Add new constraint for unlimited levels
ALTER TABLE user_gamification_progress
ADD CONSTRAINT user_gamification_progress_current_level_check
CHECK (current_level >= 1 AND current_level <= 999999);

-- Drop the level cap constraint on level_milestones
ALTER TABLE level_milestones
DROP CONSTRAINT IF EXISTS level_milestones_level_check;

-- Add new constraint for unlimited milestones
ALTER TABLE level_milestones
ADD CONSTRAINT level_milestones_level_check
CHECK (level >= 1 AND level <= 999999);

-- ============================================
-- FUNCTION: calculate_level_from_xp_unlimited
-- ============================================

CREATE OR REPLACE FUNCTION calculate_level_from_xp_unlimited(total_xp bigint)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  calculated_level integer := 1;
  xp_needed bigint := 0;
  xp_per_level integer;
BEGIN
  -- Levels 1-10: 100 XP per level
  FOR i IN 1..10 LOOP
    xp_needed := xp_needed + 100;
    IF total_xp >= xp_needed THEN
      calculated_level := i + 1;
    ELSE
      RETURN calculated_level;
    END IF;
  END LOOP;

  -- Levels 11-25: 150 XP per level
  FOR i IN 11..25 LOOP
    xp_needed := xp_needed + 150;
    IF total_xp >= xp_needed THEN
      calculated_level := i + 1;
    ELSE
      RETURN calculated_level;
    END IF;
  END LOOP;

  -- Levels 26-50: 200 XP per level
  FOR i IN 26..50 LOOP
    xp_needed := xp_needed + 200;
    IF total_xp >= xp_needed THEN
      calculated_level := i + 1;
    ELSE
      RETURN calculated_level;
    END IF;
  END LOOP;

  -- Levels 51-75: 300 XP per level
  FOR i IN 51..75 LOOP
    xp_needed := xp_needed + 300;
    IF total_xp >= xp_needed THEN
      calculated_level := i + 1;
    ELSE
      RETURN calculated_level;
    END IF;
  END LOOP;

  -- Levels 76-100: 500 XP per level
  FOR i IN 76..100 LOOP
    xp_needed := xp_needed + 500;
    IF total_xp >= xp_needed THEN
      calculated_level := i + 1;
    ELSE
      RETURN calculated_level;
    END IF;
  END LOOP;

  -- Beyond level 100: Exponential curve
  -- Base: 600 XP, increases by 50 XP every 10 levels
  xp_per_level := 600;

  WHILE calculated_level <= 999999 LOOP
    -- Increase XP requirement every 10 levels
    IF calculated_level > 100 AND (calculated_level - 100) % 10 = 0 THEN
      xp_per_level := xp_per_level + 50;
    END IF;

    xp_needed := xp_needed + xp_per_level;

    IF total_xp >= xp_needed THEN
      calculated_level := calculated_level + 1;
    ELSE
      RETURN calculated_level;
    END IF;
  END LOOP;

  RETURN calculated_level;
END;
$$;

-- ============================================
-- FUNCTION: get_xp_for_level_unlimited
-- ============================================

CREATE OR REPLACE FUNCTION get_xp_for_level_unlimited(target_level integer)
RETURNS bigint
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  total_xp bigint := 0;
  xp_per_level integer;
  i integer;
BEGIN
  IF target_level <= 1 THEN
    RETURN 0;
  END IF;

  -- Levels 1-10: 100 XP per level
  total_xp := total_xp + (LEAST(target_level - 1, 10) * 100);

  -- Levels 11-25: 150 XP per level
  IF target_level > 10 THEN
    total_xp := total_xp + (LEAST(target_level - 10, 15) * 150);
  END IF;

  -- Levels 26-50: 200 XP per level
  IF target_level > 25 THEN
    total_xp := total_xp + (LEAST(target_level - 25, 25) * 200);
  END IF;

  -- Levels 51-75: 300 XP per level
  IF target_level > 50 THEN
    total_xp := total_xp + (LEAST(target_level - 50, 25) * 300);
  END IF;

  -- Levels 76-100: 500 XP per level
  IF target_level > 75 THEN
    total_xp := total_xp + (LEAST(target_level - 75, 25) * 500);
  END IF;

  -- Beyond level 100
  IF target_level > 100 THEN
    xp_per_level := 600;

    FOR i IN 101..target_level LOOP
      -- Increase XP requirement every 10 levels
      IF (i - 100) % 10 = 0 THEN
        xp_per_level := xp_per_level + 50;
      END IF;

      total_xp := total_xp + xp_per_level;
    END LOOP;
  END IF;

  RETURN total_xp;
END;
$$;

-- ============================================
-- FUNCTION: generate_dynamic_milestone
-- ============================================

CREATE OR REPLACE FUNCTION generate_dynamic_milestone(p_level integer)
RETURNS TABLE (
  level integer,
  xp_required bigint,
  xp_to_next integer,
  milestone_name text,
  milestone_description text,
  is_major_milestone boolean,
  badge_color text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_xp_required bigint;
  v_xp_to_next integer;
  v_is_major boolean;
  v_color text;
  v_name text;
  v_description text;
BEGIN
  -- Calculate XP required for this level
  v_xp_required := get_xp_for_level_unlimited(p_level);

  -- Calculate XP to next level
  v_xp_to_next := (get_xp_for_level_unlimited(p_level + 1) - v_xp_required)::integer;

  -- Determine if major milestone (every 10 levels)
  v_is_major := (p_level % 10 = 0);

  -- Assign color based on level range
  v_color := CASE
    WHEN p_level >= 500 THEN '#FFD700' -- Gold
    WHEN p_level >= 250 THEN '#E5E4E2' -- Platinum
    WHEN p_level >= 150 THEN '#B87333' -- Copper
    WHEN p_level >= 100 THEN '#C0C0C0' -- Silver
    ELSE '#CD7F32' -- Bronze
  END;

  -- Generate milestone name
  v_name := CASE
    WHEN p_level % 100 = 0 THEN 'Centenaire Niveau ' || p_level
    WHEN p_level % 50 = 0 THEN 'Demi-Centenaire Niveau ' || p_level
    WHEN v_is_major THEN 'Palier Niveau ' || p_level
    ELSE 'Niveau ' || p_level
  END;

  -- Generate description
  v_description := CASE
    WHEN p_level >= 500 THEN 'Légende vivante! Tu domines totalement!'
    WHEN p_level >= 250 THEN 'Maître absolu de la transformation!'
    WHEN p_level >= 150 THEN 'Champion d''élite! Respect total!'
    WHEN p_level >= 100 THEN 'Au-delà de l''excellence! Continue!'
    ELSE 'Progression exceptionnelle!'
  END;

  -- Return the generated milestone
  RETURN QUERY SELECT
    p_level,
    v_xp_required,
    v_xp_to_next,
    v_name,
    v_description,
    v_is_major,
    v_color;
END;
$$;

-- ============================================
-- FUNCTION: backfill_historical_gamification_xp
-- ============================================

CREATE OR REPLACE FUNCTION backfill_historical_gamification_xp(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_body_scans_count integer;
  v_meals_count integer;
  v_training_count integer;
  v_fasting_count integer;
  v_activities_count integer;
  v_total_xp_awarded bigint := 0;
  v_scan_record record;
  v_meal_record record;
  v_training_record record;
  v_fasting_record record;
  v_activity_record record;
  v_final_level integer;
  v_final_total_xp bigint;
  v_result jsonb;
BEGIN
  -- Ensure user has gamification progress record
  INSERT INTO user_gamification_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Count existing historical events to avoid duplicates
  SELECT COUNT(*) INTO v_body_scans_count
  FROM xp_events_log
  WHERE user_id = p_user_id
  AND event_metadata->>'historical_backfill' = 'true'
  AND event_type = 'body_scan';

  -- Process body scans (25 XP each)
  IF v_body_scans_count = 0 THEN
    FOR v_scan_record IN
      SELECT id, scan_date, created_at
      FROM body_scans
      WHERE user_id = p_user_id
      ORDER BY scan_date ASC
    LOOP
      INSERT INTO xp_events_log (
        user_id,
        event_type,
        event_category,
        base_xp,
        multiplier,
        final_xp,
        event_date,
        event_metadata
      ) VALUES (
        p_user_id,
        'body_scan',
        'body_scan',
        25,
        1.0,
        25,
        v_scan_record.scan_date,
        jsonb_build_object('historical_backfill', true, 'body_scan_id', v_scan_record.id)
      );

      v_total_xp_awarded := v_total_xp_awarded + 25;
    END LOOP;
  END IF;

  -- Process meals (10 XP each)
  FOR v_meal_record IN
    SELECT id, consumed_at
    FROM meals
    WHERE user_id = p_user_id
    AND consumed_at IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM xp_events_log
      WHERE user_id = p_user_id
      AND event_metadata->>'meal_id' = v_meal_record.id::text
      AND event_metadata->>'historical_backfill' = 'true'
    )
    ORDER BY consumed_at ASC
  LOOP
    INSERT INTO xp_events_log (
      user_id,
      event_type,
      event_category,
      base_xp,
      multiplier,
      final_xp,
      event_date,
      event_metadata
    ) VALUES (
      p_user_id,
      'meal_scan',
      'nutrition',
      10,
      1.0,
      10,
      v_meal_record.consumed_at,
      jsonb_build_object('historical_backfill', true, 'meal_id', v_meal_record.id)
    );

    v_total_xp_awarded := v_total_xp_awarded + 10;
  END LOOP;

  -- Process training sessions (60 XP each)
  FOR v_training_record IN
    SELECT id, created_at
    FROM training_sessions
    WHERE user_id = p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM xp_events_log
      WHERE user_id = p_user_id
      AND event_metadata->>'training_session_id' = v_training_record.id::text
      AND event_metadata->>'historical_backfill' = 'true'
    )
    ORDER BY created_at ASC
  LOOP
    INSERT INTO xp_events_log (
      user_id,
      event_type,
      event_category,
      base_xp,
      multiplier,
      final_xp,
      event_date,
      event_metadata
    ) VALUES (
      p_user_id,
      'training_session',
      'training',
      60,
      1.0,
      60,
      v_training_record.created_at,
      jsonb_build_object('historical_backfill', true, 'training_session_id', v_training_record.id)
    );

    v_total_xp_awarded := v_total_xp_awarded + 60;
  END LOOP;

  -- Process fasting protocols (35 XP each)
  FOR v_fasting_record IN
    SELECT id, created_at
    FROM fasting_protocols
    WHERE user_id = p_user_id
    AND status = 'completed'
    AND NOT EXISTS (
      SELECT 1 FROM xp_events_log
      WHERE user_id = p_user_id
      AND event_metadata->>'fasting_protocol_id' = v_fasting_record.id::text
      AND event_metadata->>'historical_backfill' = 'true'
    )
    ORDER BY created_at ASC
  LOOP
    INSERT INTO xp_events_log (
      user_id,
      event_type,
      event_category,
      base_xp,
      multiplier,
      final_xp,
      event_date,
      event_metadata
    ) VALUES (
      p_user_id,
      'fasting_protocol',
      'fasting',
      35,
      1.0,
      35,
      v_fasting_record.created_at,
      jsonb_build_object('historical_backfill', true, 'fasting_protocol_id', v_fasting_record.id)
    );

    v_total_xp_awarded := v_total_xp_awarded + 35;
  END LOOP;

  -- Process biometric activities (15 XP each)
  FOR v_activity_record IN
    SELECT id, timestamp
    FROM biometric_activities
    WHERE user_id = p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM xp_events_log
      WHERE user_id = p_user_id
      AND event_metadata->>'activity_id' = v_activity_record.id::text
      AND event_metadata->>'historical_backfill' = 'true'
    )
    ORDER BY timestamp ASC
    LIMIT 100  -- Limit to avoid too many activities
  LOOP
    INSERT INTO xp_events_log (
      user_id,
      event_type,
      event_category,
      base_xp,
      multiplier,
      final_xp,
      event_date,
      event_metadata
    ) VALUES (
      p_user_id,
      'wearable_sync',
      'wearable',
      15,
      1.0,
      15,
      v_activity_record.timestamp,
      jsonb_build_object('historical_backfill', true, 'activity_id', v_activity_record.id)
    );

    v_total_xp_awarded := v_total_xp_awarded + 15;
  END LOOP;

  -- Recalculate user's level based on total XP
  SELECT COALESCE(SUM(final_xp), 0) INTO v_final_total_xp
  FROM xp_events_log
  WHERE user_id = p_user_id;

  v_final_level := calculate_level_from_xp_unlimited(v_final_total_xp);

  -- Update user gamification progress
  UPDATE user_gamification_progress
  SET
    total_xp_earned = v_final_total_xp,
    current_level = v_final_level,
    current_xp = v_final_total_xp - get_xp_for_level_unlimited(v_final_level),
    xp_to_next_level = (get_xp_for_level_unlimited(v_final_level + 1) - v_final_total_xp)::integer,
    level_up_count = v_final_level - 1,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'xp_awarded', v_total_xp_awarded,
    'final_level', v_final_level,
    'final_total_xp', v_final_total_xp,
    'events_processed', jsonb_build_object(
      'body_scans', (SELECT COUNT(*) FROM body_scans WHERE user_id = p_user_id),
      'meals', (SELECT COUNT(*) FROM meals WHERE user_id = p_user_id AND consumed_at IS NOT NULL),
      'training_sessions', (SELECT COUNT(*) FROM training_sessions WHERE user_id = p_user_id),
      'fasting_protocols', (SELECT COUNT(*) FROM fasting_protocols WHERE user_id = p_user_id AND status = 'completed'),
      'activities', LEAST(100, (SELECT COUNT(*) FROM biometric_activities WHERE user_id = p_user_id))
    )
  );

  RETURN v_result;
END;
$$;

-- ============================================
-- UPDATE EXISTING AWARD_XP FUNCTION
-- ============================================

-- Replace old function to use new unlimited functions
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id uuid,
  p_event_type text,
  p_event_category text,
  p_base_xp integer,
  p_event_metadata jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_streak integer;
  v_multiplier numeric;
  v_final_xp integer;
  v_new_total_xp bigint;
  v_old_level integer;
  v_new_level integer;
  v_leveled_up boolean := false;
  v_xp_to_next integer;
  v_result jsonb;
BEGIN
  -- Ensure user has gamification record
  INSERT INTO user_gamification_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update streak
  v_current_streak := check_and_update_streak(p_user_id);

  -- Get streak multiplier
  v_multiplier := get_streak_multiplier(v_current_streak);

  -- Calculate final XP
  v_final_xp := FLOOR(p_base_xp * v_multiplier);

  -- Get current level before update
  SELECT current_level, total_xp_earned
  INTO v_old_level, v_new_total_xp
  FROM user_gamification_progress
  WHERE user_id = p_user_id;

  -- Add XP
  v_new_total_xp := v_new_total_xp + v_final_xp;

  -- Calculate new level using unlimited function
  v_new_level := calculate_level_from_xp_unlimited(v_new_total_xp);

  -- Check if leveled up
  v_leveled_up := v_new_level > v_old_level;

  -- Calculate XP to next level using unlimited function
  v_xp_to_next := (get_xp_for_level_unlimited(v_new_level + 1) - v_new_total_xp)::integer;

  -- Update gamification progress
  UPDATE user_gamification_progress
  SET
    current_xp = v_new_total_xp - get_xp_for_level_unlimited(v_new_level),
    current_level = v_new_level,
    xp_to_next_level = v_xp_to_next,
    total_xp_earned = v_new_total_xp,
    level_up_count = CASE WHEN v_leveled_up THEN level_up_count + (v_new_level - v_old_level) ELSE level_up_count END,
    last_level_up_at = CASE WHEN v_leveled_up THEN now() ELSE last_level_up_at END,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Log XP event
  INSERT INTO xp_events_log (
    user_id,
    event_type,
    event_category,
    base_xp,
    multiplier,
    final_xp,
    event_metadata
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_category,
    p_base_xp,
    v_multiplier,
    v_final_xp,
    p_event_metadata
  );

  -- Build result
  v_result := jsonb_build_object(
    'xp_awarded', v_final_xp,
    'base_xp', p_base_xp,
    'multiplier', v_multiplier,
    'streak_days', v_current_streak,
    'leveled_up', v_leveled_up,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'current_xp', v_new_total_xp - get_xp_for_level_unlimited(v_new_level),
    'xp_to_next_level', v_xp_to_next,
    'total_xp', v_new_total_xp
  );

  RETURN v_result;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION calculate_level_from_xp_unlimited IS 'Calculates user level from total XP with unlimited progression up to 999999';
COMMENT ON FUNCTION get_xp_for_level_unlimited IS 'Returns total XP required to reach any level up to 999999';
COMMENT ON FUNCTION generate_dynamic_milestone IS 'Auto-generates milestone data for any level beyond 100';
COMMENT ON FUNCTION backfill_historical_gamification_xp IS 'Awards XP retroactively for all historical user actions (run once per user)';
