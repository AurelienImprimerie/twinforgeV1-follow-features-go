/**
 * ConversationSwitchService - Transparent Switch between Text and Voice
 * Manages seamless transitions between text chat and voice coaching
 * Preserves context and conversation history across modes
 */

import logger from '../../../lib/utils/logger';
import { conversationMemoryManager } from '../../head/memory/ConversationMemoryManager';
import { useUnifiedCoachStore } from '../../store/unifiedCoachStore';
import type { ConversationContextWindow } from '../../head/memory/ConversationMemoryManager';

export class ConversationSwitchService {
  /**
   * Switch from text to voice mode
   * Loads conversation history and prepares voice coaching context
   */
  async switchToVoice(
    userId: string,
    sessionId?: string
  ): Promise<{
    success: boolean;
    contextWindow?: ConversationContextWindow;
    error?: string;
  }> {
    try {
      logger.info('CONVERSATION_SWITCH', 'Switching to voice mode', {
        userId,
        sessionId
      });

      // Get conversation context window (summary + recent messages)
      const contextWindow = await conversationMemoryManager.getContextWindow(
        userId,
        sessionId,
        20 // Last 20 messages
      );

      logger.info('CONVERSATION_SWITCH', 'Context window loaded for voice mode', {
        hasSummary: !!contextWindow.summary,
        recentMessageCount: contextWindow.recentMessages.length,
        totalMessages: contextWindow.totalMessageCount
      });

      // Prepare context for voice coaching
      const contextSummary = this.buildContextSummary(contextWindow);

      logger.debug('CONVERSATION_SWITCH', 'Voice context prepared', {
        summaryLength: contextSummary.length,
        hasHistory: contextWindow.recentMessages.length > 0
      });

      return {
        success: true,
        contextWindow
      };
    } catch (error) {
      logger.error('CONVERSATION_SWITCH', 'Failed to switch to voice mode', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Switch from voice to text mode
   * Syncs voice transcripts to text chat history
   */
  async switchToText(
    userId: string,
    sessionId?: string
  ): Promise<{
    success: boolean;
    contextWindow?: ConversationContextWindow;
    error?: string;
  }> {
    try {
      logger.info('CONVERSATION_SWITCH', 'Switching to text mode', {
        userId,
        sessionId
      });

      // Get conversation context window (includes voice messages)
      const contextWindow = await conversationMemoryManager.getContextWindow(
        userId,
        sessionId,
        20
      );

      logger.info('CONVERSATION_SWITCH', 'Context window loaded for text mode', {
        hasSummary: !!contextWindow.summary,
        recentMessageCount: contextWindow.recentMessages.length,
        totalMessages: contextWindow.totalMessageCount
      });

      // Load messages into unifiedCoachStore
      const store = useUnifiedCoachStore.getState();

      // Convert context window messages to chat messages
      const chatMessages = contextWindow.recentMessages.map(msg => ({
        id: `msg-${msg.timestamp}`,
        role: msg.role === 'assistant' ? 'coach' : msg.role,
        type: msg.messageType as 'text' | 'voice' | 'system',
        content: msg.content,
        timestamp: msg.timestamp
      }));

      // Update store with conversation history
      store.messages = chatMessages;

      logger.debug('CONVERSATION_SWITCH', 'Text chat loaded with history', {
        messageCount: chatMessages.length,
        hasVoiceMessages: chatMessages.some(m => m.type === 'voice')
      });

      return {
        success: true,
        contextWindow
      };
    } catch (error) {
      logger.error('CONVERSATION_SWITCH', 'Failed to switch to text mode', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build context summary from conversation window
   * Used to inform AI about conversation history
   */
  private buildContextSummary(contextWindow: ConversationContextWindow): string {
    const parts: string[] = [];

    // Add summary if available
    if (contextWindow.summary) {
      parts.push('📋 RÉSUMÉ DE CONVERSATION PRÉCÉDENTE:');
      parts.push(contextWindow.summary.text);
      parts.push(`(${contextWindow.summary.messageCount} messages résumés)`);

      if (contextWindow.summary.keyTopics.length > 0) {
        parts.push(`Sujets clés: ${contextWindow.summary.keyTopics.join(', ')}`);
      }
      parts.push('');
    }

    // Add recent messages count
    if (contextWindow.recentMessages.length > 0) {
      const textCount = contextWindow.recentMessages.filter(m => m.messageType === 'text').length;
      const voiceCount = contextWindow.recentMessages.filter(m => m.messageType === 'voice').length;

      parts.push('💬 MESSAGES RÉCENTS:');
      parts.push(`${contextWindow.recentMessages.length} messages récents disponibles`);
      parts.push(`- ${textCount} messages texte`);
      parts.push(`- ${voiceCount} messages vocaux`);
      parts.push('');
    }

    // Add continuity note
    parts.push('🔄 CONTINUITÉ DE CONVERSATION:');
    parts.push('L\'utilisateur a changé de mode de communication (texte ↔ voix).');
    parts.push('Maintiens la continuité de la conversation et fais référence aux échanges précédents si pertinent.');

    return parts.join('\n');
  }

  /**
   * Check if user has recent conversation history
   */
  async hasRecentHistory(
    userId: string,
    sessionId?: string,
    maxAgeMinutes: number = 30
  ): Promise<boolean> {
    try {
      const cutoffTime = Date.now() - (maxAgeMinutes * 60 * 1000);

      const messages = await conversationMemoryManager.getHistory(userId, {
        sessionId,
        limit: 1,
        since: new Date(cutoffTime)
      });

      return messages.length > 0;
    } catch (error) {
      logger.error('CONVERSATION_SWITCH', 'Failed to check recent history', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Get conversation mode recommendation
   * Suggests switching mode based on context
   */
  async getModeSuggestion(
    userId: string,
    sessionId?: string,
    currentMode: 'text' | 'voice'
  ): Promise<{
    suggestedMode: 'text' | 'voice';
    reason: string;
    confidence: number;
  }> {
    try {
      const contextWindow = await conversationMemoryManager.getContextWindow(
        userId,
        sessionId,
        10
      );

      const recentMessages = contextWindow.recentMessages.slice(-10);
      const voiceMessageCount = recentMessages.filter(m => m.messageType === 'voice').length;
      const textMessageCount = recentMessages.filter(m => m.messageType === 'text').length;

      // If user predominantly uses one mode, suggest that mode
      if (voiceMessageCount > textMessageCount * 2) {
        return {
          suggestedMode: 'voice',
          reason: 'Tu utilises principalement le mode vocal',
          confidence: 0.8
        };
      }

      if (textMessageCount > voiceMessageCount * 2) {
        return {
          suggestedMode: 'text',
          reason: 'Tu préfères le chat texte',
          confidence: 0.8
        };
      }

      // Default: keep current mode
      return {
        suggestedMode: currentMode,
        reason: 'Tu utilises les deux modes équitablement',
        confidence: 0.6
      };
    } catch (error) {
      logger.error('CONVERSATION_SWITCH', 'Failed to get mode suggestion', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        suggestedMode: currentMode,
        reason: 'Mode actuel',
        confidence: 0.5
      };
    }
  }

  /**
   * Sync messages from one mode to another
   * Ensures all messages are visible regardless of mode
   */
  async syncMessages(
    userId: string,
    sessionId?: string
  ): Promise<{
    success: boolean;
    syncedCount: number;
  }> {
    try {
      logger.info('CONVERSATION_SWITCH', 'Syncing messages across modes', {
        userId,
        sessionId
      });

      // Get all recent messages
      const messages = await conversationMemoryManager.getHistory(userId, {
        sessionId,
        limit: 50
      });

      // Update unified coach store with all messages
      const store = useUnifiedCoachStore.getState();

      const chatMessages = messages.map(msg => ({
        id: `msg-${msg.timestamp}`,
        role: msg.role === 'assistant' ? 'coach' : msg.role,
        type: msg.messageType as 'text' | 'voice' | 'system',
        content: msg.content,
        timestamp: msg.timestamp
      }));

      store.messages = chatMessages;

      logger.info('CONVERSATION_SWITCH', 'Messages synced successfully', {
        syncedCount: chatMessages.length,
        textMessages: chatMessages.filter(m => m.type === 'text').length,
        voiceMessages: chatMessages.filter(m => m.type === 'voice').length
      });

      return {
        success: true,
        syncedCount: chatMessages.length
      };
    } catch (error) {
      logger.error('CONVERSATION_SWITCH', 'Failed to sync messages', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        syncedCount: 0
      };
    }
  }
}

// Export singleton instance
export const conversationSwitchService = new ConversationSwitchService();
