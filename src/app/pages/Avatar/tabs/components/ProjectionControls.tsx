import React from 'react';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import type { NutritionQuality, SportIntensity, ProjectionDuration, ProjectionParams } from '../../../../../hooks/useProjectionCalculator';

interface ProjectionControlsProps {
  params: ProjectionParams;
  onParamsChange: (params: ProjectionParams) => void;
  warnings: string[];
  fatChange: number;
  muscleChange: number;
  projectionResult?: {
    estimatedBodyFatPercent?: number;
    estimatedWaistReductionCm?: number;
    estimatedLeanMassGainKg?: number;
    healthRiskReduction?: string;
    metabolicImprovementPercent?: number;
  };
}

const NUTRITION_LABELS: Record<NutritionQuality, { label: string; icon: keyof typeof ICONS; color: string }> = {
  1: { label: 'Très mauvaise', icon: 'XCircle', color: '#EF4444' },
  2: { label: 'Mauvaise', icon: 'AlertTriangle', color: '#F97316' },
  3: { label: 'Moyenne', icon: 'Minus', color: '#EAB308' },
  4: { label: 'Bonne', icon: 'CheckCircle', color: '#84CC16' },
  5: { label: 'Excellente', icon: 'Sparkles', color: '#10B981' },
};

const SPORT_LABELS: Record<SportIntensity, { label: string; icon: keyof typeof ICONS; color: string }> = {
  1: { label: 'Aucun', icon: 'XCircle', color: '#EF4444' },
  2: { label: 'Léger', icon: 'Activity', color: '#F97316' },
  3: { label: 'Modéré', icon: 'TrendingUp', color: '#EAB308' },
  4: { label: 'Intense', icon: 'Zap', color: '#84CC16' },
  5: { label: 'Très intense', icon: 'Flame', color: '#10B981' },
};

const DURATION_LABELS: Record<ProjectionDuration, { label: string; shortLabel: string }> = {
  '3_months': { label: '3 mois', shortLabel: '3M' },
  '6_months': { label: '6 mois', shortLabel: '6M' },
  '1_year': { label: '1 an', shortLabel: '1A' },
  '3_years': { label: '3 ans', shortLabel: '3A' },
};

