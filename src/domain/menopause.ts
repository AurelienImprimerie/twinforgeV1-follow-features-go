/**
 * Menopause Domain Types
 *
 * Types and interfaces for menopause tracking and management
 */

export type ReproductiveStatus =
  | 'menstruating'
  | 'perimenopause'
  | 'menopause'
  | 'postmenopause';

export type PerimenopauseStage = 'early' | 'late';

export interface MenopauseTracking {
  id: string;
  user_id: string;
  reproductive_status: ReproductiveStatus;
  perimenopause_stage: PerimenopauseStage | null;
  last_period_date: string | null;
  menopause_confirmation_date: string | null;
  fsh_level: number | null;
  estrogen_level: number | null;
  last_hormone_test_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenopauseSymptomLog {
  id: string;
  user_id: string;
  symptom_date: string;
  hot_flashes_intensity: number | null;
  night_sweats_intensity: number | null;
  sleep_quality: number | null;
  mood_changes_intensity: number | null;
  vaginal_dryness_intensity: number | null;
  energy_level: number | null;
  brain_fog_intensity: number | null;
  joint_pain_intensity: number | null;
  heart_palpitations: boolean;
  weight_gain: number | null;
  notes: string | null;
  created_at: string;
}

export interface MenopauseFormData {
  reproductive_status: ReproductiveStatus;
  perimenopause_stage: PerimenopauseStage | null;
  last_period_date: string;
  menopause_confirmation_date: string;
  fsh_level: string;
  estrogen_level: string;
  last_hormone_test_date: string;
  notes: string;
}

export interface SymptomLogFormData {
  symptom_date: string;
  hot_flashes_intensity: number;
  night_sweats_intensity: number;
  sleep_quality: number;
  mood_changes_intensity: number;
  vaginal_dryness_intensity: number;
  energy_level: number;
  brain_fog_intensity: number;
  joint_pain_intensity: number;
  heart_palpitations: boolean;
  weight_gain: string;
  notes: string;
}

export interface MenopausePhaseData {
  status: ReproductiveStatus;
  stage: PerimenopauseStage | null;
  daysSinceLastPeriod: number | null;
  daysUntilMenopauseConfirmation: number | null;
  isInTransition: boolean;
  phaseDescription: string;
  energyLevel: 'low' | 'moderate' | 'high';
  metabolicRate: 'reduced' | 'normal';
}

export interface MenopauseRecommendations {
  nutrition: string[];
  exercise: string[];
  fasting: string[];
  lifestyle: string[];
}

export interface SymptomSummary {
  averageIntensity: number;
  mostCommonSymptoms: Array<{
    symptom: string;
    frequency: number;
    averageIntensity: number;
  }>;
  trendDirection: 'improving' | 'stable' | 'worsening';
}
