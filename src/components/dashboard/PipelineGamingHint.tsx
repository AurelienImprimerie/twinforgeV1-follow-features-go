import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../system/context/PerformanceModeContext';
import SpatialIcon from '../../ui/icons/SpatialIcon';
import { ICONS } from '../../ui/icons/registry';
import { GAMING_COLORS } from './gamingColors';

interface PipelineGamingHintProps {
  points: number;
  forgeName: string;
  message: string;
  className?: string;
}

/**
 * PipelineGamingHint - Petit indicateur gaming pour les étapes 1 des pipelines
 * Affiche un message informatif avec les points gagnables
 * Utilise le thème gaming universel (dégradé jaune/orange)
 */
const PipelineGamingHint: React.FC<PipelineGamingHintProps> = ({
  points,
  forgeName,
  message,
  className = ''
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const gamingColors = GAMING_COLORS.UNIVERSAL_GAMING;
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <MotionDiv
      className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl ${className}`}
      style={{
        background: gamingColors.hint.background,
        border: `1px solid ${gamingColors.hint.border}`,
        backdropFilter: isPerformanceMode ? 'none' : 'blur(12px) saturate(120%)',
        boxShadow: isPerformanceMode
          ? 'none'
          : `0 4px 16px ${gamingColors.glow}20`
      }}
      {...(!isPerformanceMode && {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, delay: 0.2 }
      })}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          background: gamingColors.hint.iconBackground,
          border: `1px solid ${gamingColors.hint.iconBorder}`
        }}
      >
        <SpatialIcon
          Icon={ICONS.Trophy}
          size={20}
          style={{
            color: gamingColors.secondary,
            filter: isPerformanceMode ? 'none' : `drop-shadow(0 0 6px ${gamingColors.glow})`
          }}
        />
      </div>

      <div className="flex-1">
        <p className="text-white/90 text-sm font-medium">{message}</p>
      </div>

      <div
        className="flex-shrink-0 px-3 py-1.5 rounded-full font-bold text-sm"
        style={{
          background: gamingColors.badge.background,
          border: `1px solid ${gamingColors.badge.border}`,
          color: gamingColors.badge.text
        }}
      >
        +{points} pts
      </div>
    </MotionDiv>
  );
};

export default PipelineGamingHint;
