/**
 * Voice Coach Session Provider
 * Manages voice coaching integration during Step3 training sessions
 * Connects BrainCore, EventListenerHub, and OpenAI Realtime for live coaching
 */

import logger from '../../../lib/utils/logger';
import { voiceCoachOrchestrator } from './voiceCoachOrchestrator';
import { realtimeIntegration } from '../../head/integration/RealtimeIntegration';
import { openaiRealtimeService } from '../openai-realtime/openaiRealtimeService';
import { useUnifiedCoachStore } from '../../store/unifiedCoachStore';
import { eventListenerHub } from '../../head/events/EventListenerHub';
import { voiceProactiveCoaching } from './voiceProactiveCoaching';
import type { Exercise } from '../../store/trainingPipeline/types';
import type { EventSubscription } from '../../head/events/types';

export interface TrainingSessionContext {
  sessionId: string;
  userId: string;
  discipline: string;
  exercises: Exercise[];
  currentExerciseIndex: number;
  currentExercise: Exercise;
  currentSet: number;
  isResting: boolean;
  restTimeRemaining: number;
  sessionTimeElapsed: number;
  lastRPE?: number;
}

class VoiceCoachSessionProvider {
  private isSessionActive = false;
  private currentSessionId: string | null = null;
  private sessionContext: TrainingSessionContext | null = null;
  private unsubscribeHandlers: (() => void)[] = [];
  private eventSubscription: EventSubscription | null = null;

