/*
  # SPRINT 3: Accélération Progression & Bonus System

  ## Résumé
  Rééquilibrage complet de la courbe XP pour accélérer la progression initiale,
  ajout de bonus First Time et système de Perfect Days tracking.

  ## 1. Rééquilibrage Courbe XP

  ### Ancienne Courbe (Niveaux 1-20)
  - Niveau 1-10: 100 XP par niveau
  - Niveau 11-20: 150 XP par niveau
  - Total niveau 1→10: 900 XP
  - Total niveau 1→20: 2400 XP

  ### Nouvelle Courbe (Niveaux 1-20) - PLUS RAPIDE
  - Niveau 1-10: 50 XP par niveau (divisé par 2!)
  - Niveau 11-15: 100 XP par niveau
  - Niveau 16-20: 150 XP par niveau
  - Total niveau 1→10: 450 XP (2x plus rapide!)
  - Total niveau 1→20: 1200 XP (2x plus rapide!)

  ### Augmentation XP de Base Actions
  - Meal scan: 10 → 15 XP (+50%)
  - Activity log: 15 → 30 XP (+100%)
  - Training session: 30 XP (inchangé)
  - Calorie goal met: 50 XP (inchangé)
  - Fasting protocol: 35 XP (inchangé)
  - Body scan: 25 → 35 XP (+40%)

  ## 2. Bonus First Time

  ### Nouvelles Colonnes user_gamification_progress
  - `first_meal_scan_bonus_claimed` (boolean)
  - `first_activity_bonus_claimed` (boolean)
  - `first_training_bonus_claimed` (boolean)
  - `first_body_scan_bonus_claimed` (boolean)
  - `first_fasting_bonus_claimed` (boolean)
  - `first_calorie_goal_bonus_claimed` (boolean)
  - `first_time_bonuses_count` (integer) - compteur total

  ### Règles Bonus First Time
  - DOUBLE XP sur première action de chaque type
  - Badge "Première Fois 🌟" dans UI
  - Animation spéciale + confetti
  - Notification encourageante personnalisée

  ## 3. Bonus Daily Complete & Perfect Days

  ### Nouvelle Table: perfect_days_tracking
  Tracking des "Perfect Days" où toutes actions quotidiennes complétées
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `perfect_date` (date) - jour de la journée parfaite
  - `actions_completed` (jsonb) - détail des actions
  - `bonus_xp_awarded` (integer) - XP bonus pour cette journée
  - `current_streak` (integer) - série actuelle
  - `created_at` (timestamptz)

  ### Nouvelle Table: perfect_days_streaks
  Tracking des séries de Perfect Days consécutifs
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `current_streak` (integer) - série actuelle
  - `longest_streak` (integer) - meilleure série
  - `last_perfect_date` (date)
  - `total_perfect_days` (integer) - total sur toute la vie
  - `updated_at` (timestamptz)

  ## 4. Fonctions SQL

  ### update_level_milestones()
  Met à jour les seuils XP des niveaux 1-20 selon nouvelle courbe

  ### claim_first_time_bonus(user_id, action_type)
  Vérifie et attribue le bonus first time pour une action

  ### check_and_record_perfect_day(user_id, date)
  Vérifie si toutes actions quotidiennes complétées et enregistre Perfect Day

  ### get_perfect_days_streak(user_id)
  Retourne la série actuelle et meilleure de Perfect Days

  ## 5. Sécurité
  - Enable RLS sur toutes les nouvelles tables
  - Policies pour accès utilisateur authentifié uniquement
  - Bonus first time non-manipulable (SQL functions only)
*/

-- ============================================
-- 1. UPDATE LEVEL MILESTONES (Niveaux 1-20)
-- ============================================

