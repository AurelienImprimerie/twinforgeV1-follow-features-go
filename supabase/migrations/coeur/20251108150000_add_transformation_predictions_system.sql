/*
  # Transformation Predictions System

  1. New Tables
    - `transformation_predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `predicted_date` (timestamptz) - Realistic scenario achievement date
      - `confidence_score` (integer) - 0-100 confidence in prediction
      - `current_weight` (decimal) - Weight at time of prediction
      - `target_weight` (decimal) - Target weight
      - `weight_to_go` (decimal) - Remaining weight to lose/gain
      - `weekly_trend` (decimal) - Average kg change per week
      - `days_to_target` (integer) - Estimated days to reach target
      - `optimistic_date` (timestamptz) - Best case scenario
      - `pessimistic_date` (timestamptz) - Worst case scenario
      - `data_points` (integer) - Number of weight records used
      - `influence_factors` (jsonb) - Activity, consistency, caloric balance scores
      - `recommendations` (jsonb) - AI-generated adjustment suggestions
      - `is_active` (boolean) - Current prediction vs historical
      - `prediction_accuracy` (decimal) - Tracked after achievement
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `prediction_milestones`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `prediction_id` (uuid, foreign key to transformation_predictions)
      - `milestone_type` (text) - 'quarter_way', 'halfway', 'three_quarters', 'achieved'
      - `milestone_weight` (decimal) - Weight at milestone
      - `predicted_date` (timestamptz) - When milestone should be reached
      - `actual_date` (timestamptz) - When milestone was actually reached
      - `status` (text) - 'pending', 'on_track', 'ahead', 'behind', 'achieved'
      - `variance_days` (integer) - Days ahead/behind schedule
      - `created_at` (timestamptz)
      - `achieved_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own predictions
    - Secure prediction data from unauthorized access

  3. Indexes
    - Index on user_id for fast user prediction lookups
    - Index on is_active for current predictions
    - Index on created_at for historical tracking
*/

-- Create transformation_predictions table
CREATE TABLE IF NOT EXISTS transformation_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Prediction Core Data
  predicted_date timestamptz NOT NULL,
  confidence_score integer NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Weight Data
  current_weight decimal(5,2) NOT NULL,
  target_weight decimal(5,2) NOT NULL,
  weight_to_go decimal(5,2) NOT NULL,
  weekly_trend decimal(4,2) NOT NULL,
  days_to_target integer NOT NULL,

  -- Scenarios
  optimistic_date timestamptz NOT NULL,
  pessimistic_date timestamptz NOT NULL,

  -- Metadata
  data_points integer NOT NULL DEFAULT 0,
  influence_factors jsonb DEFAULT '{}',
  recommendations jsonb DEFAULT '[]',

  -- Status
  is_active boolean NOT NULL DEFAULT true,
  prediction_accuracy decimal(5,2),

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prediction_milestones table
CREATE TABLE IF NOT EXISTS prediction_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id uuid NOT NULL REFERENCES transformation_predictions(id) ON DELETE CASCADE,

  milestone_type text NOT NULL CHECK (milestone_type IN ('quarter_way', 'halfway', 'three_quarters', 'achieved')),
  milestone_weight decimal(5,2) NOT NULL,

  predicted_date timestamptz NOT NULL,
  actual_date timestamptz,

  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'on_track', 'ahead', 'behind', 'achieved')),
  variance_days integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  achieved_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transformation_predictions_user_id
  ON transformation_predictions(user_id);

