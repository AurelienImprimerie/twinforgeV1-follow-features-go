import logger from '@/lib/utils/logger';

export interface FastingXpCalculation {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  eventType: 'fasting_success' | 'fasting_success_exceeded' | 'fasting_partial_12h' | 'fasting_partial_8h' | 'fasting_incomplete';
  reason: string;
  canAwardXp: boolean;
}

export interface FastingXpThresholds {
  duration: number;
  xp: number;
  label: string;
  color: string;
}

const XP_THRESHOLDS: FastingXpThresholds[] = [
  { duration: 8, xp: 25, label: 'Seuil Métabolique', color: '#F59E0B' },
  { duration: 12, xp: 35, label: 'Cétose Active', color: '#FBBF24' },
  { duration: 16, xp: 50, label: 'Jeûne Optimal', color: '#10B981' },
  { duration: 18, xp: 50, label: 'Performance Avancée', color: '#06B6D4' },
];

/**
 * FastingGamificationService
 * Service dédié aux calculs de XP et récompenses pour le jeûne intermittent
 */
class FastingGamificationService {
  /**
   * Calculate XP for a fasting session
   */
  calculateFastingXp(
    durationHours: number,
    targetHours: number,
    completed: boolean
  ): FastingXpCalculation {
    // Too short - no XP
    if (durationHours < 8) {
      return {
        baseXp: 0,
        bonusXp: 0,
        totalXp: 0,
        eventType: 'fasting_incomplete',
        reason: 'Durée trop courte (< 8h) - Seuil métabolique non atteint',
        canAwardXp: false
      };
    }

    // Full success with target reached
    if (completed && durationHours >= targetHours) {
      const baseXp = 50; // FASTING_SUCCESS
      let bonusXp = 0;

      // Bonus if exceeded target by 20%+
      if (durationHours >= targetHours * 1.2) {
        bonusXp = 20;
        return {
          baseXp,
          bonusXp,
          totalXp: baseXp + bonusXp,
          eventType: 'fasting_success_exceeded',
          reason: `Objectif dépassé de ${Math.round(((durationHours - targetHours) / targetHours) * 100)}% - Bonus Excellence!`,
          canAwardXp: true
        };
      }

      return {
        baseXp,
        bonusXp,
        totalXp: baseXp,
        eventType: 'fasting_success',
        reason: 'Jeûne complété avec succès',
        canAwardXp: true
      };
    }

    // Partial fasting based on duration thresholds
    if (durationHours >= 12) {
      return {
        baseXp: 35,
        bonusXp: 0,
        totalXp: 35,
        eventType: 'fasting_partial_12h',
        reason: 'Jeûne partiel 12h+ - Cétose active atteinte',
        canAwardXp: true
      };
    }

    // Minimum threshold (8h+)
    return {
      baseXp: 25,
      bonusXp: 0,
      totalXp: 25,
      eventType: 'fasting_partial_8h',
      reason: 'Jeûne partiel 8h+ - Seuil métabolique atteint',
      canAwardXp: true
    };
  }

  /**
   * Get next XP threshold that the user can reach
   */
  getNextXpThreshold(currentDurationHours: number): FastingXpThresholds | null {
    const nextThreshold = XP_THRESHOLDS.find(t => currentDurationHours < t.duration);
    return nextThreshold || null;
  }

  /**
   * Get current XP threshold based on duration
   */
  getCurrentXpThreshold(durationHours: number): FastingXpThresholds | null {
    // Find the highest threshold reached
    const thresholds = [...XP_THRESHOLDS].reverse();
    return thresholds.find(t => durationHours >= t.duration) || null;
  }

  /**
   * Calculate potential XP for current session (real-time display)
   */
  calculatePotentialXp(
    elapsedHours: number,
    targetHours: number
  ): {
    currentXp: number;
    potentialXp: number;
    nextThreshold: FastingXpThresholds | null;
    hoursToNextThreshold: number;
  } {
    const calculation = this.calculateFastingXp(elapsedHours, targetHours, elapsedHours >= targetHours);
    const nextThreshold = this.getNextXpThreshold(elapsedHours);

    return {
      currentXp: calculation.totalXp,
      potentialXp: elapsedHours >= targetHours ? calculation.totalXp : 50, // Show max potential
      nextThreshold,
      hoursToNextThreshold: nextThreshold ? nextThreshold.duration - elapsedHours : 0
    };
  }

  /**
   * Format points message for display
   */
  formatXpMessage(calculation: FastingXpCalculation): string {
    if (!calculation.canAwardXp) {
      return 'Continue pour gagner des points (8h minimum)';
    }

    const totalXp = calculation.totalXp;
    const baseText = `+${totalXp} pts`;

    if (calculation.bonusXp > 0) {
      return `${baseText} (dont +${calculation.bonusXp} bonus!)`;
    }

    return baseText;
  }

  /**
   * Get XP color based on amount
   */
  getXpColor(xp: number): string {
    if (xp >= 50) return '#10B981'; // Green for success
    if (xp >= 35) return '#FBBF24'; // Amber for good
    if (xp >= 25) return '#F59E0B'; // Orange for minimum
    return '#94A3B8'; // Gray for none
  }

  /**
   * Get all XP thresholds for display
   */
  getAllThresholds(): FastingXpThresholds[] {
    return XP_THRESHOLDS;
  }

  /**
   * Check if user will lose XP by stopping now
   */
  calculateLostXp(
    currentDurationHours: number,
    targetHours: number
  ): {
    currentXp: number;
    potentialXp: number;
    lostXp: number;
    shouldContinue: boolean;
    motivation: string;
  } {
    const current = this.calculateFastingXp(currentDurationHours, targetHours, false);
    const potential = this.calculateFastingXp(targetHours, targetHours, true);

    const lostXp = potential.totalXp - current.totalXp;
    const shouldContinue = lostXp > 0;

    let motivation = '';
    if (shouldContinue) {
      const hoursRemaining = targetHours - currentDurationHours;
      motivation = `Continue ${hoursRemaining.toFixed(1)}h pour gagner +${lostXp} points supplémentaires!`;
    } else {
      motivation = 'Tu as déjà atteint le maximum de points possible!';
    }

    return {
      currentXp: current.totalXp,
      potentialXp: potential.totalXp,
      lostXp,
      shouldContinue,
      motivation
    };
  }
}

export const fastingGamificationService = new FastingGamificationService();
