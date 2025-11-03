/**
 * TextChatSessionProvider - Text Chat for Step3 Training
 * Manages text chat context during live training sessions
 */

import logger from '../../../lib/utils/logger';
import { brainCore } from '../../head/core/BrainCore';
import { eventListenerHub } from '../../head/events/EventListenerHub';
import { conversationMemoryManager } from '../../head/memory/ConversationMemoryManager';
import type { TrainingEvent } from '../../head/events/types';
import type { Exercise } from '../../store/trainingPipeline/types';

export interface TrainingChatContext {
  sessionId: string;
  userId: string;
  discipline: string;
  exercises: Exercise[];
  currentExerciseIndex: number;
  currentExercise: Exercise;
  currentSet: number;
  totalSets: number;
  isResting: boolean;
  restTimeRemaining: number;
  sessionTimeElapsed: number;
  lastRPE?: number;
  hasUnreadNotification: boolean;
}

export class TextChatSessionProvider {
  private isActive: boolean = false;
  private currentContext: TrainingChatContext | null = null;
  private eventListeners: Array<() => void> = [];
  private notificationCallback: ((hasNotification: boolean) => void) | null = null;
  private lastNotificationTime: number = 0;
  private MIN_NOTIFICATION_INTERVAL = 30000; // 30s between notifications

  constructor() {
    logger.info('TEXT_CHAT_SESSION_PROVIDER', 'TextChatSessionProvider initialized');
  }

  /**
   * Start text chat session for Step3
   */
  async startSession(context: Omit<TrainingChatContext, 'hasUnreadNotification'>): Promise<void> {
    if (this.isActive) {
      logger.warn('TEXT_CHAT_SESSION_PROVIDER', 'Session already active');
      return;
    }

    this.currentContext = {
      ...context,
      hasUnreadNotification: false
    };

    this.isActive = true;

    // Update BrainCore with training session
    brainCore.setTrainingSession({
      sessionId: context.sessionId,
      sessionType: 'force', // TODO: adapt based on discipline
      isActive: true,
      currentExercise: context.currentExercise.name,
      currentSet: context.currentSet,
      totalSets: context.totalSets,
      isResting: context.isResting,
      discipline: context.discipline,
      currentExerciseIndex: context.currentExerciseIndex,
      totalExercises: context.exercises.length,
      restTimeRemaining: context.restTimeRemaining,
      sessionTimeElapsed: context.sessionTimeElapsed,
      lastRPE: context.lastRPE
    });

    // Subscribe to training events
    this.setupEventListeners();

    logger.info('TEXT_CHAT_SESSION_PROVIDER', 'Text chat session started', {
      sessionId: context.sessionId,
      discipline: context.discipline,
      exerciseCount: context.exercises.length
    });
  }

  /**
   * Update training context
   */
  updateContext(updates: Partial<TrainingChatContext>): void {
    if (!this.isActive || !this.currentContext) {
      logger.warn('TEXT_CHAT_SESSION_PROVIDER', 'Cannot update context - no active session');
      return;
    }

    this.currentContext = {
      ...this.currentContext,
      ...updates
    };

    // Update BrainCore
    brainCore.setTrainingSession({
      sessionId: this.currentContext.sessionId,
      sessionType: 'force',
      isActive: true,
      currentExercise: this.currentContext.currentExercise.name,
      currentSet: this.currentContext.currentSet,
      totalSets: this.currentContext.totalSets,
      isResting: this.currentContext.isResting,
      discipline: this.currentContext.discipline,
      currentExerciseIndex: this.currentContext.currentExerciseIndex,
      totalExercises: this.currentContext.exercises.length,
      restTimeRemaining: this.currentContext.restTimeRemaining,
      sessionTimeElapsed: this.currentContext.sessionTimeElapsed,
      lastRPE: this.currentContext.lastRPE
    });

    logger.debug('TEXT_CHAT_SESSION_PROVIDER', 'Context updated', {
      currentSet: this.currentContext.currentSet,
      isResting: this.currentContext.isResting
    });
  }

  /**
   * End session
   */
  endSession(): void {
    if (!this.isActive) {
      return;
    }

    this.cleanup();
    this.isActive = false;
    this.currentContext = null;

    // Clear training session from BrainCore
    brainCore.clearTrainingSession();

    logger.info('TEXT_CHAT_SESSION_PROVIDER', 'Text chat session ended');
  }

  /**
   * Get current context
   */
  getContext(): TrainingChatContext | null {
    return this.currentContext;
  }

  /**
   * Check if response should be ultra-short (during effort)
   */
  shouldUseUltraShortResponse(): boolean {
    if (!this.currentContext) {
      return false;
    }

    // Ultra-short during active effort, normal during rest
    return !this.currentContext.isResting;
  }