CREATE INDEX IF NOT EXISTS idx_transformation_predictions_is_active
  ON transformation_predictions(user_id, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_transformation_predictions_created_at
  ON transformation_predictions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prediction_milestones_user_id
  ON prediction_milestones(user_id);

CREATE INDEX IF NOT EXISTS idx_prediction_milestones_prediction_id
  ON prediction_milestones(prediction_id);

CREATE INDEX IF NOT EXISTS idx_prediction_milestones_status
  ON prediction_milestones(user_id, status);

-- Enable Row Level Security
ALTER TABLE transformation_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transformation_predictions
CREATE POLICY "Users can view own predictions"
  ON transformation_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON transformation_predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON transformation_predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions"
  ON transformation_predictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for prediction_milestones
CREATE POLICY "Users can view own milestones"
  ON prediction_milestones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON prediction_milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON prediction_milestones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON prediction_milestones FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to deactivate previous predictions when creating a new one
CREATE OR REPLACE FUNCTION deactivate_previous_predictions()
RETURNS TRIGGER AS $$
BEGIN
  -- Deactivate all previous active predictions for this user
  UPDATE transformation_predictions
  SET is_active = false, updated_at = now()
  WHERE user_id = NEW.user_id
    AND is_active = true
    AND id != NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically deactivate old predictions
DROP TRIGGER IF EXISTS trigger_deactivate_previous_predictions ON transformation_predictions;
CREATE TRIGGER trigger_deactivate_previous_predictions
  AFTER INSERT ON transformation_predictions
  FOR EACH ROW
  EXECUTE FUNCTION deactivate_previous_predictions();

-- Function to update milestone status based on current progress
CREATE OR REPLACE FUNCTION update_milestone_status(
  p_user_id uuid,
  p_current_weight decimal,
  p_target_weight decimal
)
RETURNS void AS $$
DECLARE
  v_milestone RECORD;
  v_variance integer;
  v_new_status text;
BEGIN
  -- Get active prediction milestones
  FOR v_milestone IN
    SELECT pm.*, tp.weekly_trend
    FROM prediction_milestones pm
    JOIN transformation_predictions tp ON pm.prediction_id = tp.id
    WHERE pm.user_id = p_user_id
      AND pm.status != 'achieved'
      AND tp.is_active = true
  LOOP
    -- Check if milestone weight has been reached
    IF (p_target_weight > p_current_weight AND p_current_weight <= v_milestone.milestone_weight) OR
       (p_target_weight < p_current_weight AND p_current_weight >= v_milestone.milestone_weight) THEN

      -- Calculate variance in days
      v_variance := EXTRACT(days FROM (now() - v_milestone.predicted_date))::integer;

      -- Mark as achieved
      UPDATE prediction_milestones
      SET status = 'achieved',
          actual_date = now(),
          achieved_at = now(),
          variance_days = v_variance
      WHERE id = v_milestone.id;

    ELSE
      -- Check if on track, ahead, or behind
      v_variance := EXTRACT(days FROM (now() - v_milestone.predicted_date))::integer;

      IF v_variance <= -7 THEN
        v_new_status := 'ahead';
      ELSIF v_variance >= 7 THEN
        v_new_status := 'behind';
      ELSE
        v_new_status := 'on_track';
      END IF;

      UPDATE prediction_milestones
      SET status = v_new_status,
          variance_days = v_variance
      WHERE id = v_milestone.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate prediction milestones when creating a new prediction
CREATE OR REPLACE FUNCTION generate_prediction_milestones()
RETURNS TRIGGER AS $$
DECLARE
  v_weight_diff decimal;
  v_quarter_weight decimal;
  v_half_weight decimal;
  v_three_quarter_weight decimal;
  v_days_diff integer;
BEGIN
  v_weight_diff := NEW.target_weight - NEW.current_weight;
  v_days_diff := NEW.days_to_target;

  -- Calculate milestone weights
  v_quarter_weight := NEW.current_weight + (v_weight_diff * 0.25);
  v_half_weight := NEW.current_weight + (v_weight_diff * 0.5);
  v_three_quarter_weight := NEW.current_weight + (v_weight_diff * 0.75);

  -- Insert milestones
  INSERT INTO prediction_milestones (user_id, prediction_id, milestone_type, milestone_weight, predicted_date)
  VALUES
    (NEW.user_id, NEW.id, 'quarter_way', v_quarter_weight, NEW.created_at + (v_days_diff * 0.25 || ' days')::interval),
    (NEW.user_id, NEW.id, 'halfway', v_half_weight, NEW.created_at + (v_days_diff * 0.5 || ' days')::interval),
    (NEW.user_id, NEW.id, 'three_quarters', v_three_quarter_weight, NEW.created_at + (v_days_diff * 0.75 || ' days')::interval),
    (NEW.user_id, NEW.id, 'achieved', NEW.target_weight, NEW.predicted_date);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate milestones on prediction creation
DROP TRIGGER IF EXISTS trigger_generate_prediction_milestones ON transformation_predictions;
CREATE TRIGGER trigger_generate_prediction_milestones
  AFTER INSERT ON transformation_predictions
  FOR EACH ROW
  EXECUTE FUNCTION generate_prediction_milestones();
