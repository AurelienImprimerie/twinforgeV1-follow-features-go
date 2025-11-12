/*
  # Intelligent Dashboard System V2 - Enhanced Features

  ## Summary
  Enhancements to the dashboard system for real-world user behavior tracking,
  dynamic scoring based on actual actions, and AI-powered personalized insights.

  ## 1. New Tables

  ### user_daily_expectations
  Defines personalized daily expectations for each user based on their profile and objectives
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `meals_per_day_min` (integer) - Minimum meals to scan per day (1-3)
  - `training_sessions_per_week` (integer) - Expected training sessions per week
  - `fasting_hours_per_day` (integer) - Fasting hours expected per day
  - `body_scan_frequency_days` (integer) - How often to scan body (default 14 days)
  - `wearable_sync_daily` (boolean) - Whether to sync wearable daily

  ### forge_activity_log
  Detailed log of every action in each forge for precise scoring

  ### ai_insights_cache
  Cache AI-generated insights to optimize token usage

  ### milestone_achievements
  Track user milestones and badges

  ### smart_notifications_queue
  Intelligent notification queue with context awareness

  ## 2. Security
  - Enable RLS on all new tables
  - Restrictive policies checking auth.uid() = user_id
*/

-- Create user_daily_expectations table
CREATE TABLE IF NOT EXISTS user_daily_expectations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  meals_per_day_min integer NOT NULL DEFAULT 2 CHECK (meals_per_day_min >= 1 AND meals_per_day_min <= 5),
  training_sessions_per_week integer NOT NULL DEFAULT 3 CHECK (training_sessions_per_week >= 0 AND training_sessions_per_week <= 7),
  fasting_hours_per_day integer NOT NULL DEFAULT 0 CHECK (fasting_hours_per_day >= 0 AND fasting_hours_per_day <= 24),
  body_scan_frequency_days integer NOT NULL DEFAULT 14 CHECK (body_scan_frequency_days >= 1),
  wearable_sync_daily boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_daily_expectations_user_id
  ON user_daily_expectations(user_id);

ALTER TABLE user_daily_expectations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily expectations"
  ON user_daily_expectations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily expectations"
  ON user_daily_expectations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily expectations"
  ON user_daily_expectations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create forge_activity_log table
CREATE TABLE IF NOT EXISTS forge_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forge_type text NOT NULL CHECK (forge_type IN ('training', 'nutrition', 'body_scan', 'fasting', 'wearable', 'general')),
  activity_type text NOT NULL,
  activity_date timestamptz NOT NULL DEFAULT now(),
  activity_data jsonb DEFAULT '{}'::jsonb,
  score_impact numeric DEFAULT 0 CHECK (score_impact >= 0 AND score_impact <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forge_activity_log_user_id
  ON forge_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_forge_activity_log_forge_type
  ON forge_activity_log(forge_type);
CREATE INDEX IF NOT EXISTS idx_forge_activity_log_activity_date
  ON forge_activity_log(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_forge_activity_log_user_forge_date
  ON forge_activity_log(user_id, forge_type, activity_date DESC);

ALTER TABLE forge_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forge activity log"
  ON forge_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own forge activity log"
  ON forge_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create ai_insights_cache table
CREATE TABLE IF NOT EXISTS ai_insights_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('daily_summary', 'weekly_analysis', 'action_recommendation', 'motivational', 'progress_check')),
  insight_key text NOT NULL,
  insight_content jsonb NOT NULL,
  tokens_consumed integer NOT NULL DEFAULT 0,
  valid_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, insight_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_cache_user_id
  ON ai_insights_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_cache_valid_until
  ON ai_insights_cache(valid_until);
CREATE INDEX IF NOT EXISTS idx_ai_insights_cache_user_key
  ON ai_insights_cache(user_id, insight_key);

ALTER TABLE ai_insights_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai insights cache"
  ON ai_insights_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ai insights cache"
  ON ai_insights_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai insights cache"
  ON ai_insights_cache
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_insights_cache
  WHERE valid_until < now();
END;
$$ LANGUAGE plpgsql;

-- Create milestone_achievements table
CREATE TABLE IF NOT EXISTS milestone_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL CHECK (milestone_type IN ('streak', 'weight_loss', 'weight_gain', 'sessions', 'scans', 'consistency', 'transformation')),
  milestone_name text NOT NULL,
  milestone_description text NOT NULL,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  milestone_data jsonb DEFAULT '{}'::jsonb,
  celebrated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_milestone_achievements_user_id
  ON milestone_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_achievements_achieved_at
  ON milestone_achievements(achieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_milestone_achievements_celebrated
  ON milestone_achievements(user_id, celebrated) WHERE NOT celebrated;

ALTER TABLE milestone_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestone achievements"
  ON milestone_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own milestone achievements"
  ON milestone_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestone achievements"
  ON milestone_achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create smart_notifications_queue table
CREATE TABLE IF NOT EXISTS smart_notifications_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('reminder', 'suggestion', 'celebration', 'warning', 'insight')),
  category text NOT NULL CHECK (category IN ('training', 'nutrition', 'body_scan', 'fasting', 'wearable', 'general')),
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  action_url text,
  action_label text,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  sent_at timestamptz,
  opened boolean NOT NULL DEFAULT false,
  opened_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smart_notifications_queue_user_id
  ON smart_notifications_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_queue_scheduled
  ON smart_notifications_queue(scheduled_for) WHERE NOT sent;
CREATE INDEX IF NOT EXISTS idx_smart_notifications_queue_pending
  ON smart_notifications_queue(user_id, sent, scheduled_for) WHERE NOT sent;

ALTER TABLE smart_notifications_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own smart notifications"
  ON smart_notifications_queue
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own smart notifications"
  ON smart_notifications_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own smart notifications"
  ON smart_notifications_queue
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
