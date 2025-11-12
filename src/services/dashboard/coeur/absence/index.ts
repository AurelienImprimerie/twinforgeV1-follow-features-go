/**
 * Absence Continuity System - Service Exports
 *
 * This system handles user absence detection, activity estimation,
 * anti-cheat validation, and reconciliation flow.
 *
 * Usage:
 * ```ts
 * import { supabase } from '@/system/supabase/client';
 * import { AbsenceReconciliationService } from '@/services/absence';
 *
 * const reconciliationService = new AbsenceReconciliationService(supabase);
 * const result = await reconciliationService.reconcileAbsence({
 *   userId: 'user-id',
 *   newWeight: 75.5
 * });
 * ```
 */

// Export all services
export { AbsenceDetectionService } from './AbsenceDetectionService';
export { EstimatedActivityService } from './EstimatedActivityService';
export { AntiCheatValidationService } from './AntiCheatValidationService';
export { AbsenceRecoveryCoachingService } from './AbsenceRecoveryCoachingService';
export { AbsenceReconciliationService } from './AbsenceReconciliationService';

// Export types
export type {
  AbsenceDetectionResult,
  AbsenceLog
} from './AbsenceDetectionService';

export type {
  ActivityPattern,
  DailyEstimate,
  AbsenceEstimation
} from './EstimatedActivityService';

export type {
  WeightChangeValidation,
  ValidationContext
} from './AntiCheatValidationService';

export type {
  CoachMessage,
  RecoveryContext
} from './AbsenceRecoveryCoachingService';

export type {
  ReconciliationResult,
  WeightUpdatePayload
} from './AbsenceReconciliationService';
