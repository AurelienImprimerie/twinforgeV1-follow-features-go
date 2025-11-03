/**
 * Voice Proactive Coaching
 * Handles proactive coaching messages triggered by training events
 */

import logger from '../../../lib/utils/logger';
import { voiceCoachSessionProvider } from './VoiceCoachSessionProvider';
import type { TrainingEvent } from '../../head/events/types';

export class VoiceProactiveCoaching {
  private lastMessageTime = 0;
  private readonly MIN_MESSAGE_INTERVAL = 8000; // 8 seconds minimum between messages

  /**
   * Handle training event and send proactive coaching if appropriate
   */
  handleTrainingEvent(event: TrainingEvent): void {
    const now = Date.now();

    // Rate limiting: don't spam user with messages
    if (now - this.lastMessageTime < this.MIN_MESSAGE_INTERVAL) {
      logger.debug('VOICE_PROACTIVE_COACHING', 'Message rate limited', {
        timeSinceLastMessage: now - this.lastMessageTime,
        eventType: event.type
      });
      return;
    }

    const message = this.generateMessageForEvent(event);

    if (message) {
      voiceCoachSessionProvider.sendProactiveMessage(message);
      this.lastMessageTime = now;

      logger.info('VOICE_PROACTIVE_COACHING', 'Proactive message sent', {
        eventType: event.type,
        messagePreview: message.substring(0, 50)
      });
    }
  }

  /**
   * Generate coaching message based on event
   */
  private generateMessageForEvent(event: TrainingEvent): string | null {
    switch (event.type) {
      case 'set:completed':
        return this.handleSetCompleted(event);

      case 'exercise:completed':
        return this.handleExerciseCompleted(event);

      case 'rest:started':
        return this.handleRestStarted(event);

      case 'record:beaten':
        return this.handleRecordBeaten(event);

      case 'pain:reported':
        return this.handlePainReported(event);

      case 'difficulty:high':
        return this.handleHighDifficulty(event);

      default:
        return null;
    }
  }

  /**
   * Handle set completed event
   */
  private handleSetCompleted(event: TrainingEvent): string | null {
    const { setNumber, totalSets, rpe } = event.payload || {};

    if (!setNumber || !totalSets) {
      return null;
    }

    // High RPE (8-10): Encouragement + potential load adjustment
    if (rpe >= 8) {
      return `Bravo, cette série était intense ! Tu gères comme un champion. ${
        setNumber < totalSets
          ? 'Prends ton repos, tu l\'as mérité.'
          : 'Plus qu\'une série, tu vas y arriver !'
      }`;
    }

    // Medium RPE (5-7): Standard encouragement
    if (rpe >= 5) {
      if (setNumber === totalSets) {
        return 'Excellente dernière série ! Tu finis fort, j\'adore ça.';
      }
      return `Série ${setNumber} validée ! Continue comme ça, tu es dans le flow.`;
    }

    // Low RPE (1-4): Suggest increasing intensity
    if (rpe < 5 && setNumber < totalSets) {
      return 'Bien joué ! Ça a l\'air facile pour toi. On pourrait peut-être augmenter un peu la charge ?';
    }

    return null;
  }

  /**
   * Handle exercise completed event
   */
  private handleExerciseCompleted(event: TrainingEvent): string | null {
    const { exerciseName, nextExerciseName } = event.payload || {};

    if (!exerciseName) {
      return null;
    }

    if (nextExerciseName) {
      return `${exerciseName} terminé ! Excellent travail. On passe maintenant à ${nextExerciseName}.`;
    }

    return `${exerciseName} complété ! Tu progresses à chaque séance, continue !`;
  }

  /**
   * Handle rest started event
   */
  private handleRestStarted(event: TrainingEvent): string | null {
    const { restDuration, setNumber, totalSets } = event.payload || {};

    if (!restDuration) {
      return null;
    }

    // Only give rest advice every 2-3 sets
    if (setNumber && setNumber % 2 === 0) {
      return `${restDuration} secondes de repos. Respire profondément, hydrate-toi, et visualise la prochaine série.`;
    }

    return null;
  }

  /**
   * Handle record beaten event
   */
  private handleRecordBeaten(event: TrainingEvent): string | null {
    const { exerciseName, previousRecord, newRecord } = event.payload || {};

    if (!exerciseName || !newRecord) {
      return null;
    }

    return `🔥 RECORD BATTU ! ${exerciseName}: ${newRecord}kg ! ${
      previousRecord
        ? `Tu as explosé ton ancien record de ${previousRecord}kg !`
        : 'Premier record établi !'
    } Félicitations champion !`;
  }

  /**
   * Handle pain reported event
   */
  private handlePainReported(event: TrainingEvent): string | null {
    const { painLevel, painLocation } = event.payload || {};

    if (!painLevel) {
      return null;
    }

    if (painLevel >= 7) {
      return `⚠️ Douleur importante signalée ${
        painLocation ? `au niveau ${painLocation}` : ''
      }. Stop immédiat ! On va adapter l'exercice ou passer au suivant. Ta sécurité d'abord.`;
    }

    if (painLevel >= 4) {
      return `Je note une gêne ${
        painLocation ? `au niveau ${painLocation}` : ''
      }. Surveille bien ta forme et n'hésite pas à réduire la charge si nécessaire.`;
    }

    return null;
  }

  /**
   * Handle high difficulty event
   */
  private handleHighDifficulty(event: TrainingEvent): string | null {
    const { exerciseName, suggestedAdjustment } = event.payload || {};

    if (!exerciseName) {
      return null;
    }

    return `Je vois que ${exerciseName} est challengeant aujourd'hui. ${
      suggestedAdjustment || 'N\'hésite pas à réduire un peu la charge si besoin.'
    } L'important c'est la qualité d'exécution.`;
  }

  /**
   * Send custom proactive message
   */
  sendCustomMessage(message: string): void {
    const now = Date.now();

    // Allow custom messages to bypass rate limiting if explicitly called
    voiceCoachSessionProvider.sendProactiveMessage(message);
    this.lastMessageTime = now;

    logger.info('VOICE_PROACTIVE_COACHING', 'Custom proactive message sent', {
      messagePreview: message.substring(0, 50)
    });
  }
}

// Export singleton
export const voiceProactiveCoaching = new VoiceProactiveCoaching();
