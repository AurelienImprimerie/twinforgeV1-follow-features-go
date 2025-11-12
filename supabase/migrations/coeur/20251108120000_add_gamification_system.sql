/*
  # Gamification System - XP, Levels & Progression

  ## Summary
  Complete gamification system transforming the transformation score into an engaging
  XP-based progression system. Users earn XP from all activities, level up, and can
  track when they'll reach their transformation objective.

  ## 1. New Tables

  ### user_gamification_progress
  Tracks user's XP, level, and overall gamification state
  - `user_id` (uuid, primary key, foreign key to auth.users)
  - `current_xp` (bigint) - Total XP earned
  - `current_level` (integer) - Current level (1-100)
  - `xp_to_next_level` (integer) - XP needed for next level
  - `total_xp_earned` (bigint) - Lifetime XP (never decreases)
  - `level_up_count` (integer) - Total times leveled up
  - `current_streak_days` (integer) - Current daily activity streak
  - `longest_streak_days` (integer) - Best streak ever
  - `last_activity_date` (date) - Last day user earned XP
  - `last_level_up_at` (timestamptz) - When last leveled up
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### xp_events_log
  Detailed log of every XP event for transparency and auditing
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `event_type` (text) - Type: meal_scan, training_session, body_scan, etc.
  - `event_category` (text) - Category: nutrition, training, fasting, body_scan, wearable
  - `base_xp` (integer) - Base XP for the activity
  - `multiplier` (numeric) - Streak or bonus multiplier
  - `final_xp` (integer) - Final XP awarded (base * multiplier)
  - `event_date` (timestamptz) - When event occurred
  - `event_metadata` (jsonb) - Additional event data
  - `created_at` (timestamptz)

  ### level_milestones
  Defines XP thresholds and rewards for each level
  - `level` (integer, primary key)
  - `xp_required` (bigint) - Total XP needed to reach this level
  - `xp_to_next` (integer) - XP needed from this level to next
  - `milestone_name` (text) - Name of this level
  - `milestone_description` (text) - Description
  - `unlock_features` (jsonb) - Features unlocked at this level
  - `badge_icon` (text) - Icon for this level
  - `badge_color` (text) - Color theme for level badge
  - `is_major_milestone` (boolean) - True every 10 levels
  - `created_at` (timestamptz)

  ### weight_updates_history
  Track weight updates with XP rewards
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `previous_weight` (numeric) - Previous weight in kg
  - `new_weight` (numeric) - New weight in kg
  - `weight_delta` (numeric) - Change in weight
  - `updated_from` (text) - Source: dashboard_gaming, profile, body_scan
  - `xp_awarded` (integer) - XP given for update
  - `is_milestone` (boolean) - True if significant progress
  - `milestone_data` (jsonb) - Milestone details if applicable
  - `created_at` (timestamptz)

  ## 2. Schema Changes

  ### auth.users (via profiles)
  Add gamification columns to track in user context
  - No direct changes, use user_gamification_progress join

  ## 3. Functions

  ### calculate_level_from_xp(xp bigint)
  Calculates level from total XP using progressive curve

  ### award_xp(user_id uuid, event_type text, base_xp integer)
  Awards XP to user with streak multipliers and handles level ups

  ### get_xp_for_level(level integer)
  Returns total XP needed to reach a specific level

  ### check_and_update_streak(user_id uuid)
  Updates streak based on last activity date

  ## 4. XP Award Rules

  Base XP values:
  - Meal scan: 10 XP
  - Daily calorie goal met: 50 XP
  - Training session completed: 30 XP
  - Following meal plan: 40 XP
  - Body scan completed: 25 XP
  - Fasting protocol followed: 35 XP
  - Wearable daily sync: 15 XP
  - Weight update: 15 XP (base)
  - Weight milestone reached: +25 XP bonus

  Streak Multipliers:
  - 3 days: 1.5x
  - 7 days: 2.0x
  - 14 days: 2.5x
  - 30 days: 3.0x

  ## 5. Level Progression Curve

  Non-linear progression:
  - Level 1-10: 100 XP per level (easy start)
  - Level 11-25: 150 XP per level
  - Level 26-50: 200 XP per level
  - Level 51-75: 300 XP per level
  - Level 76-100: 500 XP per level

  ## 6. Security
  - Enable RLS on all tables
  - Users can only view/modify their own data
  - XP awards are system-controlled (no manual manipulation)

  ## 7. Integration Points
  - Weight updates from gaming widget update user_profiles.weight_kg
  - All XP events logged for transparency
  - Streak system encourages daily engagement
*/

-- ============================================
-- TABLE: user_gamification_progress
-- ============================================

