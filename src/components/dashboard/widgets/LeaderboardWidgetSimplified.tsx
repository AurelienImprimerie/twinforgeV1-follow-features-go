import React from 'react';
import GlassCard from '@/ui/cards/GlassCard';
import SpatialIcon from '@/ui/icons/SpatialIcon';
import { ICONS } from '@/ui/icons/registry';

export default function LeaderboardWidgetSimplified() {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 flex items-center justify-center border border-purple-500/30">
          <SpatialIcon Icon={ICONS.Trophy} size={20} style={{ color: '#A855F7' }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Classement</h3>
          <p className="text-sm text-white/60">Comparez vos performances</p>
        </div>
      </div>

      <div className="text-center py-12">
        <SpatialIcon Icon={ICONS.Trophy} size={48} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <p className="text-white/60 mt-4">Classement en développement</p>
        <p className="text-white/40 text-sm mt-2">Leaderboard communautaire bientôt disponible</p>
      </div>
    </GlassCard>
  );
}
