/*
  # Add transformation card shares tracking system

  1. New Table
    - `transformation_card_shares`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profile)
      - `record_id` (uuid, references user_records)
      - `template_type` (text) - Type de template utilisé (transformation, minimalist, etc.)
      - `card_format` (text) - Format de la carte (vertical, square, etc.)
      - `card_data` (jsonb) - Données de la carte au moment du partage
      - `shared_at` (timestamptz) - Date de partage effectif (null si download seulement)
      - `platform` (text) - Plateforme de partage (native_share, download, instagram, etc.)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can insert their own shares
    - Users can view their own shares
    - Admins can view all shares

  3. Indexes
    - Index on user_id for fast user queries
    - Index on record_id for record tracking
    - Index on created_at for temporal queries
*/

-- Create transformation_card_shares table
CREATE TABLE IF NOT EXISTS transformation_card_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  record_id uuid NOT NULL REFERENCES user_records(id) ON DELETE CASCADE,
  template_type text NOT NULL DEFAULT 'transformation',
  card_format text NOT NULL DEFAULT 'vertical',
  card_data jsonb DEFAULT '{}'::jsonb,
  shared_at timestamptz,
  platform text,
  created_at timestamptz DEFAULT now()
);

-- Add comments
COMMENT ON TABLE transformation_card_shares IS 'Tracking des partages de cartes de transformation';
COMMENT ON COLUMN transformation_card_shares.user_id IS 'Utilisateur ayant généré la carte';
COMMENT ON COLUMN transformation_card_shares.record_id IS 'Record de transformation partagé';
COMMENT ON COLUMN transformation_card_shares.template_type IS 'Type de template (transformation, minimalist, fullscreen)';
COMMENT ON COLUMN transformation_card_shares.card_format IS 'Format de la carte (vertical, square, horizontal)';
COMMENT ON COLUMN transformation_card_shares.card_data IS 'Données de la carte au moment du partage';
COMMENT ON COLUMN transformation_card_shares.shared_at IS 'Date de partage effectif (null si download seulement)';
COMMENT ON COLUMN transformation_card_shares.platform IS 'Plateforme de partage (native_share, instagram, etc.)';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transformation_card_shares_user_id 
  ON transformation_card_shares(user_id);

CREATE INDEX IF NOT EXISTS idx_transformation_card_shares_record_id 
  ON transformation_card_shares(record_id);

CREATE INDEX IF NOT EXISTS idx_transformation_card_shares_created_at 
  ON transformation_card_shares(created_at DESC);

-- Enable RLS
ALTER TABLE transformation_card_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own transformation card shares"
  ON transformation_card_shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transformation card shares"
  ON transformation_card_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transformation card shares"
  ON transformation_card_shares FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transformation card shares"
  ON transformation_card_shares FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);