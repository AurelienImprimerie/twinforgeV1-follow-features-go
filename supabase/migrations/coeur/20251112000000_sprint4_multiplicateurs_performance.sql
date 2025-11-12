/*
  # SPRINT 4: Multiplicateurs Performance - Système de Bonus Dynamiques

  ## Résumé
  Système complet de règles de bonus XP configurables dynamiquement,
  avec calcul automatique des scores de performance et attribution de bonus.

  ## 1. Table bonus_xp_rules

  Table pour gérer dynamiquement les règles de bonus XP sans redéploiement:
  - `id` (uuid, primary key)
  - `rule_type` (text) - Type: nutrition_streak, training_frequency, consistency, weekly_perfect
  - `rule_name` (text) - Nom descriptif de la règle
  - `condition` (jsonb) - Conditions pour déclencher le bonus
  - `xp_reward` (integer) - XP à attribuer si condition remplie
  - `period` (text) - Période d'évaluation: daily, weekly, monthly
  - `is_active` (boolean) - Active ou désactivée
  - `priority` (integer) - Ordre d'affichage
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Table user_bonus_history

  Historique de tous les bonus XP attribués aux utilisateurs:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `rule_id` (uuid, foreign key to bonus_xp_rules)
  - `xp_awarded` (integer)
  - `period_start` (date)
  - `period_end` (date)
  - `performance_score` (numeric) - Score 0-100
  - `condition_details` (jsonb) - Détails des conditions remplies
  - `awarded_at` (timestamptz)

  ## 3. Table user_performance_scores

  Scores de performance calculés pour chaque utilisateur:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `period_type` (text) - daily, weekly, monthly
  - `period_start` (date)
  - `period_end` (date)
  - `nutrition_score` (numeric) - 0-100
  - `training_score` (numeric) - 0-100
  - `consistency_score` (numeric) - 0-100
  - `progression_score` (numeric) - 0-100
  - `overall_score` (numeric) - 0-100 (moyenne pondérée)
  - `calculated_at` (timestamptz)

  ## 4. Fonctions SQL

  ### calculate_nutrition_score(user_id, start_date, end_date)
  Calcule score nutrition basé sur meals logged, macros respect, calorie goals

  ### calculate_training_score(user_id, start_date, end_date)
  Calcule score training basé sur fréquence, volume, intensité

  ### calculate_consistency_score(user_id, start_date, end_date)
  Calcule score consistance basé sur régularité des actions

  ### check_and_award_bonus(user_id, rule_id)
  Vérifie si utilisateur éligible au bonus et attribue XP

  ## 5. Sécurité
  - Enable RLS sur toutes les tables
  - Policies pour accès utilisateur authentifié uniquement
  - bonus_xp_rules lisible par tous, modifiable par admin seulement
*/

-- ============================================
-- 1. CREATE bonus_xp_rules TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS bonus_xp_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL CHECK (rule_type IN (
    'nutrition_streak',
    'training_frequency',
    'consistency',
    'weekly_perfect',
    'monthly_perfect',
    'macro_precision',
    'progressive_overload'
  )),
  rule_name text NOT NULL,
  description text,
  condition jsonb NOT NULL DEFAULT '{}',
  xp_reward integer NOT NULL CHECK (xp_reward > 0),
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_bonus_rules_active
  ON bonus_xp_rules(is_active, period);

CREATE INDEX IF NOT EXISTS idx_bonus_rules_type
  ON bonus_xp_rules(rule_type);

-- Enable RLS
ALTER TABLE bonus_xp_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Tous peuvent lire les règles actives
CREATE POLICY "Anyone can view active bonus rules"
  ON bonus_xp_rules
  FOR SELECT
  USING (is_active = true);

-- ============================================
-- 2. CREATE user_bonus_history TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_bonus_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES bonus_xp_rules(id) ON DELETE SET NULL,
  rule_name text NOT NULL,
  xp_awarded integer NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  performance_score numeric CHECK (performance_score >= 0 AND performance_score <= 100),
  condition_details jsonb DEFAULT '{}',
  awarded_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bonus_history_user_date
  ON user_bonus_history(user_id, awarded_at DESC);

CREATE INDEX IF NOT EXISTS idx_bonus_history_rule
  ON user_bonus_history(rule_id);

-- Enable RLS
ALTER TABLE user_bonus_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own bonus history
CREATE POLICY "Users can view own bonus history"
  ON user_bonus_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 3. CREATE user_performance_scores TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_performance_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  nutrition_score numeric DEFAULT 0 CHECK (nutrition_score >= 0 AND nutrition_score <= 100),
  training_score numeric DEFAULT 0 CHECK (training_score >= 0 AND training_score <= 100),
  consistency_score numeric DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100),
  progression_score numeric DEFAULT 0 CHECK (progression_score >= 0 AND progression_score <= 100),
  overall_score numeric DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  details jsonb DEFAULT '{}',
  calculated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_type, period_start, period_end)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_performance_scores_user_period
  ON user_performance_scores(user_id, period_type, period_start DESC);

