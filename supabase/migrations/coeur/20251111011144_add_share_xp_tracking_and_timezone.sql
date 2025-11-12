/*
  # Système de tracking des partages XP et gestion des fuseaux horaires

  1. Nouvelles Tables
    - `record_share_xp_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers user_profile)
      - `record_id` (uuid) - ID du record partagé
      - `share_type` (text) - Type: 'training_record', 'session_record', 'transformation_record'
      - `xp_awarded` (integer) - XP accordé (50 points)
      - `shared_at` (timestamptz) - Date du partage
      - `created_at` (timestamptz)

  2. Modifications
    - Ajout de la colonne `timezone` dans `user_profile`
      - Stocke le fuseau horaire de l'utilisateur (ex: 'America/Martinique', 'Europe/Paris')
      - Permet de gérer correctement les actions quotidiennes et le système de gamification

  3. Sécurité
    - RLS activé sur la nouvelle table
    - Policies pour permettre aux utilisateurs de voir uniquement leurs propres partages
    - Index pour optimiser les requêtes de vérification

  4. Notes Importantes
    - Le système empêche de gagner des XP plusieurs fois pour le même record
    - Le timezone est optionnel et sera détecté automatiquement par le client si non défini
    - Les calculs de début/fin de journée utiliseront le timezone de l'utilisateur
*/

-- Ajouter la colonne timezone au profil utilisateur
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profile' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE user_profile ADD COLUMN timezone text DEFAULT NULL;
    COMMENT ON COLUMN user_profile.timezone IS 'Fuseau horaire de l''utilisateur (ex: Europe/Paris, America/Martinique)';
  END IF;
END $$;

-- Créer la table de tracking des partages XP
CREATE TABLE IF NOT EXISTS record_share_xp_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  record_id uuid NOT NULL,
  share_type text NOT NULL CHECK (share_type IN ('training_record', 'session_record', 'transformation_record')),
  xp_awarded integer NOT NULL DEFAULT 50,
  shared_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour optimiser les vérifications de doublons
CREATE INDEX IF NOT EXISTS idx_record_share_xp_user_record
  ON record_share_xp_tracking(user_id, record_id, share_type);

-- Index pour les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_record_share_xp_user
  ON record_share_xp_tracking(user_id, shared_at DESC);

-- Constraint unique pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_record_share_xp_unique
  ON record_share_xp_tracking(user_id, record_id, share_type);

-- Activer RLS
ALTER TABLE record_share_xp_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir uniquement leurs propres partages
CREATE POLICY "Users can view own share XP tracking"
  ON record_share_xp_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent insérer leurs propres partages
CREATE POLICY "Users can insert own share XP tracking"
  ON record_share_xp_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Pas de mise à jour (immutable après création)
-- Policy: Pas de suppression (historique permanent)

-- Fonction helper pour vérifier si un partage a déjà donné des XP
CREATE OR REPLACE FUNCTION check_share_xp_already_awarded(
  p_user_id uuid,
  p_record_id uuid,
  p_share_type text
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM record_share_xp_tracking
    WHERE user_id = p_user_id
      AND record_id = p_record_id
      AND share_type = p_share_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour enregistrer un partage avec XP
CREATE OR REPLACE FUNCTION record_share_with_xp(
  p_user_id uuid,
  p_record_id uuid,
  p_share_type text
) RETURNS jsonb AS $$
DECLARE
  v_already_awarded boolean;
  v_xp_amount integer := 50;
  v_result jsonb;
BEGIN
  -- Vérifier si déjà partagé
  v_already_awarded := check_share_xp_already_awarded(p_user_id, p_record_id, p_share_type);

  IF v_already_awarded THEN
    -- Déjà partagé, pas de XP
    RETURN jsonb_build_object(
      'success', true,
      'xp_awarded', 0,
      'already_shared', true,
      'message', 'Ce record a déjà été partagé'
    );
  END IF;

  -- Enregistrer le partage
  INSERT INTO record_share_xp_tracking (
    user_id,
    record_id,
    share_type,
    xp_awarded,
    shared_at
  ) VALUES (
    p_user_id,
    p_record_id,
    p_share_type,
    v_xp_amount,
    now()
  );

  -- Accorder les XP via le système de gamification
  -- Note: Cette fonction doit être appelée depuis le client pour gérer les XP

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_xp_amount,
    'already_shared', false,
    'message', 'Partage enregistré ! +' || v_xp_amount || ' XP'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur les fonctions
COMMENT ON FUNCTION check_share_xp_already_awarded IS 'Vérifie si un record a déjà été partagé avec gain XP';
COMMENT ON FUNCTION record_share_with_xp IS 'Enregistre un partage de record et retourne les informations de XP';
