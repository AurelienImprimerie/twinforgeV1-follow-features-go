/*
  # Enhancement: Records Sharing System V2

  ## Résumé
  Amélioration du système de partage des records avec enrichissement automatique des données,
  préférences utilisateur pour le leaderboard et templates premium.

  ## 1. Modifications Tables Existantes

  ### user_records
  - Pas de modification de structure (context_data jsonb suffit)
  - Les enrichissements seront calculés à la volée

  ### leaderboard_settings
  - Ajout de colonnes pour préférences de partage

  ## 2. Nouvelles Fonctionnalités

  - Préférences utilisateur pour inclure/exclure classement dans cartes
  - Templates premium (epic) pour records légendaires
  - Enrichissement automatique des données

  ## 3. Sécurité

  - RLS maintenu sur toutes les tables
  - Préférences utilisateur privées
  - Opt-in explicite pour partage de données communautaires
*/

-- ============================================
-- 1. AJOUT COLONNE leaderboard_settings
-- ============================================

-- Ajouter préférences de partage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leaderboard_settings' AND column_name = 'allow_sharing_with_rank'
  ) THEN
    ALTER TABLE leaderboard_settings ADD COLUMN allow_sharing_with_rank boolean DEFAULT false;
  END IF;
END $$;

COMMENT ON COLUMN leaderboard_settings.allow_sharing_with_rank IS 'Autoriser affichage du classement dans les cartes de partage';

-- ============================================
-- 2. TABLE record_template_preferences
-- ============================================

CREATE TABLE IF NOT EXISTS record_template_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Préférences par type de record
  training_pr_template text DEFAULT 'story', -- 'minimalist', 'detailed', 'story', 'epic'
  weight_template text DEFAULT 'minimalist',
  transformation_template text DEFAULT 'detailed',

  -- Format préféré
  preferred_format text DEFAULT 'square', -- 'square', 'vertical', 'horizontal'

  -- Options par défaut
  default_include_leaderboard boolean DEFAULT false,
  default_add_custom_message boolean DEFAULT true,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_training_template CHECK (training_pr_template IN ('minimalist', 'detailed', 'story', 'epic')),
  CONSTRAINT valid_weight_template CHECK (weight_template IN ('minimalist', 'detailed', 'story', 'epic')),
  CONSTRAINT valid_transformation_template CHECK (transformation_template IN ('minimalist', 'detailed', 'story', 'epic')),
  CONSTRAINT valid_format CHECK (preferred_format IN ('square', 'vertical', 'horizontal')),
  CONSTRAINT one_preference_per_user UNIQUE (user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_record_template_prefs_user ON record_template_preferences(user_id);

-- Enable RLS
ALTER TABLE record_template_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own template preferences"
  ON record_template_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own template preferences"
  ON record_template_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own template preferences"
  ON record_template_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. FONCTION: Auto-init template preferences
-- ============================================

CREATE OR REPLACE FUNCTION init_record_template_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer préférences par défaut quand un utilisateur est créé
  INSERT INTO record_template_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS init_record_template_preferences_trigger ON auth.users;
CREATE TRIGGER init_record_template_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION init_record_template_preferences();

-- ============================================
-- 4. FONCTION: Get enriched record data
-- ============================================

CREATE OR REPLACE FUNCTION get_enriched_record(
  p_record_id uuid,
  p_include_leaderboard boolean DEFAULT false
)
RETURNS jsonb AS $$
DECLARE
  v_record record;
  v_enrichment jsonb;
  v_percentile numeric;
  v_rank integer;
  v_total integer;
BEGIN
  -- Récupérer le record
  SELECT * INTO v_record
  FROM user_records
  WHERE id = p_record_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calculer les enrichissements
  v_enrichment := jsonb_build_object(
    'formatted_exercise_name', COALESCE(v_record.context_data->>'exercise_name', v_record.record_subtype),
    'formatted_discipline', COALESCE(v_record.context_data->>'discipline', ''),
    'shareability_score', COALESCE((v_record.context_data->>'shareability_score')::integer, 50)
  );

  -- Si leaderboard demandé, calculer percentile et rang
  IF p_include_leaderboard THEN
    -- Calculer percentile
    SELECT
      COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM user_records WHERE record_type = v_record.record_type), 0) * 100
    INTO v_percentile
    FROM user_records
    WHERE record_type = v_record.record_type
      AND record_subtype = v_record.record_subtype
      AND value < v_record.value;

    -- Calculer rang
    SELECT COUNT(*) + 1 INTO v_rank
    FROM user_records
    WHERE record_type = v_record.record_type
      AND record_subtype = v_record.record_subtype
      AND value > v_record.value;

    -- Calculer total
    SELECT COUNT(*) INTO v_total
    FROM user_records
    WHERE record_type = v_record.record_type
      AND record_subtype = v_record.record_subtype;

    v_enrichment := v_enrichment || jsonb_build_object(
      'percentile', COALESCE(v_percentile, 0),
      'community_rank', v_rank,
      'total_in_category', v_total
    );
  END IF;

  RETURN v_enrichment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FONCTION: Update record_share_cards
-- ============================================

-- Ajouter colonnes si nécessaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'record_share_cards' AND column_name = 'included_leaderboard'
  ) THEN
    ALTER TABLE record_share_cards ADD COLUMN included_leaderboard boolean DEFAULT false;
  END IF;
END $$;

COMMENT ON COLUMN record_share_cards.included_leaderboard IS 'Si le classement communautaire a été inclus dans la carte';

-- ============================================
-- 6. INDEX OPTIMISATION
-- ============================================

-- Index pour recherches de percentile/rang rapides
CREATE INDEX IF NOT EXISTS idx_user_records_type_subtype_value
  ON user_records(record_type, record_subtype, value DESC);

-- Index pour progression history
CREATE INDEX IF NOT EXISTS idx_user_records_user_achieved
  ON user_records(user_id, record_type, record_subtype, achieved_at DESC);

-- ============================================
-- 7. VUES UTILES
-- ============================================

-- Vue pour records avec enrichissements de base
CREATE OR REPLACE VIEW enriched_user_records AS
SELECT
  ur.*,
  -- Formatage de base
  COALESCE(ur.context_data->>'exercise_name', ur.record_subtype) as formatted_exercise_name,
  COALESCE(ur.context_data->>'discipline', '') as formatted_discipline,

  -- Calcul improvement
  CASE
    WHEN ur.previous_value IS NOT NULL AND ur.previous_value > 0
    THEN ROUND(((ur.value - ur.previous_value) / ur.previous_value * 100)::numeric, 1)
    ELSE NULL
  END as improvement_percent,

  -- Calcul shareability score de base
  CASE
    WHEN ur.record_category = 'legendary' THEN 90
    WHEN ur.record_category = 'epic' THEN 75
    WHEN ur.record_category = 'major' THEN 60
    ELSE 40
  END as base_shareability_score
FROM user_records ur;

-- Grant access
GRANT SELECT ON enriched_user_records TO authenticated;

-- ============================================
-- 8. COMMENTAIRES
-- ============================================

COMMENT ON TABLE record_template_preferences IS 'Préférences utilisateur pour templates de cartes de partage';
COMMENT ON FUNCTION get_enriched_record IS 'Récupère un record avec données enrichies (percentile, rang, etc)';
COMMENT ON VIEW enriched_user_records IS 'Vue des records avec calculs enrichis de base';
