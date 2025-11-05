import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { usePerformanceMode } from '../../../../../../system/context/PerformanceModeContext';

interface PlanFilterSystemProps {
  searchFilter: string;
  setSearchFilter: (filter: string) => void;
  minDays?: number;
  setMinDays?: (days: number | undefined) => void;
  maxDays?: number;
  setMaxDays?: (days: number | undefined) => void;
  minCalories?: number;
  setMinCalories?: (calories: number | undefined) => void;
  maxCalories?: number;
  setMaxCalories?: (calories: number | undefined) => void;
  plansCount: number;
  totalPlansCount: number;
}

const PlanFilterSystem: React.FC<PlanFilterSystemProps> = ({
  searchFilter,
  setSearchFilter,
  minDays,
  setMinDays,
  maxDays,
  setMaxDays,
  minCalories,
  setMinCalories,
  maxCalories,
  setMaxCalories,
  plansCount,
  totalPlansCount
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { isPerformanceMode } = usePerformanceMode();
  const MotionDiv = isPerformanceMode ? 'div' : motion.div;

  const clearAllFilters = () => {
    setSearchFilter('');
    setMinDays?.(undefined);
    setMaxDays?.(undefined);
    setMinCalories?.(undefined);
    setMaxCalories?.(undefined);
  };

  const hasActiveFilters = searchFilter.length > 0 ||
                          minDays !== undefined || maxDays !== undefined ||
                          minCalories !== undefined || maxCalories !== undefined;

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  return (
    <GlassCard
      className="p-4 space-y-6"
      style={isPerformanceMode ? {
        background: 'linear-gradient(145deg, color-mix(in srgb, #8B5CF6 20%, #1e293b), color-mix(in srgb, #8B5CF6 10%, #0f172a))',
        borderColor: 'color-mix(in srgb, #8B5CF6 40%, transparent)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      } : {
        background: `
          radial-gradient(circle at 30% 20%, color-mix(in srgb, #8B5CF6 12%, transparent) 0%, transparent 60%),
          radial-gradient(circle at 70% 80%, color-mix(in srgb, #A855F7 8%, transparent) 0%, transparent 50%),
          rgba(255, 255, 255, 0.05)
        `,
        borderColor: 'color-mix(in srgb, #8B5CF6 25%, transparent)',
        boxShadow: `
          0 12px 40px rgba(0, 0, 0, 0.25),
          0 0 30px color-mix(in srgb, #8B5CF6 15%, transparent),
          0 0 60px color-mix(in srgb, #A855F7 10%, transparent),
          inset 0 2px 0 rgba(255, 255, 255, 0.15)
        `
      }}
    >
      {/* En-tête du Filtre */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center breathing-icon"
            style={isPerformanceMode ? {
              background: 'linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, #1e293b), color-mix(in srgb, #8B5CF6 25%, #0f172a))',
              border: '2px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)'
            } : {
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #8B5CF6 35%, transparent), color-mix(in srgb, #8B5CF6 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #8B5CF6 50%, transparent)',
              boxShadow: '0 0 30px color-mix(in srgb, #8B5CF6 40%, transparent)'
            }}
          >
            <SpatialIcon
              Icon={ICONS.Filter}
              size={20}
              style={{ color: '#8B5CF6' }}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Filtrer les Plans
            </h2>
            <p className="text-white/60 text-sm">
              Affiner votre recherche
            </p>
          </div>
        </div>

        {/* Badge de comptage */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-400/20 text-purple-400 text-sm font-semibold rounded-full">
            {plansCount}
          </span>
          <button
            onClick={toggleAdvancedFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              background: 'color-mix(in srgb, #8B5CF6 15%, transparent)',
              border: '1px solid color-mix(in srgb, #8B5CF6 30%, transparent)',
              color: 'color-mix(in srgb, #8B5CF6 80%, white)'
            }}
          >
            <SpatialIcon
              Icon={ICONS.Settings}
              size={16}
            />
            <span className="text-sm font-medium">Filtres avancés</span>
            <SpatialIcon
              Icon={showAdvancedFilters ? ICONS.ChevronUp : ICONS.ChevronDown}
              size={16}
            />
          </button>
        </div>
      </div>

      {/* Panneau de Filtres Avancés */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <MotionDiv
            {...(!isPerformanceMode && {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: 'auto' },
              exit: { opacity: 0, height: 0 },
              transition: { duration: 0.3 }
            })}
            className="space-y-4 overflow-hidden"
          >
            {/* Barre de recherche */}
            <div className="relative">
              <label htmlFor="search-filter" className="block text-sm font-medium text-white/80 mb-2">
                Recherche rapide
              </label>
              <input
                id="search-filter"
                type="text"
                placeholder="Rechercher un plan..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>

            {/* Filtres Numériques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Nombre de Jours Min */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Jours minimum
                </label>
                <input
                  type="number"
                  placeholder="Ex: 3"
                  value={minDays || ''}
                  onChange={(e) => setMinDays?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>

              {/* Nombre de Jours Max */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Jours maximum
                </label>
                <input
                  type="number"
                  placeholder="Ex: 7"
                  value={maxDays || ''}
                  onChange={(e) => setMaxDays?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>

              {/* Calories Min */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Calories min/jour
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1500"
                  value={minCalories || ''}
                  onChange={(e) => setMinCalories?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  min="500"
                  max="5000"
                  step="100"
                />
              </div>

              {/* Calories Max */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Calories max/jour
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2500"
                  value={maxCalories || ''}
                  onChange={(e) => setMaxCalories?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  min="500"
                  max="5000"
                  step="100"
                />
              </div>
            </div>

            {/* Bouton Clear */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                >
                  <SpatialIcon Icon={ICONS.X} size={14} />
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between text-sm text-white/60 mt-6 pt-2 border-t border-white/10">
        <span>
          {plansCount} plan{plansCount > 1 ? 's' : ''} {
            plansCount !== totalPlansCount ? `sur ${totalPlansCount}` : ''
          }
        </span>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <SpatialIcon
              Icon={ICONS.Filter}
              size={14}
              className="text-purple-400"
            />
            <span className="text-purple-400">
              Filtres actifs
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default PlanFilterSystem;
