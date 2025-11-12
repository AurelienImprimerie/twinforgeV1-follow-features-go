/*
  # Add user_id column to recipes table (v2)

  1. Changes
    - Add `user_id` column to `recipes` table (nullable first)
    - Populate user_id from session_id -> recipe_sessions -> user_id
    - Set NOT NULL constraint after population
    - Add foreign key constraint to auth.users
    - Create index for better query performance
  
  2. Security
    - Update RLS policies to use user_id for access control
*/

-- Step 1: Add user_id column as nullable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE recipes ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Step 2: Populate user_id from recipe_sessions
UPDATE recipes r
SET user_id = rs.user_id
FROM recipe_sessions rs
WHERE r.session_id = rs.id
AND r.user_id IS NULL;

-- Step 3: For any remaining NULL user_ids (recipes without sessions), delete them or assign to first user
DELETE FROM recipes WHERE user_id IS NULL;

-- Step 4: Make user_id NOT NULL and add foreign key
ALTER TABLE recipes 
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 5: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- Step 6: Update RLS policies to use user_id
DROP POLICY IF EXISTS "Users can read own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- Create new policies with user_id check
CREATE POLICY "Users can read own recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