-- Mettre à jour les seuils XP pour accélération progression
UPDATE level_milestones
SET
  xp_required = CASE level
    -- Niveau 1-10: 50 XP par niveau (nouveau)
    WHEN 1 THEN 0
    WHEN 2 THEN 50
    WHEN 3 THEN 100
    WHEN 4 THEN 150
    WHEN 5 THEN 200
    WHEN 6 THEN 250
    WHEN 7 THEN 300
    WHEN 8 THEN 350
    WHEN 9 THEN 400
    WHEN 10 THEN 450
    -- Niveau 11-15: 100 XP par niveau (nouveau)
    WHEN 11 THEN 550
    WHEN 12 THEN 650
    WHEN 13 THEN 750
    WHEN 14 THEN 850
    WHEN 15 THEN 950
    -- Niveau 16-20: 150 XP par niveau (nouveau)
    WHEN 16 THEN 1100
    WHEN 17 THEN 1250
    WHEN 18 THEN 1400
    WHEN 19 THEN 1550
    WHEN 20 THEN 1700
    ELSE xp_required
  END,
  xp_to_next = CASE level
    WHEN 1 THEN 50
    WHEN 2 THEN 50
    WHEN 3 THEN 50
    WHEN 4 THEN 50
    WHEN 5 THEN 50
    WHEN 6 THEN 50
    WHEN 7 THEN 50
    WHEN 8 THEN 50
    WHEN 9 THEN 50
    WHEN 10 THEN 100
    WHEN 11 THEN 100
    WHEN 12 THEN 100
    WHEN 13 THEN 100
    WHEN 14 THEN 100
    WHEN 15 THEN 150
    WHEN 16 THEN 150
    WHEN 17 THEN 150
    WHEN 18 THEN 150
    WHEN 19 THEN 150
    WHEN 20 THEN 200
    ELSE xp_to_next
  END
WHERE level BETWEEN 1 AND 20;

-- ============================================
-- 2. ADD FIRST TIME BONUS COLUMNS
-- ============================================

-- Ajouter colonnes first time bonus si elles n'existent pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_gamification_progress' AND column_name = 'first_meal_scan_bonus_claimed'
  ) THEN
    ALTER TABLE user_gamification_progress
    ADD COLUMN first_meal_scan_bonus_claimed boolean DEFAULT false,
    ADD COLUMN first_activity_bonus_claimed boolean DEFAULT false,
    ADD COLUMN first_training_bonus_claimed boolean DEFAULT false,
    ADD COLUMN first_body_scan_bonus_claimed boolean DEFAULT false,
    ADD COLUMN first_fasting_bonus_claimed boolean DEFAULT false,
    ADD COLUMN first_calorie_goal_bonus_claimed boolean DEFAULT false,
    ADD COLUMN first_time_bonuses_count integer DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 3. CREATE PERFECT DAYS TRACKING TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS perfect_days_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  perfect_date date NOT NULL,
  actions_completed jsonb NOT NULL DEFAULT '{}',
  bonus_xp_awarded integer NOT NULL DEFAULT 50,
  current_streak integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, perfect_date)
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_perfect_days_user_date
  ON perfect_days_tracking(user_id, perfect_date DESC);

-- Enable RLS
ALTER TABLE perfect_days_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own perfect days
CREATE POLICY "Users can view own perfect days"
  ON perfect_days_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: System can insert perfect days (via function)
CREATE POLICY "System can insert perfect days"
  ON perfect_days_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Table pour tracking des streaks Perfect Days
CREATE TABLE IF NOT EXISTS perfect_days_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_perfect_date date,
  total_perfect_days integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_perfect_streaks_user
  ON perfect_days_streaks(user_id);

-- Enable RLS
ALTER TABLE perfect_days_streaks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own streak
CREATE POLICY "Users can view own perfect streak"
  ON perfect_days_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert/update their streak
CREATE POLICY "Users can manage own perfect streak"
  ON perfect_days_streaks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. FUNCTION: claim_first_time_bonus
-- ============================================

