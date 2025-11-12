import logger from '@/lib/utils/logger';
import { startOfWeek } from 'date-fns';
import type { BrainContext } from '@/system/head/types';
import type { TransformationObjective } from '../DashboardIntelligenceService';

export interface ForgeScore {
  score: number;
  weight: number;
  details: string;
  dataPoints: number;
  lastActivity: string | null;
}

export interface AdaptiveScores {
  overallScore: number;
  forgeScores: {
    training: ForgeScore;
    nutrition: ForgeScore;
    bodyScan: ForgeScore;
    fasting: ForgeScore;
    wearable: ForgeScore;
    consistency: ForgeScore;
  };
  objectiveProgress: number;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
}

const OBJECTIVE_WEIGHTS: Record<string, Record<string, number>> = {
  weight_loss: {
    training: 0.15,
    nutrition: 0.30,
    bodyScan: 0.20,
    fasting: 0.20,
    wearable: 0.10,
    consistency: 0.05
  },
  muscle_gain: {
    training: 0.35,
    nutrition: 0.30,
    bodyScan: 0.20,
    fasting: 0.05,
    wearable: 0.05,
    consistency: 0.05
  },
  endurance: {
    training: 0.25,
    nutrition: 0.15,
    bodyScan: 0.10,
    fasting: 0.10,
    wearable: 0.30,
    consistency: 0.10
  },
  strength: {
    training: 0.40,
    nutrition: 0.25,
    bodyScan: 0.15,
    fasting: 0.05,
    wearable: 0.10,
    consistency: 0.05
  },
  health_optimization: {
    training: 0.15,
    nutrition: 0.25,
    bodyScan: 0.15,
    fasting: 0.15,
    wearable: 0.20,
    consistency: 0.10
  },
  body_recomposition: {
    training: 0.30,
    nutrition: 0.25,
    bodyScan: 0.25,
    fasting: 0.10,
    wearable: 0.05,
    consistency: 0.05
  }
};

const DEFAULT_WEIGHTS = {
  training: 0.20,
  nutrition: 0.20,
  bodyScan: 0.20,
  fasting: 0.15,
  wearable: 0.15,
  consistency: 0.10
};

