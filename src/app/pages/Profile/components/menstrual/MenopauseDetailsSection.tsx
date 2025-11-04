import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import type { ReproductiveStatus, PerimenopauseStage } from '../../../../../domain/menopause';

interface MenopauseDetailsSectionProps {
  status: ReproductiveStatus;
  value: {
    perimenopause_stage: PerimenopauseStage | null;
    last_period_date: string;
    menopause_confirmation_date: string;
    fsh_level: string;
    estrogen_level: string;
    last_hormone_test_date: string;
    notes: string;
  };
  onChange: (value: any) => void;
  errors?: Record<string, string>;
}

const MenopauseDetailsSection: React.FC<MenopauseDetailsSectionProps> = ({
  status,
  value,
  onChange,
  errors = {},
}) => {
  if (status === 'menstruating') {
    return null;
  }

  const handleChange = (field: string, fieldValue: string | null) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const showPerimenopauseFields = status === 'perimenopause';
  const showMenopauseFields = status === 'menopause';
  const showPostmenopauseFields = status === 'postmenopause';

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                linear-gradient(135deg, color-mix(in srgb, #F59E0B 35%, transparent), color-mix(in srgb, #F59E0B 25%, transparent))
              `,
              border: '2px solid color-mix(in srgb, #F59E0B 50%, transparent)',
              boxShadow: '0 0 20px color-mix(in srgb, #F59E0B 30%, transparent)',
            }}
          >
            <SpatialIcon Icon={ICONS.Activity} size={20} style={{ color: '#F59E0B' }} variant="pure" />
          </div>
          <div>
            <div className="text-xl">Détails de Suivi</div>
            <div className="text-white/60 text-sm font-normal mt-0.5">
              Informations spécifiques à votre santé reproductive
            </div>
          </div>
        </h3>
      </div>

      <div className="space-y-4">
        {showPerimenopauseFields && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Stade de périménopause
            </label>
            <select
              value={value.perimenopause_stage || ''}
              onChange={(e) =>
                handleChange('perimenopause_stage', e.target.value || null)
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
            >
              <option value="">Sélectionner un stade</option>
              <option value="early">Précoce (cycles encore présents mais irréguliers)</option>
              <option value="late">Tardif (absence de règles 60+ jours)</option>
            </select>
            <p className="mt-1 text-xs text-white/40">
              Le stade aide à adapter les recommandations
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Date des dernières règles
          </label>
          <input
            type="date"
            value={value.last_period_date || ''}
            onChange={(e) => handleChange('last_period_date', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
          />
          {errors.last_period_date && (
            <p className="mt-1 text-sm text-red-400">{errors.last_period_date}</p>
          )}
        </div>

        {showMenopauseFields && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Date de confirmation de ménopause
            </label>
            <input
              type="date"
              value={value.menopause_confirmation_date || ''}
              onChange={(e) =>
                handleChange('menopause_confirmation_date', e.target.value)
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
            />
            <p className="mt-1 text-xs text-white/40">
              12 mois après les dernières règles
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
            <span>🧪</span>
            Données médicales (optionnel)
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Niveau FSH (UI/L)
              </label>
              <input
                type="number"
                step="0.1"
                value={value.fsh_level || ''}
                onChange={(e) => handleChange('fsh_level', e.target.value)}
                placeholder="Ex: 35.5"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
              />
              <p className="mt-1 text-xs text-white/40">
                FSH {'>'} 25 UI/L suggère une périménopause
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Niveau d'œstrogène (pg/mL)
              </label>
              <input
                type="number"
                step="0.1"
                value={value.estrogen_level || ''}
                onChange={(e) => handleChange('estrogen_level', e.target.value)}
                placeholder="Ex: 15.0"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
              />
              <p className="mt-1 text-xs text-white/40">
                Œstrogène {'<'} 30 pg/mL typique en post-ménopause
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Date du dernier test hormonal
              </label>
              <input
                type="date"
                value={value.last_hormone_test_date || ''}
                onChange={(e) =>
                  handleChange('last_hormone_test_date', e.target.value)
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Notes personnelles
          </label>
          <textarea
            value={value.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            placeholder="Ajoutez des notes sur vos symptômes, traitements, ou observations..."
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#F59E0B]/50 transition-colors resize-none"
          />
        </div>
      </div>
    </GlassCard>
  );
};

export default MenopauseDetailsSection;
