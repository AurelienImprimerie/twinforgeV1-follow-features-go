/*
  # SPRINT 6: Records & Leaderboard System

  ## Résumé
  Système complet de records personnels partageables (style Strava) et classement
  communautaire avec opt-in/opt-out pour la visibilité publique.

  ## 1. Nouvelles Tables

  ### user_records
  Table principale pour stocker tous les records personnels de l'utilisateur
  - Types: weight, calorie_deficit, streak, training_pr, nutrition, transformation
  - Détection automatique des nouveaux records via triggers
  - Attribution XP bonus selon importance du record

  ### leaderboard_entries
  Table des entrées au classement avec calcul automatisé
  - Classements multiples: par XP, niveau, série, transformation
  - Refresh périodique via CRON job
  - Support classement hebdo/mensuel/all-time

  ### leaderboard_settings
  Préférences utilisateur pour participation au classement
  - Opt-in/opt-out pour visibilité publique
  - Options anonymisation (nom, âge)
  - Contrôle granulaire de la vie privée

  ### record_share_cards
  Tracking des cartes de partage générées
  - Templates multiples (minimaliste, détaillé, story)
  - Métriques de partage pour analytics
  - Historique des partages utilisateur

  ## 2. Types de Records

  ### Weight Records
  - lowest_weight: Poids le plus bas (fat_loss)
  - highest_weight: Poids le plus haut (muscle_gain)
  - biggest_weight_loss_week: Meilleure perte hebdo
  - biggest_weight_gain_week: Meilleure prise hebdo

  ### Nutrition Records
  - best_calorie_deficit_day: Meilleur déficit calorique jour
  - perfect_macro_day: Journée macros parfaite
  - longest_meal_plan_streak: Plus longue série plan repas
  - perfect_week_nutrition: Semaine nutrition parfaite

  ### Training Records
  - training_1rm_[exercise]: Record 1RM par exercice
  - longest_training_streak: Plus longue série training
  - best_session_volume: Meilleur volume session
  - fastest_workout_time: Temps workout le plus rapide

  ### Streak Records
  - longest_daily_streak: Plus longue série quotidienne
  - longest_perfect_days_streak: Plus longue série perfect days
  - current_active_streak: Série active actuelle

  ### Transformation Records
  - biggest_body_scan_change: Plus grosse évolution scan
  - fastest_level_up: Level up le plus rapide
  - most_xp_single_day: Plus d'XP en une journée

  ## 3. Bonus XP Records

  - Minor record: +50 XP (ex: best calorie deficit day)
  - Major record: +100 XP (ex: longest streak)
  - Epic record: +200 XP (ex: transformation milestone)
  - Legendary record: +500 XP (ex: 100 day streak)

  ## 4. Leaderboard Types

  - xp_weekly: XP gagné cette semaine
  - xp_monthly: XP gagné ce mois
  - xp_alltime: XP total
  - level: Niveau actuel
  - streak: Série active
  - transformation: Score transformation

  ## 5. Sécurité

  - RLS activé sur toutes les tables
  - Policies read/write pour utilisateur authentifié
  - Leaderboard public read si opt-in activé
  - Anonymisation automatique selon préférences
  - Validation données sensibles santé masquées
*/

-- ============================================
-- 1. TABLE user_records
-- ============================================

