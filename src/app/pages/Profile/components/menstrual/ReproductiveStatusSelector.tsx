import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import { getStatusEmoji, getStatusColor } from '../../../../../lib/utils/menopauseHelper';
import type { ReproductiveStatus } from '../../../../../domain/menopause';

interface ReproductiveStatusSelectorProps {
  value: ReproductiveStatus;
  onChange: (status: ReproductiveStatus) => void;
}

const statuses: Array<{
  value: ReproductiveStatus;
  label: string;
  description: string;
}> = [
  {
    value: 'menstruating',
    label: 'Cycle Menstruel',
    description: 'Cycles menstruels réguliers ou irréguliers',
  },
  {
    value: 'perimenopause',
    label: 'Périménopause',
    description: 'Transition - Cycles irréguliers, symptômes variables',
  },
  {
    value: 'menopause',
    label: 'Ménopause',
    description: 'Pas de règles depuis 12 mois',
  },
  {
    value: 'postmenopause',
    label: 'Post-ménopause',
    description: 'Après la ménopause, hormones stabilisées',
  },
];

const ReproductiveStatusSelector: React.FC<ReproductiveStatusSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <GlassCard className="p-6">
      <h3 className="text-white font-semibold text-lg mb-4">
        Mon Statut Reproductif
      </h3>
      <p className="text-white/60 text-sm mb-6">
        Sélectionnez votre statut actuel pour bénéficier de recommandations personnalisées
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statuses.map((status) => {
          const isSelected = value === status.value;
          const emoji = getStatusEmoji(status.value);
          const color = getStatusColor(status.value);

          return (
            <button
              key={status.value}
              onClick={() => onChange(status.value)}
              className="text-left p-4 rounded-lg border-2 transition-all"
              style={{
                borderColor: isSelected ? color : 'rgba(255, 255, 255, 0.1)',
                background: isSelected
                  ? `radial-gradient(circle at 30% 20%, ${color}15 0%, transparent 60%), var(--glass-opacity)`
                  : 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{emoji}</span>
                <div className="flex-1">
                  <div
                    className="font-semibold mb-1"
                    style={{ color: isSelected ? color : 'white' }}
                  >
                    {status.label}
                  </div>
                  <div className="text-sm text-white/60">
                    {status.description}
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-xs text-white/60">
          💡 Votre sélection influence les recommandations de toutes les forges (nutrition, entraînement, jeûne)
        </p>
      </div>
    </GlassCard>
  );
};

export default ReproductiveStatusSelector;
