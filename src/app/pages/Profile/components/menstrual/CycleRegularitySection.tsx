import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';

interface CycleRegularitySectionProps {
  value: {
    cycleRegularity: 'regular' | 'irregular' | 'very_irregular';
    trackingSymptoms: boolean;
  };
  onChange: (value: any) => void;
}

const CycleRegularitySection: React.FC<CycleRegularitySectionProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (field: string, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const regularityOptions = [
    { value: 'regular', label: 'Régulier', description: 'Cycle stable, variations < 3 jours' },
    { value: 'irregular', label: 'Irrégulier', description: 'Variations de 3-7 jours' },
    { value: 'very_irregular', label: 'Très irrégulier', description: 'Variations > 7 jours' },
  ];

  return (
    <GlassCard title="Régularité du Cycle" variant="frosted" className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-3">
            Comment décririez-vous votre cycle?
          </label>
          <div className="space-y-2">
            {regularityOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-start p-4 rounded-lg border cursor-pointer transition-all
                  ${
                    value.cycleRegularity === option.value
                      ? 'bg-[var(--circuit-health)]/10 border-[var(--circuit-health)]/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <input
                  type="radio"
                  name="cycleRegularity"
                  value={option.value}
                  checked={value.cycleRegularity === option.value}
                  onChange={(e) => handleChange('cycleRegularity', e.target.value)}
                  className="mt-1 text-[var(--circuit-health)]"
                />
                <div className="ml-3 flex-1">
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-sm text-white/60 mt-1">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value.trackingSymptoms || false}
              onChange={(e) => handleChange('trackingSymptoms', e.target.checked)}
              className="text-[var(--circuit-health)]"
            />
            <span className="ml-3 text-white/80">
              Je souhaite suivre mes symptômes menstruels
            </span>
          </label>
          <p className="mt-2 text-xs text-white/40 ml-7">
            Activez cette option pour recevoir des recommandations personnalisées basées sur vos symptômes
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

export default CycleRegularitySection;