-- Enable RLS
ALTER TABLE user_performance_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own performance scores
CREATE POLICY "Users can view own performance scores"
  ON user_performance_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 4. FUNCTION: calculate_nutrition_score
-- ============================================

CREATE OR REPLACE FUNCTION calculate_nutrition_score(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_days integer;
  v_days_with_meals integer;
  v_days_with_calorie_goal integer;
  v_meal_consistency_score numeric;
  v_calorie_goal_score numeric;
  v_final_score numeric;
BEGIN
  -- Calculer nombre total de jours
  v_total_days := (p_end_date - p_start_date + 1);

  -- Compter jours avec au moins 1 meal logged
  SELECT COUNT(DISTINCT DATE(consumed_at))
  INTO v_days_with_meals
  FROM meals
  WHERE user_id = p_user_id
    AND consumed_at >= p_start_date::timestamptz
    AND consumed_at < (p_end_date + INTERVAL '1 day')::timestamptz;

  -- Compter jours avec objectif calorique atteint
  SELECT COUNT(*)
  INTO v_days_with_calorie_goal
  FROM calorie_goal_achievements
  WHERE user_id = p_user_id
    AND achievement_date >= p_start_date
    AND achievement_date <= p_end_date;

  -- Score consistance repas (0-60 points)
  v_meal_consistency_score := (v_days_with_meals::numeric / NULLIF(v_total_days, 0)) * 60;

  -- Score objectif calorique (0-40 points)
  v_calorie_goal_score := (v_days_with_calorie_goal::numeric / NULLIF(v_total_days, 0)) * 40;

  -- Score final (0-100)
  v_final_score := COALESCE(v_meal_consistency_score, 0) + COALESCE(v_calorie_goal_score, 0);

  RETURN LEAST(v_final_score, 100);
END;
$$;

COMMENT ON FUNCTION calculate_nutrition_score IS
  'Calculates nutrition score (0-100) based on meal logging consistency and calorie goal achievement';

-- ============================================
-- 5. FUNCTION: calculate_training_score
-- ============================================

CREATE OR REPLACE FUNCTION calculate_training_score(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_days integer;
  v_days_with_activity integer;
  v_total_activities integer;
  v_frequency_score numeric;
  v_volume_score numeric;
  v_final_score numeric;
BEGIN
  -- Calculer nombre total de jours
  v_total_days := (p_end_date - p_start_date + 1);

  -- Compter jours avec au moins 1 activité
  SELECT COUNT(DISTINCT activity_date)
  INTO v_days_with_activity
  FROM biometric_activities
  WHERE user_id = p_user_id
    AND activity_date >= p_start_date
    AND activity_date <= p_end_date;

  -- Compter total activités
  SELECT COUNT(*)
  INTO v_total_activities
  FROM biometric_activities
  WHERE user_id = p_user_id
    AND activity_date >= p_start_date
    AND activity_date <= p_end_date;

  -- Score fréquence (0-70 points) - au moins 3-4 jours par semaine = excellent
  v_frequency_score := LEAST((v_days_with_activity::numeric / NULLIF(v_total_days, 0)) * 200, 70);

  -- Score volume (0-30 points) - au moins 1 activité par jour actif = excellent
  v_volume_score := LEAST((v_total_activities::numeric / NULLIF(v_days_with_activity, 0)) * 30, 30);

  -- Score final (0-100)
  v_final_score := COALESCE(v_frequency_score, 0) + COALESCE(v_volume_score, 0);

  RETURN LEAST(v_final_score, 100);
END;
$$;

COMMENT ON FUNCTION calculate_training_score IS
  'Calculates training score (0-100) based on activity frequency and volume';

-- ============================================
-- 6. FUNCTION: calculate_consistency_score
-- ============================================

CREATE OR REPLACE FUNCTION calculate_consistency_score(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_days integer;
  v_perfect_days integer;
  v_current_streak integer;
  v_perfect_days_score numeric;
  v_streak_score numeric;
  v_final_score numeric;
BEGIN
  -- Calculer nombre total de jours
  v_total_days := (p_end_date - p_start_date + 1);

  -- Compter Perfect Days dans la période
  SELECT COUNT(*)
  INTO v_perfect_days
  FROM perfect_days_tracking
  WHERE user_id = p_user_id
    AND perfect_date >= p_start_date
    AND perfect_date <= p_end_date;

  -- Récupérer current streak
  SELECT current_streak
  INTO v_current_streak
  FROM perfect_days_streaks
  WHERE user_id = p_user_id;

  v_current_streak := COALESCE(v_current_streak, 0);

  -- Score Perfect Days (0-70 points)
  v_perfect_days_score := (v_perfect_days::numeric / NULLIF(v_total_days, 0)) * 70;

  -- Score Streak (0-30 points) - streak de 7+ = max
  v_streak_score := LEAST(v_current_streak * 4.3, 30);

  -- Score final (0-100)
  v_final_score := COALESCE(v_perfect_days_score, 0) + COALESCE(v_streak_score, 0);

  RETURN LEAST(v_final_score, 100);
END;
$$;

COMMENT ON FUNCTION calculate_consistency_score IS
  'Calculates consistency score (0-100) based on Perfect Days and streaks';

-- ============================================
-- 7. FUNCTION: calculate_overall_performance_score
-- ============================================

CREATE OR REPLACE FUNCTION calculate_overall_performance_score(
  p_user_id uuid,
  p_period_type text,
  p_start_date date,
  p_end_date date
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_nutrition_score numeric;
  v_training_score numeric;
  v_consistency_score numeric;
  v_progression_score numeric := 50; -- Placeholder pour progression
  v_overall_score numeric;
  v_result jsonb;
BEGIN
  -- Calculer les 3 scores principaux
  v_nutrition_score := calculate_nutrition_score(p_user_id, p_start_date, p_end_date);
  v_training_score := calculate_training_score(p_user_id, p_start_date, p_end_date);
  v_consistency_score := calculate_consistency_score(p_user_id, p_start_date, p_end_date);

  -- Calculer score global pondéré
  -- Nutrition: 35%, Training: 30%, Consistency: 25%, Progression: 10%
  v_overall_score := (
    v_nutrition_score * 0.35 +
    v_training_score * 0.30 +
    v_consistency_score * 0.25 +
    v_progression_score * 0.10
  );

  -- Enregistrer dans user_performance_scores
  INSERT INTO user_performance_scores (
    user_id,
    period_type,
    period_start,
    period_end,
    nutrition_score,
    training_score,
    consistency_score,
    progression_score,
    overall_score
  )
  VALUES (
    p_user_id,
    p_period_type,
    p_start_date,
    p_end_date,
    v_nutrition_score,
    v_training_score,
    v_consistency_score,
    v_progression_score,
    v_overall_score
  )
  ON CONFLICT (user_id, period_type, period_start, period_end)
  DO UPDATE SET
    nutrition_score = EXCLUDED.nutrition_score,
    training_score = EXCLUDED.training_score,
    consistency_score = EXCLUDED.consistency_score,
    progression_score = EXCLUDED.progression_score,
    overall_score = EXCLUDED.overall_score,
    calculated_at = now();

  -- Construire résultat
  v_result := jsonb_build_object(
    'nutrition_score', v_nutrition_score,
    'training_score', v_training_score,
    'consistency_score', v_consistency_score,
    'progression_score', v_progression_score,
    'overall_score', v_overall_score
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION calculate_overall_performance_score IS
  'Calculates all performance scores and returns weighted overall score';

-- ============================================
-- 8. SEED: Default Bonus XP Rules
-- ============================================

INSERT INTO bonus_xp_rules (rule_type, rule_name, description, condition, xp_reward, period, is_active, priority)
VALUES
  -- Nutrition Streak (7 jours)
  (
    'nutrition_streak',
    'Série Nutrition 7 Jours',
    'Logge au moins 1 repas chaque jour pendant 7 jours consécutifs',
    '{"min_days": 7, "min_meals_per_day": 1}',
    150,
    'weekly',
    true,
    1
  ),
  -- Training Frequency (3+ sessions/semaine)
  (
    'training_frequency',
    'Guerrier de la Semaine',
    'Complète au moins 3 sessions d''entraînement dans la semaine',
    '{"min_sessions": 3, "period_days": 7}',
    100,
    'weekly',
    true,
    2
  ),
  -- Perfect Week (7 Perfect Days)
  (
    'weekly_perfect',
    'Semaine Parfaite',
    'Réalise 7 Perfect Days consécutifs',
    '{"min_perfect_days": 7, "consecutive": true}',
    200,
    'weekly',
    true,
    3
  ),
  -- Consistency Champion (5+ Perfect Days dans la semaine)
  (
    'consistency',
    'Champion de Consistance',
    'Atteins 5 ou plus Perfect Days dans la semaine',
    '{"min_perfect_days": 5, "period_days": 7}',
    125,
    'weekly',
    true,
    4
  ),
  -- Monthly Perfect (21+ Perfect Days)
  (
    'monthly_perfect',
    'Maître du Mois',
    'Accumule 21+ Perfect Days dans le mois',
    '{"min_perfect_days": 21, "period_days": 30}',
    500,
    'monthly',
    true,
    5
  );

COMMENT ON TABLE bonus_xp_rules IS
  'Configurable bonus XP rules. Can be modified without code deployment.

Examples:
- Nutrition streak: 7 days of meal logging → 150 XP
- Training frequency: 3+ sessions/week → 100 XP
- Perfect week: 7 Perfect Days → 200 XP
- Consistency: 5+ Perfect Days/week → 125 XP
- Monthly perfect: 21+ Perfect Days/month → 500 XP';
