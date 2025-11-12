/*
  # Daily Actions Tracking System

  1. New Tables
    - `daily_actions_completion`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action_date` (date) - La date de l'action
      - `action_id` (text) - L'identifiant de l'action (meal-scan, activity-log, fasting-log, etc.)
      - `completed_at` (timestamptz) - Timestamp de complétion
      - `xp_earned` (integer) - XP gagné pour cette action
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `daily_actions_completion` table
    - Add policies for authenticated users to manage their own actions

  3. Indexes
    - Index on (user_id, action_date, action_id) for fast lookups
    - Index on (user_id, action_date) for daily queries

  4. Notes
    - Permet de tracker quelles actions quotidiennes ont été complétées
    - Supporte la visualisation des checkmarks/badges dans l'UI
    - Permet d'éviter les doublons d'XP pour la même action le même jour
*/

-- Create daily_actions_completion table
CREATE TABLE IF NOT EXISTS daily_actions_completion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_date date NOT NULL DEFAULT CURRENT_DATE,
  action_id text NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  xp_earned integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Prevent duplicate completions for same action on same day
  UNIQUE(user_id, action_date, action_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_actions_user_date_action 
  ON daily_actions_completion(user_id, action_date, action_id);

CREATE INDEX IF NOT EXISTS idx_daily_actions_user_date 
  ON daily_actions_completion(user_id, action_date);

CREATE INDEX IF NOT EXISTS idx_daily_actions_user_recent 
  ON daily_actions_completion(user_id, action_date DESC);

-- Enable RLS
ALTER TABLE daily_actions_completion ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily actions"
  ON daily_actions_completion
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily actions"
  ON daily_actions_completion
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily actions"
  ON daily_actions_completion
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily actions"
  ON daily_actions_completion
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to mark action as completed
CREATE OR REPLACE FUNCTION mark_daily_action_completed(
  p_action_id text,
  p_xp_earned integer DEFAULT 0
)
RETURNS TABLE(
  action_id text,
  was_newly_completed boolean,
  xp_awarded integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_existing_id uuid;
  v_was_new boolean;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already completed today
  SELECT id INTO v_existing_id
  FROM daily_actions_completion
  WHERE user_id = v_user_id
    AND action_date = CURRENT_DATE
    AND daily_actions_completion.action_id = p_action_id;

  IF v_existing_id IS NOT NULL THEN
    -- Already completed today
    v_was_new := false;
    RETURN QUERY SELECT p_action_id, v_was_new, 0;
  ELSE
    -- New completion, insert it
    INSERT INTO daily_actions_completion (user_id, action_id, xp_earned)
    VALUES (v_user_id, p_action_id, p_xp_earned);
    
    v_was_new := true;
    RETURN QUERY SELECT p_action_id, v_was_new, p_xp_earned;
  END IF;
END;
$$;

-- Function to get today's completed actions for a user
CREATE OR REPLACE FUNCTION get_todays_completed_actions()
RETURNS TABLE(
  action_id text,
  completed_at timestamptz,
  xp_earned integer
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
    dac.xp_earned
  FROM daily_actions_completion dac
  WHERE dac.user_id = v_user_id
    AND dac.action_date = CURRENT_DATE
  ORDER BY dac.completed_at ASC;
END;
$$;
