/*
  # Optimisation du Système d'Actions Quotidiennes pour Occurrences Multiples

  1. Modifications de la Table
    - Retrait de la contrainte UNIQUE pour permettre plusieurs occurrences par jour
    - Ajout de `is_first_of_day` (boolean) - Identifie si c'est la première occurrence
    - Ajout de `occurrence_number` (integer) - Numéro d'occurrence dans la journée (1, 2, 3...)
    - Ajout de `xp_awarded` (boolean) - Indique si cette occurrence a donné des XP

  2. Nouvelles Fonctions
    - `mark_daily_action_completed_v2` - Version améliorée qui supporte les occurrences multiples
    - `get_daily_action_occurrences` - Retourne le nombre d'occurrences d'une action aujourd'hui
    - `get_daily_action_stats` - Statistiques complètes des actions quotidiennes
    - `check_action_combo` - Vérifie si l'utilisateur a débloqué un combo

  3. Vues
    - `daily_actions_stats` - Vue pour les statistiques en temps réel

  4. Security
    - Maintien des RLS policies existantes
    - Toutes les nouvelles fonctions sont SECURITY DEFINER

  5. Notes
    - Les XP ne sont accordés que pour la première occurrence de chaque action par jour
    - Les occurrences suivantes sont trackées mais sans XP supplémentaire
    - Le système de combos récompense visuellement les actions multiples
*/

-- Drop existing unique constraint
ALTER TABLE daily_actions_completion
  DROP CONSTRAINT IF EXISTS daily_actions_completion_user_id_action_date_action_id_key;

-- Add new columns
ALTER TABLE daily_actions_completion
  ADD COLUMN IF NOT EXISTS is_first_of_day boolean DEFAULT false NOT NULL;

ALTER TABLE daily_actions_completion
  ADD COLUMN IF NOT EXISTS occurrence_number integer DEFAULT 1 NOT NULL;

ALTER TABLE daily_actions_completion
  ADD COLUMN IF NOT EXISTS xp_awarded boolean DEFAULT false NOT NULL;

-- Create new index for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_actions_user_date_action_occurrence
  ON daily_actions_completion(user_id, action_date, action_id, created_at DESC);

-- Drop old function
DROP FUNCTION IF EXISTS mark_daily_action_completed(text, integer);

-- Create improved function that supports multiple occurrences
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
  -- Get authenticated user
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

-- Function to get occurrence count for a specific action today
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

-- Function to get comprehensive daily action stats
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

-- Function to check for action combos
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

-- Update existing function for backward compatibility
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

-- Create materialized view for quick stats (optional, can be refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_actions_stats_summary AS
SELECT
  user_id,
  action_date,
  action_id,
  COUNT(*) as total_occurrences,
  MIN(completed_at) as first_occurrence,
  MAX(completed_at) as last_occurrence,
  SUM(xp_earned) as total_xp_earned
FROM daily_actions_completion
GROUP BY user_id, action_date, action_id;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_daily_actions_stats_user_date
  ON daily_actions_stats_summary(user_id, action_date);

-- Update existing data to set is_first_of_day for historical records
WITH ranked_actions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, action_date, action_id
      ORDER BY completed_at ASC
    ) as rn
  FROM daily_actions_completion
)
UPDATE daily_actions_completion dac
SET
  is_first_of_day = (ra.rn = 1),
  occurrence_number = ra.rn,
  xp_awarded = (ra.rn = 1 AND dac.xp_earned > 0)
FROM ranked_actions ra
WHERE dac.id = ra.id;
