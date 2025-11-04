import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';

interface MenstrualCycleSectionProps {
  value: {
    lastPeriodDate: string;
    averageCycleLength: number;
    averagePeriodDuration: number;
  };
  onChange: (value: any) => void;
  errors?: Record<string, string>;
}

const MenstrualCycleSection: React.FC<MenstrualCycleSectionProps> = ({
  value,
  onChange,
  errors = {},
}) => {
  const handleChange = (field: string, fieldValue: string | number) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <GlassCard title="Informations du Cycle" variant="frosted" className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Date des dernières règles
          </label>
          <input
            type="date"
            value={value.lastPeriodDate || ''}
            onChange={(e) => handleChange('lastPeriodDate', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--circuit-health)]/50 transition-colors"
          />
          {errors.lastPeriodDate && (
            <p className="mt-1 text-sm text-red-400">{errors.lastPeriodDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Durée moyenne du cycle (jours)
          </label>
          <input
            type="number"
            min="21"
            max="45"
            value={value.averageCycleLength || 28}
            onChange={(e) => handleChange('averageCycleLength', parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--circuit-health)]/50 transition-colors"
          />
          <p className="mt-1 text-xs text-white/40">
            Entre 21 et 45 jours (moyenne: 28 jours)
          </p>
          {errors.averageCycleLength && (
            <p className="mt-1 text-sm text-red-400">{errors.averageCycleLength}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Durée moyenne des règles (jours)
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={value.averagePeriodDuration || 5}
            onChange={(e) => handleChange('averagePeriodDuration', parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--circuit-health)]/50 transition-colors"
          />
          <p className="mt-1 text-xs text-white/40">
            Entre 2 et 10 jours (moyenne: 5 jours)
          </p>
          {errors.averagePeriodDuration && (
            <p className="mt-1 text-sm text-red-400">{errors.averagePeriodDuration}</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default MenstrualCycleSection;
