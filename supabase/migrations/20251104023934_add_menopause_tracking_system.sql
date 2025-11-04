/*
  # Menopause Tracking System - Complete Integration

  ## Summary
  This migration adds comprehensive menopause tracking capabilities to TwinForge, 
  allowing women to seamlessly transition from menstrual cycle tracking to 
  perimenopause, menopause, and postmenopause management.

  ## 1. New Tables Created
  
  ### `menopause_tracking`
  Stores core menopause status and medical data for each user
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `reproductive_status` (text) - Current status: 'menstruating', 'perimenopause', 'menopause', 'postmenopause'
  - `perimenopause_stage` (text, nullable) - Early or late stage if in perimenopause
  - `last_period_date` (date, nullable) - Date of last menstrual period
  - `menopause_confirmation_date` (date, nullable) - Date when 12 months no period reached
  - `fsh_level` (numeric, nullable) - FSH hormone level (optional medical data)
  - `estrogen_level` (numeric, nullable) - Estrogen level (optional medical data)
  - `last_hormone_test_date` (date, nullable) - Date of last hormone test
  - `notes` (text, nullable) - Free-form notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `menopause_symptoms_log`
  Daily symptom tracking for detailed monitoring
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `symptom_date` (date) - Date of symptom occurrence
  - `hot_flashes_intensity` (integer, nullable) - Intensity 0-10
  - `night_sweats_intensity` (integer, nullable) - Intensity 0-10
  - `sleep_quality` (integer, nullable) - Quality 0-10 (10 = excellent)
  - `mood_changes_intensity` (integer, nullable) - Intensity 0-10
  - `vaginal_dryness_intensity` (integer, nullable) - Intensity 0-10
  - `energy_level` (integer, nullable) - Level 0-10 (10 = high energy)
  - `brain_fog_intensity` (integer, nullable) - Intensity 0-10
  - `joint_pain_intensity` (integer, nullable) - Intensity 0-10
  - `heart_palpitations` (boolean, default false) - Presence of palpitations
  - `weight_gain` (numeric, nullable) - Weight change in kg
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ## 2. Security (RLS)
  
  All tables have strict Row Level Security:
  - SELECT: Users can only view their own data
  - INSERT: Users can only insert their own data
  - UPDATE: Users can only update their own data
  - DELETE: Users can only delete their own data

  ## 3. Indexes
  
  Performance indexes on:
  - `menopause_tracking.user_id` for fast user lookup
  - `menopause_symptoms_log.user_id, symptom_date` for efficient symptom queries
  - `menopause_tracking.reproductive_status` for filtering

  ## Important Notes
  
  - All menopause data is highly sensitive and encrypted at rest
  - Medical data (FSH, estrogen) is optional and stored only if user provides it
  - System supports smooth transitions between all reproductive stages
  - Backward compatible with existing menstrual cycle tracking
*/

-- 1. Create menopause_tracking table
CREATE TABLE IF NOT EXISTS menopause_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reproductive_status text NOT NULL DEFAULT 'menstruating',
  perimenopause_stage text,
  last_period_date date,
  menopause_confirmation_date date,
  fsh_level numeric,
  estrogen_level numeric,
  last_hormone_test_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_reproductive_status CHECK (
    reproductive_status IN ('menstruating', 'perimenopause', 'menopause', 'postmenopause')
  ),
  CONSTRAINT valid_perimenopause_stage CHECK (
    perimenopause_stage IS NULL OR perimenopause_stage IN ('early', 'late')
  ),
  CONSTRAINT valid_fsh_level CHECK (fsh_level IS NULL OR fsh_level >= 0),
  CONSTRAINT valid_estrogen_level CHECK (estrogen_level IS NULL OR estrogen_level >= 0),
  
  -- One record per user
  UNIQUE(user_id)
);

-- 2. Create menopause_symptoms_log table
CREATE TABLE IF NOT EXISTS menopause_symptoms_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_date date NOT NULL DEFAULT CURRENT_DATE,
  hot_flashes_intensity integer,
  night_sweats_intensity integer,
  sleep_quality integer,
  mood_changes_intensity integer,
  vaginal_dryness_intensity integer,
  energy_level integer,
  brain_fog_intensity integer,
  joint_pain_intensity integer,
  heart_palpitations boolean DEFAULT false,
  weight_gain numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  
  -- Constraints for intensity values (0-10)
  CONSTRAINT valid_hot_flashes CHECK (hot_flashes_intensity IS NULL OR (hot_flashes_intensity >= 0 AND hot_flashes_intensity <= 10)),
  CONSTRAINT valid_night_sweats CHECK (night_sweats_intensity IS NULL OR (night_sweats_intensity >= 0 AND night_sweats_intensity <= 10)),
  CONSTRAINT valid_sleep_quality CHECK (sleep_quality IS NULL OR (sleep_quality >= 0 AND sleep_quality <= 10)),
  CONSTRAINT valid_mood_changes CHECK (mood_changes_intensity IS NULL OR (mood_changes_intensity >= 0 AND mood_changes_intensity <= 10)),
  CONSTRAINT valid_vaginal_dryness CHECK (vaginal_dryness_intensity IS NULL OR (vaginal_dryness_intensity >= 0 AND vaginal_dryness_intensity <= 10)),
  CONSTRAINT valid_energy_level CHECK (energy_level IS NULL OR (energy_level >= 0 AND energy_level <= 10)),
  CONSTRAINT valid_brain_fog CHECK (brain_fog_intensity IS NULL OR (brain_fog_intensity >= 0 AND brain_fog_intensity <= 10)),
  CONSTRAINT valid_joint_pain CHECK (joint_pain_intensity IS NULL OR (joint_pain_intensity >= 0 AND joint_pain_intensity <= 10)),
  
  -- One entry per user per date
  UNIQUE(user_id, symptom_date)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menopause_tracking_user_id ON menopause_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_menopause_tracking_status ON menopause_tracking(reproductive_status);
CREATE INDEX IF NOT EXISTS idx_menopause_symptoms_user_date ON menopause_symptoms_log(user_id, symptom_date DESC);

-- 4. Enable Row Level Security
ALTER TABLE menopause_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE menopause_symptoms_log ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for menopause_tracking

-- SELECT: Users can view their own data
CREATE POLICY "Users can view own menopause tracking"
  ON menopause_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can insert their own data
CREATE POLICY "Users can insert own menopause tracking"
  ON menopause_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own data
CREATE POLICY "Users can update own menopause tracking"
  ON menopause_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own data
CREATE POLICY "Users can delete own menopause tracking"
  ON menopause_tracking
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Create RLS Policies for menopause_symptoms_log

-- SELECT: Users can view their own symptoms
CREATE POLICY "Users can view own menopause symptoms"
  ON menopause_symptoms_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can log their own symptoms
CREATE POLICY "Users can insert own menopause symptoms"
  ON menopause_symptoms_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own symptoms
CREATE POLICY "Users can update own menopause symptoms"
  ON menopause_symptoms_log
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own symptoms
CREATE POLICY "Users can delete own menopause symptoms"
  ON menopause_symptoms_log
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Create updated_at trigger for menopause_tracking
CREATE OR REPLACE FUNCTION update_menopause_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_menopause_tracking_updated_at'
  ) THEN
    CREATE TRIGGER set_menopause_tracking_updated_at
      BEFORE UPDATE ON menopause_tracking
      FOR EACH ROW
      EXECUTE FUNCTION update_menopause_tracking_updated_at();
  END IF;
END $$;