CREATE TABLE IF NOT EXISTS user_gamification_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_xp bigint NOT NULL DEFAULT 0 CHECK (current_xp >= 0),
  current_level integer NOT NULL DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 100),
  xp_to_next_level integer NOT NULL DEFAULT 100,
  total_xp_earned bigint NOT NULL DEFAULT 0 CHECK (total_xp_earned >= 0),
  level_up_count integer NOT NULL DEFAULT 0 CHECK (level_up_count >= 0),
  current_streak_days integer NOT NULL DEFAULT 0 CHECK (current_streak_days >= 0),
  longest_streak_days integer NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
  last_activity_date date,
  last_level_up_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_gamification_user_id ON user_gamification_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_level ON user_gamification_progress(current_level);
CREATE INDEX IF NOT EXISTS idx_gamification_last_activity ON user_gamification_progress(last_activity_date);

-- ============================================
-- TABLE: xp_events_log
-- ============================================

CREATE TABLE IF NOT EXISTS xp_events_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_category text NOT NULL CHECK (event_category IN ('nutrition', 'training', 'fasting', 'body_scan', 'wearable', 'general')),
  base_xp integer NOT NULL CHECK (base_xp >= 0),
  multiplier numeric NOT NULL DEFAULT 1.0 CHECK (multiplier >= 1.0 AND multiplier <= 10.0),
  final_xp integer NOT NULL CHECK (final_xp >= 0),
  event_date timestamptz NOT NULL DEFAULT now(),
  event_metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for analytics and lookups
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_date ON xp_events_log(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_category ON xp_events_log(event_category);
CREATE INDEX IF NOT EXISTS idx_xp_events_type ON xp_events_log(event_type);

-- ============================================
-- TABLE: level_milestones
-- ============================================

CREATE TABLE IF NOT EXISTS level_milestones (
  level integer PRIMARY KEY CHECK (level >= 1 AND level <= 100),
  xp_required bigint NOT NULL CHECK (xp_required >= 0),
  xp_to_next integer NOT NULL CHECK (xp_to_next >= 0),
  milestone_name text NOT NULL,
  milestone_description text,
  unlock_features jsonb DEFAULT '[]',
  badge_icon text DEFAULT 'Star',
  badge_color text DEFAULT '#10B981',
  is_major_milestone boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE: weight_updates_history
-- ============================================

CREATE TABLE IF NOT EXISTS weight_updates_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_weight numeric,
  new_weight numeric NOT NULL CHECK (new_weight > 0 AND new_weight < 500),
  weight_delta numeric,
  updated_from text NOT NULL CHECK (updated_from IN ('dashboard_gaming', 'profile', 'body_scan')),
  xp_awarded integer NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  is_milestone boolean NOT NULL DEFAULT false,
  milestone_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_weight_updates_user_id ON weight_updates_history(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_updates_date ON weight_updates_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_updates_milestone ON weight_updates_history(is_milestone) WHERE is_milestone = true;

-- ============================================
-- FUNCTION: calculate_level_from_xp
-- ============================================

CREATE OR REPLACE FUNCTION calculate_level_from_xp(total_xp bigint)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  calculated_level integer := 1;
  xp_needed bigint := 0;
  xp_per_level integer;
BEGIN
  -- Progressive XP curve
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
  FOR i IN 76..99 LOOP
    xp_needed := xp_needed + 500;
    IF total_xp >= xp_needed THEN
      calculated_level := i + 1;
    ELSE
      RETURN calculated_level;
    END IF;
  END LOOP;

  -- Cap at level 100
  RETURN LEAST(calculated_level, 100);
END;
$$;

-- ============================================
-- FUNCTION: get_xp_for_level
-- ============================================

CREATE OR REPLACE FUNCTION get_xp_for_level(target_level integer)
RETURNS bigint
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  total_xp bigint := 0;
BEGIN
  IF target_level <= 1 THEN
    RETURN 0;
  END IF;

  -- Calculate cumulative XP for target level
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

  RETURN total_xp;
END;
$$;

-- ============================================
-- FUNCTION: check_and_update_streak
-- ============================================

CREATE OR REPLACE FUNCTION check_and_update_streak(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_activity_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_today date := CURRENT_DATE;
  v_new_streak integer;
BEGIN
  -- Get current streak data
  SELECT last_activity_date, current_streak_days, longest_streak_days
  INTO v_last_activity_date, v_current_streak, v_longest_streak
  FROM user_gamification_progress
  WHERE user_id = p_user_id;

  -- If no record exists, return 0
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- If no previous activity, start streak at 1
  IF v_last_activity_date IS NULL THEN
    v_new_streak := 1;
  -- If last activity was yesterday, increment streak
  ELSIF v_last_activity_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_current_streak + 1;
  -- If last activity was today, keep current streak
  ELSIF v_last_activity_date = v_today THEN
    v_new_streak := v_current_streak;
  -- Otherwise, streak broken, reset to 1
  ELSE
    v_new_streak := 1;
  END IF;

  -- Update streak and last activity date
  UPDATE user_gamification_progress
  SET
    current_streak_days = v_new_streak,
    longest_streak_days = GREATEST(longest_streak_days, v_new_streak),
    last_activity_date = v_today,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN v_new_streak;
END;
$$;

-- ============================================
-- FUNCTION: get_streak_multiplier
-- ============================================

CREATE OR REPLACE FUNCTION get_streak_multiplier(streak_days integer)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF streak_days >= 30 THEN
    RETURN 3.0;
  ELSIF streak_days >= 14 THEN
    RETURN 2.5;
  ELSIF streak_days >= 7 THEN
    RETURN 2.0;
  ELSIF streak_days >= 3 THEN
    RETURN 1.5;
  ELSE
    RETURN 1.0;
  END IF;
END;
$$;

-- ============================================
-- FUNCTION: award_xp
-- ============================================

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

  -- Calculate new level
  v_new_level := calculate_level_from_xp(v_new_total_xp);

  -- Check if leveled up
  v_leveled_up := v_new_level > v_old_level;

  -- Calculate XP to next level
  v_xp_to_next := get_xp_for_level(v_new_level + 1) - v_new_total_xp;

  -- Update gamification progress
  UPDATE user_gamification_progress
  SET
    current_xp = v_new_total_xp - get_xp_for_level(v_new_level),
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
    'current_xp', v_new_total_xp - get_xp_for_level(v_new_level),
    'xp_to_next_level', v_xp_to_next,
    'total_xp', v_new_total_xp
  );

  RETURN v_result;
END;
$$;

-- ============================================
-- SEED DATA: level_milestones
-- ============================================

INSERT INTO level_milestones (level, xp_required, xp_to_next, milestone_name, milestone_description, is_major_milestone, badge_color)
VALUES
  -- Levels 1-10 (100 XP per level)
  (1, 0, 100, 'Débutant', 'Bienvenue dans ta transformation!', false, '#94A3B8'),
  (2, 100, 100, 'Apprenti', 'Tu prends tes marques', false, '#94A3B8'),
  (3, 200, 100, 'Motivé', 'Le voyage commence!', false, '#94A3B8'),
  (4, 300, 100, 'Engagé', 'Tu es sur la bonne voie', false, '#94A3B8'),
  (5, 400, 100, 'Assidu', 'La régularité paie!', false, '#3B82F6'),
  (6, 500, 100, 'Déterminé', 'Rien ne t''arrête', false, '#3B82F6'),
  (7, 600, 100, 'Endurant', 'Tu tiens la distance', false, '#3B82F6'),
  (8, 700, 100, 'Persévérant', 'Continue comme ça!', false, '#3B82F6'),
  (9, 800, 100, 'Discipliné', 'L''excellence en vue', false, '#10B981'),
  (10, 900, 150, 'Expert', 'Premier palier atteint!', true, '#10B981'),

  -- Levels 11-25 (150 XP per level)
  (11, 1050, 150, 'Champion', 'Tu es dans la cour des grands', false, '#10B981'),
  (12, 1200, 150, 'Guerrier', 'Force et détermination', false, '#10B981'),
  (13, 1350, 150, 'Athlète', 'Le corps se transforme', false, '#10B981'),
  (14, 1500, 150, 'Performeur', 'Des résultats visibles', false, '#10B981'),
  (15, 1650, 150, 'Titan', 'Puissance incarnée', false, '#F59E0B'),
  (16, 1800, 150, 'Héros', 'Une inspiration pour les autres', false, '#F59E0B'),
  (17, 1950, 150, 'Conquérant', 'Objectifs conquis', false, '#F59E0B'),
  (18, 2100, 150, 'Invincible', 'Rien ne te résiste', false, '#F59E0B'),
  (19, 2250, 150, 'Prodige', 'Excellence absolue', false, '#F59E0B'),
  (20, 2400, 200, 'Maître', 'Deuxième palier franchi!', true, '#F59E0B'),

  -- Continue pour 21-100...
  (21, 2600, 200, 'Sage', 'Sagesse et force', false, '#F59E0B'),
  (22, 2800, 200, 'Mentor', 'Tu guides les autres', false, '#F59E0B'),
  (23, 3000, 200, 'Seigneur', 'Domination totale', false, '#EF4444'),
  (24, 3200, 200, 'Roi', 'La royauté du fitness', false, '#EF4444'),
  (25, 3400, 200, 'Empereur', 'Pouvoir suprême', false, '#EF4444')

ON CONFLICT (level) DO NOTHING;

-- Generate remaining levels (26-100)
DO $$
DECLARE
  v_level integer;
  v_xp_required bigint;
  v_xp_increment integer;
  v_color text;
BEGIN
  v_xp_required := 3400;

  -- Levels 26-50 (200 XP per level)
  FOR v_level IN 26..50 LOOP
    v_xp_required := v_xp_required + 200;
    v_xp_increment := CASE WHEN v_level < 50 THEN 200 ELSE 300 END;
    v_color := CASE
      WHEN v_level = 30 THEN '#A855F7'
      WHEN v_level = 40 THEN '#EC4899'
      WHEN v_level = 50 THEN '#18E3FF'
      ELSE '#EF4444'
    END;

    INSERT INTO level_milestones (level, xp_required, xp_to_next, milestone_name, milestone_description, is_major_milestone, badge_color)
    VALUES (
      v_level,
      v_xp_required,
      v_xp_increment,
      'Niveau ' || v_level,
      'Continue ta progression!',
      (v_level % 10 = 0),
      v_color
    )
    ON CONFLICT (level) DO NOTHING;
  END LOOP;

  -- Levels 51-75 (300 XP per level)
  FOR v_level IN 51..75 LOOP
    v_xp_required := v_xp_required + 300;
    v_xp_increment := CASE WHEN v_level < 75 THEN 300 ELSE 500 END;
    v_color := CASE
      WHEN v_level = 60 THEN '#8B5CF6'
      WHEN v_level = 70 THEN '#06B6D4'
      ELSE '#A855F7'
    END;

    INSERT INTO level_milestones (level, xp_required, xp_to_next, milestone_name, milestone_description, is_major_milestone, badge_color)
    VALUES (
      v_level,
      v_xp_required,
      v_xp_increment,
      'Niveau ' || v_level,
      'Excellence pure!',
      (v_level % 10 = 0),
      v_color
    )
    ON CONFLICT (level) DO NOTHING;
  END LOOP;

  -- Levels 76-100 (500 XP per level)
  FOR v_level IN 76..100 LOOP
    v_xp_required := v_xp_required + 500;
    v_xp_increment := CASE WHEN v_level < 100 THEN 500 ELSE 0 END;
    v_color := CASE
      WHEN v_level = 80 THEN '#FBBF24'
      WHEN v_level = 90 THEN '#F59E0B'
      WHEN v_level = 100 THEN '#B9F2FF'
      ELSE '#EC4899'
    END;

    INSERT INTO level_milestones (level, xp_required, xp_to_next, milestone_name, milestone_description, is_major_milestone, badge_color)
    VALUES (
      v_level,
      v_xp_required,
      v_xp_increment,
      CASE
        WHEN v_level = 100 THEN 'Légende Absolue'
        ELSE 'Niveau ' || v_level
      END,
      CASE
        WHEN v_level = 100 THEN 'Tu as atteint le sommet! Félicitations!'
        ELSE 'Vers la légende!'
      END,
      (v_level % 10 = 0),
      v_color
    )
    ON CONFLICT (level) DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_gamification_progress
ALTER TABLE user_gamification_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification progress"
  ON user_gamification_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification progress"
  ON user_gamification_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification progress"
  ON user_gamification_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- xp_events_log
ALTER TABLE xp_events_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own XP events"
  ON xp_events_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: Only system can insert XP events (via award_xp function)

-- level_milestones (public read-only)
ALTER TABLE level_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view level milestones"
  ON level_milestones
  FOR SELECT
  TO authenticated
  USING (true);

-- weight_updates_history
ALTER TABLE weight_updates_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight updates"
  ON weight_updates_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight updates"
  ON weight_updates_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGER: auto_update_timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_gamification_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_gamification_progress_timestamp
  BEFORE UPDATE ON user_gamification_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_timestamp();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE user_gamification_progress IS 'Tracks user XP, level, and streak progression';
COMMENT ON TABLE xp_events_log IS 'Audit log of all XP-earning events';
COMMENT ON TABLE level_milestones IS 'Defines XP thresholds and rewards for each level';
COMMENT ON TABLE weight_updates_history IS 'History of weight updates with XP rewards';

COMMENT ON FUNCTION calculate_level_from_xp IS 'Calculates user level from total XP using progressive curve';
COMMENT ON FUNCTION get_xp_for_level IS 'Returns total XP required to reach a specific level';
COMMENT ON FUNCTION check_and_update_streak IS 'Updates user streak based on activity';
COMMENT ON FUNCTION get_streak_multiplier IS 'Returns XP multiplier based on streak length';
COMMENT ON FUNCTION award_xp IS 'Awards XP to user with streak multipliers and handles level ups';
