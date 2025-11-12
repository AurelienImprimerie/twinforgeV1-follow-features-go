import React from 'react';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';

export default function RecordsWidgetSimplified() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 flex items-center justify-center border border-yellow-500/30">
          <SpatialIcon Icon={ICONS.Award} size={20} style={{ color: '#FBBF24' }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Records Personnels</h3>
          <p className="text-sm text-white/60">Vos meilleures performances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
          <SpatialIcon Icon={ICONS.Dumbbell} size={24} style={{ color: '#FBBF24' }} className="mx-auto mb-2" />
          <p className="text-white/60 text-sm">Séances</p>
          <p className="text-white/40 text-xs mt-1">Bientôt disponible</p>
        </div>

        <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
          <SpatialIcon Icon={ICONS.Target} size={24} style={{ color: '#FBBF24' }} className="mx-auto mb-2" />
          <p className="text-white/60 text-sm">Exercices</p>
          <p className="text-white/40 text-xs mt-1">Bientôt disponible</p>
        </div>

        <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
          <SpatialIcon Icon={ICONS.TrendingUp} size={24} style={{ color: '#FBBF24' }} className="mx-auto mb-2" />
          <p className="text-white/60 text-sm">Transformation</p>
          <p className="text-white/40 text-xs mt-1">Bientôt disponible</p>
        </div>
      </div>
    </GlassCard>
  );
}
