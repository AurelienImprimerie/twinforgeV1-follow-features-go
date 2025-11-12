/**
 * EmptyGamificationState
 * État vide du widget de gamification avec encouragement et illustration
 */

import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import SpatialIcon from '@/ui/icons/SpatialIcon';

export default function EmptyGamificationState() {
  const { performanceMode } = usePerformanceMode();

  return (
    <motion.div
      className="glass-card-premium p-8 rounded-3xl space-y-6 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 30% 30%, rgba(247, 147, 30, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(251, 191, 36, 0.25) 0%, transparent 50%),
          rgba(247, 147, 30, 0.05)
        `,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        border: '2px solid rgba(247, 147, 30, 0.4)',
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.15)
        `
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {performanceMode === 'premium' && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </>
      )}

      {/* Header avec illustration */}
      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className="relative w-32 h-32 flex items-center justify-center"
            animate={
              performanceMode !== 'low'
                ? {
                    y: [0, -10, 0],
                  }
                : {}
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Cercles de fond */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 blur-xl"
              animate={
                performanceMode !== 'low'
                  ? {
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Icône principale */}
            <div
              className="relative w-24 h-24 rounded-3xl flex items-center justify-center backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.4), rgba(247, 147, 30, 0.2))',
                border: '2px solid rgba(247, 147, 30, 0.5)',
                boxShadow: '0 0 40px rgba(247, 147, 30, 0.4)',
              }}
            >
              <SpatialIcon name="Zap" size={48} color="#F7931E" glowColor="#FBBF24" variant="pure" />
            </div>

            {/* Étoiles flottantes */}
            {performanceMode !== 'low' && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${10 + i * 20}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: 'easeInOut',
                    }}
                  >
                    <SpatialIcon name="Sparkles" size={12} color="#F59E0B" />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        </div>

        <h3 className="text-2xl font-black text-white">Pas encore de données</h3>
        <p className="text-base text-white/70 max-w-md mx-auto">
          Commence à gagner des points pour débloquer tes prédictions de progression!
        </p>
      </div>

      {/* Stats nécessaires */}
      <div className="relative z-10 glass-card rounded-2xl p-5 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border border-orange-500/20">
        <div className="flex items-center gap-3 mb-4">
          <SpatialIcon name="Info" size={20} color="#F7931E" />
          <p className="text-sm font-semibold text-white">Pour débloquer les prédictions</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Actions quotidiennes complétées</span>
            <span className="text-white font-bold">0 / 3 jours</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" />
          </div>
          <p className="text-xs text-white/60 text-center">
            Complète au moins 3 jours d'activité pour voir tes prédictions
          </p>
        </div>
      </div>

      {/* Encouragement final */}
      <div className="relative z-10 text-center">
        <p className="text-sm text-white/80">
          Chaque action compte pour ta progression!{' '}
          <span className="font-bold text-orange-400">Level up</span> et débloque des récompenses.
        </p>
      </div>
    </motion.div>
  );
}
