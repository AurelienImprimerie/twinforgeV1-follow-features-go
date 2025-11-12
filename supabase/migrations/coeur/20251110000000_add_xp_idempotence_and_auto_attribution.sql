/*
  # SPRINT 2: Système d'Attribution XP Automatique avec Idempotence

  ## Résumé
  Migration complète pour automatiser l'attribution XP avec système d'idempotence
  garantissant qu'aucun XP ne peut être attribué deux fois pour le même événement.

  ## 1. Nouvelles Colonnes pour Idempotence

  Ajout de colonnes `xp_event_id` dans toutes les tables sources pour tracker
  si XP a déjà été attribué pour cet enregistrement:
  - `biometric_activities.xp_event_id`
  - `calorie_goal_achievements.xp_event_id`

  ## 2. Table d'Audit XP

  ### xp_attribution_audit
  Tracking de toutes les tentatives d'attribution XP (succès et échecs)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `source_table` (text) - Table source de l'événement
  - `source_record_id` (uuid) - ID de l'enregistrement source
  - `event_type` (text) - Type d'événement XP
  - `xp_amount` (integer) - Montant XP tenté
  - `success` (boolean) - Attribution réussie ou pas
  - `failure_reason` (text) - Raison de l'échec si applicable
  - `attempted_at` (timestamptz)
  - `created_at` (timestamptz)

  ## 3. Fonctions SQL

  ### check_xp_already_awarded(source_table text, source_id uuid)
  Vérifie si XP a déjà été attribué pour un enregistrement source donné

  ### award_xp_idempotent(user_id, event_type, base_xp, source_table, source_id)
  Version idempotente de award_xp qui vérifie avant d'attribuer et log dans audit

  ### auto_award_activity_xp()
  Trigger function pour attribution automatique XP sur INSERT biometric_activities

  ### auto_award_calorie_goal_xp()
  Trigger function pour attribution automatique XP sur INSERT calorie_goal_achievements

  ## 4. Triggers

  - trigger_auto_award_activity_xp sur biometric_activities AFTER INSERT
  - trigger_auto_award_calorie_goal_xp sur calorie_goal_achievements AFTER INSERT

  ## 5. Sécurité

  - Enable RLS sur xp_attribution_audit
  - Policies pour accès utilisateur authentifié uniquement
  - Logs audit pour traçabilité complète

  ## Notes Importantes

  - Le système est IDEMPOTENT: même événement = 1 seule attribution XP
  - Les triggers garantissent l'attribution même si frontend échoue
  - Les appels frontend restent possibles pour feedback UI immédiat
  - Système hybride: backend garantit, frontend optimise UX
*/

-- ============================================
-- 1. ADD IDEMPOTENCE COLUMNS TO SOURCE TABLES
-- ============================================

