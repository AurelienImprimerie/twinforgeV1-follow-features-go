/**
 * ReconciliationSuccessMessage - Message de félicitation après réconciliation d'absence
 * Remplace le PendingXpWidget après validation du poids
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { scrollToSection } from '@/utils/navigationUtils';
import type { CoachMessage } from '@/services/dashboard/coeur/absence/AbsenceRecoveryCoachingService';

interface ReconciliationSuccessMessageProps {
  coachMessages: CoachMessage[];
  onDismiss?: () => void;
  autoHideDuration?: number; // ms, default 8000 (8 seconds)
}

export default function ReconciliationSuccessMessage({
  coachMessages,
  onDismiss,
  autoHideDuration = 8000
}: ReconciliationSuccessMessageProps) {
  const { mode: performanceMode } = usePerformanceMode();
  const [isVisible, setIsVisible] = useState(true);

  // Extract main celebration message (highest priority)
  const celebrationMessage = coachMessages.find(m => m.type === 'progress_celebration');

  if (!celebrationMessage) {
    return null;
  }

  // Auto-hide after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onDismiss?.();
      }, 500); // Wait for exit animation
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [autoHideDuration, onDismiss]);

  const handleCtaClick = () => {
    if (celebrationMessage.cta?.scrollTarget) {
      scrollToSection(celebrationMessage.cta.scrollTarget);
    }
    // Keep message visible a bit longer after CTA click
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onDismiss?.();
      }, 500);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            duration: 0.5
          }}
          className="glass-card-premium p-6 rounded-3xl relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.35) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              rgba(34, 197, 94, 0.08)
            `,
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            border: '2px solid rgba(34, 197, 94, 0.5)',
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              0 8px 32px rgba(34, 197, 94, 0.3),
              0 0 80px rgba(34, 197, 94, 0.2)
            `
          }}
        >
          {/* Animated Background Glow - Premium only */}
          {performanceMode === 'premium' && (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400/15 via-blue-400/15 to-green-400/15"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute top-0 right-0 w-40 h-40 bg-green-400/25 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/25 rounded-full blur-3xl"
                animate={{
                  scale: [1.3, 1, 1.3],
                  opacity: [0.6, 0.4, 0.6]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
            </>
          )}

          {/* Content */}
          <div className="relative z-10 space-y-4">
            {/* Header with Icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.4) 0%, transparent 70%),
                      rgba(34, 197, 94, 0.2)
                    `,
                    border: '2px solid rgba(34, 197, 94, 0.4)',
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)'
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(34, 197, 94, 0.4)',
                      '0 0 50px rgba(34, 197, 94, 0.6)',
                      '0 0 30px rgba(34, 197, 94, 0.4)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <SpatialIcon
                    Icon={ICONS.CheckCircle}
                    size={28}
                    style={{
                      color: '#22C55E',
                      filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))'
                    }}
                  />
                  {/* Success pulse */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E, #3B82F6)',
                      boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)'
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.6, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    XP débloqués!
                  </h3>
                  <p className="text-sm text-white/70 font-medium">
                    Réconciliation réussie
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onDismiss?.(), 500);
                }}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="Fermer"
              >
                <SpatialIcon Icon={ICONS.X} size={16} color="white" />
              </button>
            </div>

            {/* Message Content */}
            <div className="space-y-3 px-2">
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                {celebrationMessage.message}
              </p>
            </div>

            {/* CTA Button */}
            {celebrationMessage.cta && (
              <motion.button
                onClick={handleCtaClick}
                className="w-full px-6 py-4 rounded-xl font-bold text-white relative overflow-hidden"
                style={{
                  background: performanceMode === 'ultra-performance'
                    ? '#22C55E'
                    : 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)',
                  border: performanceMode === 'ultra-performance'
                    ? '3px solid #3B82F6'
                    : '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: performanceMode === 'ultra-performance'
                    ? '0 2px 8px rgba(34, 197, 94, 0.6)'
                    : `
                      0 4px 20px rgba(34, 197, 94, 0.5),
                      inset 0 1px 0 rgba(255, 255, 255, 0.3)
                    `
                }}
                whileHover={performanceMode !== 'ultra-performance' ? {
                  scale: 1.03,
                  boxShadow: `
                    0 8px 32px rgba(34, 197, 94, 0.6),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4)
                  `
                } : undefined}
                whileTap={performanceMode !== 'ultra-performance' ? { scale: 0.97 } : undefined}
              >
                {/* Button shimmer effect - Premium only */}
                {performanceMode === 'premium' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  />
                )}
                <div className="relative flex items-center justify-center gap-2">
                  <SpatialIcon Icon={ICONS.Zap} size={20} color="white" />
                  <span>{celebrationMessage.cta.text}</span>
                </div>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
