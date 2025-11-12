/**
 * AbsenceCoachingMessages - Display coaching messages after reconciliation
 * Shows prioritized messages with CTAs for navigation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import type { CoachMessage } from '@/services/dashboard/coeur/absence/AbsenceRecoveryCoachingService';
import logger from '@/lib/utils/logger';

interface AbsenceCoachingMessagesProps {
  messages: CoachMessage[];
  onDismiss?: () => void;
}

// Icon mapping for message types
const MESSAGE_TYPE_ICONS: Record<CoachMessage['type'], keyof typeof ICONS> = {
  welcome_back: 'HandWave',
  weight_update_prompt: 'Scale',
  progress_celebration: 'PartyPopper',
  gentle_reminder: 'Bell',
  avatar_prompt: 'User',
  body_scan_prompt: 'Camera'
};

// Color mapping for priorities
const PRIORITY_COLORS = {
  critical: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    text: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.3)'
  },
  high: {
    bg: 'rgba(251, 146, 60, 0.15)',
    border: 'rgba(251, 146, 60, 0.4)',
    text: '#FB923C',
    glow: 'rgba(251, 146, 60, 0.3)'
  },
  medium: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    text: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.3)'
  },
  low: {
    bg: 'rgba(156, 163, 175, 0.15)',
    border: 'rgba(156, 163, 175, 0.4)',
    text: '#9CA3AF',
    glow: 'rgba(156, 163, 175, 0.3)'
  }
};

export default function AbsenceCoachingMessages({ messages, onDismiss }: AbsenceCoachingMessagesProps) {
  const navigate = useNavigate();

  // Sort messages by priority
  const sortedMessages = [...messages].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleCtaClick = (message: CoachMessage) => {
    if (!message.cta) return;

    logger.info('ABSENCE_COACHING', 'CTA clicked', {
      messageType: message.type,
      action: message.cta.action,
      navigationPath: message.cta.navigationPath,
      scrollTarget: message.cta.scrollTarget
    });

    // Handle navigation
    if (message.cta.navigationPath) {
      navigate(message.cta.navigationPath);

      // Scroll to target after navigation (with delay)
      if (message.cta.scrollTarget) {
        setTimeout(() => {
          const target = document.getElementById(message.cta!.scrollTarget!);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    } else if (message.cta.scrollTarget) {
      // Just scroll on same page
      const target = document.getElementById(message.cta.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (sortedMessages.length === 0) {
    return null;
  }

  return (
    <div className="absence-coaching-messages space-y-4">
      <AnimatePresence mode="popLayout">
        {sortedMessages.map((message, index) => {
          const colors = PRIORITY_COLORS[message.priority];
          const icon = MESSAGE_TYPE_ICONS[message.type] || 'MessageSquare';

          return (
            <motion.div
              key={`${message.type}-${index}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: index * 0.1
              }}
              className="glass-card rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                boxShadow: `
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  0 4px 16px ${colors.glow}
                `
              }}
            >
              {/* Message Content */}
              <div className="relative z-10 space-y-3">
                {/* Header with Icon and Priority Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `rgba(255, 255, 255, 0.1)`,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <SpatialIcon
                        Icon={ICONS[icon]}
                        size={20}
                        style={{
                          color: colors.text,
                          filter: `drop-shadow(0 0 8px ${colors.glow})`
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide"
                          style={{
                            background: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`
                          }}
                        >
                          {message.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dismiss button if callback provided */}
                  {onDismiss && (
                    <motion.button
                      onClick={onDismiss}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileHover={{ scale: 1.1, background: 'rgba(255, 255, 255, 0.15)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <SpatialIcon Icon={ICONS.X} size={14} color="rgba(255, 255, 255, 0.7)" />
                    </motion.button>
                  )}
                </div>

                {/* Message Text */}
                <div className="pl-13">
                  <p
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    {message.message}
                  </p>
                </div>

                {/* CTA Button */}
                {message.cta && (
                  <div className="pl-13 pt-2">
                    <motion.button
                      onClick={() => handleCtaClick(message)}
                      className="px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.text}dd 100%)`,
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: `
                          0 2px 12px ${colors.glow},
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `
                      }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: `
                          0 4px 20px ${colors.glow},
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span>{message.cta.text}</span>
                      <SpatialIcon Icon={ICONS.ArrowRight} size={14} color="white" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
