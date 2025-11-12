import React from 'react';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';

export default function CalorieBalanceWidgetV3() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30">
          <SpatialIcon Icon={ICONS.Flame} size={20} style={{ color: '#F59E0B' }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Balance Énergétique</h3>
          <p className="text-sm text-white/60">Suivi calorique quotidien</p>
        </div>
      </div>

      <div className="text-center py-12">
        <SpatialIcon Icon={ICONS.Activity} size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <p className="text-white/60 mt-4">Widget en développement</p>
        <p className="text-white/40 text-sm mt-2">Suivi énergétique gamifié bientôt disponible</p>
      </div>
    </GlassCard>
  );
}
