/*
  # Add Exercise Reference Table

  1. New Tables
    - `exercise_reference`
      - `id` (uuid, primary key)
      - `exercise_slug` (text, unique) - Technical identifier
      - `display_name` (text) - Human-readable name
      - `mets_value` (decimal) - Metabolic Equivalent of Task
      - `difficulty_coefficient` (decimal) - Exercise difficulty multiplier
      - `muscle_groups` (text[]) - Primary muscle groups engaged
      - `typical_1rm_bodyweight_ratio` (decimal) - Average 1RM as ratio of bodyweight
      - `category` (text) - strength, cardio, functional, calisthenics
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `exercise_reference` table
    - Public read access (reference data)
    - Admin-only write access

  3. Indexes
    - Unique index on exercise_slug for fast lookups
    - Index on category for filtering

  4. Important Notes
    - METs values based on scientific research for accurate calorie estimation
    - Difficulty coefficients used for intensity calculations
    - Pre-populated with common exercises
*/

-- Create exercise_reference table
CREATE TABLE IF NOT EXISTS exercise_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  mets_value decimal(4,2) NOT NULL CHECK (mets_value > 0 AND mets_value <= 20),
  difficulty_coefficient decimal(3,2) NOT NULL DEFAULT 1.0 CHECK (difficulty_coefficient > 0 AND difficulty_coefficient <= 3.0),
  muscle_groups text[] NOT NULL DEFAULT '{}',
  typical_1rm_bodyweight_ratio decimal(3,2),
  category text NOT NULL CHECK (category IN ('strength', 'cardio', 'functional', 'calisthenics', 'endurance')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_reference_slug ON exercise_reference(exercise_slug);
CREATE INDEX IF NOT EXISTS idx_exercise_reference_category ON exercise_reference(category);

-- Enable Row Level Security
ALTER TABLE exercise_reference ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read exercise reference data
CREATE POLICY "Public read access to exercise reference"
  ON exercise_reference
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only service role can insert/update
CREATE POLICY "Service role can manage exercise reference"
  ON exercise_reference
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed data with common exercises
INSERT INTO exercise_reference (exercise_slug, display_name, mets_value, difficulty_coefficient, muscle_groups, typical_1rm_bodyweight_ratio, category) VALUES
  -- Powerlifting / Strength
  ('squat', 'Squat', 6.0, 1.3, ARRAY['legs', 'glutes', 'core'], 1.8, 'strength'),
  ('squat_axle_bar_deadlift', 'Squat Axle Bar Deadlift', 6.5, 1.4, ARRAY['legs', 'back', 'core'], 1.8, 'strength'),
  ('box_squat_wide_stance', 'Box Squat Wide Stance', 6.0, 1.2, ARRAY['legs', 'glutes'], 1.7, 'strength'),
  ('deadlift', 'Deadlift', 6.5, 1.5, ARRAY['back', 'legs', 'grip', 'core'], 2.0, 'strength'),
  ('bench_press', 'Bench Press', 5.0, 1.2, ARRAY['chest', 'triceps', 'shoulders'], 1.2, 'strength'),
  ('overhead_press', 'Overhead Press', 5.5, 1.3, ARRAY['shoulders', 'triceps', 'core'], 0.7, 'strength'),
  ('front_squat', 'Front Squat', 6.0, 1.3, ARRAY['legs', 'core', 'upper_back'], 1.5, 'strength'),
  ('romanian_deadlift', 'Romanian Deadlift', 6.0, 1.2, ARRAY['hamstrings', 'glutes', 'back'], 1.5, 'strength'),
  ('sumo_deadlift', 'Sumo Deadlift', 6.5, 1.4, ARRAY['legs', 'back', 'glutes'], 1.9, 'strength'),

  -- Isolation / Accessory
  ('bicep_curl', 'Bicep Curl', 3.5, 0.8, ARRAY['biceps'], 0.3, 'strength'),
  ('tricep_extension', 'Tricep Extension', 3.5, 0.8, ARRAY['triceps'], 0.3, 'strength'),
  ('lateral_raise', 'Lateral Raise', 3.5, 0.9, ARRAY['shoulders'], 0.2, 'strength'),
  ('leg_press', 'Leg Press', 5.5, 1.1, ARRAY['legs', 'glutes'], 2.5, 'strength'),
  ('leg_curl', 'Leg Curl', 4.0, 0.9, ARRAY['hamstrings'], 0.5, 'strength'),
  ('leg_extension', 'Leg Extension', 4.0, 0.9, ARRAY['quadriceps'], 0.5, 'strength'),

  -- Functional / CrossFit
  ('clean_and_jerk', 'Clean and Jerk', 7.0, 1.8, ARRAY['full_body', 'shoulders', 'legs'], 1.0, 'functional'),
  ('snatch', 'Snatch', 7.5, 1.9, ARRAY['full_body', 'shoulders', 'legs'], 0.8, 'functional'),
  ('thruster', 'Thruster', 7.0, 1.6, ARRAY['legs', 'shoulders', 'core'], 0.8, 'functional'),
  ('wall_ball', 'Wall Ball', 6.0, 1.3, ARRAY['legs', 'shoulders', 'core'], 0.6, 'functional'),
  ('burpee', 'Burpee', 8.0, 1.5, ARRAY['full_body'], NULL, 'functional'),
  ('box_jump', 'Box Jump', 7.0, 1.4, ARRAY['legs', 'power'], NULL, 'functional'),
  ('rowing_machine', 'Rowing Machine', 7.0, 1.3, ARRAY['back', 'legs', 'cardio'], NULL, 'cardio'),
  ('assault_bike', 'Assault Bike', 8.5, 1.5, ARRAY['full_body', 'cardio'], NULL, 'cardio'),

  -- Calisthenics
  ('pull_up', 'Pull Up', 6.0, 1.4, ARRAY['back', 'biceps'], NULL, 'calisthenics'),
  ('push_up', 'Push Up', 4.5, 1.0, ARRAY['chest', 'triceps', 'core'], NULL, 'calisthenics'),
  ('dip', 'Dip', 5.5, 1.3, ARRAY['chest', 'triceps'], NULL, 'calisthenics'),
  ('muscle_up', 'Muscle Up', 7.5, 1.9, ARRAY['back', 'chest', 'core'], NULL, 'calisthenics'),
  ('handstand_push_up', 'Handstand Push Up', 7.0, 1.8, ARRAY['shoulders', 'triceps', 'core'], NULL, 'calisthenics'),

  -- Endurance
  ('running', 'Running', 9.8, 1.2, ARRAY['legs', 'cardio'], NULL, 'endurance'),
  ('cycling', 'Cycling', 8.0, 1.1, ARRAY['legs', 'cardio'], NULL, 'endurance'),
  ('swimming', 'Swimming', 8.0, 1.3, ARRAY['full_body', 'cardio'], NULL, 'endurance')
ON CONFLICT (exercise_slug) DO NOTHING;
