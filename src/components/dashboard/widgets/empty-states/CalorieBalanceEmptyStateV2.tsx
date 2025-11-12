/**
 * CalorieBalanceEmptyState V2
 * Empty state simplifié avec focus sur l'action immédiate
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserBiometrics } from '@/hooks/useUserBiometrics';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import SpatialIcon from '@/ui/icons/SpatialIcon';

export default function CalorieBalanceEmptyStateV2() {
  const navigate = useNavigate();
  const { data: biometrics } = useUserBiometrics();
  const { performanceMode } = usePerformanceMode();

  const getObjectiveMessage = () => {
    if (!biometrics?.objective) return "Suis ton équilibre énergétique quotidien";

    switch (biometrics.objective) {
      case 'fat_loss':
        return "Crée ton premier déficit calorique aujourd'hui";
      case 'muscle_gain':
        return "Commence à nourrir ta croissance musculaire";
      case 'recomp':
        return "Démarre ta recomposition corporelle";
      default:
        return "Suis ton équilibre énergétique quotidien";
    }
  };

  const getMainCTAConfig = () => {
    if (!biometrics?.objective || biometrics.objective === 'fat_loss') {
      return {
        icon: 'UtensilsCrossed',
        label: 'Scanner mon premier repas',
        subtitle: 'Découvre tes macros instantanément',
        route: '/fridge',
        xp: 10,
        color: '#EC4899',
        glowColor: '#F472B6',
      };
    }

    return {
      icon: 'UtensilsCrossed',
      label: 'Scanner mon premier repas',
      subtitle: 'Track tes calories pour atteindre ton surplus',
      route: '/fridge',
      xp: 10,
      color: '#3B82F6',
      glowColor: '#60A5FA',
    };
  };

  const cta = getMainCTAConfig();

  return (
    <motion.div
      className="glass-card-premium p-8 rounded-3xl space-y-8 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {performanceMode === 'premium' && (
        <div
          className="absolute top-0 right-0 w-96 h-96 blur-3xl pointer-events-none opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${cta.color}, transparent)`,
          }}
        />
      )}

      {/* Hero Section */}
      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center mb-6">
          <motion.div
            className="w-24 h-24 rounded-3xl flex items-center justify-center backdrop-blur-sm relative"
            style={{
              background: `linear-gradient(135deg, ${cta.color}40, ${cta.color}25)`,
              border: `2px solid ${cta.color}50`,
              boxShadow: `0 0 40px ${cta.glowColor}60`,
            }}
            animate={
              performanceMode !== 'low'
                ? {
                    scale: [1, 1.05, 1],
                    rotate: [0, 3, -3, 0],
                  }
                : {}
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <SpatialIcon name="Flame" size={48} color={cta.color} glowColor={cta.glowColor} variant="pure" />
            {performanceMode !== 'low' && (
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `radial-gradient(circle at center, ${cta.glowColor}40, transparent)`,
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        </div>

        <h2 className="text-3xl font-black text-white">{getObjectiveMessage()}</h2>
        <p className="text-lg text-white/70 max-w-xl mx-auto">
          Track chaque calorie pour atteindre ton objectif avec précision
        </p>
      </div>

      {/* Key Metrics */}
      {biometrics && (
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            className="glass-card-premium rounded-2xl p-5 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SpatialIcon name="Scale" size={24} color="#A78BFA" className="mx-auto mb-2" />
            <p className="text-xs text-white/60 mb-1">Poids Actuel</p>
            <p className="text-2xl font-black text-white">{biometrics.weight} kg</p>
            {biometrics.targetWeight && (
              <p className="text-xs text-purple-400 mt-1">→ {biometrics.targetWeight} kg</p>
            )}
          </motion.div>

          <motion.div
            className="glass-card-premium rounded-2xl p-5 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SpatialIcon name="Flame" size={24} color="#FB923C" className="mx-auto mb-2" />
            <p className="text-xs text-white/60 mb-1">Métabolisme</p>
            <p className="text-2xl font-black text-white">{biometrics.bmr}</p>
            <p className="text-xs text-orange-400 mt-1">kcal/jour</p>
          </motion.div>

          <motion.div
            className="glass-card-premium rounded-2xl p-5 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SpatialIcon name="Target" size={24} color="#10B981" className="mx-auto mb-2" />
            <p className="text-xs text-white/60 mb-1">Objectif</p>
            <p className="text-2xl font-black text-white">{biometrics.tdee}</p>
            <p className="text-xs text-green-400 mt-1">TDEE</p>
          </motion.div>
        </div>
      )}

      {/* Main CTA - Emphasized */}
      <motion.button
        onClick={() => navigate(cta.route)}
        className="relative group w-full glass-card-premium rounded-3xl p-8 overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, ${cta.color}25 0%, transparent 60%),
            radial-gradient(circle at 70% 70%, ${cta.color}15 0%, transparent 65%),
            rgba(255, 255, 255, 0.05)
          `,
          border: `2px solid ${cta.color}40`,
          boxShadow: `0 8px 32px ${cta.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: performanceMode !== 'low' ? 1.02 : 1, y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        {performanceMode === 'premium' && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${cta.color}30 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl backdrop-blur-sm" style={{ background: `${cta.color}30`, border: `1px solid ${cta.color}50` }}>
          <span className="text-sm font-black" style={{ color: cta.color }}>
            +{cta.xp} points
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5">
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${cta.color}60, ${cta.color}40)`,
              boxShadow: `0 0 30px ${cta.glowColor}60, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
              border: `1px solid ${cta.color}70`,
            }}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <SpatialIcon
              name={cta.icon as any}
              size={40}
              color={cta.color}
              glowColor={cta.glowColor}
              variant="pure"
            />
          </motion.div>

          <div className="text-center">
            <h3 className="text-2xl font-black text-white mb-2">{cta.label}</h3>
            <p className="text-base text-white/70">{cta.subtitle}</p>
          </div>
        </div>
      </motion.button>

      {/* Secondary CTAs - Compact */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          onClick={() => navigate('/activity/input')}
          className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <SpatialIcon name="Activity" size={20} color="#3B82F6" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-bold text-white">Logger Activité</p>
              <p className="text-xs text-white/60">+20 points</p>
            </div>
          </div>
        </motion.button>

        {biometrics?.objective === 'fat_loss' && (
          <motion.button
            onClick={() => navigate('/fasting/input')}
            className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all group"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <SpatialIcon name="Timer" size={20} color="#F59E0B" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-white">Lancer Jeûne</p>
                <p className="text-xs text-white/60">+25-50 points</p>
              </div>
            </div>
          </motion.button>
        )}

        {biometrics?.objective === 'muscle_gain' && (
          <motion.button
            onClick={() => navigate('/meals')}
            className="glass-card rounded-xl p-4 hover:bg-white/10 transition-all group"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                <SpatialIcon name="ClipboardList" size={20} color="#10B981" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-white">Plan Alimentaire</p>
                <p className="text-xs text-white/60">+50 points</p>
              </div>
            </div>
          </motion.button>
        )}
      </div>

      {/* Info card */}
      <motion.div
        className="glass-card-premium rounded-2xl p-4 text-center"
        style={{
          background: `linear-gradient(135deg, ${cta.color}10, transparent)`,
          border: `1px solid ${cta.color}20`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm text-white/80">
          Commence dès maintenant et débloquer des{' '}
          <span className="font-bold" style={{ color: cta.color }}>
            métriques avancées
          </span>
          , des{' '}
          <span className="font-bold" style={{ color: cta.color }}>
            prédictions IA
          </span>{' '}
          et un{' '}
          <span className="font-bold" style={{ color: cta.color }}>
            système de streaks
          </span>
          !
        </p>
      </motion.div>
    </motion.div>
  );
}
