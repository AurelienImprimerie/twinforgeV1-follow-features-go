/**
 * ClassementTabSkeleton - Skeleton pour l'onglet Classement
 * Couleur thématique: Violette (#8B5CF6)
 * Reproduit la structure de LeaderboardWidgetSimplified
 */

import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

export default function ClassementTabSkeleton() {
  const { performanceMode } = usePerformanceMode();
  const shouldAnimate = performanceMode !== 'high-performance';

  return (
    <div className="space-y-6">
      {/* Leaderboard Widget Skeleton */}
      <div
        className="glass-card-premium p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.25) 0%, transparent 50%),
            rgba(139, 92, 246, 0.05)
          `,
          backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          border: '2px solid rgba(139, 92, 246, 0.4)',
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
              <div className="w-2 h-2 rounded-full bg-violet-500/50 animate-pulse" />
              <div className="h-3 w-32 bg-white/10 rounded-lg animate-pulse" />
            </div>

            {/* Widget Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/20 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-4 w-56 bg-white/10 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse ml-auto" />
                <div className="h-3 w-12 bg-white/10 rounded-lg animate-pulse ml-auto" />
              </div>
            </div>
          </div>

          {/* Quick Stats - Position */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-3 w-32 bg-white/10 rounded-lg animate-pulse ml-auto" />
                <div className="h-8 w-20 bg-white/10 rounded-lg animate-pulse ml-auto" />
              </div>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => {
              // Podium (top 3) avec style spécial
              const isPodium = i <= 3;

              return (
                <div
                  key={i}
                  className="glass-card rounded-xl p-4"
                  style={{
                    background: isPodium
                      ? 'rgba(139, 92, 246, 0.15)'
                      : 'rgba(139, 92, 246, 0.05)',
                    border: `1px solid ${isPodium ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.2)'}`,
                    boxShadow: isPodium ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Rank & User */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        {isPodium ? (
                          <div className="space-y-1">
                            <div className="w-8 h-8 rounded-full bg-violet-500/30 animate-pulse mx-auto" />
                            <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
                          </div>
                        ) : (
                          <div className="h-6 w-8 bg-white/10 rounded-lg animate-pulse" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-white/10 rounded-lg animate-pulse" />
                        <div className="h-3 w-20 bg-white/10 rounded-lg animate-pulse" />
                      </div>
                    </div>

                    {/* Right: Points */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right space-y-1">
                        <div className="h-6 w-20 bg-white/10 rounded-lg animate-pulse ml-auto" />
                        <div className="h-3 w-12 bg-white/10 rounded-lg animate-pulse ml-auto" />
                      </div>
                      <div className="w-6 h-6 rounded bg-violet-500/20 animate-pulse" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-12 bg-violet-500/20 rounded-xl animate-pulse" />
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
            </div>
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
              background: 'rgba(139, 92, 246, 0.05)',
              backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
              border: '1px solid rgba(139, 92, 246, 0.2)'
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