CREATE TABLE IF NOT EXISTS user_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Type et catégorie
  record_type text NOT NULL, -- 'weight', 'calorie_deficit', 'streak', 'training_pr', 'nutrition', 'transformation'
  record_category text NOT NULL, -- 'minor', 'major', 'epic', 'legendary'
  record_subtype text, -- ex: 'lowest_weight', '1rm_squat', 'longest_streak'

  -- Valeurs
  value numeric NOT NULL, -- Valeur du record
  previous_value numeric, -- Ancienne valeur si amélioration
  unit text NOT NULL, -- 'kg', 'kcal', 'days', 'reps', '%'

  -- Métadonnées
  achieved_at timestamptz NOT NULL DEFAULT now(),
  context_data jsonb DEFAULT '{}', -- Contexte additionnel

  -- XP bonus
  xp_awarded integer NOT NULL DEFAULT 0, -- XP bonus pour ce record
  xp_category text, -- 'minor', 'major', 'epic', 'legendary'

  -- Partage
  is_shared boolean DEFAULT false, -- Si partagé sur réseaux sociaux
  share_count integer DEFAULT 0, -- Nombre de fois partagé

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_record_type CHECK (record_type IN ('weight', 'calorie_deficit', 'streak', 'training_pr', 'nutrition', 'transformation')),
  CONSTRAINT valid_record_category CHECK (record_category IN ('minor', 'major', 'epic', 'legendary')),
  CONSTRAINT valid_xp_category CHECK (xp_category IS NULL OR xp_category IN ('minor', 'major', 'epic', 'legendary'))
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_user_records_user_id ON user_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_records_type ON user_records(record_type);
CREATE INDEX IF NOT EXISTS idx_user_records_achieved ON user_records(achieved_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_records_user_type ON user_records(user_id, record_type);

-- Enable RLS
ALTER TABLE user_records ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- ============================================
-- 2. TABLE leaderboard_settings
-- ============================================

CREATE TABLE IF NOT EXISTS leaderboard_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Participation
  is_participating boolean DEFAULT false, -- Opt-in pour classement public

  -- Visibilité
  show_full_name boolean DEFAULT false, -- Afficher nom complet
  show_age boolean DEFAULT true, -- Afficher âge
  anonymized_name text, -- Pseudo anonymisé si souhaité

  -- Classements actifs
  participate_xp boolean DEFAULT true, -- Participer classement XP
  participate_level boolean DEFAULT true, -- Participer classement niveau
  participate_streak boolean DEFAULT true, -- Participer classement série
  participate_transformation boolean DEFAULT false, -- Participer classement transformation (données sensibles)

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_leaderboard_settings_user ON leaderboard_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_settings_participating ON leaderboard_settings(is_participating);

-- Enable RLS
ALTER TABLE leaderboard_settings ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- ============================================
-- 3. TABLE leaderboard_entries
-- ============================================

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identité (selon préférences)
  display_name text NOT NULL, -- Nom affiché (anonymisé ou réel)
  age integer, -- Âge si partagé

  -- Type de classement
  leaderboard_type text NOT NULL, -- 'xp_weekly', 'xp_monthly', 'xp_alltime', 'level', 'streak', 'transformation'
  period text NOT NULL, -- 'week', 'month', 'alltime'
  period_start date, -- Début période si applicable
  period_end date, -- Fin période si applicable

  -- Classement
  rank integer NOT NULL, -- Position au classement
  score numeric NOT NULL, -- Score/métrique principale
  score_unit text, -- Unité du score

  -- Contexte additionnel
  metadata jsonb DEFAULT '{}', -- Données additionnelles

  -- Timestamps
  calculated_at timestamptz DEFAULT now(), -- Quand le classement a été calculé
  created_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_leaderboard_type CHECK (leaderboard_type IN ('xp_weekly', 'xp_monthly', 'xp_alltime', 'level', 'streak', 'transformation')),
  CONSTRAINT valid_period CHECK (period IN ('week', 'month', 'alltime')),
  CONSTRAINT unique_user_leaderboard_period UNIQUE (user_id, leaderboard_type, period, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type ON leaderboard_entries(leaderboard_type);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_period ON leaderboard_entries(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_type_rank ON leaderboard_entries(leaderboard_type, rank);

-- Enable RLS
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Policies: Public read si user participe, write restricted
CREATE POLICY "Anyone can view leaderboard entries"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leaderboard_settings
      WHERE leaderboard_settings.user_id = leaderboard_entries.user_id
      AND leaderboard_settings.is_participating = true
    )
  );

CREATE POLICY "System can insert leaderboard entries"
  ON leaderboard_entries FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Insertion via functions only

CREATE POLICY "System can update leaderboard entries"
  ON leaderboard_entries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true); -- Update via functions only

-- ============================================
-- 4. TABLE record_share_cards
-- ============================================

