/*
  # Fix Daily Actions Completion - Add Missing Columns
  
  1. Changes
    - Add `is_first_of_day` column (boolean) - Tracks if this is the first completion of the day
    - Add `occurrence_number` column (integer) - Tracks the occurrence number for the day
    - Add `xp_awarded` column (boolean) - Tracks if XP was awarded for this occurrence
    - Remove unique constraint to allow multiple occurrences
    - Add index for efficient queries
    - Update existing data to set default values
  
  2. Security
    - Maintains existing RLS policies
    - No changes to access control
*/

-- Drop existing unique constraint if it exists
ALTER TABLE daily_actions_completion
  DROP CONSTRAINT IF EXISTS daily_actions_completion_user_id_action_date_action_id_key;

-- Add new columns
ALTER TABLE daily_actions_completion
  ADD COLUMN IF NOT EXISTS is_first_of_day boolean DEFAULT false NOT NULL;

ALTER TABLE daily_actions_completion
  ADD COLUMN IF NOT EXISTS occurrence_number integer DEFAULT 1 NOT NULL;

ALTER TABLE daily_actions_completion
  ADD COLUMN IF NOT EXISTS xp_awarded boolean DEFAULT false NOT NULL;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_actions_user_date_action_occurrence
  ON daily_actions_completion(user_id, action_date, action_id, created_at DESC);

-- Update existing data to set proper values
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
