/**
 * Chat AI Service
 * Service for interacting with the chat-ai Edge Function
 */

import { supabase } from '../../supabase/client';
import logger from '../../../lib/utils/logger';
import type { ChatMessage } from '../../../domain/coachChat';
import type { ChatMode } from '../../store/globalChatStore';

export interface ChatAIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  mode: ChatMode;
  contextData?: any;
  stream?: boolean;
}

export interface ChatAIResponse {
  message: {
    role: 'assistant';
    content: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class ChatAIService {
  private baseUrl: string;
  private csrfTokenCache: { token: string; expiresAt: number } | null = null;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.baseUrl = `${supabaseUrl}/functions/v1`;
  }

  private async getCSRFToken(userId: string, forceRefresh = false): Promise<string | null> {
    const now = Date.now();

    if (!forceRefresh && this.csrfTokenCache && this.csrfTokenCache.expiresAt > now) {
      logger.info('CHAT_AI_SERVICE', '🔐 Using cached CSRF token', {
        cacheAge: Math.floor((now - (this.csrfTokenCache.expiresAt - 50 * 60 * 1000)) / 1000),
        remainingTime: Math.floor((this.csrfTokenCache.expiresAt - now) / 1000)
      });
      return this.csrfTokenCache.token;
    }

    try {
      logger.info('CHAT_AI_SERVICE', '🔐 Generating new CSRF token', { userId, forceRefresh });

      const { data, error } = await supabase.rpc('generate_csrf_token', {
        p_user_id: userId,
        p_validity_minutes: 60
      });

      if (error) {
        logger.warn('CHAT_AI_SERVICE', '⚠️ Failed to generate CSRF token - continuing without it', {
          error: error.message,
          hint: 'CSRF protection is degraded but chat will still work'
        });
        return null;
      }

      if (data) {
        this.csrfTokenCache = {
          token: data,
          expiresAt: now + (50 * 60 * 1000)
        };

        logger.info('CHAT_AI_SERVICE', '✅ CSRF token generated and cached', {
          validityMinutes: 50
        });
        return data;
      }

      return null;
    } catch (error) {
      logger.warn('CHAT_AI_SERVICE', '⚠️ Exception generating CSRF token - continuing without it', {
        error: error instanceof Error ? error.message : String(error),
        hint: 'CSRF protection is degraded but chat will still work'
      });
      return null;
    }
  }

  private invalidateCSRFCache(): void {
    logger.info('CHAT_AI_SERVICE', '🔄 Invalidating CSRF token cache');
    this.csrfTokenCache = null;
  }

  async sendMessage(request: ChatAIRequest, retryCount = 0): Promise<ChatAIResponse> {
    const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxRetries = 1;

    try {
      logger.info('CHAT_AI_SERVICE', '🚀 Starting sendMessage request', {
        requestId,
        mode: request.mode,
        messageCount: request.messages.length,
        hasContext: !!request.contextData,
        baseUrl: this.baseUrl,
        retryCount
      });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        logger.error('CHAT_AI_SERVICE', '❌ User not authenticated', { requestId });
        throw new Error('User not authenticated');
      }

      const forceRefresh = retryCount > 0;
      const csrfToken = await this.getCSRFToken(session.user.id, forceRefresh);

      logger.info('CHAT_AI_SERVICE', '✅ Session validated, making fetch request', {
        requestId,
        userId: session.user.id,
        url: `${this.baseUrl}/chat-ai`,
        hasCsrfToken: !!csrfToken,
        tokenRefreshed: forceRefresh
      });

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      };

      // CSRF token disabled for chat-ai - Edge Function doesn't validate it yet
      // TODO: Re-enable when Edge Function CORS headers are updated
      // if (csrfToken) {
      //   headers['X-CSRF-Token'] = csrfToken;
      // }

      const response = await fetch(`${this.baseUrl}/chat-ai`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      logger.info('CHAT_AI_SERVICE', '📡 Fetch response received', {
        requestId,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('Content-Type')
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('CHAT_AI_SERVICE', '❌ Response not OK', {
          requestId,
          status: response.status,
          errorText,
          retryCount
        });

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }

        if (response.status === 403 && errorData.error?.includes('CSRF') && retryCount < maxRetries) {
          logger.warn('CHAT_AI_SERVICE', '🔄 CSRF validation failed, invalidating cache and retrying', {
            requestId,
            retryCount,
            maxRetries
          });

          this.invalidateCSRFCache();

          await new Promise(resolve => setTimeout(resolve, 300));

          return this.sendMessage(request, retryCount + 1);
        }

        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data: ChatAIResponse = await response.json();

      logger.info('CHAT_AI_SERVICE', '✅ Response parsed successfully', {
        requestId,
        mode: request.mode,
        tokensUsed: data.usage?.total_tokens,
        hasMessage: !!data.message,
        messageLength: data.message?.content?.length || 0
      });

      return data;
    } catch (error) {
      logger.error('CHAT_AI_SERVICE', '❌ Fatal error in sendMessage', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async sendStreamMessage(
    request: ChatAIRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const startTime = Date.now();
    let chunkCount = 0;
    let totalContent = '';
    let requestId = 'unknown';

    try {
      logger.info('CHAT_AI_SERVICE', 'Starting stream request', {
        mode: request.mode,
        messageCount: request.messages.length
      });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        logger.error('CHAT_AI_SERVICE', 'User not authenticated for stream');
        throw new Error('User not authenticated');
      }

      const csrfToken = await this.getCSRFToken(session.user.id, false);

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      };

      // CSRF token disabled for chat-ai - Edge Function doesn't validate it yet
      // TODO: Re-enable when Edge Function CORS headers are updated
      // if (csrfToken) {
      //   headers['X-CSRF-Token'] = csrfToken;
      // }

      const response = await fetch(`${this.baseUrl}/chat-ai`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...request,
          stream: true
        })
      });

      requestId = response.headers.get('X-Request-Id') || 'unknown';

      logger.info('CHAT_AI_SERVICE', 'Stream response received', {
        requestId,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('Content-Type')
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('CHAT_AI_SERVICE', 'Stream response not ok', {
          requestId,
          status: response.status,
          error: errorText
        });
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        logger.error('CHAT_AI_SERVICE', 'No response body reader', { requestId });
        throw new Error('Response body is not readable');
      }

      logger.info('CHAT_AI_SERVICE', 'Starting to read stream chunks', { requestId });

      let buffer = ''; // Buffer pour accumuler les lignes partielles
      let totalLinesProcessed = 0;
      let dataLinesProcessed = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          logger.info('CHAT_AI_SERVICE', 'Stream reading completed', {
            requestId,
            chunkCount,
            totalLength: totalContent.length,
            totalLinesProcessed,
            dataLinesProcessed,
            durationMs: Date.now() - startTime
          });
          break;
        }

        // Ajouter le nouveau chunk au buffer
        buffer += decoder.decode(value, { stream: true });

        // Séparer par les lignes complètes
        const lines = buffer.split('\n');

        // Garder la dernière ligne (potentiellement incomplète) dans le buffer
        buffer = lines.pop() || '';


        for (const line of lines) {
          totalLinesProcessed++;

          if (!line.trim()) continue;

          if (line.startsWith('data: ')) {
            dataLinesProcessed++;
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              logger.info('CHAT_AI_SERVICE', 'Stream [DONE] marker received', {
                requestId,
                totalChunks: chunkCount,
                totalLength: totalContent.length
              });
              return;
            }

            try {
              const parsed = JSON.parse(data);


              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                chunkCount++;
                totalContent += content;

                onChunk(content);
              }
            } catch (parseError) {
            }
          }
        }
      }

      if (chunkCount === 0) {
        logger.warn('CHAT_AI_SERVICE', 'No content chunks received in stream', {
          requestId,
          durationMs: Date.now() - startTime
        });
      }
    } catch (error) {
      logger.error('CHAT_AI_SERVICE', 'Error in stream', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        chunkCount,
        durationMs: Date.now() - startTime
      });
      throw error;
    }
  }

  convertMessagesToAPI(messages: ChatMessage[]): ChatAIRequest['messages'] {
    return messages
      .filter(msg => {
        // Filter out messages with empty or invalid content
        if (!msg.content || msg.content.trim() === '') {
          logger.warn('CHAT_AI_SERVICE', '⚠️ Filtering message with empty content', {
            role: msg.role,
            type: msg.type,
            id: msg.id
          });
          return false;
        }

        // Filter out local system notifications (not AI system prompts)
        // These are UI-only messages like "Passage en mode Training"
        if (msg.role === 'system' && msg.type === 'system') {
          logger.debug('CHAT_AI_SERVICE', '🔇 Filtering local system notification', {
            content: msg.content.substring(0, 50)
          });
          return false;
        }

        return true;
      })
      .map(msg => ({
        role: msg.role === 'coach' ? 'assistant' : msg.role as 'system' | 'user' | 'assistant',
        content: msg.content.trim()
      }));
  }
}

export const chatAIService = new ChatAIService();