class AdaptiveScoreCalculator {
  async calculateAdaptiveScores(
    brainContext: BrainContext,
    objective: TransformationObjective | null,
    consistencyScore: number,
    streakDays: number,
    userId: string
  ): Promise<AdaptiveScores> {
    try {
      const weights = objective
        ? OBJECTIVE_WEIGHTS[objective.objectiveType] || DEFAULT_WEIGHTS
        : DEFAULT_WEIGHTS;

      const trainingScore = await this.calculateTrainingScore(brainContext, userId);
      const nutritionScore = this.calculateNutritionScore(brainContext);
      const bodyScanScore = await this.calculateBodyScanScore(brainContext, userId);
      const fastingScore = this.calculateFastingScore(brainContext);
      const wearableScore = this.calculateWearableScore(brainContext);
      const consistencyForgeScore = this.calculateConsistencyScore(consistencyScore, streakDays);

      const overallScore =
        trainingScore.score * weights.training +
        nutritionScore.score * weights.nutrition +
        bodyScanScore.score * weights.bodyScan +
        fastingScore.score * weights.fasting +
        wearableScore.score * weights.wearable +
        consistencyForgeScore.score * weights.consistency;

      const objectiveProgress = objective
        ? await this.calculateObjectiveProgress(brainContext, objective, userId)
        : 0;

      const trend = await this.determineTrend(overallScore, brainContext, userId);

      const totalDataPoints =
        trainingScore.dataPoints +
        nutritionScore.dataPoints +
        bodyScanScore.dataPoints +
        fastingScore.dataPoints +
        wearableScore.dataPoints;

      const confidence = Math.min(100, (totalDataPoints / 50) * 100);

      logger.debug('ADAPTIVE_SCORE', 'Calculated adaptive scores', {
        overallScore,
        objectiveProgress,
        trend,
        confidence,
        forgeDataPoints: {
          training: trainingScore.dataPoints,
          nutrition: nutritionScore.dataPoints,
          bodyScan: bodyScanScore.dataPoints,
          fasting: fastingScore.dataPoints,
          wearable: wearableScore.dataPoints,
          consistency: consistencyForgeScore.dataPoints
        },
        forgeScores: {
          training: trainingScore.score,
          nutrition: nutritionScore.score,
          bodyScan: bodyScanScore.score,
          fasting: fastingScore.score,
          wearable: wearableScore.score,
          consistency: consistencyForgeScore.score
        }
      });

      return {
        overallScore: Math.round(overallScore * 10) / 10,
        forgeScores: {
          training: { ...trainingScore, weight: weights.training },
          nutrition: { ...nutritionScore, weight: weights.nutrition },
          bodyScan: { ...bodyScanScore, weight: weights.bodyScan },
          fasting: { ...fastingScore, weight: weights.fasting },
          wearable: { ...wearableScore, weight: weights.wearable },
          consistency: { ...consistencyForgeScore, weight: weights.consistency }
        },
        objectiveProgress: Math.round(objectiveProgress * 10) / 10,
        trend,
        confidence: Math.round(confidence)
      };
    } catch (error) {
      logger.error('ADAPTIVE_SCORE', 'Failed to calculate adaptive scores', {
        error,
        hasContext: !!brainContext,
        hasUser: !!brainContext?.user,
        hasTraining: !!brainContext?.user?.training,
        hasNutrition: !!brainContext?.user?.nutrition,
        hasBodyScan: !!brainContext?.user?.bodyScan,
        hasFasting: !!brainContext?.user?.fasting,
        hasActivity: !!brainContext?.user?.energy
      });

      return {
        overallScore: 0,
        forgeScores: {
          training: { score: 0, details: 'Erreur de calcul', dataPoints: 0, lastActivity: null, weight: 0.2 },
          nutrition: { score: 0, details: 'Erreur de calcul', dataPoints: 0, lastActivity: null, weight: 0.2 },
          bodyScan: { score: 0, details: 'Erreur de calcul', dataPoints: 0, lastActivity: null, weight: 0.2 },
          fasting: { score: 0, details: 'Erreur de calcul', dataPoints: 0, lastActivity: null, weight: 0.15 },
          wearable: { score: 0, details: 'Erreur de calcul', dataPoints: 0, lastActivity: null, weight: 0.15 },
          consistency: { score: 0, details: 'Erreur de calcul', dataPoints: 0, lastActivity: null, weight: 0.1 }
        },
        objectiveProgress: 0,
        trend: 'stable',
        confidence: 0
      };
    }
  }

