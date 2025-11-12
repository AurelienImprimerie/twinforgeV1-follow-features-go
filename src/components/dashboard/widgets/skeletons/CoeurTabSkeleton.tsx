/**
 * CoeurTabSkeleton - Skeleton pour l'onglet Coeur (TwinGame)
 * Couleur thématique: Orange (#F7931E)
 * Reproduit la structure de GamingProgressWidgetV3 + stats + projections
 */

import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

export default function CoeurTabSkeleton() {
  const { performanceMode } = usePerformanceMode();
  const shouldAnimate = performanceMode !== 'high-performance';

  return (
    <div className="space-y-6">
      {/* Gaming Progress Widget Skeleton */}
      <div
        className="glass-card-premium p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(247, 147, 30, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(251, 191, 36, 0.25) 0%, transparent 50%),
            rgba(247, 147, 30, 0.05)
          `,
          backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          border: '2px solid rgba(247, 147, 30, 0.4)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* Shimmer overlay */}
        {shouldAnimate && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              zIndex: 1
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Header avec date */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-400/50 animate-pulse" />
            <div className="h-3 w-32 bg-white/10 rounded-lg animate-pulse" />
          </div>

          {/* Widget Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-400/20 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-white/10 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse ml-auto" />
              <div className="h-3 w-16 bg-white/10 rounded-lg animate-pulse ml-auto" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-4 w-20 bg-white/10 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500/30 to-amber-500/30"
                animate={shouldAnimate ? { width: ['0%', '60%', '0%'] } : {}}
                transition={shouldAnimate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
              />
            </div>
          </div>

          {/* Stats grid - 3 colonnes */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-xl p-4 space-y-3">
                <div className="h-3 w-20 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-7 w-16 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-3 w-24 bg-white/10 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Summary Stats Skeleton */}
      <div
        className="glass-card rounded-3xl p-6 space-y-4"
        style={{
          background: 'rgba(247, 147, 30, 0.05)',
          backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          border: '1px solid rgba(247, 147, 30, 0.3)'
        }}
      >
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-8 w-20 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-white/10 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Projection Skeleton */}
      <div
        className="glass-card rounded-3xl p-6 space-y-4"
        style={{
          background: 'rgba(247, 147, 30, 0.05)',
          backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          border: '1px solid rgba(247, 147, 30, 0.3)'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-4 w-40 bg-white/10 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
