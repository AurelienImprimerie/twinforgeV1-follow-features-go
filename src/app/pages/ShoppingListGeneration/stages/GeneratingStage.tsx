import React from 'react';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';

interface GeneratingStageProps {
  onExit: () => void;
}

const GeneratingStage: React.FC<GeneratingStageProps> = ({ onExit }) => {
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  return (
    <div className="space-y-6">
      <MotionDiv
        {...(!isPerformanceMode && {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.5 }
        })}
      >
        <GlassCard
          className="p-12 text-center"
          style={{
            background: `
              radial-gradient(circle at 50% 30%, color-mix(in srgb, #fb923c 15%, transparent) 0%, transparent 60%),
              radial-gradient(circle at 50% 70%, color-mix(in srgb, #f97316 12%, transparent) 0%, transparent 50%),
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
          <div className="space-y-8">
            {/* Animated Icon */}
            <MotionDiv
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #fb923c 40%, transparent), color-mix(in srgb, #f97316 35%, transparent))
                `,
                border: '3px solid color-mix(in srgb, #fb923c 50%, transparent)',
                boxShadow: `
                  0 0 40px color-mix(in srgb, #fb923c 50%, transparent),
                  inset 0 2px 0 rgba(255,255,255,0.3)
                `
              }}
              {...(!isPerformanceMode && {
                animate: {
                  scale: [1, 1.05, 1],
                  rotate: [0, 180, 360]
                },
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              })}
            >
              <SpatialIcon
                Icon={ICONS.ShoppingCart}
                size={48}
                color="rgba(255, 255, 255, 0.95)"
                variant="pure"
              />
            </MotionDiv>

            {/* Loading Text */}
            <div className="space-y-4">
              <h2
                className="text-3xl font-bold text-white"
                style={{
                  textShadow: '0 0 25px color-mix(in srgb, #fb923c 50%, transparent)'
                }}
              >
                Génération en cours...
              </h2>
              <p className="text-white/80 text-lg max-w-lg mx-auto">
                Votre liste de courses personnalisée est en cours de création
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2].map((index) => (
                <MotionDiv
                  key={index}
                  className="w-3 h-3 rounded-full bg-orange-400"
                  style={{
                    boxShadow: '0 0 10px rgba(251, 146, 60, 0.6)'
                  }}
                  {...(!isPerformanceMode && {
                    animate: {
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    },
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2
                    }
                  })}
                />
              ))}
            </div>
          </div>
        </GlassCard>
      </MotionDiv>

      {/* Exit Button */}
      <div className="flex justify-center">
        <button
          onClick={onExit}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200"
        >
          Quitter
        </button>
      </div>
    </div>
  );
};

export default GeneratingStage;
