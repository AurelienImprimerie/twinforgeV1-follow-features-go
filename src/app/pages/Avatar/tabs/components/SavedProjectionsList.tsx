import React, { useState } from 'react';
import { ConditionalMotion } from '../../../../../lib/motion/ConditionalMotion';
import GlassCard from '../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../hooks/useFeedback';
import type { SavedProjection } from '../../../../../system/data/repositories/projectionsRepo';
import type { ProjectionParams } from '../../../../../hooks/useProjectionCalculator';

interface SavedProjectionsListProps {
  projections: SavedProjection[];
  onLoadProjection: (params: ProjectionParams) => void;
  onDeleteProjection: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  isDeleting: boolean;
}

const DURATION_LABELS: Record<string, string> = {
  '3_months': '3 mois',
  '6_months': '6 mois',
  '1_year': '1 an',
  '3_years': '3 ans',
};

const SavedProjectionsList: React.FC<SavedProjectionsListProps> = ({
  projections,
  onLoadProjection,
  onDeleteProjection,
  onToggleFavorite,
  isDeleting
}) => {
  const { click } = useFeedback();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (projections.length === 0) {
    return (
      <GlassCard
        className="p-6 text-center"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))',
            border: '1px solid rgba(16,185,129,0.2)'
          }}
        >
          <SpatialIcon Icon={ICONS.Archive} size={32} className="text-emerald-400/50" />
        </div>
        <p className="text-white/60 text-sm">
          Aucune projection sauvegardée. Créez votre première projection pour la retrouver ici.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {projections.map((projection, index) => {
        const isExpanded = expandedId === projection.id;

        const handleLoad = () => {
          click();
          onLoadProjection({
            nutritionQuality: projection.nutrition_quality as any,
            sportIntensity: projection.sport_intensity as any,
            duration: projection.duration_key as any
          });
        };

        const handleToggleFavorite = (e: React.MouseEvent) => {
          e.stopPropagation();
          click();
          onToggleFavorite(projection.id, !projection.is_favorite);
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          click();
          if (confirm(`Supprimer la projection "${projection.name}" ?`)) {
            onDeleteProjection(projection.id);
          }
        };

        const handleToggleExpand = () => {
          click();
          setExpandedId(isExpanded ? null : projection.id);
        };

        return (
          <ConditionalMotion
            key={projection.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative"
          >
            <GlassCard
              className="p-4 cursor-pointer transition-all duration-200"
              interactive
              style={{
                background: projection.is_favorite
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))'
                  : 'rgba(255,255,255,0.03)',
                border: projection.is_favorite
                  ? '1px solid rgba(16,185,129,0.3)'
                  : '1px solid rgba(255,255,255,0.1)',
                boxShadow: projection.is_favorite
                  ? '0 0 20px rgba(16,185,129,0.15)'
                  : 'none'
              }}
              onClick={handleToggleExpand}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {projection.is_favorite && (
                      <SpatialIcon Icon={ICONS.Star} size={16} className="text-yellow-400" />
                    )}
                    <h4 className="text-white font-semibold">{projection.name}</h4>
                  </div>

                  {projection.description && (
                    <p className="text-white/60 text-sm mb-3">{projection.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-2">
                    <div
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10B981'
                      }}
                    >
                      {DURATION_LABELS[projection.duration_key] || projection.duration_key}
                    </div>

                    <div
                      className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      style={{
                        background: 'rgba(59,130,246,0.15)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        color: '#3B82F6'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.Utensils} size={12} />
                      <span>Nutrition: {projection.nutrition_quality}/5</span>
                    </div>

                    <div
                      className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        color: '#8B5CF6'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.Dumbbell} size={12} />
                      <span>Sport: {projection.sport_intensity}/5</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <ConditionalMotion
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-white/60 mb-1">Masse grasse</div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {projection.projected_pear_figure.toFixed(2)}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: projection.fat_change < 0 ? '#10B981' : '#EF4444' }}
                            >
                              ({projection.fat_change > 0 ? '+' : ''}{projection.fat_change.toFixed(2)})
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="text-white/60 mb-1">Masse musculaire</div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {projection.projected_bodybuilder_size.toFixed(2)}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: projection.muscle_change > 0 ? '#10B981' : '#EF4444' }}
                            >
                              ({projection.muscle_change > 0 ? '+' : ''}{projection.muscle_change.toFixed(2)})
                            </span>
                          </div>
                        </div>
                      </div>
                    </ConditionalMotion>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{
                      background: projection.is_favorite ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)',
                      border: projection.is_favorite ? '1px solid rgba(234,179,8,0.4)' : '1px solid rgba(255,255,255,0.1)'
                    }}
                    title={projection.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <SpatialIcon
                      Icon={projection.is_favorite ? ICONS.Star : ICONS.Star}
                      size={16}
                      style={{ color: projection.is_favorite ? '#EAB308' : 'rgba(255,255,255,0.4)' }}
                    />
                  </button>

                  <button
                    onClick={handleLoad}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{
                      background: 'rgba(16,185,129,0.2)',
                      border: '1px solid rgba(16,185,129,0.4)'
                    }}
                    title="Charger cette projection"
                  >
                    <SpatialIcon Icon={ICONS.Play} size={16} style={{ color: '#10B981' }} />
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{
                      background: 'rgba(239,68,68,0.2)',
                      border: '1px solid rgba(239,68,68,0.4)',
                      opacity: isDeleting ? 0.5 : 1
                    }}
                    title="Supprimer cette projection"
                  >
                    <SpatialIcon Icon={ICONS.Trash2} size={16} style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
            </GlassCard>
          </ConditionalMotion>
        );
      })}
    </div>
  );
};

export default SavedProjectionsList;
