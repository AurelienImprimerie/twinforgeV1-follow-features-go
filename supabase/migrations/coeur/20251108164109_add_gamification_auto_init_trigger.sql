/*
  # Auto-Initialize Gamification Progress for New Users

  ## Summary
  This migration adds a trigger to automatically create a gamification progress entry
  when a new user signs up. This ensures every user starts with Level 1 and 0 XP without
  requiring manual initialization.

  ## Changes
  1. Add trigger function to create gamification progress
  2. Add trigger on user_profile INSERT to initialize gamification
  3. Ensure idempotent - only create if doesn't exist

  ## Security
  - Function runs as SECURITY DEFINER to bypass RLS
  - Only creates entry if not exists
  - No risk of duplicate or unauthorized creation
*/

-- ============================================
-- FUNCTION: Auto-initialize gamification progress
-- ============================================

CREATE OR REPLACE FUNCTION initialize_user_gamification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create gamification progress if it doesn't exist yet
  INSERT INTO user_gamification_progress (
    user_id,
    current_xp,
    current_level,
    xp_to_next_level,
    total_xp_earned,
    level_up_count,
    current_streak_days,
    longest_streak_days,
    last_activity_date,
    last_level_up_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.user_id,
    0,              -- Start with 0 XP
    1,              -- Start at Level 1
    100,            -- First level needs 100 XP
    0,              -- No XP earned yet
    0,              -- No level ups yet
    0,              -- No streak
    0,              -- No best streak
    NULL,           -- No activity yet
    NULL,           -- Never leveled up
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;  -- Idempotent - ignore if already exists

  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGER: Auto-initialize on user creation
-- ============================================

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_initialize_gamification ON user_profile;

-- Create trigger on user_profile table
-- This runs AFTER a new profile is created
CREATE TRIGGER trigger_initialize_gamification
  AFTER INSERT ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_gamification();

-- ============================================
-- BACKFILL: Initialize existing users without gamification
-- ============================================

-- Initialize gamification for existing users who don't have it yet
INSERT INTO user_gamification_progress (
  user_id,
  current_xp,
  current_level,
  xp_to_next_level,
  total_xp_earned,
  level_up_count,
  current_streak_days,
  longest_streak_days,
  last_activity_date,
  last_level_up_at,
  created_at,
  updated_at
)
SELECT
  up.user_id,
  0,              -- Start with 0 XP
  1,              -- Start at Level 1
  100,            -- First level needs 100 XP
  0,              -- No XP earned yet
  0,              -- No level ups yet
  0,              -- No streak
  0,              -- No best streak
  NULL,           -- No activity yet
  NULL,           -- Never leveled up
  now(),
  now()
FROM user_profile up
LEFT JOIN user_gamification_progress ugp ON ugp.user_id = up.user_id
WHERE ugp.user_id IS NULL;  -- Only for users without gamification yet

-- Log completion
DO $$
DECLARE
  v_initialized_count integer;
BEGIN
  SELECT COUNT(*) INTO v_initialized_count
  FROM user_gamification_progress;

  RAISE NOTICE 'Gamification auto-initialization complete. Total users with gamification: %', v_initialized_count;
END $$;