  private async calculateTrainingScore(context: BrainContext, userId: string): Promise<Omit<ForgeScore, 'weight'>> {
    const training = context.user?.training;

    if (!training || !training.hasData) {
      return {
        score: 0,
        details: 'Aucune donnée d\'entraînement',
        dataPoints: 0,
        lastActivity: null
      };
    }

    let score = 0;
    let dataPoints = 0;
    let details = '';

    // Get week start in user's timezone
    const userNow = new Date(); // TODO: Use timezone service when available
    const weekStartDate = startOfWeek(userNow, { weekStartsOn: 0 }); // Sunday = 0

    const weeklySessionsCount = training.recentSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStartDate;
    }).length;

    const totalSessions = training.recentSessions.length;

    if (weeklySessionsCount > 0) {
      const targetSessions = 3;
      const sessionScore = Math.min(100, (weeklySessionsCount / targetSessions) * 100);
      score += sessionScore * 0.4;
      dataPoints += weeklySessionsCount;
      details += `${weeklySessionsCount} séances cette semaine. `;
    }

    if (totalSessions > 0) {
      score += Math.min(30, totalSessions);
      dataPoints += totalSessions;
      details += `${totalSessions} séances totales. `;
    }

    if (training.lastSessionDate) {
      const userNow = new Date(); // TODO: Use timezone service when available
      const daysSinceLastSession = Math.floor(
        (userNow.getTime() - new Date(training.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastSession <= 1) {
        score += 30;
        details += 'Séance récente! ';
      } else if (daysSinceLastSession <= 3) {
        score += 20;
      } else if (daysSinceLastSession <= 7) {
        score += 10;
      }
    }

    return {
      score: Math.min(100, score),
      details: details || 'Bon début d\'entraînement',
      dataPoints,
      lastActivity: training.lastSessionDate
    };
  }

  private calculateNutritionScore(context: BrainContext): Omit<ForgeScore, 'weight'> {
    try {
      const nutrition = context.user?.nutrition;

      if (!nutrition || !nutrition.hasData) {
      return {
        score: 0,
        details: 'Aucune donnée nutritionnelle',
        dataPoints: 0,
        lastActivity: null
      };
    }

    let score = 0;
    let dataPoints = nutrition.recentMeals.length;
    let details = '';

    if (nutrition.scanFrequency > 0) {
      const dailyTarget = 30;
      const frequencyScore = Math.min(100, (nutrition.scanFrequency / dailyTarget) * 100);
      score += frequencyScore * 0.5;
      details += `${nutrition.scanFrequency} repas scannés. `;
    }

    if (nutrition.mealPlans.hasActivePlan) {
      score += 25;
      dataPoints += 5;
      details += 'Plan actif. ';
    }

    if (nutrition.fridgeScans.hasInventory) {
      score += 15;
      dataPoints += nutrition.fridgeScans.totalItemsInFridge;
      details += `${nutrition.fridgeScans.totalItemsInFridge} items en stock. `;
    }

    if (nutrition.averageProtein > 0) {
      const proteinTarget = 120;
      const proteinScore = Math.min(10, (nutrition.averageProtein / proteinTarget) * 10);
      score += proteinScore;
      details += `${Math.round(nutrition.averageProtein)}g protéines/jour. `;
    }

      return {
        score: Math.min(100, score),
        details: details || 'Suivi nutritionnel démarré',
        dataPoints,
        lastActivity: nutrition.lastScanDate
      };
    } catch (error) {
      logger.error('ADAPTIVE_SCORE', 'Error calculating nutrition score', { error });
      return {
        score: 0,
        details: 'Erreur de calcul',
        dataPoints: 0,
        lastActivity: null
      };
    }
  }

  private async calculateBodyScanScore(context: BrainContext, userId: string): Promise<Omit<ForgeScore, 'weight'>> {
    try {
      const bodyScan = context.user?.bodyScan;

      if (!bodyScan) {
        logger.debug('ADAPTIVE_SCORE', 'No body scan data in context');
        return {
          score: 0,
          details: 'Aucun scan corporel',
          dataPoints: 0,
          lastActivity: null
        };
      }

      if (!bodyScan.hasData) {
        logger.debug('ADAPTIVE_SCORE', 'Body scan hasData is false');
        return {
          score: 0,
          details: 'Aucun scan corporel',
          dataPoints: 0,
          lastActivity: null
        };
      }

      let score = 0;
      let dataPoints = 0;
      let details = '';

      if (bodyScan.totalScans > 0) {
        score += Math.min(40, bodyScan.totalScans * 10);
        dataPoints += bodyScan.totalScans;
        details += `${bodyScan.totalScans} scans effectués. `;
      }

      if (bodyScan.lastScanDate) {
        const userNow = new Date(); // TODO: Use timezone service when available
        const daysSinceLastScan = Math.floor(
          (userNow.getTime() - new Date(bodyScan.lastScanDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastScan <= 7) {
          score += 30;
          details += 'Scan récent! ';
        } else if (daysSinceLastScan <= 14) {
          score += 20;
        } else if (daysSinceLastScan <= 30) {
          score += 10;
        }
      }

      if (bodyScan.hasProjections) {
        score += 30;
        dataPoints += 1;
        details += 'Projections disponibles. ';
      }

      logger.debug('ADAPTIVE_SCORE', 'Body scan score calculated', {
        score,
        dataPoints,
        totalScans: bodyScan.totalScans,
        hasProjections: bodyScan.hasProjections
      });

      return {
        score: Math.min(100, score),
        details: details || 'Scan corporel en cours',
        dataPoints,
        lastActivity: bodyScan.lastScanDate
      };
    } catch (error) {
      logger.error('ADAPTIVE_SCORE', 'Error calculating body scan score', { error });
      return {
        score: 0,
        details: 'Erreur de calcul',
        dataPoints: 0,
        lastActivity: null
      };
    }
  }

  private calculateFastingScore(context: BrainContext): Omit<ForgeScore, 'weight'> {
    try {
      const fasting = context.user?.fasting;

      if (!fasting) {
        logger.debug('ADAPTIVE_SCORE', 'No fasting data in context');
        return {
          score: 0,
          details: 'Aucun jeûne configuré',
          dataPoints: 0,
          lastActivity: null
        };
      }

      if (!fasting.hasData) {
        logger.debug('ADAPTIVE_SCORE', 'Fasting hasData is false');
        return {
          score: 0,
          details: 'Aucun jeûne configuré',
          dataPoints: 0,
          lastActivity: null
        };
      }

      let score = 0;
      let dataPoints = 0;
      let details = '';

      if (fasting.totalSessions > 0) {
        score += Math.min(40, fasting.totalSessions * 5);
        dataPoints += fasting.totalSessions;
        details += `${fasting.totalSessions} sessions. `;
      }

      if (fasting.currentStreak > 0) {
        score += Math.min(30, fasting.currentStreak * 10);
        details += `${fasting.currentStreak} jours de suite! `;
      }

      if (fasting.successRate > 0) {
        score += fasting.successRate * 0.3;
        details += `${Math.round(fasting.successRate)}% de réussite. `;
      }

      logger.debug('ADAPTIVE_SCORE', 'Fasting score calculated', {
        score,
        dataPoints,
        totalSessions: fasting.totalSessions,
        currentStreak: fasting.currentStreak
      });

      return {
        score: Math.min(100, score),
        details: details || 'Jeûne intermittent démarré',
        dataPoints,
        lastActivity: fasting.lastSessionDate
      };
    } catch (error) {
      logger.error('ADAPTIVE_SCORE', 'Error calculating fasting score', { error });
      return {
        score: 0,
        details: 'Erreur de calcul',
        dataPoints: 0,
        lastActivity: null
      };
    }
  }

  private calculateWearableScore(context: BrainContext): Omit<ForgeScore, 'weight'> {
    try {
      const activity = context.user?.energy;

      if (!activity || !activity.hasData) {
      return {
        score: 0,
        details: 'Aucune donnée wearable',
        dataPoints: 0,
        lastActivity: null
      };
    }

    let score = 0;
    let dataPoints = activity.recentActivities?.length || 0;
    let details = '';

    const recentActivitiesCount = activity.recentActivities?.length || 0;
    if (recentActivitiesCount > 0) {
      const weeklyTarget = 5;
      const weeklyScore = Math.min(100, (recentActivitiesCount / weeklyTarget) * 100);
      score += weeklyScore * 0.6;
      details += `${recentActivitiesCount} activités cette semaine. `;
    }

    if (activity.biometrics?.hrAvg && activity.biometrics.hrAvg > 0) {
      score += 20;
      details += `FC moyenne: ${Math.round(activity.biometrics.hrAvg)} bpm. `;
    }

    const totalCalories = activity.recentActivities?.reduce((sum, act) => sum + (act.caloriesBurned || 0), 0) || 0;
    if (totalCalories > 0) {
      score += 20;
      details += `${Math.round(totalCalories)} cal brûlées. `;
    }

      return {
        score: Math.min(100, score),
        details: details || 'Suivi des activités actif',
        dataPoints,
        lastActivity: activity.lastActivityDate
      };
    } catch (error) {
      logger.error('ADAPTIVE_SCORE', 'Error calculating wearable score', { error });
      return {
        score: 0,
        details: 'Erreur de calcul',
        dataPoints: 0,
        lastActivity: null
      };
    }
  }

  private calculateConsistencyScore(
    dailyConsistencyScore: number,
    streakDays: number
  ): Omit<ForgeScore, 'weight'> {
    let score = 0;
    let dataPoints = 0;

    if (dailyConsistencyScore > 0) {
      score += dailyConsistencyScore * 0.5;
      dataPoints += 1;
    }

    if (streakDays > 0) {
      const streakBonus = Math.min(50, streakDays * 5);
      score += streakBonus;
      dataPoints += streakDays;
    }

    const details =
      streakDays > 0
        ? `${Math.round(dailyConsistencyScore)}% aujourd'hui, ${streakDays} jours de suite!`
        : dailyConsistencyScore > 0
        ? `${Math.round(dailyConsistencyScore)}% aujourd'hui`
        : 'Aucune activité aujourd\'hui';

    return {
      score: Math.min(100, score),
      details,
      dataPoints: Math.max(1, dataPoints),
      lastActivity: new Date().toISOString()
    };
  }

  private async calculateObjectiveProgress(
    context: BrainContext,
    objective: TransformationObjective,
    userId: string
  ): Promise<number> {
    switch (objective.objectiveType) {
      case 'weight_loss':
        return this.calculateWeightLossProgress(context, objective);
      case 'muscle_gain':
        return await this.calculateMuscleGainProgress(context, objective, userId);
      case 'endurance':
        return this.calculateEnduranceProgress(context, objective);
      case 'strength':
        return await this.calculateStrengthProgress(context, objective, userId);
      case 'health_optimization':
        return this.calculateHealthOptimizationProgress(context);
      case 'body_recomposition':
        return await this.calculateBodyRecompositionProgress(context, userId);
      default:
        return 0;
    }
  }

  private calculateWeightLossProgress(context: BrainContext, objective: TransformationObjective): number {
    if (!context.user?.bodyScan?.hasData) return 0;

    const currentWeight = context.user.bodyScan.latestMeasurements?.weight;
    const targetWeight = objective.targetValue;

    if (!currentWeight || currentWeight === targetWeight) return 100;

    const initialWeight = currentWeight + (currentWeight - targetWeight) * 0.1;
    const progress = ((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100;

    return Math.max(0, Math.min(100, progress));
  }

  private async calculateMuscleGainProgress(context: BrainContext, objective: TransformationObjective, userId: string): Promise<number> {
    const userNow = new Date(); // TODO: Use timezone service when available
    const weekStartDate = startOfWeek(userNow, { weekStartsOn: 0 });

    const trainingFrequency = context.user?.training?.recentSessions?.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStartDate;
    }).length || 0;

    const proteinIntake = context.user?.nutrition?.averageProtein || 0;

    let progress = 0;

    if (trainingFrequency >= 3) progress += 40;
    else if (trainingFrequency >= 2) progress += 25;
    else if (trainingFrequency >= 1) progress += 15;

    if (proteinIntake >= 120) progress += 40;
    else if (proteinIntake >= 100) progress += 25;
    else if (proteinIntake >= 80) progress += 15;

    if (context.user?.bodyScan?.hasData) progress += 20;

    return Math.min(100, progress);
  }

  private calculateEnduranceProgress(context: BrainContext, objective: TransformationObjective): number {
    const weeklyActivities = context.user?.energy?.recentActivities?.length || 0;
    const avgHeartRate = context.user?.energy?.biometrics?.hrAvg || 0;

    let progress = 0;

    if (weeklyActivities >= 5) progress += 50;
    else if (weeklyActivities >= 3) progress += 30;
    else if (weeklyActivities >= 1) progress += 15;

    if (avgHeartRate > 0 && avgHeartRate < 140) progress += 30;
    else if (avgHeartRate > 0) progress += 15;

    if ((context.user?.energy?.recentActivities?.length || 0) > 10) progress += 20;

    return Math.min(100, progress);
  }

  private async calculateStrengthProgress(context: BrainContext, objective: TransformationObjective, userId: string): Promise<number> {
    const userNow = new Date(); // TODO: Use timezone service when available
    const weekStartDate = startOfWeek(userNow, { weekStartsOn: 0 });

    const trainingFrequency = context.user?.training?.recentSessions?.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStartDate;
    }).length || 0;

    const totalSessions = context.user?.training?.recentSessions?.length || 0;

    let progress = 0;

    if (trainingFrequency >= 4) progress += 50;
    else if (trainingFrequency >= 3) progress += 35;
    else if (trainingFrequency >= 2) progress += 20;

    if (totalSessions >= 20) progress += 30;
    else if (totalSessions >= 10) progress += 20;
    else if (totalSessions >= 5) progress += 10;

    if (context.user?.bodyScan?.hasData) progress += 20;

    return Math.min(100, progress);
  }

  private calculateHealthOptimizationProgress(context: BrainContext): number {
    let progress = 0;

    if (context.user?.training?.hasData) progress += 15;
    if (context.user?.nutrition?.hasData) progress += 20;
    if (context.user?.fasting?.hasData) progress += 15;
    if (context.user?.bodyScan?.hasData) progress += 20;
    if (context.user?.energy?.hasData) progress += 20;

    if ((context.user?.nutrition?.scanFrequency || 0) >= 21) progress += 10;

    return Math.min(100, progress);
  }

  private async calculateBodyRecompositionProgress(context: BrainContext, userId: string): Promise<number> {
    let progress = 0;

    const userNow = new Date(); // TODO: Use timezone service when available
    const weekStartDate = startOfWeek(userNow, { weekStartsOn: 0 });

    const weeklySessionsCount = context.user?.training?.recentSessions?.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStartDate;
    }).length || 0;

    if (weeklySessionsCount >= 3) progress += 30;
    if ((context.user?.nutrition?.averageProtein || 0) >= 100) progress += 25;
    if (context.user?.bodyScan?.hasData && (context.user?.bodyScan?.recentScans?.length || 0) >= 2) progress += 25;
    if (context.user?.fasting?.hasData) progress += 10;
    if ((context.user?.energy?.recentActivities?.length || 0) >= 2) progress += 10;

    return Math.min(100, progress);
  }

  private async determineTrend(currentScore: number, context: BrainContext, userId: string): Promise<'improving' | 'stable' | 'declining'> {
    const userNow = new Date(); // TODO: Use timezone service when available
    const recentActivityDays = [
      context.user?.training?.lastSessionDate,
      context.user?.nutrition?.lastScanDate,
      context.user?.bodyScan?.lastScanDate,
      context.user?.fasting?.lastSessionDate,
      context.user?.energy?.lastActivityDate
    ]
      .filter(Boolean)
      .map((date) => Math.floor((userNow.getTime() - new Date(date!).getTime()) / (1000 * 60 * 60 * 24)));

    const avgDaysSinceActivity =
      recentActivityDays.length > 0
        ? recentActivityDays.reduce((a, b) => a + b, 0) / recentActivityDays.length
        : 30;

    if (currentScore >= 70 && avgDaysSinceActivity <= 3) return 'improving';
    if (currentScore >= 50 && avgDaysSinceActivity <= 7) return 'stable';
    return 'declining';
  }
}

export const adaptiveScoreCalculator = new AdaptiveScoreCalculator();
