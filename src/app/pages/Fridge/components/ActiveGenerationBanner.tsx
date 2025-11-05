import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useFeedback } from '../../../../hooks/useFeedback';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActiveGenerationBannerProps {
  currentStep: 'validation' | 'recipe_details_generating' | 'recipe_details_validation';
  sessionId: string;
  updatedAt: string;
}

const STEP_LABELS = {
  validation: 'Validation des plans alimentaires',
  recipe_details_generating: 'Génération des recettes détaillées',
  recipe_details_validation: 'Validation des recettes détaillées'
};

const STEP_ICONS = {
  validation: ICONS.CheckCircle,
  recipe_details_generating: ICONS.Loader,
  recipe_details_validation: ICONS.Chef
};

const ActiveGenerationBanner: React.FC<ActiveGenerationBannerProps> = ({
  currentStep,
  sessionId,
  updatedAt
}) => {
  const navigate = useNavigate();
  const { click } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();

  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const handleResume = () => {
    click();
    navigate('/meal-plan-generation');
  };

  const timeAgo = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: true,
    locale: fr
  });

  const isGenerating = currentStep === 'recipe_details_generating';

  return (
    <GlassCard
      className="relative overflow-hidden p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #10B981 18%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #059669 15%, transparent) 0%, transparent 50%),
          linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08)),
          rgba(11, 14, 23, 0.85)
        `,
        borderColor: 'color-mix(in srgb, #10B981 40%, transparent)',
        boxShadow: `
          0 20px 60px rgba(0, 0, 0, 0.3),
          0 0 40px color-mix(in srgb, #10B981 25%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.2)
        `,
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)'
      }}
    >
      <div className="flex items-start gap-4">
        <MotionDiv
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
              linear-gradient(135deg, color-mix(in srgb, #10B981 35%, transparent), color-mix(in srgb, #059669 30%, transparent))
            `,
            border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
            boxShadow: `
              0 0 20px color-mix(in srgb, #10B981 35%, transparent),
              inset 0 2px 0 rgba(255,255,255,0.3)
            `
          }}
          {...(!isPerformanceMode && isGenerating && {
            animate: { rotate: [0, 360] },
            transition: { duration: 2, repeat: Infinity, ease: 'linear' }
          })}
        >
          <SpatialIcon
            Icon={STEP_ICONS[currentStep]}
            size={32}
            color="rgba(255, 255, 255, 0.95)"
            variant="pure"
          />
        </MotionDiv>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Génération en Cours
              </h3>
              <p className="text-white/70 text-sm">
                {STEP_LABELS[currentStep]}
              </p>
            </div>

            <div
              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
              style={{
                background: isGenerating
                  ? 'color-mix(in srgb, #10B981 25%, transparent)'
                  : 'color-mix(in srgb, #3B82F6 25%, transparent)',
                border: isGenerating
                  ? '1px solid color-mix(in srgb, #10B981 40%, transparent)'
                  : '1px solid color-mix(in srgb, #3B82F6 40%, transparent)',
                color: isGenerating ? '#10B981' : '#3B82F6'
              }}
            >
              {isGenerating ? 'En cours' : 'En attente'}
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
            <SpatialIcon Icon={ICONS.Clock} size={14} />
            <span>Dernière activité {timeAgo}</span>
          </div>

          <button
            onClick={handleResume}
            className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 group"
            style={{
              background: `
                linear-gradient(135deg,
                  color-mix(in srgb, #10B981 75%, transparent),
                  color-mix(in srgb, #059669 60%, transparent)
                )
              `,
              border: '2px solid color-mix(in srgb, #10B981 50%, transparent)',
              boxShadow: `
                0 10px 30px color-mix(in srgb, #10B981 35%, transparent),
                inset 0 2px 0 rgba(255,255,255,0.4)
              `,
              color: 'white'
            }}
            onMouseEnter={(e) => {
              if (!isPerformanceMode && window.matchMedia('(hover: hover)').matches) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `
                  0 14px 40px color-mix(in srgb, #10B981 45%, transparent),
                  inset 0 2px 0 rgba(255,255,255,0.5)
                `;
              }
            }}
            onMouseLeave={(e) => {
              if (!isPerformanceMode && window.matchMedia('(hover: hover)').matches) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `
                  0 10px 30px color-mix(in srgb, #10B981 35%, transparent),
                  inset 0 2px 0 rgba(255,255,255,0.4)
                `;
              }
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <SpatialIcon Icon={ICONS.Play} size={18} color="white" variant="pure" />
              <span>Reprendre la Génération</span>
            </div>
          </button>
        </div>
      </div>

      {isGenerating && !isPerformanceMode && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600"
          style={{
            width: '100%',
            opacity: 0.6
          }}
          animate={{
            scaleX: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </GlassCard>
  );
};

export default ActiveGenerationBanner;
