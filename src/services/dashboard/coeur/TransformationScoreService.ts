/**
 * TransformationScoreService
 * Calcule le score de transformation global basé sur les données de toutes les forges
 */

import { supabase } from '@/system/supabase/client';
import { brainCore } from '@/system/head';
import logger from '@/lib/utils/logger';
import type {
  TransformationScore,
  ForgeScore,
  ScoreLevel,
  LevelInfo,
  ScoreHistory
} from './types';
import type { UserKnowledge } from '@/system/head/types';

class TransformationScoreServiceClass {
  private readonly LEVEL_THRESHOLDS: Record<ScoreLevel, number> = {
    bronze: 0,
    silver: 30,
    gold: 50,
    platinum: 70,
    diamond: 90
  };

  private readonly LEVEL_COLORS: Record<ScoreLevel, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF'
  };

  /**
   * Calculate global transformation score
   */
  async calculateGlobalScore(userId: string): Promise<TransformationScore> {
    try {
      logger.debug('TRANSFORMATION_SCORE', 'Calculating global score', { userId });

      const context = await brainCore.getContext();
      const knowledge = context.userKnowledge;

      const forgeScores = {
        training: this.calculateTrainingScore(knowledge),
        nutrition: this.calculateNutritionScore(knowledge),
        fasting: this.calculateFastingScore(knowledge),
        body: this.calculateBodyScore(knowledge),
        energy: this.calculateEnergyScore(knowledge),
        consistency: this.calculateConsistencyScore(knowledge)
      };

      const globalScore = this.calculateWeightedAverage(forgeScores);
      const level = this.getLevel(globalScore);
      const levelProgress = this.getLevelProgress(globalScore, level);

      const evolution = await this.getScoreEvolution(userId);

      const transformationScore: TransformationScore = {
        globalScore: Math.round(globalScore),
        level,
        levelProgress,
        forgeScores,
        timestamp: new Date(),
        evolution
      };

      await this.saveScore(userId, transformationScore);

      logger.info('TRANSFORMATION_SCORE', 'Score calculated successfully', {
        userId,
        globalScore: transformationScore.globalScore,
        level
      });

      return transformationScore;
    } catch (error) {
      logger.error('TRANSFORMATION_SCORE', 'Failed to calculate score', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Calculate training score (20% weight)
   */
  private calculateTrainingScore(knowledge: UserKnowledge): ForgeScore {
    const training = knowledge?.training;

    if (!training || !training.hasData || !training.recentSessions || training.recentSessions.length === 0) {
      return { score: 0, weight: 0.20, hasData: false };
    }

    let score = 0;
    const weights = {
      consistency: 0.4, // 40%
      volume: 0.3, // 30%
      progression: 0.3 // 30%
    };

    const last7Days = training.recentSessions.filter(s => {
      const sessionDate = new Date(s.date);
      const daysAgo = (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    const consistencyScore = Math.min(100, (last7Days.length / 4) * 100);
    score += consistencyScore * weights.consistency;

    const completedSessions = training.recentSessions.filter(s => s.status === 'completed');
    const volumeScore = Math.min(100, (completedSessions.length / 10) * 100);
    score += volumeScore * weights.volume;

    const hasProgression = training.progressionPatterns.length > 0;
    const progressionScore = hasProgression ? 80 : 40;
    score += progressionScore * weights.progression;

    return {
      score: Math.round(score),
      weight: 0.20,
      hasData: true
    };
  }

  /**
   * Calculate nutrition score (25% weight)
   */
  private calculateNutritionScore(knowledge: UserKnowledge): ForgeScore {
    const nutrition = knowledge?.nutrition;

    if (!nutrition || !nutrition.hasData || !nutrition.recentMeals || nutrition.recentMeals.length === 0) {
      return { score: 0, weight: 0.25, hasData: false };
    }

    let score = 0;
    const weights = {
      frequency: 0.4,
      macroCompliance: 0.4,
      quality: 0.2
    };

    const last7DaysMeals = nutrition.recentMeals.filter(m => {
      const mealDate = new Date(m.created_at);
      const daysAgo = (Date.now() - mealDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    const avgMealsPerDay = last7DaysMeals.length / 7;
    const frequencyScore = Math.min(100, (avgMealsPerDay / 3) * 100);
    score += frequencyScore * weights.frequency;

    if (nutrition.dailyAvgMacros) {
      const proteinCompliance = nutrition.dailyAvgMacros.protein_g / (knowledge.profile.proteinTargetG || 150);
      const macroScore = Math.min(100, proteinCompliance * 100);
      score += macroScore * weights.macroCompliance;
    }

    const qualityScore = 70;
    score += qualityScore * weights.quality;

    return {
      score: Math.round(score),
      weight: 0.25,
      hasData: true
    };
  }

  /**
   * Calculate fasting score (15% weight)
   */
  private calculateFastingScore(knowledge: UserKnowledge): ForgeScore {
    const fasting = knowledge?.fasting;

    if (!fasting || !fasting.hasData) {
      return { score: 0, weight: 0.15, hasData: false };
    }

    let score = 0;

    if (fasting.currentSession) {
      score += 30;
    }

    const recentSessionsCompleted = (fasting.recentSessions || []).filter(s => s.status === 'completed').length;
    const consistencyScore = Math.min(70, (recentSessionsCompleted / 5) * 70);
    score += consistencyScore;

    return {
      score: Math.round(score),
      weight: 0.15,
      hasData: true
    };
  }

  /**
   * Calculate body score (15% weight)
   */
  private calculateBodyScore(knowledge: UserKnowledge): ForgeScore {
    const bodyScan = knowledge?.bodyScan;

    if (!bodyScan || !bodyScan.hasData || !bodyScan.recentScans || bodyScan.recentScans.length === 0) {
      return { score: 0, weight: 0.15, hasData: false };
    }

    let score = 50;

    if (bodyScan.recentScans.length >= 2) {
      score += 30;
    }

    if (bodyScan.morphologyInsights.hasData) {
      score += 20;
    }

    return {
      score: Math.round(score),
      weight: 0.15,
      hasData: true
    };
  }

  /**
   * Calculate energy score (10% weight)
   */
  private calculateEnergyScore(knowledge: UserKnowledge): ForgeScore {
    const energy = knowledge?.energy;

    if (!energy || !energy.hasData) {
      return { score: 0, weight: 0.10, hasData: false };
    }

    let score = 0;

    if (energy.hasConnectedDevices) {
      score += 50;
    }

    if (energy.recentActivities && energy.recentActivities.length > 0) {
      const recentScore = Math.min(50, (energy.recentActivities.length / 5) * 50);
      score += recentScore;
    }

    return {
      score: Math.round(score),
      weight: 0.10,
      hasData: true
    };
  }

  /**
   * Calculate consistency score (15% weight)
   */
  private calculateConsistencyScore(knowledge: UserKnowledge): ForgeScore {
    const today = knowledge?.today;
    let score = 0;
    let activeForges = 0;

    if (!today) {
      return { score: 0, weight: 0.15, hasData: false };
    }

    if (today.hasTraining && today.trainingSessions?.length > 0) {
      score += 25;
      activeForges++;
    }

    if (today.hasNutrition && today.meals?.length > 0) {
      score += 25;
      activeForges++;
    }

    if (today.hasFasting && today.fastingSession) {
      score += 20;
      activeForges++;
    }

    if (today.hasBodyScan && today.bodyScans?.length > 0) {
      score += 15;
      activeForges++;
    }

    if (activeForges >= 3) {
      score += 15;
    }

    return {
      score: Math.round(score),
      weight: 0.15,
      hasData: activeForges > 0
    };
  }

  /**
   * Calculate weighted average of all forge scores
   */
  private calculateWeightedAverage(forgeScores: Record<string, ForgeScore>): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.values(forgeScores).forEach(forge => {
      if (forge.hasData) {
        totalWeightedScore += forge.score * forge.weight;
        totalWeight += forge.weight;
      }
    });

    if (totalWeight === 0) return 0;

    return (totalWeightedScore / totalWeight);
  }

  /**
   * Get level from score
   */
  private getLevel(score: number): ScoreLevel {
    if (score >= this.LEVEL_THRESHOLDS.diamond) return 'diamond';
    if (score >= this.LEVEL_THRESHOLDS.platinum) return 'platinum';
    if (score >= this.LEVEL_THRESHOLDS.gold) return 'gold';
    if (score >= this.LEVEL_THRESHOLDS.silver) return 'silver';
    return 'bronze';
  }

  /**
   * Get level progress (0-100)
   */
  private getLevelProgress(score: number, currentLevel: ScoreLevel): number {
    const currentThreshold = this.LEVEL_THRESHOLDS[currentLevel];
    const levels: ScoreLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex === levels.length - 1) {
      return 100;
    }

    const nextLevel = levels[currentIndex + 1];
    const nextThreshold = this.LEVEL_THRESHOLDS[nextLevel];
    const range = nextThreshold - currentThreshold;
    const progress = score - currentThreshold;

    return Math.round((progress / range) * 100);
  }

  /**
   * Get level information
   */
  getLevelInfo(score: number): LevelInfo {
    const level = this.getLevel(score);
    const levels: ScoreLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = levels.indexOf(level);
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;

    return {
      current: level,
      next: nextLevel,
      currentThreshold: this.LEVEL_THRESHOLDS[level],
      nextThreshold: nextLevel ? this.LEVEL_THRESHOLDS[nextLevel] : null,
      progress: this.getLevelProgress(score, level),
      icon: this.getLevelIcon(level),
      color: this.LEVEL_COLORS[level]
    };
  }

  private getLevelIcon(level: ScoreLevel): string {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💠'
    };
    return icons[level];
  }

  /**
   * Get score evolution
   */
  private async getScoreEvolution(userId: string): Promise<TransformationScore['evolution']> {
    try {
      const { data, error } = await supabase
        .from('transformation_scores')
        .select('date, global_score')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      if (error || !data || data.length === 0) {
        return undefined;
      }

      const today = data[0]?.global_score || 0;
      const yesterday = data[1]?.global_score;
      const weekAgo = data[7]?.global_score;
      const monthAgo = data[29]?.global_score;

      return {
        daily: yesterday ? today - yesterday : 0,
        weekly: weekAgo ? today - weekAgo : 0,
        monthly: monthAgo ? today - monthAgo : 0
      };
    } catch (error) {
      logger.warn('TRANSFORMATION_SCORE', 'Could not get evolution', { error });
      return undefined;
    }
  }

  /**
   * Save score to database
   */
  private async saveScore(userId: string, score: TransformationScore): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('transformation_scores')
        .upsert({
          user_id: userId,
          date: today,
          global_score: score.globalScore,
          training_score: score.forgeScores.training.score,
          nutrition_score: score.forgeScores.nutrition.score,
          fasting_score: score.forgeScores.fasting.score,
          body_score: score.forgeScores.body.score,
          energy_score: score.forgeScores.energy.score,
          consistency_score: score.forgeScores.consistency.score,
          level: score.level,
          metadata: {
            levelProgress: score.levelProgress,
            hasEvolution: !!score.evolution
          }
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      logger.debug('TRANSFORMATION_SCORE', 'Score saved successfully', { userId, date: today });
    } catch (error) {
      logger.error('TRANSFORMATION_SCORE', 'Failed to save score', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get score history
   */
  async getScoreHistory(userId: string, days: number = 30): Promise<ScoreHistory[]> {
    try {
      const { data, error } = await supabase
        .from('transformation_scores')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) throw error;

      return (data || []).map(record => ({
        date: new Date(record.date),
        globalScore: record.global_score,
        forgeScores: {
          training: record.training_score || 0,
          nutrition: record.nutrition_score || 0,
          fasting: record.fasting_score || 0,
          body: record.body_score || 0,
          energy: record.energy_score || 0,
          consistency: record.consistency_score || 0
        }
      }));
    } catch (error) {
      logger.error('TRANSFORMATION_SCORE', 'Failed to get score history', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }
}

export const TransformationScoreService = new TransformationScoreServiceClass();
