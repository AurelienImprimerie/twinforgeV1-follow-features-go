import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';
import { GAMING_COLORS } from './gamingColors';

interface GamingSuccessBannerProps {
  points: number;
  forgeName: string;
  title: string;
  message: string;
  className?: string;
}

/**
 * GamingSuccessBanner - Bannière de succès gaming pour les étapes finales
 * Affiche une célébration avec animation pulse pour les points gagnés
 * Utilise le thème gaming universel (dégradé jaune/orange)
 */
const GamingSuccessBanner: React.FC<GamingSuccessBannerProps> = ({
  points,
  forgeName,
  title,
  message,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const gamingColors = GAMING_COLORS.UNIVERSAL_GAMING;
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: gamingColors.success.background,
        border: `2px solid ${gamingColors.success.border}`,
        backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(140%)',
        boxShadow: isPerformanceMode
          ? 'none'
          : `0 8px 32px ${gamingColors.glow}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      }}
      {...(!isPerformanceMode && {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      })}
    >
      <div className="p-4 sm:p-6">
        {/* Layout responsive: column sur mobile, row sur desktop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Icon avec animation pulse */}
          <MotionDiv
            className="flex-shrink-0"
            {...(!isPerformanceMode && {
              animate: {
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1]
              },
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            })}
          >
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: gamingColors.success.iconBackground,
                border: `2px solid ${gamingColors.success.iconBorder}`,
                boxShadow: isPerformanceMode
                  ? 'none'
                  : `0 0 30px ${gamingColors.glow}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
              }}
            >
              <SpatialIcon
                Icon={ICONS.Trophy}
                size={28}
                style={{
                  color: gamingColors.secondary,
                  filter: isPerformanceMode ? 'none' : `drop-shadow(0 0 10px ${gamingColors.glow})`
                }}
              />
            </div>
          </MotionDiv>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg sm:text-xl mb-1">{title}</h3>
            <p className="text-white/80 text-sm">{message}</p>
          </div>

          {/* Points badge avec pulse - Full width sur mobile */}
          <MotionDiv
            className="flex-shrink-0 w-full sm:w-auto"
            {...(!isPerformanceMode && {
              animate: {
                scale: [1, 1.05, 1]
              },
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            })}
          >
            <div
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold text-base sm:text-lg text-center"
              style={{
                background: gamingColors.badge.background,
                border: `2px solid ${gamingColors.badge.border}`,
                color: gamingColors.badge.text,
                boxShadow: isPerformanceMode
                  ? 'none'
                  : `0 0 25px ${gamingColors.glow}, 0 4px 16px rgba(0, 0, 0, 0.3)`
              }}
            >
              +{points} pts
            </div>
          </MotionDiv>
        </div>
      </div>
    </MotionDiv>
  );
};

export default GamingSuccessBanner;
