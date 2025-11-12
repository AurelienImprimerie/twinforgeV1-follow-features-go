/*
  # Fix xp_attribution_audit RLS - Add INSERT policy
  
  1. Changes
    - Add INSERT policy to allow users to create their own audit logs
    - The function award_xp_idempotent needs to insert into this table
  
  2. Security
    - Users can only insert audit logs for themselves (auth.uid() = user_id)
    - This allows the RPC function to work properly while maintaining security
*/

-- Add INSERT policy for xp_attribution_audit
CREATE POLICY "Users can insert own XP audit logs"
  ON xp_attribution_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
