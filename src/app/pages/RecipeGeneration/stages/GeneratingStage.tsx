import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePerformanceMode } from '../../../../system/context/PerformanceModeContext';
import { useRecipeGenerationPipeline } from '../../../../system/store/recipeGeneration';
import RecipeCard from '../../../pages/Fridge/tabs/RecipesTab/components/RecipeCard';
import RecipeGenerationLoader from '../../../pages/Fridge/tabs/RecipesTab/components/RecipeGenerationLoader';

const GeneratingStage: React.FC = () => {
  const { isPerformanceMode } = usePerformanceMode();
  const { recipeCandidates, loadingState } = useRecipeGenerationPipeline();
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  useEffect(() => {
    if (recipeCandidates.length > 0) {
      setShowInitialLoader(false);
    }
  }, [recipeCandidates.length]);

  const hasRecipes = recipeCandidates.length > 0;
  const isStreaming = loadingState === 'streaming' || loadingState === 'generating';

  if (showInitialLoader && !hasRecipes) {
    return <RecipeGenerationLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Recipes Grid with Progressive Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Header Info */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isStreaming ? 'Génération en Cours' : 'Recettes Générées'}
          </h2>
          <p className="text-white/70">
            {isStreaming
              ? 'Les recettes apparaissent progressivement...'
              : `${recipeCandidates.filter(r => r.status === 'ready').length} recette(s) générée(s)`
            }
          </p>
        </div>

        {/* Progressive Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="sync">
            {recipeCandidates.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                isSaved={false}
                isNewlyGenerated={false}
                isLoading={recipe.status === 'loading'}
                onToggleSaveStatus={() => {}}
                onView={() => {}}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Streaming Status Indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-white/70 mt-6"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Création des recettes suivantes...</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GeneratingStage;
