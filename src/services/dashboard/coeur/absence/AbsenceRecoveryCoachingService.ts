/**
 * AbsenceRecoveryCoachingService - Proactive coaching for user absence recovery
 * Generates personalized messages to welcome users back and guide weight updates
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import logger from '@/lib/utils/logger';

export interface CoachMessage {
  type: 'welcome_back' | 'weight_update_prompt' | 'progress_celebration' | 'gentle_reminder' | 'avatar_prompt' | 'body_scan_prompt';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  cta?: {
    text: string;
    action: string;
    navigationPath?: string;
    scrollTarget?: string; // Component to scroll to
  };
  metadata?: Record<string, any>;
}

export interface RecoveryContext {
  userId: string;
  userName?: string;
  daysAbsent: number;
  pendingXp: number;
  userObjective: string;
  lastWeightUpdate?: Date;
  hasBodyScan: boolean;
  lastBodyScanDate?: Date;
  hasAvatar: boolean;
  lastAvatarUpdate?: Date;
}

export class AbsenceRecoveryCoachingService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    console.log('✅ AbsenceRecoveryCoachingService initialized');
  }

  /**
   * Generate welcome back message with context-aware coaching
   * NOTE: These messages should NOT be displayed - they're generated BEFORE weight update
   * The celebration message (generateProgressCelebration) is what should be shown AFTER
   */
  async generateWelcomeBackMessage(context: RecoveryContext): Promise<CoachMessage[]> {
    console.log('👋 [ABSENCE_COACHING] Generating welcome back messages (internal use)', { userId: context.userId, daysAbsent: context.daysAbsent });
    try {
      logger.info('ABSENCE_COACHING', 'Generating welcome back message', {
        userId: context.userId,
        daysAbsent: context.daysAbsent,
        pendingXp: context.pendingXp
      });

      const messages: CoachMessage[] = [];

      // Only include messages that make sense AFTER weight update
      // Avatar and body scan prompts - but NOT welcome/weight prompts

      // 1. Avatar update prompt if needed
      if (this.shouldPromptAvatarUpdate(context)) {
        console.log('👤 [ABSENCE_COACHING] Adding avatar update prompt');
        const avatarPrompt = this.getAvatarUpdatePrompt(context);
        messages.push(avatarPrompt);
      }

      // 2. Body scan prompt if needed
      if (this.shouldPromptBodyScan(context)) {
        console.log('📸 [ABSENCE_COACHING] Adding body scan prompt');
        const bodyScanPrompt = this.getBodyScanPrompt(context);
        messages.push(bodyScanPrompt);
      }

      logger.info('ABSENCE_COACHING', 'Generated recovery messages', {
        userId: context.userId,
        messageCount: messages.length
      });

      return messages;
    } catch (error) {
      logger.error('ABSENCE_COACHING', 'Failed to generate welcome back message', {
        userId: context.userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return [];
    }
  }

  /**
   * Generate progress celebration message after successful reconciliation
   * This is the MAIN message that should be displayed to the user
   */
  async generateProgressCelebration(
    context: RecoveryContext,
    weightDelta: number,
    awardedXp: number,
    coherenceScore: number
  ): Promise<CoachMessage> {
    console.log('🎉 [ABSENCE_COACHING] Generating progress celebration', { weightDelta, awardedXp, coherenceScore });
    const userName = context.userName || 'Champion';

    let message = `Félicitations, ${userName}! 🎉\n\n`;

    // Analyze progress based on objective
    if (context.userObjective === 'fat_loss' && weightDelta < 0) {
      const weeklyLoss = Math.abs(weightDelta) / (context.daysAbsent / 7);
      if (weeklyLoss >= 0.5 && weeklyLoss <= 1.0) {
        message += `Excellent travail! Vous avez perdu ${Math.abs(weightDelta).toFixed(1)}kg - un rythme optimal pour une perte de gras durable. `;
      } else if (weightDelta < 0) {
        message += `Vous avez perdu ${Math.abs(weightDelta).toFixed(1)}kg pendant votre absence. `;
      }
    } else if (context.userObjective === 'muscle_gain' && weightDelta > 0) {
      message += `Super! Vous avez pris ${weightDelta.toFixed(1)}kg - votre prise de masse se poursuit bien. `;
    } else if (context.userObjective === 'maintenance') {
      if (Math.abs(weightDelta) <= 0.5) {
        message += `Parfait! Votre poids est resté stable (${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)}kg). `;
      } else {
        message += `Votre poids a varié de ${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)}kg. `;
      }
    }

    message += `\n\nVous avez débloqué ${awardedXp} points pour votre activité estimée pendant ces ${context.daysAbsent} jours! `;

    if (coherenceScore >= 0.8) {
      message += `Vos progrès sont excellents et cohérents. 💪`;
    } else if (coherenceScore >= 0.6) {
      message += `Continuez sur cette lancée!`;
    }

    message += `\n\nPassez à l'action maintenant avec le panneau de commande ci-dessous! 🎯`;

    return {
      type: 'progress_celebration',
      priority: 'high',
      message,
      cta: {
        text: 'Voir mes actions disponibles',
        action: 'scroll_to_actions',
        scrollTarget: 'gaming-actions-widget'
      },
      metadata: {
        weightDelta,
        awardedXp,
        coherenceScore
      }
    };
  }

  /**
   * Generate gentle reminder for weight update (after 24-48h)
   */
  generateGentleReminder(daysAbsent: number, pendingXp: number): CoachMessage {
    console.log('🔔 [ABSENCE_COACHING] Generating gentle reminder', { daysAbsent, pendingXp });
    let message = `Hey! Cela fait ${daysAbsent} jours que vous n'avez pas mis à jour votre poids. `;
    message += `Vous avez ${pendingXp} points en attente qui seront débloqués dès que vous confirmerez votre poids actuel.\n\n`;
    message += `Prenez juste 30 secondes pour mettre à jour votre poids et débloquer vos récompenses! 🎯`;

    return {
      type: 'gentle_reminder',
      priority: 'medium',
      message,
      cta: {
        text: 'Mettre à jour mon poids',
        action: 'navigate_to_weight_update',
        navigationPath: '/home',
        scrollTarget: 'weight-update-section'
      },
      metadata: {
        daysAbsent,
        pendingXp
      }
    };
  }

  /**
   * Get welcome message based on absence duration
   */
  private getWelcomeMessage(context: RecoveryContext): CoachMessage {
    const userName = context.userName || 'Champion';
    let message = '';

    if (context.daysAbsent <= 3) {
      message = `Content de vous revoir, ${userName}! 👋`;
    } else if (context.daysAbsent <= 7) {
      message = `Bienvenue de retour, ${userName}! Vous nous avez manqué! 🎉`;
    } else if (context.daysAbsent <= 14) {
      message = `${userName}, quel plaisir de vous retrouver! Prêt à reprendre la forge? 💪`;
    } else {
      message = `${userName}, c'est un vrai plaisir de vous retrouver après ${context.daysAbsent} jours! On reprend ensemble? 🔥`;
    }

    return {
      type: 'welcome_back',
      priority: 'medium',
      message
    };
  }

  /**
   * Get weight update prompt
   */
  private getWeightUpdatePrompt(context: RecoveryContext): CoachMessage {
    let message = `Pendant votre absence de ${context.daysAbsent} jours, j'ai estimé votre activité et vous avez accumulé ${context.pendingXp} points! 🎁\n\n`;

    message += `Pour débloquer ces points, j'ai besoin que vous mettiez à jour votre poids actuel. `;
    message += `Cela me permet de valider vos progrès et de vous attribuer vos récompenses de manière juste et précise.\n\n`;

    message += `Le nouveau système accepte des incréments de 0.1kg pour une précision maximale! ⚖️`;

    return {
      type: 'weight_update_prompt',
      priority: 'high',
      message,
      cta: {
        text: 'Mettre à jour mon poids (0.1kg de précision)',
        action: 'navigate_to_weight_update',
        navigationPath: '/home',
        scrollTarget: 'weight-update-section'
      },
      metadata: {
        pendingXp: context.pendingXp,
        daysAbsent: context.daysAbsent
      }
    };
  }

  /**
   * Get avatar update prompt
   */
  private getAvatarUpdatePrompt(context: RecoveryContext): CoachMessage {
    let message = '';

    if (!context.hasAvatar) {
      message = `Je remarque que vous n'avez pas encore configuré votre avatar 3D! `;
      message += `Créer votre avatar vous permet de visualiser votre progression en temps réel. C'est motivant et ultra-immersif! 🎨`;
    } else if (context.lastAvatarUpdate) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - context.lastAvatarUpdate.getTime()) / (24 * 60 * 60 * 1000)
      );
      message = `Votre avatar n'a pas été mis à jour depuis ${daysSinceUpdate} jours. `;
      message += `Après ${context.daysAbsent} jours d'absence, ce serait le moment idéal de le mettre à jour! 🔄`;
    } else {
      message = `Pensez à mettre à jour votre avatar pour refléter vos progrès récents! 👤`;
    }

    return {
      type: 'avatar_prompt',
      priority: 'medium',
      message,
      cta: {
        text: context.hasAvatar ? 'Mettre à jour mon avatar' : 'Créer mon avatar',
        action: 'navigate_to_avatar',
        navigationPath: '/profile',
        scrollTarget: 'avatar-section'
      }
    };
  }

  /**
   * Get body scan prompt
   */
  private getBodyScanPrompt(context: RecoveryContext): CoachMessage {
    let message = '';

    if (!context.hasBodyScan) {
      message = `Vous n'avez pas encore fait de scan corporel! `;
      message += `Le scan 3D vous permet de suivre l'évolution de votre composition corporelle avec une précision impressionnante. `;
      message += `C'est la meilleure façon de voir vos vrais progrès! 📊`;
    } else if (context.lastBodyScanDate) {
      const daysSinceScan = Math.floor(
        (Date.now() - context.lastBodyScanDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysSinceScan >= 30) {
        message = `Votre dernier scan corporel date de ${daysSinceScan} jours! `;
        message += `Après une absence de ${context.daysAbsent} jours, un nouveau scan vous permettrait de mesurer précisément vos changements. 📸`;
      } else if (context.daysAbsent >= 14) {
        message = `Après ${context.daysAbsent} jours d'absence, un scan corporel vous donnerait une vue précise de votre évolution! 🎯`;
      }
    }

    if (!message) return null as any; // Skip if no prompt needed

    return {
      type: 'body_scan_prompt',
      priority: 'medium',
      message,
      cta: {
        text: context.hasBodyScan ? 'Faire un nouveau scan' : 'Faire mon premier scan',
        action: 'navigate_to_body_scan',
        navigationPath: '/body-scan',
        scrollTarget: 'scan-start-section'
      }
    };
  }

  /**
   * Check if we should prompt avatar update
   */
  private shouldPromptAvatarUpdate(context: RecoveryContext): boolean {
    // Always prompt if no avatar
    if (!context.hasAvatar) return true;

    // Prompt if last update was more than 30 days ago
    if (context.lastAvatarUpdate) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - context.lastAvatarUpdate.getTime()) / (24 * 60 * 60 * 1000)
      );
      return daysSinceUpdate >= 30;
    }

    // Prompt for longer absences
    return context.daysAbsent >= 7;
  }

  /**
   * Check if we should prompt body scan
   */
  private shouldPromptBodyScan(context: RecoveryContext): boolean {
    // Always prompt if no scan yet
    if (!context.hasBodyScan) return true;

    // Prompt if last scan was more than 30 days ago
    if (context.lastBodyScanDate) {
      const daysSinceScan = Math.floor(
        (Date.now() - context.lastBodyScanDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      return daysSinceScan >= 30;
    }

    // Prompt for longer absences (14+ days)
    return context.daysAbsent >= 14;
  }

  /**
   * Fallback welcome message if generation fails
   */
  private getFallbackWelcomeMessage(context: RecoveryContext): CoachMessage {
    return {
      type: 'welcome_back',
      priority: 'medium',
      message: `Bienvenue de retour! Vous avez ${context.pendingXp} points en attente. Mettez à jour votre poids pour les débloquer! 🎁`,
      cta: {
        text: 'Mettre à jour mon poids',
        action: 'navigate_to_weight_update',
        navigationPath: '/home',
        scrollTarget: 'weight-update-section'
      }
    };
  }

  /**
   * Store coaching message in database for tracking
   */
  async recordCoachMessage(
    userId: string,
    absenceLogId: string,
    message: CoachMessage
  ): Promise<void> {
    console.log('📝 [ABSENCE_COACHING] Recording coach message', { userId, messageType: message.type });
    try {
      await this.supabase
        .from('absence_logs')
        .update({
          reminder_sent_count: this.supabase.rpc('increment', { x: 1 }),
          last_reminder_sent_at: new Date().toISOString()
        })
        .eq('id', absenceLogId);

      logger.info('ABSENCE_COACHING', 'Recorded coach message', {
        userId,
        absenceLogId,
        messageType: message.type
      });
    } catch (error) {
      logger.error('ABSENCE_COACHING', 'Failed to record coach message', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
