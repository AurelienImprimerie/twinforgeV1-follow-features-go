/*
  # Fix RLS Policies for Token System Tables

  ## Overview
  Fixes the 400 errors on ai_analysis_jobs and user_subscriptions tables
  by ensuring proper RLS policies for service_role access.

  ## Changes

  1. ai_analysis_jobs Table
    - Ensure service_role can read/write for caching
    - Users can read their own analysis jobs
    - Add policy for cache reads (no user_id filter needed for service_role)

  2. user_subscriptions Table
    - Ensure service_role can read/write for token balance checks
    - Users can read their own subscriptions
    - Add policy for service_role subscription checks

  3. Security
    - Maintain user data isolation
    - Allow service_role full access for system operations
    - Enable proper caching without RLS conflicts

  ## Notes
  - Fixes the 400 errors seen in Supabase logs
  - Maintains security while allowing system operations
*/

-- ============================================
-- FIX ai_analysis_jobs RLS POLICIES
-- ============================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view own analysis jobs" ON ai_analysis_jobs;
DROP POLICY IF EXISTS "Service role can manage analysis jobs" ON ai_analysis_jobs;

-- Recreate policies with proper access
CREATE POLICY "Users can view own analysis jobs"
  ON ai_analysis_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis jobs"
  ON ai_analysis_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- CRITICAL: Allow service_role full access for caching system
CREATE POLICY "Service role has full access to analysis jobs"
  ON ai_analysis_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add index for cache lookups
CREATE INDEX IF NOT EXISTS idx_ai_analysis_jobs_cache_lookup
  ON ai_analysis_jobs(input_hash, analysis_type, created_at DESC)
  WHERE status = 'completed';

-- ============================================
-- FIX user_subscriptions RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON user_subscriptions;

-- Recreate policies with proper access
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- CRITICAL: Allow service_role full access for token balance checks
CREATE POLICY "Service role has full access to subscriptions"
  ON user_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add index for subscription status lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status_lookup
  ON user_subscriptions(user_id, status)
  WHERE status IN ('active', 'trialing');

-- ============================================
-- FIX user_token_balance RLS POLICIES
-- ============================================

-- Ensure user_token_balance has proper policies
DROP POLICY IF EXISTS "Users can view own token balance" ON user_token_balance;
DROP POLICY IF EXISTS "Service role can manage token balances" ON user_token_balance;

-- Recreate policies
CREATE POLICY "Users can view own token balance"
  ON user_token_balance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- CRITICAL: Allow service_role full access for token operations
CREATE POLICY "Service role has full access to token balances"
  ON user_token_balance FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FIX ai_cost_analytics RLS POLICIES
-- ============================================

-- Ensure ai_cost_analytics has proper policies for logging
CREATE TABLE IF NOT EXISTS ai_cost_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  edge_function_name text NOT NULL,
  operation_type text NOT NULL,
  openai_model text,
  openai_cost_usd numeric(12, 6),
  tokens_charged integer NOT NULL,
  margin_multiplier numeric(4, 2) NOT NULL DEFAULT 5.0,
  margin_percentage numeric(5, 2),
  profit_usd numeric(12, 6),
  revenue_usd numeric(12, 6),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_cost_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own cost analytics" ON ai_cost_analytics;
DROP POLICY IF EXISTS "Service role can manage cost analytics" ON ai_cost_analytics;

-- Create policies
CREATE POLICY "Users can view own cost analytics"
  ON ai_cost_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to cost analytics"
  ON ai_cost_analytics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_ai_cost_analytics_user_date
  ON ai_cost_analytics(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_cost_analytics_function
  ON ai_cost_analytics(edge_function_name, created_at DESC);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Log policy fixes
DO $$
BEGIN
  RAISE NOTICE 'RLS policies fixed for token system tables';
  RAISE NOTICE '- ai_analysis_jobs: service_role can read/write for caching';
  RAISE NOTICE '- user_subscriptions: service_role can read for token checks';
  RAISE NOTICE '- user_token_balance: service_role can manage tokens';
  RAISE NOTICE '- ai_cost_analytics: service_role can log costs';
END $$;
