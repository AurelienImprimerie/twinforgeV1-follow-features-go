import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { usePerformanceMode } from '@/system/context/PerformanceModeContext';

interface NutritionAction {
  id: string;
  label: string;
  icon: string;
  xp: number;
  route: string;
  description: string;
  color: string;
  glowColor: string;
}

const NUTRITION_ACTIONS: NutritionAction[] = [
  {
    id: 'fridge-scan',
    label: 'Scanner mon Frigo',
    icon: 'Refrigerator',
    xp: 15,
    route: '/fridge',
    description: 'Inventaire automatique',
    color: '#10B981',
    glowColor: '#059669'
  },
  {
    id: 'recipe-generation',
    label: 'Créer une Recette',
    icon: 'ChefHat',
    xp: 40,
    route: '/fridge',
    description: 'Cuisine optimisée',
    color: '#10B981',
    glowColor: '#059669'
  },
  {
    id: 'meal-plan',
    label: 'Plan Alimentaire',
    icon: 'ClipboardList',
    xp: 50,
    route: '/meals',
    description: 'Planification hebdo',
    color: '#10B981',
    glowColor: '#059669'
  },
  {
    id: 'shopping-list',
    label: 'Liste de Courses',
    icon: 'ShoppingCart',
    xp: 40,
    route: '/meals',
    description: 'Smart shopping',
    color: '#10B981',
    glowColor: '#059669'
  }
];

export default function NutritionActionsWidget() {
  const navigate = useNavigate();
  const { performanceMode } = usePerformanceMode();

  const handleActionClick = (action: NutritionAction) => {
    navigate(action.route);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="px-2">
        <h3 className="text-xl font-bold text-white">Forges Culinaires</h3>
        <p className="text-sm text-white/60">Optimise ton alimentation avec le système intelligent</p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {NUTRITION_ACTIONS.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="glass-card p-5 rounded-xl relative overflow-hidden group text-left"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
                rgba(255, 255, 255, 0.03)
              `,
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              border: `1px solid ${action.color}20`,
              boxShadow: `
                0 2px 8px ${action.color}15,
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated glow */}
            {performanceMode === 'premium' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/5"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-start gap-4">
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                style={{
                  background: `linear-gradient(135deg, ${action.color}30, ${action.color}20)`,
                  border: `1px solid ${action.color}40`,
                  boxShadow: `0 0 12px ${action.color}30`
                }}
              >
                {performanceMode !== 'low' && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${action.color}20, transparent)`,
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                <SpatialIcon
                  name={action.icon as any}
                  size={28}
                  color={action.color}
                  glowColor={action.glowColor}
                  variant="pure"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white">{action.label}</h4>
                  <div
                    className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: `${action.color}20`,
                      color: action.color,
                      border: `1px solid ${action.color}30`
                    }}
                  >
                    +{action.xp} points
                  </div>
                </div>
                <p className="text-xs text-white/70">{action.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