-- Add xp_event_id to biometric_activities if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'biometric_activities' AND column_name = 'xp_event_id'
  ) THEN
    ALTER TABLE biometric_activities
    ADD COLUMN xp_event_id uuid REFERENCES xp_events_log(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_biometric_activities_xp_event
      ON biometric_activities(xp_event_id);
  END IF;
END $$;

-- Add xp_event_id to calorie_goal_achievements if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calorie_goal_achievements' AND column_name = 'xp_event_id'
  ) THEN
    ALTER TABLE calorie_goal_achievements
    ADD COLUMN xp_event_id uuid REFERENCES xp_events_log(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_calorie_achievements_xp_event
      ON calorie_goal_achievements(xp_event_id);
  END IF;
END $$;

-- ============================================
-- 2. CREATE XP ATTRIBUTION AUDIT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS xp_attribution_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_table text NOT NULL,
  source_record_id uuid NOT NULL,
  event_type text NOT NULL,
  event_category text NOT NULL,
  xp_amount integer NOT NULL,
  success boolean NOT NULL DEFAULT false,
  failure_reason text,
  xp_event_log_id uuid REFERENCES xp_events_log(id) ON DELETE SET NULL,
  attempted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_xp_audit_user_date
  ON xp_attribution_audit(user_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_audit_source
  ON xp_attribution_audit(source_table, source_record_id);

CREATE INDEX IF NOT EXISTS idx_xp_audit_success
  ON xp_attribution_audit(success, attempted_at DESC);

-- Enable RLS
ALTER TABLE xp_attribution_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own audit logs
CREATE POLICY "Users can view own XP audit logs"
  ON xp_attribution_audit
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 3. FUNCTION: check_xp_already_awarded
-- ============================================

CREATE OR REPLACE FUNCTION check_xp_already_awarded(
  p_source_table text,
  p_source_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_xp_event_id uuid;
  v_audit_success boolean;
BEGIN
  -- Check if source record has xp_event_id set
  IF p_source_table = 'biometric_activities' THEN
    SELECT xp_event_id INTO v_xp_event_id
    FROM biometric_activities
    WHERE id = p_source_id;
  ELSIF p_source_table = 'calorie_goal_achievements' THEN
    SELECT xp_event_id INTO v_xp_event_id
    FROM calorie_goal_achievements
    WHERE id = p_source_id;
  END IF;

  -- If xp_event_id is set, XP was already awarded
  IF v_xp_event_id IS NOT NULL THEN
    RETURN true;
  END IF;

  -- Check audit log for successful attribution
  SELECT success INTO v_audit_success
  FROM xp_attribution_audit
  WHERE source_table = p_source_table
    AND source_record_id = p_source_id
    AND success = true
  LIMIT 1;

  -- Return true if found successful attribution
  RETURN COALESCE(v_audit_success, false);
END;
$$;

COMMENT ON FUNCTION check_xp_already_awarded IS
  'Checks if XP has already been awarded for a specific source record';

-- ============================================
-- 4. FUNCTION: award_xp_idempotent
-- ============================================

CREATE OR REPLACE FUNCTION award_xp_idempotent(
  p_user_id uuid,
  p_event_type text,
  p_event_category text,
  p_base_xp integer,
  p_source_table text,
  p_source_record_id uuid,
  p_event_metadata jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_already_awarded boolean;
  v_xp_result jsonb;
  v_xp_event_id uuid;
  v_audit_id uuid;
BEGIN
  -- Check if XP already awarded
  v_already_awarded := check_xp_already_awarded(p_source_table, p_source_record_id);

  IF v_already_awarded THEN
    -- Log failed attempt in audit (idempotence violation)
    INSERT INTO xp_attribution_audit (
      user_id,
      source_table,
      source_record_id,
      event_type,
      event_category,
      xp_amount,
      success,
      failure_reason
    ) VALUES (
      p_user_id,
      p_source_table,
      p_source_record_id,
      p_event_type,
      p_event_category,
      p_base_xp,
      false,
      'XP already awarded for this record (idempotence check)'
    )
    RETURNING id INTO v_audit_id;

    -- Return result indicating XP was already awarded
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'already_awarded',
      'message', 'XP déjà attribué pour cet événement',
      'audit_id', v_audit_id
    );
  END IF;

  -- Award XP using original function
  v_xp_result := award_xp(
    p_user_id,
    p_event_type,
    p_event_category,
    p_base_xp,
    p_event_metadata
  );

  -- Get the xp_event_log_id from the last inserted event
  SELECT id INTO v_xp_event_id
  FROM xp_events_log
  WHERE user_id = p_user_id
    AND event_type = p_event_type
  ORDER BY created_at DESC
  LIMIT 1;

  -- Update source record with xp_event_id
  IF p_source_table = 'biometric_activities' THEN
    UPDATE biometric_activities
    SET xp_event_id = v_xp_event_id
    WHERE id = p_source_record_id;
  ELSIF p_source_table = 'calorie_goal_achievements' THEN
    UPDATE calorie_goal_achievements
    SET xp_event_id = v_xp_event_id
    WHERE id = p_source_record_id;
  END IF;

  -- Log successful attribution in audit
  INSERT INTO xp_attribution_audit (
    user_id,
    source_table,
    source_record_id,
    event_type,
    event_category,
    xp_amount,
    success,
    xp_event_log_id
  ) VALUES (
    p_user_id,
    p_source_table,
    p_source_record_id,
    p_event_type,
    p_event_category,
    p_base_xp,
    true,
    v_xp_event_id
  )
  RETURNING id INTO v_audit_id;

  -- Add success and audit info to result
  v_xp_result := v_xp_result || jsonb_build_object(
    'success', true,
    'audit_id', v_audit_id,
    'xp_event_id', v_xp_event_id
  );

  RETURN v_xp_result;
END;
$$;

COMMENT ON FUNCTION award_xp_idempotent IS
  'Idempotent version of award_xp that checks before awarding and logs in audit';

-- ============================================
-- 5. TRIGGER FUNCTION: auto_award_activity_xp
-- ============================================

CREATE OR REPLACE FUNCTION auto_award_activity_xp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_xp_result jsonb;
  v_base_xp integer;
  v_event_type text;
  v_event_category text;
BEGIN
  -- Determine XP amount based on activity type
  -- Training activities: 30 XP
  -- Endurance activities: 20 XP
  -- Other activities: 15 XP

  v_event_category := 'activity';

  IF NEW.activity_type IN ('strength', 'resistance', 'weightlifting', 'crossfit', 'functional') THEN
    v_base_xp := 30;
    v_event_type := 'training_session_completed';
  ELSIF NEW.activity_type IN ('running', 'cycling', 'swimming', 'cardio') THEN
    v_base_xp := 20;
    v_event_type := 'endurance_session_completed';
  ELSE
    v_base_xp := 15;
    v_event_type := 'activity_logged';
  END IF;

  -- Award XP idempotently
  v_xp_result := award_xp_idempotent(
    NEW.user_id,
    v_event_type,
    v_event_category,
    v_base_xp,
    'biometric_activities',
    NEW.id,
    jsonb_build_object(
      'activity_type', NEW.activity_type,
      'duration_minutes', NEW.duration_minutes,
      'calories_burned', NEW.calories_burned
    )
  );

  -- Log result for debugging (optional)
  RAISE NOTICE 'Auto XP attribution for activity %: %', NEW.id, v_xp_result;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_award_activity_xp IS
  'Automatically awards XP when a new activity is logged';

-- ============================================
-- 6. TRIGGER FUNCTION: auto_award_calorie_goal_xp
-- ============================================

CREATE OR REPLACE FUNCTION auto_award_calorie_goal_xp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_xp_result jsonb;
  v_base_xp integer := 50; -- 50 XP for meeting calorie goal
BEGIN
  -- Award XP idempotently for calorie goal achievement
  v_xp_result := award_xp_idempotent(
    NEW.user_id,
    'calorie_goal_met',
    'nutrition',
    v_base_xp,
    'calorie_goal_achievements',
    NEW.id,
    jsonb_build_object(
      'achievement_date', NEW.achievement_date,
      'target_calories', NEW.target_calories,
      'actual_calories', NEW.actual_calories,
      'deviation', NEW.deviation,
      'objective', NEW.objective
    )
  );

  -- Update xp_awarded column in the achievement record
  NEW.xp_awarded := (v_xp_result->>'xp_awarded')::integer;

  -- Log result for debugging
  RAISE NOTICE 'Auto XP attribution for calorie goal %: %', NEW.id, v_xp_result;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_award_calorie_goal_xp IS
  'Automatically awards 50 XP when calorie goal is achieved';

-- ============================================
-- 7. CREATE TRIGGERS
-- ============================================

-- Trigger for biometric_activities
DROP TRIGGER IF EXISTS trigger_auto_award_activity_xp ON biometric_activities;

CREATE TRIGGER trigger_auto_award_activity_xp
  AFTER INSERT ON biometric_activities
  FOR EACH ROW
  EXECUTE FUNCTION auto_award_activity_xp();

COMMENT ON TRIGGER trigger_auto_award_activity_xp ON biometric_activities IS
  'Automatically awards XP when activity is logged';

-- Trigger for calorie_goal_achievements
DROP TRIGGER IF EXISTS trigger_auto_award_calorie_goal_xp ON calorie_goal_achievements;

CREATE TRIGGER trigger_auto_award_calorie_goal_xp
  BEFORE INSERT ON calorie_goal_achievements
  FOR EACH ROW
  EXECUTE FUNCTION auto_award_calorie_goal_xp();

COMMENT ON TRIGGER trigger_auto_award_calorie_goal_xp ON calorie_goal_achievements IS
  'Automatically awards 50 XP when calorie goal is achieved';

-- ============================================
-- 8. SEED TEST DATA (OPTIONAL - DEV ONLY)
-- ============================================

-- Add comment explaining the idempotence system
COMMENT ON TABLE xp_attribution_audit IS
  'Audit log for all XP attribution attempts. Tracks both successful and failed attempts for debugging and preventing double-attribution.';

COMMENT ON COLUMN biometric_activities.xp_event_id IS
  'Foreign key to xp_events_log. Set when XP is awarded for this activity. NULL means no XP awarded yet.';

COMMENT ON COLUMN calorie_goal_achievements.xp_event_id IS
  'Foreign key to xp_events_log. Set when XP is awarded for this achievement. NULL means no XP awarded yet.';
