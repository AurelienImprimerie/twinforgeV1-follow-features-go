import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import GlassCard from '../../../../../../ui/cards/GlassCard';
import SpatialIcon from '../../../../../../ui/icons/SpatialIcon';
import { ICONS } from '../../../../../../ui/icons/registry';
import { useFeedback } from '../../../../../../hooks/useFeedback';
import RecipeDetailModal from '../../RecipesTab/components/RecipeDetailModal';
import type { MealPlanData, MealDetail } from '../../../../../../system/store/mealPlanStore/types';
import type { Recipe } from '../../../../../../domain/recipe';

interface MealPlanDetailModalProps {
  plan: MealPlanData;
  onClose: () => void;
}

/**
 * Meal Plan Detail Modal - Modal de Consultation du Plan Alimentaire
 * Affiche tous les détails d'un plan alimentaire sauvegardé avec:
 * - Vue semaine par semaine
 * - Aperçu des images de recettes
 * - Navigation vers le détail complet des recettes
 */
const MealPlanDetailModal: React.FC<MealPlanDetailModalProps> = ({
  plan,
  onClose
}) => {
  const { click } = useFeedback();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      click();
      onClose();
    }
  };

  // Convert MealDetail to Recipe format for RecipeDetailModal
  const convertMealDetailToRecipe = (meal: MealDetail, mealType: string, date: string): Recipe => {
    return {
      id: meal.recipeId || `meal-${date}-${mealType}`,
      title: meal.mealName,
      description: meal.descriptionSummary,
      ingredients: meal.detailedRecipe?.ingredients || meal.mainIngredients.map(ing => ({
        name: ing,
        quantity: '',
        unit: ''
      })),
      instructions: meal.detailedRecipe?.instructions || [],
      prepTimeMin: meal.estimatedPrepTime,
      cookTimeMin: meal.estimatedCookTime,
      servings: meal.detailedRecipe?.servings || 1,
      nutritionalInfo: {
        calories: meal.estimatedCalories,
        protein: meal.nutritionalOverview?.protein || 0,
        carbs: meal.nutritionalOverview?.carbs || 0,
        fat: meal.nutritionalOverview?.fat || 0,
        fiber: meal.detailedRecipe?.nutritionalInfo?.fiber || 0
      },
      dietaryTags: meal.dietaryTags || [],
      difficulty: meal.detailedRecipe?.difficulty || 'moyen',
      imageUrl: meal.imageUrl,
      createdAt: new Date().toISOString(),
      userId: ''
    };
  };

  const handleMealClick = (meal: MealDetail, mealType: string, date: string) => {
    click();
    const recipe = convertMealDetailToRecipe(meal, mealType, date);
    setSelectedRecipe(recipe);
  };

  // Lock body scroll when modal is open
  React.useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  // Handle ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedRecipe) {
        click();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [click, onClose, selectedRecipe]);

  const weekCount = Math.ceil(plan.days.length / 7);

  return createPortal(
    <AnimatePresence>
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
      {!selectedRecipe && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="meal-plan-detail-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-6xl"
            style={{
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard
              className="p-6"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, color-mix(in srgb, #10B981 12%, transparent) 0%, transparent 60%),
                  radial-gradient(circle at 70% 80%, color-mix(in srgb, #10B981 8%, transparent) 0%, transparent 50%),
                  linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.10)),
                  rgba(11, 14, 23, 0.95)
                `,
                borderColor: 'color-mix(in srgb, #10B981 30%, transparent)',
                boxShadow: `
                  0 25px 80px rgba(0, 0, 0, 0.6),
                  0 0 60px color-mix(in srgb, #10B981 30%, transparent),
                  inset 0 3px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -3px 0 rgba(0, 0, 0, 0.2)
                `,
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)'
                }}
                aria-label="Fermer le détail"
              >
                <SpatialIcon Icon={ICONS.X} size={18} className="text-white" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #34D399)',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                    }}
                  >
                    <SpatialIcon
                      Icon={ICONS.ChefHat}
                      size={32}
                      className="text-white"
                    />
                  </div>
                  <div>
                    <h2
                      id="meal-plan-detail-title"
                      className="text-3xl font-bold text-white"
                    >
                      Semaine {plan.weekNumber}
                    </h2>
                    <p className="text-white/70">
                      {new Date(plan.startDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.Calendar} size={20} className="text-green-400 mx-auto mb-2" />
                    <div className="text-white text-2xl font-bold">{plan.days.length}</div>
                    <div className="text-white/60 text-sm">Jours</div>
                  </div>
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <SpatialIcon Icon={ICONS.UtensilsCrossed} size={20} className="text-green-400 mx-auto mb-2" />
                    <div className="text-white text-2xl font-bold">
                      {plan.days.reduce((sum, day) => sum + Object.values(day.meals || {}).filter(m => m).length, 0)}
                    </div>
                    <div className="text-white/60 text-sm">Repas</div>
                  </div>
                  {plan.nutritionalSummary && (
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <SpatialIcon Icon={ICONS.Activity} size={20} className="text-green-400 mx-auto mb-2" />
                      <div className="text-white text-2xl font-bold">
                        {Math.round(plan.nutritionalSummary.avgCaloriesPerDay)}
                      </div>
                      <div className="text-white/60 text-sm">kcal/jour</div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Explanation */}
              {plan.aiExplanation && (
                <div
                  className="mb-6 p-4 rounded-xl"
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <SpatialIcon Icon={ICONS.Sparkles} size={18} className="text-green-400" />
                    <h4 className="text-white font-semibold">Stratégie Nutritionnelle</h4>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {plan.aiExplanation.personalizedReasoning}
                  </p>
                </div>
              )}

              {/* Weeks Display */}
              <div className="space-y-6">
                {Array.from({ length: weekCount }).map((_, weekIndex) => {
                  const weekDays = plan.days.slice(weekIndex * 7, (weekIndex + 1) * 7);

                  return (
                    <div key={`week-${weekIndex}`}>
                      {weekCount > 1 && (
                        <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                          <SpatialIcon Icon={ICONS.Calendar} size={20} className="text-green-400" />
                          Semaine {weekIndex + 1}
                        </h3>
                      )}

                      {/* Days Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {weekDays.map((day) => (
                          <div
                            key={day.date}
                            className="p-4 rounded-xl"
                            style={{
                              background: 'rgba(16, 185, 129, 0.05)',
                              border: '1px solid rgba(16, 185, 129, 0.15)'
                            }}
                          >
                            <div className="font-semibold text-white mb-3 text-sm">
                              {new Date(day.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </div>

                            {/* Meals with Images */}
                            <div className="space-y-3">
                              {Object.entries(day.meals).map(([mealType, meal]) => {
                                if (!meal) return null;

                                const mealIcons = {
                                  breakfast: ICONS.Coffee,
                                  lunch: ICONS.UtensilsCrossed,
                                  dinner: ICONS.UtensilsCrossed,
                                  snack: ICONS.Cookie
                                };

                                return (
                                  <button
                                    key={mealType}
                                    onClick={() => handleMealClick(meal, mealType, day.date)}
                                    className="w-full text-left rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    style={{
                                      background: 'rgba(16, 185, 129, 0.1)',
                                      border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}
                                  >
                                    {/* Meal Image */}
                                    {meal.imageUrl ? (
                                      <div className="w-full h-24 overflow-hidden">
                                        <img
                                          src={meal.imageUrl}
                                          alt={meal.mealName}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        className="w-full h-24 flex items-center justify-center"
                                        style={{
                                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))'
                                        }}
                                      >
                                        <SpatialIcon
                                          Icon={mealIcons[mealType as keyof typeof mealIcons] || ICONS.UtensilsCrossed}
                                          size={32}
                                          className="text-green-400/60"
                                        />
                                      </div>
                                    )}

                                    {/* Meal Info */}
                                    <div className="p-3">
                                      <div className="flex items-center gap-2 mb-1">
                                        <SpatialIcon
                                          Icon={mealIcons[mealType as keyof typeof mealIcons] || ICONS.UtensilsCrossed}
                                          size={12}
                                          className="text-green-400"
                                        />
                                        <span className="text-green-400 text-xs font-medium capitalize">
                                          {mealType === 'breakfast' ? 'Petit-déj' :
                                           mealType === 'lunch' ? 'Déjeuner' :
                                           mealType === 'dinner' ? 'Dîner' : 'Snack'}
                                        </span>
                                      </div>
                                      <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                                        {meal.mealName}
                                      </p>
                                      {meal.estimatedCalories && (
                                        <p className="text-green-400/80 text-xs">
                                          {meal.estimatedCalories} kcal
                                        </p>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nutritional Summary */}
              {plan.nutritionalSummary && (
                <div
                  className="mt-6 p-4 rounded-xl"
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <SpatialIcon Icon={ICONS.Activity} size={18} className="text-green-400" />
                    Résumé Nutritionnel Moyen
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-white text-xl font-bold">
                        {Math.round(plan.nutritionalSummary.avgProteinPerDay)}g
                      </div>
                      <div className="text-white/60 text-xs">Protéines</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xl font-bold">
                        {Math.round(plan.nutritionalSummary.avgCarbsPerDay)}g
                      </div>
                      <div className="text-white/60 text-xs">Glucides</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xl font-bold">
                        {Math.round(plan.nutritionalSummary.avgFatPerDay)}g
                      </div>
                      <div className="text-white/60 text-xs">Lipides</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xl font-bold">
                        {Math.round(plan.nutritionalSummary.avgCaloriesPerDay)}
                      </div>
                      <div className="text-white/60 text-xs">kcal/jour</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, #6B7280 80%, transparent), color-mix(in srgb, #9CA3AF 60%, transparent))',
                    border: '2px solid color-mix(in srgb, #6B7280 60%, transparent)',
                    boxShadow: '0 8px 32px color-mix(in srgb, #6B7280 30%, transparent), inset 0 2px 0 rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(16px) saturate(140%)',
                    color: '#fff'
                  }}
                >
                  Fermer
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MealPlanDetailModal;