CREATE OR REPLACE FUNCTION claim_first_time_bonus(
  p_user_id uuid,
  p_action_type text,
  p_base_xp integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_bonus_claimed boolean;
  v_column_name text;
  v_bonus_xp integer;
  v_result jsonb;
BEGIN
  -- Déterminer la colonne à vérifier selon le type d'action
  CASE p_action_type
    WHEN 'meal_scan' THEN v_column_name := 'first_meal_scan_bonus_claimed';
    WHEN 'activity' THEN v_column_name := 'first_activity_bonus_claimed';
    WHEN 'training' THEN v_column_name := 'first_training_bonus_claimed';
    WHEN 'body_scan' THEN v_column_name := 'first_body_scan_bonus_claimed';
    WHEN 'fasting' THEN v_column_name := 'first_fasting_bonus_claimed';
    WHEN 'calorie_goal' THEN v_column_name := 'first_calorie_goal_bonus_claimed';
    ELSE
      RETURN jsonb_build_object(
        'bonus_applicable', false,
        'reason', 'unknown_action_type'
      );
  END CASE;

  -- Vérifier si bonus déjà réclamé
  EXECUTE format('SELECT %I FROM user_gamification_progress WHERE user_id = $1', v_column_name)
  INTO v_bonus_claimed
  USING p_user_id;

  IF v_bonus_claimed THEN
    -- Bonus déjà réclamé
    RETURN jsonb_build_object(
      'bonus_applicable', false,
      'reason', 'already_claimed',
      'base_xp', p_base_xp,
      'bonus_xp', 0,
      'total_xp', p_base_xp
    );
  END IF;

  -- Calculer bonus XP (double du base XP)
  v_bonus_xp := p_base_xp;

  -- Marquer comme réclamé et incrémenter compteur
  EXECUTE format(
    'UPDATE user_gamification_progress SET %I = true, first_time_bonuses_count = first_time_bonuses_count + 1 WHERE user_id = $1',
    v_column_name
  )
  USING p_user_id;

  -- Retourner résultat avec bonus
  RETURN jsonb_build_object(
    'bonus_applicable', true,
    'bonus_type', 'first_time',
    'action_type', p_action_type,
    'base_xp', p_base_xp,
    'bonus_xp', v_bonus_xp,
    'total_xp', p_base_xp + v_bonus_xp,
    'message', format('Première fois: %s! Bonus 2x XP 🌟', p_action_type)
  );
END;
$$;

COMMENT ON FUNCTION claim_first_time_bonus IS
  'Claims first time bonus for an action type, doubling XP on first occurrence';

-- ============================================
-- 5. FUNCTION: check_and_record_perfect_day
-- ============================================

CREATE OR REPLACE FUNCTION check_and_record_perfect_day(
  p_user_id uuid,
  p_date date,
  p_actions_completed jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_perfect boolean;
  v_bonus_xp integer := 50;
  v_current_streak integer := 0;
  v_longest_streak integer := 0;
  v_last_perfect_date date;
  v_is_consecutive boolean;
  v_total_perfect_days integer := 0;
  v_result jsonb;
BEGIN
  -- Vérifier si c'est une journée parfaite (meal_scan + activity + optionnel: fasting/calorie_goal)
  v_is_perfect := (
    (p_actions_completed->>'meal_scan')::boolean = true AND
    (p_actions_completed->>'activity')::boolean = true
  );

  IF NOT v_is_perfect THEN
    RETURN jsonb_build_object(
      'is_perfect', false,
      'message', 'Not all required actions completed',
      'actions_completed', p_actions_completed
    );
  END IF;

  -- Initialiser streak si n'existe pas
  INSERT INTO perfect_days_streaks (user_id, current_streak, longest_streak, total_perfect_days)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Récupérer données streak actuelles
  SELECT current_streak, longest_streak, last_perfect_date, total_perfect_days
  INTO v_current_streak, v_longest_streak, v_last_perfect_date, v_total_perfect_days
  FROM perfect_days_streaks
  WHERE user_id = p_user_id;

  -- Vérifier si consécutif
  v_is_consecutive := (v_last_perfect_date IS NULL) OR
                      (p_date = v_last_perfect_date + INTERVAL '1 day');

  -- Ne pas traiter si même jour
  IF v_last_perfect_date = p_date THEN
    RETURN jsonb_build_object(
      'is_perfect', true,
      'already_recorded', true,
      'message', 'Perfect day already recorded for this date'
    );
  END IF;

  -- Calculer nouveau streak
  IF v_is_consecutive THEN
    v_current_streak := v_current_streak + 1;
  ELSE
    v_current_streak := 1;
  END IF;

  -- Mettre à jour longest streak si nécessaire
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Calculer bonus XP selon streak
  IF v_current_streak >= 7 THEN
    v_bonus_xp := 100; -- +100 XP pour 7+ jours
  ELSIF v_current_streak >= 3 THEN
    v_bonus_xp := 75;  -- +75 XP pour 3-6 jours
  ELSE
    v_bonus_xp := 50;  -- +50 XP pour 1-2 jours
  END IF;

  -- Incrémenter total perfect days
  v_total_perfect_days := v_total_perfect_days + 1;

  -- Enregistrer perfect day
  INSERT INTO perfect_days_tracking (
    user_id,
    perfect_date,
    actions_completed,
    bonus_xp_awarded,
    current_streak
  )
  VALUES (
    p_user_id,
    p_date,
    p_actions_completed,
    v_bonus_xp,
    v_current_streak
  )
  ON CONFLICT (user_id, perfect_date)
  DO UPDATE SET
    actions_completed = EXCLUDED.actions_completed,
    bonus_xp_awarded = EXCLUDED.bonus_xp_awarded,
    current_streak = EXCLUDED.current_streak;

  -- Mettre à jour streak
  UPDATE perfect_days_streaks
  SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_perfect_date = p_date,
    total_perfect_days = v_total_perfect_days,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Attribuer bonus XP
  PERFORM award_xp(
    p_user_id,
    'perfect_day_completed',
    'daily_complete',
    v_bonus_xp,
    jsonb_build_object(
      'date', p_date,
      'current_streak', v_current_streak,
      'actions_completed', p_actions_completed
    )
  );

  -- Construire résultat
  v_result := jsonb_build_object(
    'is_perfect', true,
    'newly_recorded', true,
    'bonus_xp_awarded', v_bonus_xp,
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'total_perfect_days', v_total_perfect_days,
    'is_new_record', v_current_streak = v_longest_streak,
    'message', format('Journée Parfaite! +%s XP 🎉', v_bonus_xp)
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION check_and_record_perfect_day IS
  'Checks if all daily actions completed and records Perfect Day with bonus XP';

-- ============================================
-- 6. FUNCTION: get_perfect_days_streak
-- ============================================

CREATE OR REPLACE FUNCTION get_perfect_days_streak(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Initialiser si n'existe pas
  INSERT INTO perfect_days_streaks (user_id, current_streak, longest_streak, total_perfect_days)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT jsonb_build_object(
    'current_streak', current_streak,
    'longest_streak', longest_streak,
    'last_perfect_date', last_perfect_date,
    'total_perfect_days', total_perfect_days
  )
  INTO v_result
  FROM perfect_days_streaks
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_result, jsonb_build_object(
    'current_streak', 0,
    'longest_streak', 0,
    'last_perfect_date', null,
    'total_perfect_days', 0
  ));
END;
$$;

COMMENT ON FUNCTION get_perfect_days_streak IS
  'Returns current and longest Perfect Days streak for user';

-- ============================================
-- 7. HELPER FUNCTION: initialize_perfect_days_streak
-- ============================================

CREATE OR REPLACE FUNCTION initialize_perfect_days_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO perfect_days_streaks (user_id, current_streak, longest_streak, total_perfect_days)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- ============================================
-- 8. UPDATE XP BASE VALUES IN DOCUMENTATION
-- ============================================

COMMENT ON TABLE user_gamification_progress IS
  'User gamification state with XP, level, and first time bonuses tracking.

NEW XP VALUES (Sprint 3):
- Meal scan: 15 XP (was 10)
- Activity log: 30 XP (was 15)
- Training session: 30 XP (unchanged)
- Body scan: 35 XP (was 25)
- Calorie goal met: 50 XP (unchanged)
- Fasting protocol: 35 XP (unchanged)

FIRST TIME BONUS:
- Double XP on first action of each type
- Badge "Première Fois 🌟" in UI

PERFECT DAY BONUS:
- 50 XP base (1-2 days streak)
- 75 XP (3-6 days streak)
- 100 XP (7+ days streak)';

COMMENT ON TABLE perfect_days_tracking IS
  'Tracks Perfect Days where user completed all daily actions (meal scan + activity).
Bonus XP awarded: 50 XP (base), 75 XP (3+ days), 100 XP (7+ days).';

COMMENT ON TABLE perfect_days_streaks IS
  'Tracks consecutive Perfect Days streaks with rewards for consistency.';
