import React, { useState, useEffect } from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { SectionSaveButton } from '../../components/ProfileHealthComponents';
import { getStatusEmoji, getStatusColor } from '../../../../../lib/utils/menopauseHelper';
import type { ReproductiveStatus } from '../../../../../domain/menopause';

interface ReproductiveStatusSelectorProps {
  value: ReproductiveStatus;
  onChange: (updates: { reproductive_status: ReproductiveStatus }) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
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
  onSave,
  isSaving,
}) => {
  const [initialValue, setInitialValue] = useState(value);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setInitialValue(value);
  }, []);

  useEffect(() => {
    setIsDirty(value !== initialValue);
  }, [value, initialValue]);

  const handleSave = async () => {
    await onSave();
    setInitialValue(value);
    setIsDirty(false);
  };

  return (
    <GlassCard className="p-6" style={{
      background: `
        radial-gradient(circle at 30% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 60%),
        var(--glass-opacity)
      `,
      borderColor: 'rgba(236, 72, 153, 0.2)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #EC4899 35%, transparent), color-mix(in srgb, #EC4899 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #EC4899 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #EC4899 30%, transparent)'
            }}
          >
            <SpatialIcon Icon={ICONS.Heart} size={20} style={{ color: '#EC4899' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Mon Statut Reproductif</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">Sélectionnez votre phase hormonale actuelle</div>
          </div>
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-400" />
          <span className="text-pink-300 text-sm font-medium">Essentiel</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statuses.map((status) => {
          const isSelected = value === status.value;
          const emoji = getStatusEmoji(status.value);
          const color = getStatusColor(status.value);

          return (
            <button
              key={status.value}
              onClick={() => onChange({ reproductive_status: status.value })}
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

      <SectionSaveButton
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        sectionName="Statut"
      />
    </GlassCard>
  );
};

export default ReproductiveStatusSelector;
