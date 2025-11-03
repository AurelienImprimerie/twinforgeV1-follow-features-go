/*
  # Ajout des champs simplifiés pour les projections morphologiques

  ## Changements
  
  1. Ajout de nouvelles colonnes pour le système simplifié
     - `sport_intensity`: Intensité sportive (1-5)
     - `duration_key`: Clé de durée ('3_months', '6_months', '1_year', '3_years')
     - `projected_pear_figure`: Valeur projetée de pearFigure (masse grasse)
     - `projected_bodybuilder_size`: Valeur projetée de bodybuilderSize (masse musculaire)
     - `fat_change`: Changement de masse grasse par rapport à la base
     - `muscle_change`: Changement de masse musculaire par rapport à la base
  
  2. Notes
     - Les anciennes colonnes sont conservées pour compatibilité descendante
     - Les nouvelles colonnes permettent un système plus simple et performant
     - Les calculs sont basés uniquement sur 2 clés morphologiques
*/

-- Ajouter les colonnes pour le système simplifié
ALTER TABLE body_projections
ADD COLUMN IF NOT EXISTS sport_intensity INTEGER CHECK (sport_intensity BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS duration_key TEXT CHECK (duration_key IN ('3_months', '6_months', '1_year', '3_years')),
ADD COLUMN IF NOT EXISTS projected_pear_figure NUMERIC,
ADD COLUMN IF NOT EXISTS projected_bodybuilder_size NUMERIC,
ADD COLUMN IF NOT EXISTS fat_change NUMERIC,
ADD COLUMN IF NOT EXISTS muscle_change NUMERIC;

-- Créer un index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_body_projections_user_created 
ON body_projections(user_id, created_at DESC);

-- Créer un index pour les projections favorites
CREATE INDEX IF NOT EXISTS idx_body_projections_favorite 
ON body_projections(user_id, is_favorite) 
WHERE is_favorite = true;

-- Vérifier que les policies RLS sont activées
ALTER TABLE body_projections ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir leurs propres projections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'body_projections' 
    AND policyname = 'Users can view own projections'
  ) THEN
    CREATE POLICY "Users can view own projections"
      ON body_projections
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy pour permettre aux utilisateurs de créer leurs propres projections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'body_projections' 
    AND policyname = 'Users can create own projections'
  ) THEN
    CREATE POLICY "Users can create own projections"
      ON body_projections
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy pour permettre aux utilisateurs de mettre à jour leurs propres projections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'body_projections' 
    AND policyname = 'Users can update own projections'
  ) THEN
    CREATE POLICY "Users can update own projections"
      ON body_projections
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy pour permettre aux utilisateurs de supprimer leurs propres projections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'body_projections' 
    AND policyname = 'Users can delete own projections'
  ) THEN
    CREATE POLICY "Users can delete own projections"
      ON body_projections
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