  /**
   * Register notification callback
   */
  onNotification(callback: (hasNotification: boolean) => void): void {
    this.notificationCallback = callback;
  }

  /**
   * Trigger notification badge
   */
  private triggerNotification(): void {
    const now = Date.now();

    // Rate limit notifications
    if (now - this.lastNotificationTime < this.MIN_NOTIFICATION_INTERVAL) {
      logger.debug('TEXT_CHAT_SESSION_PROVIDER', 'Notification rate limited');
      return;
    }

    this.lastNotificationTime = now;

    if (this.currentContext) {
      this.currentContext.hasUnreadNotification = true;
    }

    if (this.notificationCallback) {
      this.notificationCallback(true);
      logger.debug('TEXT_CHAT_SESSION_PROVIDER', 'Notification triggered');
    }
  }

  /**
   * Clear notification
   */
  clearNotification(): void {
    if (this.currentContext) {
      this.currentContext.hasUnreadNotification = false;
    }

    if (this.notificationCallback) {
      this.notificationCallback(false);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen to important training events
    const handleEvent = (event: TrainingEvent) => {
      this.handleTrainingEvent(event);
    };

    eventListenerHub.addEventListener('set_completed', handleEvent);
    eventListenerHub.addEventListener('exercise_completed', handleEvent);
    eventListenerHub.addEventListener('record_achieved', handleEvent);
    eventListenerHub.addEventListener('pain_reported', handleEvent);
    eventListenerHub.addEventListener('difficulty_adjusted', handleEvent);

    this.eventListeners.push(
      () => eventListenerHub.removeEventListener('set_completed', handleEvent),
      () => eventListenerHub.removeEventListener('exercise_completed', handleEvent),
      () => eventListenerHub.removeEventListener('record_achieved', handleEvent),
      () => eventListenerHub.removeEventListener('pain_reported', handleEvent),
      () => eventListenerHub.removeEventListener('difficulty_adjusted', handleEvent)
    );

    logger.debug('TEXT_CHAT_SESSION_PROVIDER', 'Event listeners setup');
  }

  /**
   * Handle training events
   */
  private handleTrainingEvent(event: TrainingEvent): void {
    logger.debug('TEXT_CHAT_SESSION_PROVIDER', 'Training event received', {
      type: event.type,
      data: event.data
    });

    // Trigger notification for important events
    switch (event.type) {
      case 'record_achieved':
        this.triggerNotification();
        this.saveEventToMemory('system', '🏆 Nouveau record personnel ! Félicitations !');
        break;

      case 'pain_reported':
        if (event.data.painLevel && event.data.painLevel >= 3) {
          this.triggerNotification();
          this.saveEventToMemory('system', '⚠️ Douleur signalée. Ton coach peut t\'aider à ajuster.');
        }
        break;

      case 'difficulty_adjusted':
        this.triggerNotification();
        this.saveEventToMemory('system', '🔧 Difficulté ajustée. Continue comme ça !');
        break;

      case 'set_completed':
        if (event.data.rpe && event.data.rpe >= 9) {
          this.triggerNotification();
          this.saveEventToMemory('system', '💪 Série intense ! Besoin de conseils pour la suite ?');
        }
        break;

      case 'exercise_completed':
        // No notification, just save to memory
        this.saveEventToMemory('system', `✅ ${event.data.exerciseName} complété`);
        break;
    }
  }

  /**
   * Save event to conversation memory and broadcast via Realtime
   */
  private async saveEventToMemory(role: 'system' | 'user' | 'assistant', content: string): Promise<void> {
    if (!this.currentContext) {
      return;
    }

    try {
      const message = {
        userId: this.currentContext.userId,
        sessionId: this.currentContext.sessionId,
        role,
        content,
        messageType: 'system',
        context: {
          currentRoute: '/training/pipeline/step-3',
          activityState: this.currentContext.isResting ? 'resting' : 'exercising',
          sessionType: 'force',
          exerciseName: this.currentContext.currentExercise.name,
          setNumber: this.currentContext.currentSet
        },
        timestamp: Date.now()
      };

      await conversationMemoryManager.saveMessage(message);

      logger.debug('TEXT_CHAT_SESSION_PROVIDER', 'Event saved to memory and broadcast', { content });
    } catch (error) {
      logger.error('TEXT_CHAT_SESSION_PROVIDER', 'Failed to save event to memory', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Cleanup
   */
  private cleanup(): void {
    // Remove event listeners
    this.eventListeners.forEach(unsubscribe => unsubscribe());
    this.eventListeners = [];

    logger.debug('TEXT_CHAT_SESSION_PROVIDER', 'Cleanup completed');
  }

  /**
   * Check if session is active
   */
  isSessionActive(): boolean {
    return this.isActive;
  }
}

// Export singleton instance
export const textChatSessionProvider = new TextChatSessionProvider();
