/**
 * Physical Qualities Calculator - Sprint 5
 * Calcule 5 métriques physiques pour le graphique radar
 * Score de 0 à 10 pour chaque qualité
 *
 * V2: Utilise la table exercises (2600 exercices) au lieu de listes hardcodées
 */

import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';
import { exerciseCategoryService } from '../records/ExerciseCategoryService';

export interface PhysicalQualities {
  force: number; // 0-10: Records max weight powerlifting
  endurance: number; // 0-10: Durée cumulée sessions cardio
  puissance: number; // 0-10: Records mouvements explosifs
  technique: number; // 0-10: Diversité exercices maîtrisés
  consistance: number; // 0-10: Streak et régularité
  globalScore: number; // Moyenne des 5 scores
}

class PhysicalQualitiesCalculator {
  /**
   * Calcule toutes les qualités physiques pour un utilisateur
   */
  async calculateQualities(userId: string): Promise<PhysicalQualities> {
    try {
      const [force, endurance, puissance, technique, consistance] = await Promise.all([
        this.calculateForce(userId),
        this.calculateEndurance(userId),
        this.calculatePuissance(userId),
        this.calculateTechnique(userId),
        this.calculateConsistance(userId)
      ]);

      const globalScore = (force + endurance + puissance + technique + consistance) / 5;

      return {
        force: Math.min(10, Math.max(0, force)),
        endurance: Math.min(10, Math.max(0, endurance)),
        puissance: Math.min(10, Math.max(0, puissance)),
        technique: Math.min(10, Math.max(0, technique)),
        consistance: Math.min(10, Math.max(0, consistance)),
        globalScore: Math.round(globalScore * 10) / 10
      };
    } catch (error) {
      logger.error('PHYSICAL_QUALITIES', 'Failed to calculate qualities', { userId, error });

      // Fallback: scores par défaut
      return {
        force: 5,
        endurance: 5,
        puissance: 5,
        technique: 5,
        consistance: 5,
        globalScore: 5.0
      };
    }
  }

  /**
   * FORCE: Basée sur records max weight dans powerlifting
   * 0 = Aucun record
   * 10 = Records élite (>2x bodyweight squat, >1.5x bench, >2.5x deadlift)
   */
  private async calculateForce(userId: string): Promise<number> {
    try {
      // Récupérer le poids corporel
      const { data: profile } = await supabase
        .from('user_profile')
        .select('weight_kg')
        .eq('user_id', userId)
        .maybeSingle();

      const bodyweight = profile?.weight_kg || 75;

      // Récupérer les meilleurs records powerlifting
      const { data: records } = await supabase
        .from('user_records')
        .select('record_subtype, value, unit, context_data')
        .eq('user_id', userId)
        .eq('record_type', 'training_pr')
        .in('unit', ['kg', 'lbs'])
        .order('value', { ascending: false })
        .limit(50);

      if (!records || records.length === 0) {
        return 2; // Score minimal si pas de records
      }

      // Extraire meilleurs records par type d'exercice
      let maxSquat = 0;
      let maxBench = 0;
      let maxDeadlift = 0;

      for (const record of records) {
        const exerciseName = record.context_data?.exercise_name || '';
        const weight = record.unit === 'lbs' ? record.value * 0.453592 : record.value;

        // Vérifier si c'est un exercice de powerlifting via la base de données
        const isPowerlifting = await exerciseCategoryService.isPowerliftingExercise(exerciseName);

        if (!isPowerlifting) continue;

        const normalizedName = exerciseName.toLowerCase();

        if (normalizedName.includes('squat')) {
          maxSquat = Math.max(maxSquat, weight);
        } else if (normalizedName.includes('bench')) {
          maxBench = Math.max(maxBench, weight);
        } else if (normalizedName.includes('deadlift')) {
          maxDeadlift = Math.max(maxDeadlift, weight);
        }
      }

      // Calculer ratios par rapport au poids de corps
      const squatRatio = maxSquat / bodyweight;
      const benchRatio = maxBench / bodyweight;
      const deadliftRatio = maxDeadlift / bodyweight;

      // Score basé sur les standards de force
      // Débutant: 1x, 0.75x, 1.5x → ~3-4
      // Intermédiaire: 1.5x, 1x, 2x → ~5-6
      // Avancé: 2x, 1.5x, 2.5x → ~8-9
      // Elite: 2.5x+, 2x+, 3x+ → 10

      let score = 0;

      // Squat (max ratio 2.5 pour score 10)
      score += Math.min(4, (squatRatio / 2.5) * 4);

      // Bench (max ratio 2 pour score 10)
      score += Math.min(3, (benchRatio / 2) * 3);

      // Deadlift (max ratio 3 pour score 10)
      score += Math.min(3, (deadliftRatio / 3) * 3);

      return Math.round(score * 10) / 10;
    } catch (error) {
      logger.error('PHYSICAL_QUALITIES', 'Failed to calculate force', { userId, error });
      return 5;
    }
  }

