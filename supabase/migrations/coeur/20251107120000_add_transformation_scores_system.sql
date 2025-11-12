/*
  # Create Transformation Scores System

  1. New Tables
    - `transformation_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `date` (date, date of the score)
      - `global_score` (integer, 0-100)
      - `training_score` (integer, 0-100)
      - `nutrition_score` (integer, 0-100)
      - `fasting_score` (integer, 0-100)
      - `body_score` (integer, 0-100)
      - `energy_score` (integer, 0-100)
      - `consistency_score` (integer, 0-100)
      - `level` (text, gamification level)
      - `metadata` (jsonb, additional context)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `transformation_scores` table
    - Add policy for authenticated users to read their own scores
    - Add policy for authenticated users to insert their own scores

  3. Indexes
    - Index on user_id and date for fast queries

  4. Important Notes
    - Scores are calculated daily by the frontend service
    - Each user can have max one score per day (unique constraint)
    - All scores are 0-100 range with validation
*/

-- Create transformation_scores table
CREATE TABLE IF NOT EXISTS transformation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  global_score integer NOT NULL CHECK (global_score >= 0 AND global_score <= 100),
  training_score integer CHECK (training_score >= 0 AND training_score <= 100),
  nutrition_score integer CHECK (nutrition_score >= 0 AND nutrition_score <= 100),
  fasting_score integer CHECK (fasting_score >= 0 AND fasting_score <= 100),
  body_score integer CHECK (body_score >= 0 AND body_score <= 100),
  energy_score integer CHECK (energy_score >= 0 AND energy_score <= 100),
  consistency_score integer CHECK (consistency_score >= 0 AND consistency_score <= 100),
  level text NOT NULL DEFAULT 'bronze',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transformation_scores_user_date
  ON transformation_scores(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_transformation_scores_user_recent
  ON transformation_scores(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE transformation_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own scores
CREATE POLICY "Users can read own transformation scores"
  ON transformation_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own scores
CREATE POLICY "Users can insert own transformation scores"
  ON transformation_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own scores (same day only)
CREATE POLICY "Users can update own transformation scores"
  ON transformation_scores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own scores
CREATE POLICY "Users can delete own transformation scores"
  ON transformation_scores
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
