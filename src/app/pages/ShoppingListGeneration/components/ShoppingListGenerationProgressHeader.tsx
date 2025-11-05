import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import type { ShoppingListPipelineStep } from '../../../../system/store/shoppingListGenerationPipeline/types';

interface ShoppingListGenerationProgressHeaderProps {
  currentStep: ShoppingListPipelineStep;
  overallProgress: number;
  loadingMessage?: string;
}

const ShoppingListGenerationProgressHeader: React.FC<ShoppingListGenerationProgressHeaderProps> = ({
  currentStep,
  overallProgress,
  loadingMessage
}) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const stepIndex = ['configuration', 'generating', 'validation'].indexOf(currentStep.id);
  const progressPercentage = ((stepIndex + 1) / 3) * 100;

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #fb923c 12%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #f97316 8%, transparent) 0%, transparent 50%),
          linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05)),
          rgba(11, 14, 23, 0.85)
        `,
        borderColor: 'color-mix(in srgb, #fb923c 30%, transparent)',
        boxShadow: `
          0 20px 60px rgba(0, 0, 0, 0.3),
          0 0 40px color-mix(in srgb, #fb923c 20%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `,
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)'
      }}
    >
      <div className="space-y-6">
        {/* Header with Icon */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #fb923c 40%, transparent), color-mix(in srgb, #f97316 35%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #fb923c 50%, transparent)',
              boxShadow: `
                0 0 30px color-mix(in srgb, #fb923c 40%, transparent),
                inset 0 2px 0 rgba(255,255,255,0.3)
              `
            }}
          >
            <SpatialIcon
              Icon={ICONS.ShoppingCart}
              size={28}
              color="rgba(255, 255, 255, 0.95)"
              variant="pure"
            />
          </div>

          <div className="flex-1">
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{
                textShadow: '0 0 25px color-mix(in srgb, #fb923c 50%, transparent)'
              }}
            >
              {currentStep.label}
            </h2>
            <p className="text-white/80 text-sm">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Progression</span>
            <span className="text-orange-400 font-semibold">{Math.round(progressPercentage)}%</span>
          </div>

          <div
            className="h-2 rounded-full overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.2)'
            }}
          >
            <MotionDiv
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #fb923c, #f97316, #ea580c)',
                boxShadow: '0 0 10px rgba(251, 146, 60, 0.6)'
              }}
              {...(!isPerformanceMode && {
                initial: { width: 0 },
                animate: { width: `${progressPercentage}%` },
                transition: { duration: 0.5, ease: 'easeOut' }
              })}
              {...(isPerformanceMode && {
                style: { width: `${progressPercentage}%` }
              })}
            />
          </div>
        </div>

        {/* Loading Message */}
        {loadingMessage && (
          <MotionDiv
            {...(!isPerformanceMode && {
              initial: { opacity: 0, y: -10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.3 }
            })}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{
              background: 'rgba(251, 146, 60, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.2)'
            }}
          >
            <div className="w-5 h-5 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
            <span className="text-white/90 text-sm font-medium">{loadingMessage}</span>
          </MotionDiv>
        )}
      </div>
    </GlassCard>
  );
};

export default ShoppingListGenerationProgressHeader;
