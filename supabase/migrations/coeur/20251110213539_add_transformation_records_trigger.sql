/*
  # Add Transformation Records Trigger
  
  1. Description
    Trigger automatique qui détecte et crée les records de transformation
    lors de chaque mise à jour de poids dans weight_updates_history
  
  2. Trigger Function
    - Appelé automatiquement après INSERT sur weight_updates_history
    - Récupère l'objectif de l'utilisateur depuis user_profile
    - Appelle detect_transformation_records() pour détecter les records
    - Log les résultats pour monitoring
  
  3. Security
    - Function SECURITY DEFINER pour accès contrôlé
    - Validation des données utilisateur
*/

-- Create trigger function
CREATE OR REPLACE FUNCTION trigger_detect_transformation_records()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_objective text;
  v_records_created jsonb;
BEGIN
  -- Get user objective from profile
  SELECT objective INTO v_objective
  FROM user_profile
  WHERE user_id = NEW.user_id;
  
  -- Default to fat_loss if no objective set
  IF v_objective IS NULL THEN
    v_objective := 'fat_loss';
  END IF;
  
  -- Call detect_transformation_records
  v_records_created := detect_transformation_records(
    NEW.user_id,
    NEW.new_weight,
    v_objective
  );
  
  -- Log the result (optional, for debugging)
  IF jsonb_array_length(v_records_created) > 0 THEN
    RAISE NOTICE 'Created % transformation record(s) for user %', 
      jsonb_array_length(v_records_created), 
      NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on weight_updates_history
DROP TRIGGER IF EXISTS trigger_transformation_records_on_weight_update 
  ON weight_updates_history;

CREATE TRIGGER trigger_transformation_records_on_weight_update
  AFTER INSERT ON weight_updates_history
  FOR EACH ROW
  EXECUTE FUNCTION trigger_detect_transformation_records();

-- Add comment
COMMENT ON FUNCTION trigger_detect_transformation_records IS 
  'Automatically detects and creates transformation records when weight is updated';
