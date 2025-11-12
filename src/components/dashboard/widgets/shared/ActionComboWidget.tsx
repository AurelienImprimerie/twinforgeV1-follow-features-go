/**
 * ActionComboWidget - Affiche les combos d'actions quotidiennes
 *
 * Récompense visuellement les utilisateurs qui complètent plusieurs actions
 * dans la même journée avec des badges et animations célébrant leur engagement.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { useActionCombo } from '@/hooks/coeur/useDailyActionsTracking';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';
import { ConditionalMotion } from '@/lib/motion';

interface ComboConfig {
  id: string;
  name: string;
  description: string;
  actionIds: string[];
  icon: string;
  color: string;
  glowColor: string;
  reward: string;
}

const COMBO_CONFIGS: ComboConfig[] = [
  {
    id: 'nutrition-warrior',
    name: 'Nutrition Warrior',
    description: 'Scanne 3 repas dans la journée',
    actionIds: ['meal-scan', 'meal-scan', 'meal-scan'],
    icon: 'Trophy',
    color: '#F59E0B',
    glowColor: '#FBBF24',
    reward: 'Badge Or Nutrition'
  },
  {
    id: 'daily-complete',
    name: 'Perfect Day',
    description: 'Complète toutes les actions quotidiennes',
    actionIds: ['meal-scan', 'activity-log', 'fasting-log'],
    icon: 'Crown',
    color: '#EC4899',
    glowColor: '#DB2777',
    reward: 'Badge Jour Parfait'
  },
  {
    id: 'active-tracker',
    name: 'Active Tracker',
    description: 'Logge 2 activités ou plus',
    actionIds: ['activity-log', 'activity-log'],
    icon: 'Flame',
    color: '#F97316',
    glowColor: '#FB923C',
    reward: 'Badge Actif'
  }
];

interface ActionComboWidgetProps {
  className?: string;
}

export default function ActionComboWidget({ className = '' }: ActionComboWidgetProps) {
  const { performanceMode } = usePerformanceMode();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="px-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <SpatialIcon name="Zap" size={24} color="#FBBF24" glowColor="#F59E0B" />
          Combos du Jour
        </h3>
        <p className="text-sm text-white/60 mt-1">
          Débloque des badges en complétant plusieurs actions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {COMBO_CONFIGS.map((combo, index) => (
          <ComboCard
            key={combo.id}
            combo={combo}
            index={index}
            performanceMode={performanceMode}
          />
        ))}
      </div>
    </div>
  );
}

interface ComboCardProps {
  combo: ComboConfig;
  index: number;
  performanceMode: string;
}

function ComboCard({ combo, index, performanceMode }: ComboCardProps) {
  const { data: comboStatus } = useActionCombo(combo.actionIds);

  const isAchieved = comboStatus?.combo_achieved || false;
  const progress = comboStatus
    ? (comboStatus.actions_completed / comboStatus.actions_required) * 100
    : 0;

  return (
    <ConditionalMotion
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div
        className="glass-card p-4 rounded-xl relative overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, ${combo.color}${isAchieved ? '30' : '15'} 0%, ${combo.color}${isAchieved ? '20' : '08'} 50%, rgba(0, 0, 0, 0.3) 100%),
            radial-gradient(circle at 30% 30%, ${combo.color}12 0%, transparent 50%),
            rgba(255, 255, 255, 0.03)
          `,
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          border: `1px solid ${combo.color}${isAchieved ? '60' : '30'}`,
          boxShadow: isAchieved
            ? `0 4px 20px ${combo.color}40, 0 0 40px ${combo.color}20`
            : `0 2px 12px ${combo.color}20`
        }}
      >
        {/* Animated background for achieved combos */}
        <AnimatePresence>
          {isAchieved && performanceMode === 'premium' && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, transparent, ${combo.color}15, transparent)`
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center gap-4">
          {/* Icon with achievement indicator */}
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${combo.color}40, ${combo.color}25)`,
                border: `2px solid ${combo.color}${isAchieved ? '60' : '40'}`,
                boxShadow: isAchieved
                  ? `0 0 20px ${combo.color}40`
                  : `0 0 12px ${combo.color}25`
              }}
            >
              {performanceMode !== 'low' && isAchieved && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(circle, ${combo.color}30, transparent)`
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}
              <SpatialIcon
                name={combo.icon as any}
                size={28}
                color={combo.color}
                glowColor={combo.glowColor}
                variant="pure"
              />
            </div>

            {/* Achievement badge */}
            {isAchieved && (
              <motion.div
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white/30"
                style={{
                  background: `linear-gradient(135deg, ${combo.color}, ${combo.glowColor})`
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15
                }}
              >
                <SpatialIcon name="Check" size={16} color="white" />
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm">{combo.name}</h4>
                <p className="text-xs text-white/60 mt-0.5">{combo.description}</p>
              </div>

              {/* Status indicator */}
              {isAchieved ? (
                <motion.div
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `${combo.color}25`,
                    color: combo.color,
                    border: `1px solid ${combo.color}40`
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  Débloqué !
                </motion.div>
              ) : (
                <div
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `${combo.color}15`,
                    color: combo.color,
                    border: `1px solid ${combo.color}25`
                  }}
                >
                  {comboStatus?.actions_completed || 0}/{comboStatus?.actions_required || combo.actionIds.length}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{
                background: `${combo.color}15`,
                border: `1px solid ${combo.color}20`
              }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${combo.color}, ${combo.glowColor})`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Reward */}
            {isAchieved && (
              <motion.div
                className="mt-2 flex items-center gap-1.5"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SpatialIcon name="Gift" size={12} color={combo.color} />
                <span className="text-xs font-semibold" style={{ color: combo.color }}>
                  {combo.reward}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ConditionalMotion>
  );
}
