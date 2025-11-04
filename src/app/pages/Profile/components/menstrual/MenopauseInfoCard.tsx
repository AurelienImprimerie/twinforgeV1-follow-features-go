import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import {
  calculateMenopausePhase,
  getStatusEmoji,
  getStatusColor,
} from '../../../../../lib/utils/menopauseHelper';
import type { ReproductiveStatus, PerimenopauseStage } from '../../../../../domain/menopause';

interface MenopauseInfoCardProps {
  status: ReproductiveStatus;
  lastPeriodDate: string | null;
  menopauseConfirmationDate: string | null;
  perimenopauseStage: PerimenopauseStage | null;
}

const MenopauseInfoCard: React.FC<MenopauseInfoCardProps> = ({
  status,
  lastPeriodDate,
  menopauseConfirmationDate,
  perimenopauseStage,
}) => {
  if (status === 'menstruating') {
    return null;
  }

  const phaseData = calculateMenopausePhase(
    status,
    lastPeriodDate,
    menopauseConfirmationDate,
    perimenopauseStage
  );

  if (!phaseData) {
    return null;
  }

  const emoji = getStatusEmoji(status);
  const color = getStatusColor(status);

  return (
    <GlassCard
      className="p-6"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, ${color}15 0%, transparent 60%),
          var(--glass-opacity)
        `,
        borderColor: `${color}33`,
      }}
    >
      <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        Informations de Santé
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/60">Statut actuel</div>
            <div className="text-xl font-bold text-white mt-1">
              {phaseData.phaseDescription}
            </div>
          </div>
          {phaseData.stage && (
            <div className="text-right">
              <div className="text-sm text-white/60">Stade</div>
              <div className="text-xl font-bold text-white mt-1">
                {phaseData.stage === 'early' ? 'Précoce' : 'Tardif'}
              </div>
            </div>
          )}
        </div>

        {phaseData.daysSinceLastPeriod !== null && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Jours depuis dernières règles:</span>
              <span className="text-white font-bold">
                {phaseData.daysSinceLastPeriod} jours
              </span>
            </div>
          </div>
        )}

        {phaseData.daysUntilMenopauseConfirmation !== null && (
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60">
                Jours jusqu'à confirmation ménopause:
              </span>
              <span className="text-white font-bold">
                {phaseData.daysUntilMenopauseConfirmation} jours
              </span>
            </div>
            <p className="text-xs text-white/40 mt-2">
              La ménopause est confirmée après 12 mois consécutifs sans règles
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-white/60 mb-1">Niveau d'énergie</div>
            <div className="text-sm font-semibold text-white capitalize">
              {phaseData.energyLevel === 'low' && 'Faible'}
              {phaseData.energyLevel === 'moderate' && 'Modéré'}
              {phaseData.energyLevel === 'high' && 'Élevé'}
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="text-xs text-white/60 mb-1">Métabolisme</div>
            <div className="text-sm font-semibold text-white capitalize">
              {phaseData.metabolicRate === 'reduced' && 'Réduit'}
              {phaseData.metabolicRate === 'normal' && 'Normal'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-white/40">
            💡 Ces informations sont utilisées pour personnaliser vos recommandations nutritionnelles, d'entraînement et de jeûne
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default MenopauseInfoCard;
