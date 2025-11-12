/**
 * PendingXpWidget - Visual alert for pending XP during absence
 * Displays prominently to inform user they have XP waiting
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';
import { useAbsenceStatus } from '@/hooks/useAbsenceStatus';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import logger from '@/lib/utils/logger';

interface PendingXpWidgetProps {
  onCtaClick?: () => void; // Callback for CTA button (scroll to weight section)
}

export default function PendingXpWidget({ onCtaClick }: PendingXpWidgetProps) {
  const { data: absenceStatus, isLoading } = useAbsenceStatus();
  const { mode: performanceMode } = usePerformanceMode();

  // Don't show widget if no active absence
  if (!absenceStatus?.hasActiveAbsence || isLoading) {
    return null;
  }

  const { daysAbsent, pendingXp } = absenceStatus;

  const handleCtaClick = () => {
    logger.info('PENDING_XP_WIDGET', 'CTA clicked', { daysAbsent, pendingXp });
    if (onCtaClick) {
      onCtaClick();
    } else {
      // Default scroll behavior
      const weightSection = document.getElementById('weight-update-section');
      if (weightSection) {
        weightSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <AnimatePresence>
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
        className="pending-xp-widget glass-card-premium p-6 rounded-3xl relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
            rgba(251, 146, 60, 0.08)
          `,
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          border: '2px solid rgba(251, 146, 60, 0.5)',
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 8px 32px rgba(251, 146, 60, 0.3),
            0 0 80px rgba(251, 146, 60, 0.2)
          `
        }}
      >
        {/* Animated Background Glow - Premium only */}
        {performanceMode === 'premium' && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-400/15 via-yellow-400/15 to-orange-400/15"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute top-0 right-0 w-40 h-40 bg-orange-400/25 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/25 rounded-full blur-3xl"
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
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.4) 0%, transparent 70%),
                  rgba(251, 146, 60, 0.2)
                `,
                border: '2px solid rgba(251, 146, 60, 0.4)',
                boxShadow: '0 0 30px rgba(251, 146, 60, 0.4)'
              }}
              animate={{
                boxShadow: [
                  '0 0 30px rgba(251, 146, 60, 0.4)',
                  '0 0 50px rgba(251, 146, 60, 0.6)',
                  '0 0 30px rgba(251, 146, 60, 0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <SpatialIcon
                Icon={ICONS.Gift}
                size={28}
                style={{
                  color: '#FB923C',
                  filter: 'drop-shadow(0 0 12px rgba(251, 146, 60, 0.8))'
                }}
              />
              {/* Pulse dot */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #FB923C, #FBBF24)',
                  boxShadow: '0 0 10px rgba(251, 146, 60, 0.8)'
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
                XP en attente!
              </h3>
              <p className="text-sm text-white/70 font-medium">
                Tu as été absent {daysAbsent} jour{daysAbsent > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* XP Display */}
          <div className="flex items-center justify-center py-4">
            <motion.div
              className="glass-card rounded-2xl px-8 py-6 border-2"
              style={{
                background: 'rgba(251, 146, 60, 0.15)',
                borderColor: 'rgba(251, 146, 60, 0.3)',
                boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.1)'
              }}
              animate={{
                scale: [1, 1.03, 1],
                boxShadow: [
                  'inset 0 2px 0 rgba(255, 255, 255, 0.1)',
                  'inset 0 2px 0 rgba(255, 255, 255, 0.2)',
                  'inset 0 2px 0 rgba(255, 255, 255, 0.1)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-baseline gap-2 justify-center">
                <SpatialIcon
                  Icon={ICONS.Zap}
                  size={24}
                  style={{
                    color: '#FB923C',
                    filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.6))'
                  }}
                />
                <span className="text-6xl font-black text-white">
                  {pendingXp.toLocaleString()}
                </span>
                <span className="text-xl text-white/70 font-bold">Points</span>
              </div>
            </motion.div>
          </div>

          {/* Informational Text */}
          <div className="text-center space-y-2 px-4">
            <p className="text-white/90 text-sm leading-relaxed">
              Pendant ton absence, j'ai estimé ton activité quotidienne.
            </p>
            <p className="text-white/80 text-sm leading-relaxed font-medium">
              Pour débloquer ces <span className="text-orange-400 font-bold">{pendingXp} XP</span>,
              mets à jour ton poids actuel.
            </p>
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={handleCtaClick}
            className="w-full px-6 py-4 rounded-xl font-bold text-white relative overflow-hidden"
            style={{
              background: performanceMode === 'ultra-performance'
                ? '#FB923C' // Solid orange in ultra-performance mode for better visibility
                : 'linear-gradient(135deg, #FB923C 0%, #FBBF24 100%)',
              border: performanceMode === 'ultra-performance'
                ? '3px solid #FBBF24' // Thicker yellow border in ultra-performance
                : '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: performanceMode === 'ultra-performance'
                ? '0 2px 8px rgba(251, 146, 60, 0.6)' // Simpler shadow in ultra-performance
                : `
                  0 4px 20px rgba(251, 146, 60, 0.5),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `
            }}
            whileHover={performanceMode !== 'ultra-performance' ? {
              scale: 1.03,
              boxShadow: `
                0 8px 32px rgba(251, 146, 60, 0.6),
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
              <SpatialIcon Icon={ICONS.Scale} size={20} color="white" />
              <span>Mettre à jour mon poids</span>
            </div>
          </motion.button>

          {/* Expiration warning if needed */}
          {absenceStatus.pendingRewards.length > 0 && (
            (() => {
              const oldestReward = absenceStatus.pendingRewards[0];
              const expiresAt = new Date(oldestReward.expires_at);
              const now = new Date();
              const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

              if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
                return (
                  <motion.div
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <SpatialIcon Icon={ICONS.AlertTriangle} size={14} color="#EF4444" />
                    <span className="text-xs text-red-400 font-medium">
                      Expire dans {daysUntilExpiry} jour{daysUntilExpiry > 1 ? 's' : ''}
                    </span>
                  </motion.div>
                );
              }
              return null;
            })()
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
