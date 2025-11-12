/**
 * SuiviTabSkeleton - Skeleton pour l'onglet Suivi
 * Couleur thématique: Rouge-orangé (#F97316)
 * Reproduit la structure de CalorieBalanceWidgetV3
 */

import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

export default function SuiviTabSkeleton() {
  const { performanceMode } = usePerformanceMode();
  const shouldAnimate = performanceMode !== 'high-performance';

  return (
    <div className="space-y-6">
      {/* Calorie Balance Widget Skeleton */}
      <div
        className="glass-card-premium p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(251, 146, 60, 0.25) 0%, transparent 50%),
            rgba(249, 115, 22, 0.05)
          `,
          backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          border: '2px solid rgba(249, 115, 22, 0.4)',
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
              <div className="w-2 h-2 rounded-full bg-orange-500/50 animate-pulse" />
              <div className="h-3 w-32 bg-white/10 rounded-lg animate-pulse" />
            </div>

            {/* Widget Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-4 w-36 bg-white/10 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse ml-auto" />
                <div className="h-3 w-20 bg-white/10 rounded-lg animate-pulse ml-auto" />
              </div>
            </div>
          </div>

          {/* Circular Progress Skeleton */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Cercle principal */}
              <div className="w-48 h-48 rounded-full border-8 border-white/10 animate-pulse" />
              {/* Contenu central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-4 w-16 bg-white/10 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Action Recommendee Skeleton */}
          <div className="glass-card rounded-xl p-4 space-y-2">
            <div className="h-4 w-3/4 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-3 w-1/2 bg-white/10 rounded-lg animate-pulse" />
          </div>

          {/* Actions Panel Header */}
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <div className="h-5 w-32 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-3 w-40 bg-white/10 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-orange-500/20 animate-pulse" />
              <div className="h-7 w-12 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Actions Grid - 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="glass-card p-4 rounded-xl space-y-3"
                style={{
                  background: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.3)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-28 bg-white/10 rounded-lg animate-pulse" />
                      <div className="h-5 w-12 bg-white/10 rounded-full animate-pulse" />
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Panel Skeleton */}
      <div
        className="glass-card rounded-3xl p-6 space-y-4"
        style={{
          background: 'rgba(249, 115, 22, 0.05)',
          backdropFilter: performanceMode === 'high-performance' ? 'none' : 'blur(20px) saturate(150%)',
          border: '1px solid rgba(249, 115, 22, 0.3)'
        }}
      >
        <div className="h-5 w-40 bg-white/10 rounded-lg animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-6 w-16 bg-white/10 rounded-lg animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-white/10 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
