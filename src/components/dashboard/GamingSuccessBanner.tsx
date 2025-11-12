import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';
import { getForgeColor } from './gamingColors';

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
 */
const GamingSuccessBanner: React.FC<GamingSuccessBannerProps> = ({
  points,
  forgeName,
  title,
  message,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const forgeColor = getForgeColor(forgeName);
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: forgeColor.success.background,
        border: `2px solid ${forgeColor.success.border}`,
        backdropFilter: isPerformanceMode ? 'none' : 'blur(20px) saturate(140%)',
        boxShadow: isPerformanceMode
          ? 'none'
          : `0 8px 32px ${forgeColor.glow}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      }}
      {...(!isPerformanceMode && {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      })}
    >
      <div className="p-6 flex items-center gap-6">
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
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: forgeColor.success.iconBackground,
              border: `2px solid ${forgeColor.success.iconBorder}`,
              boxShadow: isPerformanceMode
                ? 'none'
                : `0 0 30px ${forgeColor.glow}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
            }}
          >
            <SpatialIcon
              Icon={ICONS.Trophy}
              size={32}
              style={{
                color: forgeColor.primary,
                filter: isPerformanceMode ? 'none' : `drop-shadow(0 0 10px ${forgeColor.glow})`
              }}
            />
          </div>
        </MotionDiv>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-xl mb-1">{title}</h3>
          <p className="text-white/80 text-sm">{message}</p>
        </div>

        {/* Points badge avec pulse */}
        <MotionDiv
          className="flex-shrink-0"
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
            className="px-6 py-3 rounded-2xl font-bold text-lg"
            style={{
              background: forgeColor.badge.background,
              border: `2px solid ${forgeColor.badge.border}`,
              color: forgeColor.badge.text,
              boxShadow: isPerformanceMode
                ? 'none'
                : `0 0 25px ${forgeColor.glow}, 0 4px 16px rgba(0, 0, 0, 0.3)`
            }}
          >
            +{points} pts
          </div>
        </MotionDiv>
      </div>
    </MotionDiv>
  );
};

export default GamingSuccessBanner;
