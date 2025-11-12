/**
 * Cœur de la Forge - Services Gamification
 *
 * Services liés à l'onglet "Cœur de la Forge":
 * - Progression XP/Niveau
 * - Actions quotidiennes
 * - Bonus et multiplicateurs
 * - Prédictions de niveau
 */

// Core Gamification Service
export { gamificationService } from './GamificationService';
export type {
  GamificationProgress,
  XpEvent,
  LevelMilestone,
  WeightUpdate,
  XpAwardResult
} from './GamificationService';

// Prediction Services
export { gamificationPredictionService, gamificationPredictionV2Service } from './GamificationPredictionService';
export type { UniversalLevelPrediction, PredictionTimeframe } from './GamificationPredictionService';

export { gamificationUniversalPredictionService } from './GamificationUniversalPredictionService';
export type { UniversalPrediction } from './GamificationUniversalPredictionService';

export { gamificationLevelPredictionService } from './GamificationLevelPredictionService';
export type { LevelPrediction } from './GamificationLevelPredictionService';

// Bonus & Actions
export { bonusXpCalculator } from './BonusXpCalculator';

export { actionQueueGenerator } from './ActionQueueGenerator';

export { adaptiveScoreCalculator } from './AdaptiveScoreCalculator';
export type { ForgeScore, AdaptiveScores } from './AdaptiveScoreCalculator';
