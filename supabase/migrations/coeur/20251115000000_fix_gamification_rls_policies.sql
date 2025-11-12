/*
  # Fix Gamification RLS Policies

  ## Problem
  Tables have RLS enabled but NO policies exist, blocking all operations.
  Error: "new row violates row-level security policy for table xp_events_log"

  ## Solution
  Add comprehensive RLS policies for all gamification tables to allow:
  - Users to read their own data
  - System (via functions with SECURITY DEFINER) to write data
  - Authenticated users to access their gamification data

  ## Tables Fixed
  1. user_gamification_progress - User XP and level data
  2. xp_events_log - XP event history
  3. level_milestones - Level definitions (public read)
  4. weight_updates_history - Weight tracking with XP
  5. daily_actions - Action definitions (public read)
  6. daily_actions_completed - User completed actions
  7. transformation_predictions - User predictions
  8. user_records - Personal records
  9. leaderboard_settings - User leaderboard preferences
  10. leaderboard_snapshots - Leaderboard history (public read)
*/

-- =============================================
-- USER_GAMIFICATION_PROGRESS POLICIES
-- =============================================

CREATE POLICY "Users can view own gamification progress"
  ON user_gamification_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification progress"
  ON user_gamification_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification progress"
  ON user_gamification_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- XP_EVENTS_LOG POLICIES
-- =============================================

CREATE POLICY "Users can view own XP events"
  ON xp_events_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP events"
  ON xp_events_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- LEVEL_MILESTONES POLICIES (Public Read)
-- =============================================

CREATE POLICY "Anyone can view level milestones"
  ON level_milestones FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- WEIGHT_UPDATES_HISTORY POLICIES
-- =============================================

CREATE POLICY "Users can view own weight updates"
  ON weight_updates_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight updates"
  ON weight_updates_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- DAILY_ACTIONS POLICIES (Public Read)
-- =============================================

CREATE POLICY "Anyone can view daily actions"
  ON daily_actions FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- DAILY_ACTIONS_COMPLETED POLICIES
-- =============================================

CREATE POLICY "Users can view own completed actions"
  ON daily_actions_completed FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed actions"
  ON daily_actions_completed FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completed actions"
  ON daily_actions_completed FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completed actions"
  ON daily_actions_completed FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- TRANSFORMATION_PREDICTIONS POLICIES
-- =============================================

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

-- =============================================
-- USER_RECORDS POLICIES
-- =============================================

CREATE POLICY "Users can view own records"
  ON user_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records"
  ON user_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON user_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- LEADERBOARD_SETTINGS POLICIES
-- =============================================

CREATE POLICY "Users can view own leaderboard settings"
  ON leaderboard_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leaderboard settings"
  ON leaderboard_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard settings"
  ON leaderboard_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- LEADERBOARD_SNAPSHOTS POLICIES (Public Read)
-- =============================================

CREATE POLICY "Anyone can view leaderboard snapshots"
  ON leaderboard_snapshots FOR SELECT
  TO authenticated
  USING (true);