const ProjectionControls: React.FC<ProjectionControlsProps> = ({
  params,
  onParamsChange,
  warnings,
  fatChange,
  muscleChange,
  projectionResult
}) => {
  const { click } = useFeedback();

  const handleNutritionChange = (value: NutritionQuality) => {
    click();
    onParamsChange({ ...params, nutritionQuality: value });
  };

  const handleSportChange = (value: SportIntensity) => {
    click();
    onParamsChange({ ...params, sportIntensity: value });
  };

  const handleDurationChange = (value: ProjectionDuration) => {
    click();
    onParamsChange({ ...params, duration: value });
  };

  const nutritionData = NUTRITION_LABELS[params.nutritionQuality];
  const sportData = SPORT_LABELS[params.sportIntensity];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(16,185,129,0.3) 0%, transparent 60%),
              linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.25))
            `,
            border: '2px solid rgba(16,185,129,0.4)',
            boxShadow: '0 0 20px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          <SpatialIcon Icon={ICONS.Settings} size={20} style={{ color: '#10B981' }} variant="pure" />
        </div>
        <h3 className="text-white font-semibold ml-3 text-lg">Paramètres de projection</h3>
      </div>

      <p className="text-white/70 text-sm mb-6 leading-relaxed">
        Ajustez vos habitudes nutritionnelles, votre intensité sportive et la durée de projection pour visualiser votre transformation corporelle future.
      </p>

      {/* Qualité Nutritionnelle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Utensils} size={18} className="text-emerald-400" />
            <span className="text-white font-medium">Qualité nutritionnelle</span>
          </div>
          <div
            className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${nutritionData.color}20, ${nutritionData.color}10)`,
              border: `1px solid ${nutritionData.color}40`,
              color: nutritionData.color
            }}
          >
            <SpatialIcon Icon={ICONS[nutritionData.icon]} size={14} />
            <span>{nutritionData.label}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as NutritionQuality[]).map((value) => {
            const isActive = params.nutritionQuality === value;
            const data = NUTRITION_LABELS[value];
            return (
              <button
                key={value}
                onClick={() => handleNutritionChange(value)}
                className="flex-1 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${data.color}30, ${data.color}20)`
                    : 'rgba(255,255,255,0.03)',
                  border: isActive ? `2px solid ${data.color}60` : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? `0 0 20px ${data.color}30` : 'none'
                }}
              >
                <SpatialIcon
                  Icon={ICONS[data.icon]}
                  size={20}
                  style={{ color: isActive ? data.color : 'rgba(255,255,255,0.4)' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensité Sportive */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SpatialIcon Icon={ICONS.Dumbbell} size={18} className="text-emerald-400" />
            <span className="text-white font-medium">Intensité sportive</span>
          </div>
          <div
            className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${sportData.color}20, ${sportData.color}10)`,
              border: `1px solid ${sportData.color}40`,
              color: sportData.color
            }}
          >
            <SpatialIcon Icon={ICONS[sportData.icon]} size={14} />
            <span>{sportData.label}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as SportIntensity[]).map((value) => {
            const isActive = params.sportIntensity === value;
            const data = SPORT_LABELS[value];
            return (
              <button
                key={value}
                onClick={() => handleSportChange(value)}
                className="flex-1 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${data.color}30, ${data.color}20)`
                    : 'rgba(255,255,255,0.03)',
                  border: isActive ? `2px solid ${data.color}60` : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? `0 0 20px ${data.color}30` : 'none'
                }}
              >
                <SpatialIcon
                  Icon={ICONS[data.icon]}
                  size={20}
                  style={{ color: isActive ? data.color : 'rgba(255,255,255,0.4)' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Durée de projection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SpatialIcon Icon={ICONS.Calendar} size={18} className="text-emerald-400" />
          <span className="text-white font-medium">Durée de projection</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Object.entries(DURATION_LABELS).map(([value, data]) => {
            const isActive = params.duration === value;
            return (
              <button
                key={value}
                onClick={() => handleDurationChange(value as ProjectionDuration)}
                className="py-3 rounded-xl transition-all duration-200"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))'
                    : 'rgba(255,255,255,0.03)',
                  border: isActive ? '2px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 20px rgba(16,185,129,0.3)' : 'none'
                }}
              >
                <div className="text-white font-semibold text-sm">{data.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Impact visuel */}
      <div
        className="p-4 rounded-xl space-y-3"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))',
          border: '1px solid rgba(16,185,129,0.2)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <SpatialIcon Icon={ICONS.TrendingUp} size={16} className="text-emerald-400" />
          <span className="text-white/90 font-medium text-sm">Impact projeté</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3 rounded-lg"
            style={{
              background: fatChange < 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: fatChange < 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <SpatialIcon Icon={ICONS.Triangle} size={14} style={{ color: fatChange < 0 ? '#10B981' : '#EF4444' }} />
              <span className="text-white/70 text-xs">Masse grasse</span>
            </div>
            <div className="text-white font-bold text-lg">
              {fatChange > 0 ? '+' : ''}{fatChange.toFixed(2)}
            </div>
          </div>

          <div
            className="p-3 rounded-lg"
            style={{
              background: muscleChange > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: muscleChange > 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <SpatialIcon Icon={ICONS.Zap} size={14} style={{ color: muscleChange > 0 ? '#10B981' : '#EF4444' }} />
              <span className="text-white/70 text-xs">Masse musculaire</span>
            </div>
            <div className="text-white font-bold text-lg">
              {muscleChange > 0 ? '+' : ''}{muscleChange.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Métriques motivantes */}
      {projectionResult && (
        <div className="space-y-3 mt-4">
          {projectionResult.estimatedBodyFatPercent !== undefined && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-400/20">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">% Graisse corporelle estimé</span>
                <span className="text-purple-300 font-bold text-lg">
                  {projectionResult.estimatedBodyFatPercent}%
                </span>
              </div>
            </div>
          )}

          {projectionResult.estimatedWaistReductionCm !== undefined && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">📏 Réduction tour de taille</span>
                <span className="text-emerald-300 font-bold text-lg">
                  -{projectionResult.estimatedWaistReductionCm} cm
                </span>
              </div>
            </div>
          )}

          {projectionResult.estimatedLeanMassGainKg !== undefined && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">💪 Gain masse maigre</span>
                <span className="text-blue-300 font-bold text-lg">
                  {projectionResult.estimatedLeanMassGainKg > 0 ? '+' : ''}{projectionResult.estimatedLeanMassGainKg} kg
                </span>
              </div>
            </div>
          )}

          {projectionResult.healthRiskReduction && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-400/20">
              <div className="flex items-start gap-2">
                <SpatialIcon Icon={ICONS.Heart} size={16} className="text-green-400 mt-0.5" />
                <div>
                  <div className="text-white/80 text-sm font-medium mb-1">Santé cardiovasculaire</div>
                  <div className="text-green-300 text-sm">{projectionResult.healthRiskReduction}</div>
                </div>
              </div>
            </div>
          )}

          {projectionResult.metabolicImprovementPercent !== undefined && (
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-400/20">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">🔥 Amélioration métabolique</span>
                <span className="text-orange-300 font-bold text-lg">
                  {projectionResult.metabolicImprovementPercent > 0 ? '+' : ''}{projectionResult.metabolicImprovementPercent}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div
          className="mt-4 p-3 rounded-xl space-y-2"
          style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.05))',
            border: '1px solid rgba(234,179,8,0.3)'
          }}
        >
          {warnings.map((warning, index) => {
            const isPositive = warning.includes('🎯') || warning.includes('💪') || warning.includes('✨') || warning.includes('🔥') || warning.includes('⚡');
            const iconToUse = isPositive ? ICONS.CheckCircle : ICONS.Info;
            const color = isPositive ? 'text-emerald-400/90' : 'text-yellow-400/90';

            return (
              <div key={index} className={`flex items-start gap-2 ${color} text-sm`}>
                <SpatialIcon Icon={iconToUse} size={14} className="mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};

export default ProjectionControls;
