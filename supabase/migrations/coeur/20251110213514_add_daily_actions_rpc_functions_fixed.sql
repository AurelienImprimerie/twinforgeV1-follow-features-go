/*
  # Add Daily Actions RPC Functions (Fixed)
  
  1. New Functions
    - Drop and recreate get_todays_completed_actions with new signature
    - Add mark_daily_action_completed_v2 for occurrence support
    - Add helper functions for stats and combos
  
  2. Security
    - All functions are SECURITY DEFINER
    - Validate authenticated user
*/

-- Drop old function first
DROP FUNCTION IF EXISTS get_todays_completed_actions();

-- Function to mark action completed (v2 with occurrence support)
CREATE OR REPLACE FUNCTION mark_daily_action_completed_v2(
  p_action_id text,
  p_xp_earned integer DEFAULT 0
)
RETURNS TABLE(
  action_id text,
  was_newly_completed boolean,
  xp_awarded integer,
  occurrence_number integer,
  is_first_of_day boolean,
  total_occurrences_today integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_occurrence_count integer;
  v_is_first boolean;
  v_occurrence_num integer;
  v_xp_to_award integer;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Count existing occurrences today
  SELECT COUNT(*) INTO v_occurrence_count
  FROM daily_actions_completion
  WHERE user_id = v_user_id
    AND action_date = CURRENT_DATE
    AND daily_actions_completion.action_id = p_action_id;

  -- Determine if this is the first occurrence
  v_is_first := (v_occurrence_count = 0);
  v_occurrence_num := v_occurrence_count + 1;

  -- Only award XP for first occurrence
  IF v_is_first THEN
    v_xp_to_award := p_xp_earned;
  ELSE
    v_xp_to_award := 0;
  END IF;

  -- Insert new occurrence
  INSERT INTO daily_actions_completion (
    user_id,
    action_id,
    xp_earned,
    is_first_of_day,
    occurrence_number,
    xp_awarded
  )
  VALUES (
    v_user_id,
    p_action_id,
    v_xp_to_award,
    v_is_first,
    v_occurrence_num,
    v_is_first
  );

  -- Return comprehensive result
  RETURN QUERY SELECT
    p_action_id,
    v_is_first,
    v_xp_to_award,
    v_occurrence_num,
    v_is_first,
    v_occurrence_num;
END;
$$;

-- Function to get occurrence count
CREATE OR REPLACE FUNCTION get_daily_action_occurrences(
  p_action_id text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_count integer;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM daily_actions_completion
  WHERE user_id = v_user_id
    AND action_date = CURRENT_DATE
    AND action_id = p_action_id;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Function to get daily action stats
CREATE OR REPLACE FUNCTION get_daily_action_stats()
RETURNS TABLE(
  action_id text,
  first_completed_at timestamptz,
  total_occurrences integer,
  xp_earned_total integer,
  is_completed_today boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    dac.action_id,
    MIN(dac.completed_at) as first_completed_at,
    COUNT(*)::integer as total_occurrences,
    SUM(dac.xp_earned)::integer as xp_earned_total,
    true as is_completed_today
  FROM daily_actions_completion dac
  WHERE dac.user_id = v_user_id
    AND dac.action_date = CURRENT_DATE
  GROUP BY dac.action_id
  ORDER BY MIN(dac.completed_at) ASC;
END;
$$;

-- Function to check action combo
CREATE OR REPLACE FUNCTION check_action_combo(
  p_action_ids text[]
)
RETURNS TABLE(
  combo_name text,
  combo_achieved boolean,
  actions_completed integer,
  actions_required integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_completed_count integer;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Count how many of the required actions are completed today
  SELECT COUNT(DISTINCT action_id) INTO v_completed_count
  FROM daily_actions_completion
  WHERE user_id = v_user_id
    AND action_date = CURRENT_DATE
    AND action_id = ANY(p_action_ids)
    AND is_first_of_day = true;

  -- Return combo status
  RETURN QUERY SELECT
    'Daily Combo'::text,
    v_completed_count >= array_length(p_action_ids, 1),
    v_completed_count::integer,
    array_length(p_action_ids, 1)::integer;
END;
$$;

-- Recreate get_todays_completed_actions with new columns
CREATE OR REPLACE FUNCTION get_todays_completed_actions()
RETURNS TABLE(
  action_id text,
  completed_at timestamptz,
  xp_earned integer,
  occurrence_number integer,
  is_first_of_day boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    dac.action_id,
    dac.completed_at,
    dac.xp_earned,
    dac.occurrence_number,
    dac.is_first_of_day
  FROM daily_actions_completion dac
  WHERE dac.user_id = v_user_id
    AND dac.action_date = CURRENT_DATE
  ORDER BY dac.completed_at ASC;
END;
$$;