  /**
   * ENDURANCE: Basée sur durée cumulée sessions cardio
   * 0 = Aucune session
   * 10 = >100h de cardio cumulé
   */
  private async calculateEndurance(userId: string): Promise<number> {
    try {
      // Récupérer toutes les activités cardio (utiliser 'type' et 'timestamp' selon le schéma réel)
      const { data: activities } = await supabase
        .from('biometric_activities')
        .select('duration_minutes, type')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()); // 1 an

      if (!activities || activities.length === 0) {
        return 2; // Score minimal
      }

      // Filtrer les activités cardio via la base de données
      const cardioCheckPromises = activities.map(async (a) => ({
        activity: a,
        isCardio: await exerciseCategoryService.isCardioActivity(a.type || '')
      }));

      const cardioChecks = await Promise.all(cardioCheckPromises);
      const cardioActivities = cardioChecks
        .filter(check => check.isCardio)
        .map(check => check.activity);

      // Calculer durée totale en heures
      const totalMinutes = cardioActivities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
      const totalHours = totalMinutes / 60;

      // Score basé sur volume cardio annuel
      // 0-10h → 0-2
      // 10-30h → 2-5
      // 30-60h → 5-7
      // 60-100h → 7-9
      // 100h+ → 10

      if (totalHours < 10) return Math.min(2, (totalHours / 10) * 2);
      if (totalHours < 30) return 2 + ((totalHours - 10) / 20) * 3;
      if (totalHours < 60) return 5 + ((totalHours - 30) / 30) * 2;
      if (totalHours < 100) return 7 + ((totalHours - 60) / 40) * 2;
      return 10;
    } catch (error) {
      logger.error('PHYSICAL_QUALITIES', 'Failed to calculate endurance', { userId, error });
      return 5;
    }
  }

  /**
   * PUISSANCE: Basée sur records mouvements explosifs
   * 0 = Aucun mouvement explosif
   * 10 = Records élite (clean >1.5x BW, snatch >1.2x BW)
   */
  private async calculatePuissance(userId: string): Promise<number> {
    try {
      const { data: profile } = await supabase
        .from('user_profile')
        .select('weight_kg')
        .eq('user_id', userId)
        .maybeSingle();

      const bodyweight = profile?.weight_kg || 75;

      const { data: records } = await supabase
        .from('user_records')
        .select('record_subtype, value, unit, context_data')
        .eq('user_id', userId)
        .eq('record_type', 'training_pr')
        .order('value', { ascending: false })
        .limit(50);

      if (!records || records.length === 0) {
        return 2;
      }

      let maxClean = 0;
      let maxSnatch = 0;
      let maxJerk = 0;

      for (const record of records) {
        const exerciseName = record.context_data?.exercise_name || '';
        const weight = record.unit === 'lbs' ? record.value * 0.453592 : record.value;

        // Vérifier si c'est un exercice explosif via la base de données
        const isExplosive = await exerciseCategoryService.isExplosiveExercise(exerciseName);

        if (!isExplosive) continue;

        const normalizedName = exerciseName.toLowerCase();

        if (normalizedName.includes('clean')) {
          maxClean = Math.max(maxClean, weight);
        } else if (normalizedName.includes('snatch')) {
          maxSnatch = Math.max(maxSnatch, weight);
        } else if (normalizedName.includes('jerk') || normalizedName.includes('press')) {
          maxJerk = Math.max(maxJerk, weight);
        }
      }

      // Ratios puissance
      const cleanRatio = maxClean / bodyweight;
      const snatchRatio = maxSnatch / bodyweight;
      const jerkRatio = maxJerk / bodyweight;

      // Standards:
      // Débutant: clean 0.8x, snatch 0.6x → ~3
      // Intermédiaire: clean 1.2x, snatch 0.9x → ~6
      // Avancé: clean 1.5x, snatch 1.2x → ~8-9
      // Elite: clean 1.8x+, snatch 1.4x+ → 10

      let score = 0;
      score += Math.min(5, (cleanRatio / 1.8) * 5);
      score += Math.min(4, (snatchRatio / 1.4) * 4);
      score += Math.min(1, (jerkRatio / 1.2) * 1);

      return Math.round(score * 10) / 10;
    } catch (error) {
      logger.error('PHYSICAL_QUALITIES', 'Failed to calculate puissance', { userId, error });
      return 5;
    }
  }

  /**
   * TECHNIQUE: Basée sur diversité et nombre d'exercices maîtrisés
   * 0 = <5 exercices
   * 10 = >50 exercices différents avec records
   */
  private async calculateTechnique(userId: string): Promise<number> {
    try {
      const { data: records } = await supabase
        .from('user_records')
        .select('context_data')
        .eq('user_id', userId)
        .eq('record_type', 'training_pr');

      if (!records || records.length === 0) {
        return 2;
      }

      // Compter exercices uniques
      const uniqueExercises = new Set<string>();

      records.forEach(record => {
        const exerciseName = record.context_data?.exercise_name;
        if (exerciseName) {
          uniqueExercises.add(exerciseName.toLowerCase());
        }
      });

      const count = uniqueExercises.size;

      // Score basé sur diversité
      // 0-5 exercices → 0-2
      // 5-15 exercices → 2-5
      // 15-30 exercices → 5-7
      // 30-50 exercices → 7-9
      // 50+ exercices → 10

      if (count < 5) return Math.min(2, (count / 5) * 2);
      if (count < 15) return 2 + ((count - 5) / 10) * 3;
      if (count < 30) return 5 + ((count - 15) / 15) * 2;
      if (count < 50) return 7 + ((count - 30) / 20) * 2;
      return 10;
    } catch (error) {
      logger.error('PHYSICAL_QUALITIES', 'Failed to calculate technique', { userId, error });
      return 5;
    }
  }

  /**
   * CONSISTANCE: Basée sur streak actuel et régularité
   * 0 = Aucune activité récente
   * 10 = Streak >100 jours + régularité parfaite
   */
  private async calculateConsistance(userId: string): Promise<number> {
    try {
      // Récupérer données de gamification (utiliser current_streak_days au lieu de current_streak)
      const { data: gamification } = await supabase
        .from('user_gamification_progress')
        .select('current_streak_days')
        .eq('user_id', userId)
        .maybeSingle();

      const streak = gamification?.current_streak_days || 0;

      // Calculer régularité sur 30 derniers jours (utiliser 'timestamp' au lieu de 'recorded_at')
      const { data: activities } = await supabase
        .from('biometric_activities')
        .select('timestamp')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      const activeDays = activities?.length || 0;
      const regularityPercent = (activeDays / 30) * 100;

      // Score basé sur streak et régularité
      let score = 0;

      // Streak (max 6 points)
      // 0-7 jours → 0-2
      // 7-30 jours → 2-4
      // 30-100 jours → 4-6
      // 100+ jours → 6
      if (streak < 7) score += (streak / 7) * 2;
      else if (streak < 30) score += 2 + ((streak - 7) / 23) * 2;
      else if (streak < 100) score += 4 + ((streak - 30) / 70) * 2;
      else score += 6;

      // Régularité (max 4 points)
      // 0-25% → 0-1
      // 25-50% → 1-2
      // 50-75% → 2-3
      // 75-100% → 3-4
      score += Math.min(4, (regularityPercent / 100) * 4);

      return Math.round(score * 10) / 10;
    } catch (error) {
      logger.error('PHYSICAL_QUALITIES', 'Failed to calculate consistance', { userId, error });
      return 5;
    }
  }
}

export const physicalQualitiesCalculator = new PhysicalQualitiesCalculator();
