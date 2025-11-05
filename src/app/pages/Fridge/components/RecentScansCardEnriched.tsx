import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../ui/icons/registry';
import { useFeedback } from '../../../../hooks/useFeedback';
import { useToast } from '../../../../ui/components/ToastProvider';
import { supabase } from '../../../../system/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '../../../../lib/utils/logger';
import { useFridgeScanPipeline } from '../../../../system/store/fridgeScan';
import { useMealPlanStore } from '../../../../system/store/mealPlanStore';
import { useRecipeGenerationPipeline } from '../../../../system/store/recipeGeneration';

interface RecipeSession {
  id: string;
  created_at: string;
  inventory_final: any[];
  status: string;
}

const RecentScansCardEnriched: React.FC = () => {
  const navigate = useNavigate();
  const { click, success } = useFeedback();
  const { showToast } = useToast();
  const [displaySessions, setDisplaySessions] = useState<RecipeSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { startRecipeGenerationFromInventory } = useFridgeScanPipeline();
  const { generateMealPlan } = useMealPlanStore();
  const { startPipeline } = useRecipeGenerationPipeline();

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('recipe_sessions')
        .select('id, created_at, inventory_final, status')
        .eq('user_id', user.id)
        .not('inventory_final', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setDisplaySessions(data);
      }
    } catch (error) {
      logger.warn('RECENT_SCANS_CARD', 'Failed to load recent sessions', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSessionSelect = (sessionId: string) => {
    click();
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
    } else {
      setSelectedSessionId(sessionId);
    }
  };

  const handleGenerateRecipes = async () => {
    if (!selectedSessionId) return;

    click();

    const selectedSession = displaySessions.find(s => s.id === selectedSessionId);
    if (!selectedSession) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Session introuvable',
        duration: 3000
      });
      return;
    }

    startRecipeGenerationFromInventory(selectedSessionId, selectedSession.inventory_final);
    navigate('/recipe-generation');

    showToast({
      type: 'success',
      title: 'Génération lancée',
      message: 'Création des recettes en cours...',
      duration: 3000
    });
  };

  const handleGenerateMealPlan = async () => {
    if (!selectedSessionId) return;

    click();

    const selectedSession = displaySessions.find(s => s.id === selectedSessionId);
    if (!selectedSession) {
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Session introuvable',
        duration: 3000
      });
      return;
    }

    await generateMealPlan(selectedSessionId);
    navigate('/meal-plan-generation');

    showToast({
      type: 'success',
      title: 'Génération lancée',
      message: 'Création du plan alimentaire en cours...',
      duration: 3000
    });
  };

  const handleDeleteSession = async () => {
    if (!selectedSessionId) return;

    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?');
    if (!confirmed) return;

    setIsDeleting(true);
    click();

    try {
      const { error } = await supabase
        .from('recipe_sessions')
        .delete()
        .eq('id', selectedSessionId);

      if (error) throw error;

      success();
      showToast({
        type: 'success',
        title: 'Supprimé',
        message: 'Inventaire supprimé avec succès',
        duration: 3000
      });

      setDisplaySessions(prev => prev.filter(s => s.id !== selectedSessionId));
      setSelectedSessionId(null);
    } catch (error) {
      logger.error('RECENT_SCANS_CARD', 'Failed to delete session', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer l\'inventaire',
        duration: 3000
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewAll = () => {
    click();
    showToast({
      type: 'info',
      title: 'Info',
      message: 'La vue complète des inventaires a été déplacée ici',
      duration: 3000
    });
  };

  const selectedSession = displaySessions.find(s => s.id === selectedSessionId);

  return (
    <div className="space-y-6">
      <GlassCard
        className="p-6"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, color-mix(in srgb, #EC4899 12%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, color-mix(in srgb, #F472B6 10%, transparent) 0%, transparent 50%),
            linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08)),
            rgba(11, 14, 23, 0.80)
          `,
          borderColor: 'color-mix(in srgb, #EC4899 35%, transparent)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.25),
            0 0 30px color-mix(in srgb, #EC4899 20%, transparent),
            inset 0 2px 0 rgba(255, 255, 255, 0.15)
          `,
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 60%),
                  linear-gradient(135deg, color-mix(in srgb, #EC4899 45%, transparent), color-mix(in srgb, #F472B6 35%, transparent))
                `,
                border: '2px solid color-mix(in srgb, #EC4899 60%, transparent)',
                boxShadow: '0 0 20px color-mix(in srgb, #EC4899 40%, transparent)'
              }}
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 20px rgba(236, 72, 153, 0.4)',
                  '0 0 30px rgba(236, 72, 153, 0.55)',
                  '0 0 20px rgba(236, 72, 153, 0.4)'
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <SpatialIcon Icon={ICONS.History} size={20} className="text-pink-300" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">Scans Récents</h3>
              <p className="text-sm text-white/70">Sélectionnez un inventaire pour agir</p>
            </div>
          </div>

          <button
            onClick={handleViewAll}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
            style={{
              background: 'color-mix(in srgb, #EC4899 15%, transparent)',
              border: '2px solid color-mix(in srgb, #EC4899 30%, transparent)',
              color: '#F472B6'
            }}
            onMouseEnter={(e) => {
              if (window.matchMedia('(hover: hover)').matches) {
                e.currentTarget.style.background = 'color-mix(in srgb, #EC4899 25%, transparent)';
                e.currentTarget.style.borderColor = 'color-mix(in srgb, #EC4899 45%, transparent)';
              }
            }}
            onMouseLeave={(e) => {
              if (window.matchMedia('(hover: hover)').matches) {
                e.currentTarget.style.background = 'color-mix(in srgb, #EC4899 15%, transparent)';
                e.currentTarget.style.borderColor = 'color-mix(in srgb, #EC4899 30%, transparent)';
              }
            }}
          >
            Voir tout
          </button>
        </div>

        {/* Liste des Scans */}
        <div className="space-y-4">
          {displaySessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: 'color-mix(in srgb, #EC4899 15%, transparent)',
                  border: '2px solid color-mix(in srgb, #EC4899 25%, transparent)'
                }}
              >
                <SpatialIcon Icon={ICONS.Package} size={32} className="text-pink-300 opacity-50" />
              </div>
              <p className="text-white/60 text-sm">
                Aucun scan effectué pour le moment
              </p>
              <p className="text-white/50 text-xs mt-2">
                Lancez votre premier scan pour commencer
              </p>
            </motion.div>
          ) : (
            displaySessions.map((session, index) => {
              const isSelected = selectedSessionId === session.id;

              return (
                <motion.button
                  key={session.id}
                  onClick={() => handleSessionSelect(session.id)}
                  className="w-full text-left rounded-xl p-4 transition-all duration-300"
                  style={{
                    background: isSelected
                      ? 'rgba(236, 72, 153, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected
                      ? '2px solid rgba(236, 72, 153, 0.5)'
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: isSelected
                      ? '0 0 30px rgba(236, 72, 153, 0.3)'
                      : 'none'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    background: isSelected
                      ? 'rgba(236, 72, 153, 0.2)'
                      : 'rgba(236, 72, 153, 0.08)',
                    borderColor: 'rgba(236, 72, 153, 0.4)'
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Selection Indicator */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, #EC4899, #F472B6)'
                          : 'rgba(255, 255, 255, 0.1)',
                        border: isSelected
                          ? '2px solid #EC4899'
                          : '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: isSelected
                          ? '0 0 12px rgba(236, 72, 153, 0.5)'
                          : 'none'
                      }}
                    >
                      {isSelected && (
                        <SpatialIcon Icon={ICONS.Check} size={14} className="text-white" />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `
                          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%),
                          linear-gradient(135deg, color-mix(in srgb, #EC4899 35%, transparent), color-mix(in srgb, #F472B6 25%, transparent))
                        `,
                        border: '2px solid color-mix(in srgb, #EC4899 40%, transparent)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.Refrigerator} size={32} className="text-pink-300" />
                    </div>

                    {/* Métadonnées */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-base truncate">
                          Scan du {format(new Date(session.created_at), 'd MMM yyyy', { locale: fr })}
                        </span>
                        {session.status === 'completed' && (
                          <div
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: 'color-mix(in srgb, #10B981 20%, transparent)',
                              color: '#10B981',
                              border: '1px solid color-mix(in srgb, #10B981 30%, transparent)'
                            }}
                          >
                            Terminé
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <div className="flex items-center gap-1.5">
                          <SpatialIcon Icon={ICONS.Package} size={14} />
                          <span>{Array.isArray(session.inventory_final) ? session.inventory_final.length : 0} items</span>
                        </div>
                      </div>

                      <p className="text-xs text-white/50 mt-1">
                        {format(new Date(session.created_at), 'HH:mm', { locale: fr })}
                      </p>
                    </div>

                    {/* Chevron ou Check */}
                    <SpatialIcon
                      Icon={isSelected ? ICONS.CheckCircle : ICONS.ChevronRight}
                      size={20}
                      className={isSelected ? 'text-pink-400' : 'text-white/40'}
                      style={isSelected ? { filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.6))' } : {}}
                    />
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </GlassCard>

      {/* Actions Card - Only shown when a session is selected */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard
              className="p-6"
              style={{
                background: `
                  linear-gradient(135deg,
                    color-mix(in srgb, var(--color-fridge-primary) 15%, transparent) 0%,
                    color-mix(in srgb, var(--color-plasma-cyan) 12%, transparent) 50%,
                    color-mix(in srgb, var(--color-fridge-primary) 8%, transparent) 100%
                  )
                `,
                borderColor: 'color-mix(in srgb, var(--color-fridge-primary) 40%, transparent)',
                boxShadow: `
                  0 12px 40px color-mix(in srgb, var(--color-fridge-primary) 25%, transparent),
                  0 4px 16px rgba(0, 0, 0, 0.3),
                  inset 0 2px 0 rgba(255, 255, 255, 0.15),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.1)
                `
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-xl"
                  style={{
                    background: `
                      radial-gradient(circle at center,
                        color-mix(in srgb, var(--color-fridge-primary) 30%, transparent) 0%,
                        color-mix(in srgb, var(--color-fridge-primary) 20%, transparent) 50%,
                        color-mix(in srgb, var(--color-fridge-primary) 10%, transparent) 100%
                      )
                    `,
                    border: '1px solid color-mix(in srgb, var(--color-fridge-primary) 50%, transparent)',
                    boxShadow: `
                      0 0 20px color-mix(in srgb, var(--color-fridge-primary) 40%, transparent),
                      0 4px 12px rgba(0, 0, 0, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <SpatialIcon Icon={ICONS.CheckCircle} size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Inventaire Sélectionné</h3>
              </div>

              <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-300 text-sm">
                  Inventaire du {new Date(selectedSession.created_at).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-white font-medium">
                  {selectedSession.inventory_final?.length || 0} articles détectés
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleGenerateRecipes}
                  disabled={isDeleting}
                  className="px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        var(--color-fridge-primary) 0%,
                        color-mix(in srgb, var(--color-fridge-primary) 80%, #ffffff) 100%
                      )
                    `,
                    borderColor: 'color-mix(in srgb, var(--color-fridge-primary) 70%, transparent)',
                    border: '2px solid',
                    boxShadow: `
                      0 8px 24px color-mix(in srgb, var(--color-fridge-primary) 35%, transparent),
                      0 3px 12px rgba(0, 0, 0, 0.25),
                      inset 0 2px 0 rgba(255, 255, 255, 0.2),
                      inset 0 -2px 0 rgba(0, 0, 0, 0.1)
                    `,
                    color: 'white'
                  }}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <SpatialIcon Icon={ICONS.ChefHat} size={16} />
                    <span>Générer Recettes</span>
                  </div>
                </button>

                <button
                  onClick={handleGenerateMealPlan}
                  disabled={isDeleting}
                  className="px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        var(--color-plasma-cyan) 0%,
                        color-mix(in srgb, var(--color-plasma-cyan) 80%, #ffffff) 100%
                      )
                    `,
                    borderColor: 'color-mix(in srgb, var(--color-plasma-cyan) 70%, transparent)',
                    border: '2px solid',
                    boxShadow: `
                      0 8px 24px color-mix(in srgb, var(--color-plasma-cyan) 35%, transparent),
                      0 3px 12px rgba(0, 0, 0, 0.25),
                      inset 0 2px 0 rgba(255, 255, 255, 0.2),
                      inset 0 -2px 0 rgba(0, 0, 0, 0.1)
                    `,
                    color: 'white'
                  }}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <SpatialIcon Icon={ICONS.Calendar} size={16} />
                    <span>Plan de Repas</span>
                  </div>
                </button>

                <button
                  onClick={handleDeleteSession}
                  disabled={isDeleting}
                  className="btn-glass--danger px-4 py-3 text-sm font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 justify-center">
                    <SpatialIcon Icon={isDeleting ? ICONS.Loader2 : ICONS.Trash2} size={16} className={isDeleting ? 'animate-spin' : ''} />
                    <span>{isDeleting ? 'Suppression...' : 'Supprimer'}</span>
                  </div>
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentScansCardEnriched;
