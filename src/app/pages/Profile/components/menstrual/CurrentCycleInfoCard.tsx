import React from 'react';
import GlassCard from '../../../../../ui/cards/GlassCard';
import { differenceInDays } from 'date-fns';

interface CurrentCycleInfoCardProps {
  lastPeriodDate: string;
  averageCycleLength: number;
}

const CurrentCycleInfoCard: React.FC<CurrentCycleInfoCardProps> = ({
  lastPeriodDate,
  averageCycleLength,
}) => {
  if (!lastPeriodDate) {
    return null;
  }

  const today = new Date();
  const lastPeriod = new Date(lastPeriodDate);
  const dayInCycle = differenceInDays(today, lastPeriod) + 1;
  const daysUntilNext = averageCycleLength - dayInCycle;

  const getCurrentPhase = (day: number, cycleLength: number) => {
    const ovulationDay = Math.floor(cycleLength / 2);

    if (day <= 5) {
      return {
        phase: 'Menstruation',
        emoji: '🔴',
        color: '#EF4444',
        description: 'Phase menstruelle en cours',
      };
    } else if (day < ovulationDay - 2) {
      return {
        phase: 'Phase Folliculaire',
        emoji: '🌱',
        color: '#10B981',
        description: 'Énergie croissante, bon moment pour l\'entraînement',
      };
    } else if (day >= ovulationDay - 2 && day <= ovulationDay + 2) {
      return {
        phase: 'Ovulation',
        emoji: '✨',
        color: '#F59E0B',
        description: 'Pic d\'énergie, performances maximales possibles',
      };
    } else {
      return {
        phase: 'Phase Lutéale',
        emoji: '🌙',
        color: '#8B5CF6',
        description: 'Énergie décroissante, privilégiez la récupération',
      };
    }
  };

  const phaseInfo = getCurrentPhase(dayInCycle, averageCycleLength);

  return (
    <GlassCard title="Informations du Cycle Actuel" variant="frosted" className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white/60">Phase actuelle</div>
            <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <span>{phaseInfo.emoji}</span>
              <span>{phaseInfo.phase}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">Jour du cycle</div>
            <div className="text-2xl font-bold text-white mt-1">
              J{dayInCycle}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/80 text-sm">{phaseInfo.description}</p>
        </div>

        {daysUntilNext > 0 && (
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <span className="text-white/60">Prochaines règles estimées dans:</span>
            <span className="text-white font-bold">{daysUntilNext} jours</span>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <div className="text-xs text-white/40">
            💡 Ces informations sont utilisées pour personnaliser vos recommandations nutritionnelles et d'entraînement
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default CurrentCycleInfoCard;