  /**
   * Start voice coaching for a training session
   */
  async startSession(context: TrainingSessionContext): Promise<void> {
    if (this.isSessionActive) {
      logger.warn('VOICE_SESSION_PROVIDER', 'Session already active', {
        currentSessionId: this.currentSessionId,
        newSessionId: context.sessionId
      });
      return;
    }

    try {
      logger.info('VOICE_SESSION_PROVIDER', '🚀 Starting voice coaching session', {
        sessionId: context.sessionId,
        discipline: context.discipline,
        totalExercises: context.exercises.length
      });

      this.sessionContext = context;
      this.currentSessionId = context.sessionId;
      this.isSessionActive = true;

      // Update BrainCore with training context
      this.updateBrainContext(context);

      // Setup realtime message handlers
      this.setupRealtimeHandlers();

      // Setup event listeners for proactive coaching
      this.setupEventListeners();

      logger.info('VOICE_SESSION_PROVIDER', '✅ Voice coaching session started successfully');
    } catch (error) {
      logger.error('VOICE_SESSION_PROVIDER', 'Failed to start voice session', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.cleanup();
      throw error;
    }
  }

  /**
   * Update session context (called on each exercise/set change)
   */
  updateSessionContext(updates: Partial<TrainingSessionContext>): void {
    if (!this.isSessionActive || !this.sessionContext) {
      logger.warn('VOICE_SESSION_PROVIDER', 'Cannot update context: no active session');
      return;
    }

    // Merge updates into current context
    this.sessionContext = {
      ...this.sessionContext,
      ...updates
    };

    // Update BrainCore
    this.updateBrainContext(this.sessionContext);

    logger.debug('VOICE_SESSION_PROVIDER', 'Session context updated', {
      exerciseIndex: this.sessionContext.currentExerciseIndex,
      currentSet: this.sessionContext.currentSet,
      isResting: this.sessionContext.isResting
    });
  }

  /**
   * End voice coaching session
   */
  endSession(): void {
    if (!this.isSessionActive) {
      logger.debug('VOICE_SESSION_PROVIDER', 'No active session to end');
      return;
    }

    logger.info('VOICE_SESSION_PROVIDER', '🏁 Ending voice coaching session', {
      sessionId: this.currentSessionId
    });

    this.cleanup();
  }

  /**
   * Send proactive coaching message
   */
  sendProactiveMessage(message: string): void {
    if (!this.isSessionActive) {
      logger.warn('VOICE_SESSION_PROVIDER', 'Cannot send message: no active session');
      return;
    }

    try {
      if (openaiRealtimeService.connected) {
        openaiRealtimeService.sendTextMessage(message);
        logger.info('VOICE_SESSION_PROVIDER', '💬 Proactive message sent', {
          messagePreview: message.substring(0, 50)
        });
      } else {
        logger.warn('VOICE_SESSION_PROVIDER', 'Realtime not connected, skipping proactive message');
      }
    } catch (error) {
      logger.error('VOICE_SESSION_PROVIDER', 'Failed to send proactive message', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Record user feedback during session
   */
  async recordFeedback(message: string, context?: { exerciseName?: string; setNumber?: number }): Promise<void> {
    if (!this.isSessionActive || !this.currentSessionId) {
      logger.warn('VOICE_SESSION_PROVIDER', 'Cannot record feedback: no active session');
      return;
    }

    try {
      await realtimeIntegration.recordVoiceFeedback(
        this.currentSessionId,
        message,
        {
          exerciseName: context?.exerciseName || this.sessionContext?.currentExercise.name,
          setNumber: context?.setNumber || this.sessionContext?.currentSet,
          timestamp: Date.now()
        }
      );

      logger.info('VOICE_SESSION_PROVIDER', '📝 Feedback recorded', {
        exerciseName: context?.exerciseName || this.sessionContext?.currentExercise.name,
        setNumber: context?.setNumber || this.sessionContext?.currentSet
      });
    } catch (error) {
      logger.error('VOICE_SESSION_PROVIDER', 'Failed to record feedback', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get current session status
   */
  getSessionStatus(): {
    isActive: boolean;
    sessionId: string | null;
    context: TrainingSessionContext | null;
  } {
    return {
      isActive: this.isSessionActive,
      sessionId: this.currentSessionId,
      context: this.sessionContext
    };
  }

  /**
   * Update BrainCore with current training context
   */
  private updateBrainContext(context: TrainingSessionContext): void {
    try {
      realtimeIntegration.updateTrainingContext({
        sessionId: context.sessionId,
        currentExerciseIndex: context.currentExerciseIndex,
        totalExercises: context.exercises.length,
        currentExercise: context.currentExercise ? {
          name: context.currentExercise.name,
          load: context.currentExercise.load,
          reps: context.currentExercise.reps,
          sets: context.currentExercise.sets
        } : undefined,
        currentSet: context.currentSet,
        totalSets: context.currentExercise?.sets || 0,
        isResting: context.isResting,
        restTimeRemaining: context.restTimeRemaining,
        discipline: context.discipline
      });

      logger.debug('VOICE_SESSION_PROVIDER', 'BrainCore context updated successfully');
    } catch (error) {
      logger.error('VOICE_SESSION_PROVIDER', 'Failed to update BrainCore context', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Setup realtime message handlers
   */
  private setupRealtimeHandlers(): void {
    const unsubscribe = openaiRealtimeService.onMessage((message) => {
      if (message.type === 'response.audio_transcript.done') {
        const store = useUnifiedCoachStore.getState();
        store.addMessage({
          role: 'assistant',
          content: message.transcript || ''
        });

        logger.debug('VOICE_SESSION_PROVIDER', 'Coach message transcribed', {
          messagePreview: message.transcript?.substring(0, 50)
        });
      }

      if (message.type === 'conversation.item.input_audio_transcription.completed') {
        const store = useUnifiedCoachStore.getState();
        store.addMessage({
          role: 'user',
          content: message.transcript || ''
        });

        // Record user feedback automatically
        if (message.transcript && this.sessionContext) {
          this.recordFeedback(message.transcript);
        }

        logger.debug('VOICE_SESSION_PROVIDER', 'User speech transcribed', {
          messagePreview: message.transcript?.substring(0, 50)
        });
      }
    });

    this.unsubscribeHandlers.push(unsubscribe);
  }

  /**
   * Setup event listeners for proactive coaching
   */
  private setupEventListeners(): void {
    // Subscribe to all training events
    this.eventSubscription = eventListenerHub.onAll((event) => {
      // Only process events if voice session is active
      if (!this.isSessionActive) {
        return;
      }

      // Pass event to proactive coaching handler
      voiceProactiveCoaching.handleTrainingEvent(event);
    });

    logger.info('VOICE_SESSION_PROVIDER', '✅ Event listeners setup for proactive coaching');
  }

  /**
   * Cleanup session
   */
  private cleanup(): void {
    // Unsubscribe all handlers
    this.unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
    this.unsubscribeHandlers = [];

    // Unsubscribe from event hub
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
      this.eventSubscription = null;
    }

    // Clear brain context
    realtimeIntegration.clearTrainingContext();

    // Reset state
    this.isSessionActive = false;
    this.currentSessionId = null;
    this.sessionContext = null;

    logger.info('VOICE_SESSION_PROVIDER', '🧹 Session cleanup complete');
  }
}

// Export singleton
export const voiceCoachSessionProvider = new VoiceCoachSessionProvider();
