/*
  # Fix body_projections columns nullable constraints

  1. Changes
    - Make old system columns nullable (activity_level, caloric_balance, time_period_months)
    - These columns are kept for backward compatibility but are no longer required
    - The new simplified system uses sport_intensity and duration_key instead
  
  2. Rationale
    - The simplified projection system doesn't use the old columns
    - Making them nullable allows new projections to be created without providing these values
    - Existing projections with these values are preserved
*/

-- Make old columns nullable to support the new simplified system
ALTER TABLE body_projections 
  ALTER COLUMN activity_level DROP NOT NULL,
  ALTER COLUMN caloric_balance DROP NOT NULL,
  ALTER COLUMN time_period_months DROP NOT NULL;

-- Set default values for these columns to maintain data integrity
ALTER TABLE body_projections 
  ALTER COLUMN activity_level SET DEFAULT 3,
  ALTER COLUMN caloric_balance SET DEFAULT 0,
  ALTER COLUMN time_period_months SET DEFAULT 6;