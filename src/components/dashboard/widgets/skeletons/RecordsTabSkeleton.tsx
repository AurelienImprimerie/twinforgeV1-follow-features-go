/**
 * RecordsTabSkeleton - Skeleton pour l'onglet Records
 * Couleur thématique: Rose (#EC4899)
 * Reproduit la structure de RecordsWidgetSimplified avec ses 3 sections
 */

import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

export default function RecordsTabSkeleton() {
  const { performanceMode } = usePerformanceMode();
  const shouldAnimate = performanceMode !== 'high-performance';

  return (
    <div className="space-y-6">
      {/* Records Widget Skeleton */}
      <div
        className="glass-card-premium p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(244, 114, 182, 0.25) 0%, transparent 50%),
            rgba(236, 72, 153, 0.05)
          `,
          backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          border: '2px solid rgba(236, 72, 153, 0.4)',
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

        <div className="relative z-10 space-y-6">
          {/* Header avec date */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-pink-500/50 animate-pulse" />
              <div className="h-3 w-32 bg-white/10 rounded-lg animate-pulse" />
            </div>

            {/* Widget Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-pink-500/20 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-4 w-40 bg-white/10 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-8 w-28 bg-white/10 rounded-lg animate-pulse ml-auto" />
                <div className="h-3 w-20 bg-white/10 rounded-lg animate-pulse ml-auto" />
              </div>
            </div>
          </div>

          {/* Section Tabs Skeleton - 3 onglets */}
          <div className="flex gap-2 p-1 rounded-xl bg-white/5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex-1 h-10 rounded-lg bg-white/10 animate-pulse"
              />
            ))}
          </div>

          {/* Info Banner */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/30">
            <div className="w-4 h-4 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-2/3 bg-white/10 rounded-lg animate-pulse" />
          </div>

          {/* Records List */}
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="glass-card rounded-xl p-4 space-y-3"
                style={{
                  background: 'rgba(236, 72, 153, 0.05)',
                  border: '1px solid rgba(236, 72, 153, 0.2)'
                }}
              >
                {/* Discipline Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-white/10 rounded-lg animate-pulse" />
                      <div className="h-3 w-24 bg-white/10 rounded-lg animate-pulse" />
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded bg-white/10 animate-pulse" />
                </div>

                {/* Record Cards */}
                <div className="space-y-2 pl-11">
                  {[1, 2].map(j => (
                    <div
                      key={j}
                      className="glass-card rounded-lg p-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-40 bg-white/10 rounded-lg animate-pulse" />
                          <div className="h-3 w-24 bg-white/10 rounded-lg animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-16 bg-white/10 rounded-lg animate-pulse" />
                          <div className="w-8 h-8 rounded-lg bg-pink-500/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Actions Widgets Skeletons */}
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div
            key={i}
            className="glass-card rounded-2xl p-5 space-y-3"
            style={{
              background: 'rgba(236, 72, 153, 0.05)',
              backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
              border: '1px solid rgba(236, 72, 153, 0.2)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-white/10 rounded-lg animate-pulse" />
              <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
            </div>
            <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
