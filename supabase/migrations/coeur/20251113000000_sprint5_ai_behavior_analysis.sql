/*
  # Sprint 5: Agent IA Bonus Intelligents

  1. New Tables
    - `user_ai_analysis_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `period_start` (date)
      - `period_end` (date)
      - `nutrition_score` (integer 0-100)
      - `training_score` (integer 0-100)
      - `consistency_score` (integer 0-100)
      - `progression_score` (integer 0-100)
      - `overall_score` (integer 0-100)
      - `xp_awarded` (integer)
      - `quality_rating` (text: excellent|good|fair|needs_improvement)
      - `analysis` (text)
      - `strengths` (text[])
      - `improvements` (text[])
      - `actionable_tips` (text[])
      - `motivational_message` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_ai_analysis_history` table
    - Add policies for users to read their own analysis history
    - Admin-only write access through edge functions

  3. Indexes
    - Index on `user_id` for fast user lookups
    - Composite index on `(user_id, period_start, period_end)` for idempotence
    - Index on `created_at` for chronological sorting

  4. Important Notes
    - Table stores complete AI analysis results for audit trail
    - Unique constraint on (user_id, period_start, period_end) prevents duplicates
    - quality_rating enables segmentation and analytics
    - Scores stored for trending and comparison
*/

-- Create user_ai_analysis_history table
CREATE TABLE IF NOT EXISTS user_ai_analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  nutrition_score integer NOT NULL CHECK (nutrition_score >= 0 AND nutrition_score <= 100),
  training_score integer NOT NULL CHECK (training_score >= 0 AND training_score <= 100),
  consistency_score integer NOT NULL CHECK (consistency_score >= 0 AND consistency_score <= 100),
  progression_score integer NOT NULL CHECK (progression_score >= 0 AND progression_score <= 100),
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  xp_awarded integer NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0 AND xp_awarded <= 500),
  quality_rating text NOT NULL CHECK (quality_rating IN ('excellent', 'good', 'fair', 'needs_improvement')),
  analysis text NOT NULL,
  strengths text[] NOT NULL DEFAULT '{}',
  improvements text[] NOT NULL DEFAULT '{}',
  actionable_tips text[] NOT NULL DEFAULT '{}',
  motivational_message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start, period_end)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON user_ai_analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_period ON user_ai_analysis_history(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON user_ai_analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_quality_rating ON user_ai_analysis_history(quality_rating);

-- Enable Row Level Security
ALTER TABLE user_ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own AI analysis history
CREATE POLICY "Users can view own AI analysis history"
  ON user_ai_analysis_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service role can insert AI analysis (via edge functions)
CREATE POLICY "Service role can insert AI analysis"
  ON user_ai_analysis_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Service role can update AI analysis
CREATE POLICY "Service role can update AI analysis"
  ON user_ai_analysis_history
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_analysis_updated_at
  BEFORE UPDATE ON user_ai_analysis_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Get latest AI analysis for user
CREATE OR REPLACE FUNCTION get_latest_ai_analysis(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  period_start date,
  period_end date,
  nutrition_score integer,
  training_score integer,
  consistency_score integer,
  progression_score integer,
  overall_score integer,
  xp_awarded integer,
  quality_rating text,
  analysis text,
  strengths text[],
  improvements text[],
  actionable_tips text[],
  motivational_message text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.period_start,
    h.period_end,
    h.nutrition_score,
    h.training_score,
    h.consistency_score,
    h.progression_score,
    h.overall_score,
    h.xp_awarded,
    h.quality_rating,
    h.analysis,
    h.strengths,
    h.improvements,
    h.actionable_tips,
    h.motivational_message,
    h.created_at
  FROM user_ai_analysis_history h
  WHERE h.user_id = p_user_id
  ORDER BY h.created_at DESC
  LIMIT 1;
END;
$$;

-- Function: Get AI analysis history for user
CREATE OR REPLACE FUNCTION get_ai_analysis_history(
  p_user_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  period_start date,
  period_end date,
  nutrition_score integer,
  training_score integer,
  consistency_score integer,
  progression_score integer,
  overall_score integer,
  xp_awarded integer,
  quality_rating text,
  analysis text,
  strengths text[],
  improvements text[],
  actionable_tips text[],
  motivational_message text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.period_start,
    h.period_end,
    h.nutrition_score,
    h.training_score,
    h.consistency_score,
    h.progression_score,
    h.overall_score,
    h.xp_awarded,
    h.quality_rating,
    h.analysis,
    h.strengths,
    h.improvements,
    h.actionable_tips,
    h.motivational_message,
    h.created_at
  FROM user_ai_analysis_history h
  WHERE h.user_id = p_user_id
  ORDER BY h.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function: Get AI analysis stats for user
CREATE OR REPLACE FUNCTION get_ai_analysis_stats(p_user_id uuid)
RETURNS TABLE (
  total_analyses integer,
  avg_overall_score numeric,
  avg_xp_awarded numeric,
  excellent_count integer,
  good_count integer,
  fair_count integer,
  needs_improvement_count integer,
  trend_direction text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_latest_scores integer[];
  v_previous_scores integer[];
  v_trend_direction text;
BEGIN
  -- Get counts by quality rating
  SELECT
    COUNT(*)::integer,
    ROUND(AVG(overall_score), 1),
    ROUND(AVG(xp_awarded), 0),
    COUNT(*) FILTER (WHERE quality_rating = 'excellent')::integer,
    COUNT(*) FILTER (WHERE quality_rating = 'good')::integer,
    COUNT(*) FILTER (WHERE quality_rating = 'fair')::integer,
    COUNT(*) FILTER (WHERE quality_rating = 'needs_improvement')::integer
  INTO
    total_analyses,
    avg_overall_score,
    avg_xp_awarded,
    excellent_count,
    good_count,
    fair_count,
    needs_improvement_count
  FROM user_ai_analysis_history
  WHERE user_id = p_user_id;

  -- Calculate trend (last 3 vs previous 3)
  SELECT ARRAY_AGG(overall_score ORDER BY created_at DESC)
  INTO v_latest_scores
  FROM (
    SELECT overall_score, created_at
    FROM user_ai_analysis_history
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 3
  ) latest;

  SELECT ARRAY_AGG(overall_score ORDER BY created_at DESC)
  INTO v_previous_scores
  FROM (
    SELECT overall_score, created_at
    FROM user_ai_analysis_history
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    OFFSET 3
    LIMIT 3
  ) previous;

  IF ARRAY_LENGTH(v_latest_scores, 1) >= 2 AND ARRAY_LENGTH(v_previous_scores, 1) >= 2 THEN
    IF (SELECT AVG(s) FROM UNNEST(v_latest_scores) s) > (SELECT AVG(s) FROM UNNEST(v_previous_scores) s) + 5 THEN
      v_trend_direction := 'improving';
    ELSIF (SELECT AVG(s) FROM UNNEST(v_latest_scores) s) < (SELECT AVG(s) FROM UNNEST(v_previous_scores) s) - 5 THEN
      v_trend_direction := 'declining';
    ELSE
      v_trend_direction := 'stable';
    END IF;
  ELSE
    v_trend_direction := 'insufficient_data';
  END IF;

  trend_direction := v_trend_direction;

  RETURN QUERY SELECT
    total_analyses,
    avg_overall_score,
    avg_xp_awarded,
    excellent_count,
    good_count,
    fair_count,
    needs_improvement_count,
    v_trend_direction;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON user_ai_analysis_history TO authenticated;
GRANT ALL ON user_ai_analysis_history TO service_role;
GRANT EXECUTE ON FUNCTION get_latest_ai_analysis(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_analysis_history(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_analysis_stats(uuid) TO authenticated;

-- Add comment
COMMENT ON TABLE user_ai_analysis_history IS 'Sprint 5: AI-powered weekly behavior analysis with personalized recommendations and intelligent bonus attribution';