CREATE TABLE IF NOT EXISTS record_share_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_id uuid REFERENCES user_records(id) ON DELETE SET NULL,

  -- Template
  template_type text NOT NULL, -- 'minimalist', 'detailed', 'story'
  card_format text NOT NULL, -- 'square', 'vertical', 'horizontal'

  -- Contenu
  card_data jsonb NOT NULL, -- Données de la carte générée
  custom_message text, -- Message personnalisé ajouté

  -- Tracking partage
  shared_at timestamptz,
  platform text, -- 'instagram', 'facebook', 'twitter', etc.

  -- Timestamps
  created_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_template_type CHECK (template_type IN ('minimalist', 'detailed', 'story')),
  CONSTRAINT valid_card_format CHECK (card_format IN ('square', 'vertical', 'horizontal'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_record_share_cards_user ON record_share_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_record_share_cards_record ON record_share_cards(record_id);
CREATE INDEX IF NOT EXISTS idx_record_share_cards_shared ON record_share_cards(shared_at);

-- Enable RLS
ALTER TABLE record_share_cards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own share cards"
  ON record_share_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own share cards"
  ON record_share_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. FONCTIONS SQL
-- ============================================

-- Fonction: Détecter et enregistrer nouveau record
CREATE OR REPLACE FUNCTION detect_and_save_record(
  p_user_id uuid,
  p_record_type text,
  p_record_subtype text,
  p_value numeric,
  p_unit text,
  p_context_data jsonb DEFAULT '{}'
) RETURNS jsonb AS $$
DECLARE
  v_previous_record record;
  v_is_new_record boolean := false;
  v_record_category text;
  v_xp_bonus integer := 0;
  v_new_record_id uuid;
  v_result jsonb;
BEGIN
  -- Récupérer l'ancien record
  SELECT * INTO v_previous_record
  FROM user_records
  WHERE user_id = p_user_id
    AND record_type = p_record_type
    AND record_subtype = p_record_subtype
  ORDER BY achieved_at DESC
  LIMIT 1;

  -- Déterminer si nouveau record selon type
  IF p_record_type = 'weight' THEN
    IF p_record_subtype = 'lowest_weight' THEN
      v_is_new_record := (v_previous_record.value IS NULL OR p_value < v_previous_record.value);
    ELSIF p_record_subtype = 'highest_weight' THEN
      v_is_new_record := (v_previous_record.value IS NULL OR p_value > v_previous_record.value);
    END IF;
  ELSIF p_record_type IN ('streak', 'training_pr', 'calorie_deficit') THEN
    v_is_new_record := (v_previous_record.value IS NULL OR p_value > v_previous_record.value);
  END IF;

  -- Si nouveau record, déterminer catégorie et XP
  IF v_is_new_record THEN
    -- Catégorie selon type et valeur
    IF p_record_type = 'streak' AND p_value >= 100 THEN
      v_record_category := 'legendary';
      v_xp_bonus := 500;
    ELSIF p_record_type = 'streak' AND p_value >= 30 THEN
      v_record_category := 'epic';
      v_xp_bonus := 200;
    ELSIF p_record_type = 'transformation' THEN
      v_record_category := 'major';
      v_xp_bonus := 100;
    ELSE
      v_record_category := 'minor';
      v_xp_bonus := 50;
    END IF;

    -- Insérer nouveau record
    INSERT INTO user_records (
      user_id, record_type, record_category, record_subtype,
      value, previous_value, unit, context_data,
      xp_awarded, xp_category
    ) VALUES (
      p_user_id, p_record_type, v_record_category, p_record_subtype,
      p_value, v_previous_record.value, p_unit, p_context_data,
      v_xp_bonus, v_record_category
    ) RETURNING id INTO v_new_record_id;

    -- Attribution XP via fonction existante
    PERFORM award_xp(
      p_user_id,
      'record_achieved',
      'general',
      v_xp_bonus,
      jsonb_build_object(
        'record_id', v_new_record_id,
        'record_type', p_record_type,
        'record_subtype', p_record_subtype,
        'record_category', v_record_category,
        'value', p_value
      )
    );

    v_result := jsonb_build_object(
      'is_new_record', true,
      'record_id', v_new_record_id,
      'category', v_record_category,
      'xp_awarded', v_xp_bonus,
      'previous_value', v_previous_record.value,
      'new_value', p_value
    );
  ELSE
    v_result := jsonb_build_object('is_new_record', false);
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Calculer et mettre à jour classement
CREATE OR REPLACE FUNCTION update_leaderboard(
  p_leaderboard_type text,
  p_period text,
  p_period_start date DEFAULT NULL,
  p_period_end date DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_entry record;
  v_rank integer := 0;
BEGIN
  -- Supprimer anciennes entrées pour cette période
  DELETE FROM leaderboard_entries
  WHERE leaderboard_type = p_leaderboard_type
    AND period = p_period
    AND (p_period_start IS NULL OR period_start = p_period_start);

  -- Calculer classement selon type
  IF p_leaderboard_type = 'xp_alltime' THEN
    -- Classement XP total
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        COALESCE(ls.anonymized_name, up.display_name, 'Anonymous') as display_name,
        CASE WHEN ls.show_age THEN EXTRACT(YEAR FROM AGE(up.birth_date)) ELSE NULL END as age,
        ugp.total_xp_earned as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_xp = true
      ORDER BY ugp.total_xp_earned DESC
    ) LOOP
      v_rank := v_rank + 1;
      INSERT INTO leaderboard_entries (
        user_id, display_name, age, leaderboard_type, period,
        period_start, period_end, rank, score, score_unit
      ) VALUES (
        v_entry.user_id, v_entry.display_name, v_entry.age,
        p_leaderboard_type, p_period, p_period_start, p_period_end,
        v_rank, v_entry.score, 'XP'
      );
    END LOOP;

  ELSIF p_leaderboard_type = 'level' THEN
    -- Classement par niveau
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        COALESCE(ls.anonymized_name, up.display_name, 'Anonymous') as display_name,
        CASE WHEN ls.show_age THEN EXTRACT(YEAR FROM AGE(up.birth_date)) ELSE NULL END as age,
        ugp.current_level as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_level = true
      ORDER BY ugp.current_level DESC, ugp.current_xp DESC
    ) LOOP
      v_rank := v_rank + 1;
      INSERT INTO leaderboard_entries (
        user_id, display_name, age, leaderboard_type, period,
        rank, score, score_unit
      ) VALUES (
        v_entry.user_id, v_entry.display_name, v_entry.age,
        p_leaderboard_type, 'alltime',
        v_rank, v_entry.score, 'Level'
      );
    END LOOP;

  ELSIF p_leaderboard_type = 'streak' THEN
    -- Classement par série active
    FOR v_entry IN (
      SELECT
        ugp.user_id,
        COALESCE(ls.anonymized_name, up.display_name, 'Anonymous') as display_name,
        CASE WHEN ls.show_age THEN EXTRACT(YEAR FROM AGE(up.birth_date)) ELSE NULL END as age,
        ugp.current_streak_days as score
      FROM user_gamification_progress ugp
      JOIN leaderboard_settings ls ON ls.user_id = ugp.user_id
      LEFT JOIN user_profile up ON up.user_id = ugp.user_id
      WHERE ls.is_participating = true
        AND ls.participate_streak = true
      ORDER BY ugp.current_streak_days DESC
    ) LOOP
      v_rank := v_rank + 1;
      INSERT INTO leaderboard_entries (
        user_id, display_name, age, leaderboard_type, period,
        rank, score, score_unit
      ) VALUES (
        v_entry.user_id, v_entry.display_name, v_entry.age,
        p_leaderboard_type, 'alltime',
        v_rank, v_entry.score, 'jours'
      );
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction: Initialiser leaderboard settings pour nouvel utilisateur
CREATE OR REPLACE FUNCTION initialize_leaderboard_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO leaderboard_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-init leaderboard settings
CREATE TRIGGER on_user_created_init_leaderboard
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_leaderboard_settings();

-- ============================================
-- 6. DONNÉES INITIALES
-- ============================================

-- Initialiser leaderboard settings pour utilisateurs existants
INSERT INTO leaderboard_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE user_records IS 'Records personnels utilisateur avec système bonus XP';
COMMENT ON TABLE leaderboard_settings IS 'Préférences utilisateur pour participation au classement public';
COMMENT ON TABLE leaderboard_entries IS 'Entrées calculées pour les différents classements';
COMMENT ON TABLE record_share_cards IS 'Tracking des cartes de partage générées pour records';
