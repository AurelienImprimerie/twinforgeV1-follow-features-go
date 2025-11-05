import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMode } from '../../../system/context/PerformanceModeContext';
import SpatialIcon from '../../icons/SpatialIcon';
import { ICONS } from '../../icons/registry';
import { useFeedback } from '../../../hooks/useFeedback';

interface ImprovedExitConfirmationModalProps {
  isOpen: boolean;
  currentStep: 'configuration' | 'generating' | 'validation' | 'recipe_details_generating' | 'recipe_details_validation';
  hasUnsavedProgress: boolean;
  onContinueInBackground: () => void;
  onStopAndReturn: () => void;
  onDiscardAndExit: () => void;
  onCancel: () => void;
}

const ImprovedExitConfirmationModal: React.FC<ImprovedExitConfirmationModalProps> = ({
  isOpen,
  currentStep,
  hasUnsavedProgress,
  onContinueInBackground,
  onStopAndReturn,
  onDiscardAndExit,
  onCancel
}) => {
  const { click } = useFeedback();
  const { isPerformanceMode } = usePerformanceMode();

  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const isGenerating = currentStep === 'generating' || currentStep === 'recipe_details_generating';
  const isValidating = currentStep === 'validation' || currentStep === 'recipe_details_validation';

  const options = [
    {
      id: 'background',
      icon: ICONS.Play,
      title: 'Continuer en arrière-plan',
      description: isGenerating
        ? 'La génération continuera pendant que vous naviguez ailleurs'
        : 'Vous pourrez revenir plus tard pour finaliser',
      color: '#10B981',
      action: onContinueInBackground,
      recommended: isGenerating
    },
    {
      id: 'stop',
      icon: ICONS.Pause,
      title: 'Arrêter et sauvegarder',
      description: 'Sauvegarde votre progression et retourne à l\'étape précédente',
      color: '#3B82F6',
      action: onStopAndReturn,
      recommended: isValidating
    },
    {
      id: 'discard',
      icon: ICONS.Trash2,
      title: 'Abandonner le plan',
      description: 'Supprime toute la progression et quitte définitivement',
      color: '#EF4444',
      action: onDiscardAndExit,
      recommended: false
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <MotionDiv
          className="absolute inset-0 bg-black/60"
          style={{ backdropFilter: 'blur(8px)' }}
          {...(!isPerformanceMode && {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
          })}
          onClick={onCancel}
        />

        <MotionDiv
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, color-mix(in srgb, #3B82F6 15%, transparent) 0%, transparent 60%),
              linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.10)),
              rgba(11, 14, 23, 0.95)
            `,
            border: '2px solid color-mix(in srgb, #3B82F6 30%, transparent)',
            boxShadow: `
              0 25px 80px rgba(0, 0, 0, 0.5),
              0 0 60px color-mix(in srgb, #3B82F6 20%, transparent),
              inset 0 2px 0 rgba(255, 255, 255, 0.2)
            `,
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)'
          }}
          {...(!isPerformanceMode && {
            initial: { opacity: 0, scale: 0.9, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 20 },
            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
          })}
        >
          <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                    linear-gradient(135deg, color-mix(in srgb, #3B82F6 40%, transparent), color-mix(in srgb, #2563EB 35%, transparent))
                  `,
                  border: '2px solid color-mix(in srgb, #3B82F6 50%, transparent)',
                  boxShadow: `
                    0 0 30px color-mix(in srgb, #3B82F6 35%, transparent),
                    inset 0 2px 0 rgba(255,255,255,0.3)
                  `
                }}
              >
                <SpatialIcon
                  Icon={ICONS.AlertTriangle}
                  size={32}
                  color="rgba(255, 255, 255, 0.95)"
                  variant="pure"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Quitter la Génération ?
                </h2>
                <p className="text-white/70 text-base">
                  {hasUnsavedProgress
                    ? 'Vous avez des plans non sauvegardés. Choisissez comment continuer :'
                    : 'Choisissez comment gérer votre progression :'}
                </p>
              </div>

              <button
                onClick={() => {
                  click();
                  onCancel();
                }}
                className="text-white/60 hover:text-white transition-colors p-2"
              >
                <SpatialIcon Icon={ICONS.X} size={24} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {options.map((option, index) => (
                <MotionDiv
                  key={option.id}
                  {...(!isPerformanceMode && {
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0 },
                    transition: { delay: index * 0.1 }
                  })}
                >
                  <button
                    onClick={() => {
                      click();
                      option.action();
                    }}
                    className="w-full p-5 rounded-xl transition-all duration-300 text-left relative overflow-hidden group"
                    style={{
                      background: `
                        radial-gradient(circle at 30% 30%, color-mix(in srgb, ${option.color} 12%, transparent) 0%, transparent 60%),
                        linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04)),
                        rgba(11, 14, 23, 0.5)
                      `,
                      border: `2px solid color-mix(in srgb, ${option.color} ${option.recommended ? '40' : '25'}%, transparent)`,
                      boxShadow: option.recommended
                        ? `0 8px 32px color-mix(in srgb, ${option.color} 20%, transparent), inset 0 1px 0 rgba(255,255,255,0.15)`
                        : `0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)`
                    }}
                    onMouseEnter={(e) => {
                      if (!isPerformanceMode && window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = `color-mix(in srgb, ${option.color} 60%, transparent)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPerformanceMode && window.matchMedia('(hover: hover)').matches) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = `color-mix(in srgb, ${option.color} ${option.recommended ? '40' : '25'}%, transparent)`;
                      }
                    }}
                  >
                    {option.recommended && (
                      <div
                        className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: `color-mix(in srgb, ${option.color} 25%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${option.color} 40%, transparent)`,
                          color: option.color
                        }}
                      >
                        Recommandé
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `color-mix(in srgb, ${option.color} 20%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${option.color} 35%, transparent)`
                        }}
                      >
                        <SpatialIcon
                          Icon={option.icon}
                          size={24}
                          style={{ color: option.color }}
                        />
                      </div>

                      <div className="flex-1 pt-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {option.title}
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </MotionDiv>
              ))}
            </div>

            <div
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className="flex items-start gap-3">
                <SpatialIcon
                  Icon={ICONS.Info}
                  size={18}
                  className="text-blue-400 mt-0.5"
                  style={{ filter: 'drop-shadow(0 0 6px #3B82F6)' }}
                />
                <div className="text-left">
                  <p className="text-white/70 text-sm">
                    {isGenerating
                      ? 'Si vous continuez en arrière-plan, vous recevrez une notification quand la génération sera terminée.'
                      : 'Votre progression sera sauvegardée et accessible depuis la page Plans.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </AnimatePresence>
  );
};

export default ImprovedExitConfirmationModal;
