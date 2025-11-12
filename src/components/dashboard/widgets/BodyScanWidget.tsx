import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

export default function BodyScanWidget() {
  const navigate = useNavigate();
  const { performanceMode } = usePerformanceMode();

  const handleClick = () => {
    navigate('/body-scan');
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="px-2">
        <h3 className="text-xl font-bold text-white">Forge Corporelle 3D</h3>
        <p className="text-sm text-white/60">Crée ton jumeau numérique et suis ta transformation morphologique</p>
      </div>

      <motion.button
      onClick={handleClick}
      className="w-full glass-card-premium p-6 sm:p-8 rounded-3xl relative overflow-hidden group"
      style={{
        background: `
          radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 70% 70%, rgba(147, 51, 234, 0.25) 0%, transparent 50%),
          rgba(168, 85, 247, 0.05)
        `,
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        border: '2px solid rgba(168, 85, 247, 0.4)',
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.15)
        `
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Animated Background Glow */}
      {performanceMode === 'premium' && (
        <>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-purple-500/10"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </>
      )}

      {/* Content Layout - Mobile First */}
      <div className="relative space-y-4">
        {/* Icon at Top - Centered */}
        <div className="flex justify-center sm:justify-start">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500/30 to-violet-500/30 flex items-center justify-center border-2 border-purple-500/40">
            <SpatialIcon
              name="Scan"
              size={32}
              color="#A855F7"
              glowColor="#9333EA"
              variant="pure"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center sm:text-left space-y-3">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Scan Corporel 3D
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-white/80">
              Avatar morphologique • Twin numérique 3D • Analyse composition corporelle
            </p>
          </div>

          {/* Features Grid */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-semibold text-purple-400">Précision AI</span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <SpatialIcon name="Camera" size={12} color="#A855F7" />
              <span className="text-xs text-purple-400">2 Photos</span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <SpatialIcon name="Box" size={12} color="#C084FC" />
              <span className="text-xs text-violet-300">Modèle 3D</span>
            </div>
          </div>
        </div>

        {/* Arrow - Hidden on Small Mobile */}
        <div className="hidden sm:flex justify-end">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center border border-purple-500/30">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <SpatialIcon name="ScanLine" size={24} color="#A855F7" glowColor="#9333EA" variant="pure" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.button>
    </div>
  );
}
