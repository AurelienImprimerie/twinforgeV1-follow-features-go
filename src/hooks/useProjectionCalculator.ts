import { useMemo } from 'react';
import { useMorphologyMapping } from './useMorphologyMapping';
import logger from '../lib/utils/logger';

export type NutritionQuality = 1 | 2 | 3 | 4 | 5;
export type SportIntensity = 1 | 2 | 3 | 4 | 5;
export type ProjectionDuration = '3_months' | '6_months' | '1_year' | '3_years';

export interface ProjectionParams {
  nutritionQuality: NutritionQuality;
  sportIntensity: SportIntensity;
  duration: ProjectionDuration;
}

export interface ProjectionResult {
  pearFigure: number;
  bodybuilderSize: number;
  isValid: boolean;
  warnings: string[];
}

const DURATION_MULTIPLIERS: Record<ProjectionDuration, number> = {
  '3_months': 0.25,
  '6_months': 0.5,
  '1_year': 1.0,
  '3_years': 2.5,
};

/**
 * Hook pour calculer les projections morphologiques basées sur nutrition, sport et durée
 * Utilise uniquement 2 clés de forme: pearFigure (masse grasse) et bodybuilderSize (masse musculaire)
 */
export function useProjectionCalculator(
  baseMorphData: Record<string, number>,
  gender: 'male' | 'female'
) {
  const { getMorphValueRange } = useMorphologyMapping();

  const calculateProjection = useMemo(() => {
    return (params: ProjectionParams): ProjectionResult => {
      logger.debug('PROJECTION_CALCULATOR', 'Computing projection', {
        params,
        gender,
        philosophy: 'projection_calculation_start'
      });

      const warnings: string[] = [];

      // Récupérer les ranges pour les 2 clés morphologiques
      const pearFigureRange = getMorphValueRange('pearFigure', gender);
      const bodybuilderSizeRange = getMorphValueRange('bodybuilderSize', gender);

      if (!pearFigureRange || !bodybuilderSizeRange) {
        logger.error('PROJECTION_CALCULATOR', 'Missing morph ranges', {
          hasPearFigureRange: !!pearFigureRange,
          hasBodybuilderSizeRange: !!bodybuilderSizeRange
        });
        return {
          pearFigure: baseMorphData.pearFigure || 0,
          bodybuilderSize: baseMorphData.bodybuilderSize || 0,
          isValid: false,
          warnings: ['Impossible de calculer la projection : données manquantes']
        };
      }

      // Valeurs de base actuelles
      const basePearFigure = baseMorphData.pearFigure || 0;
      const baseBodybuilderSize = baseMorphData.bodybuilderSize || 0;

      // Multiplicateur temporel (plus c'est long, plus l'effet est prononcé)
      const timeFactor = DURATION_MULTIPLIERS[params.duration];

      /**
       * CALCUL DE L'ÉVOLUTION DE LA MASSE GRASSE (pearFigure)
       *
       * Logique:
       * - Qualité nutritionnelle 1-2: Mauvaise nutrition → augmentation de la masse grasse
       * - Qualité nutritionnelle 3: Neutre → maintien
       * - Qualité nutritionnelle 4-5: Bonne nutrition → diminution de la masse grasse
       * - L'intensité sportive amplifie l'effet (plus de sport = plus de perte)
       */
      const nutritionImpact = (params.nutritionQuality - 3) * -0.3; // Range: [-0.6, 0.6]
      const sportBurnImpact = (params.sportIntensity - 1) * -0.15; // Range: [0, -0.6]
      const totalFatChange = (nutritionImpact + sportBurnImpact) * timeFactor;

      let projectedPearFigure = basePearFigure + totalFatChange;

      /**
       * CALCUL DE L'ÉVOLUTION DE LA MASSE MUSCULAIRE (bodybuilderSize)
       *
       * Logique:
       * - Intensité sportive 1-2: Peu de sport → atrophie musculaire légère
       * - Intensité sportive 3: Modéré → maintien
       * - Intensité sportive 4-5: Sport intense → développement musculaire
       * - La qualité nutritionnelle amplifie l'effet (bonne nutrition = meilleure récupération)
       */
      const sportGainImpact = (params.sportIntensity - 3) * 0.25; // Range: [-0.5, 0.5]
      const nutritionSupportImpact = (params.nutritionQuality - 3) * 0.1; // Range: [-0.2, 0.2]
      const totalMuscleChange = (sportGainImpact + nutritionSupportImpact) * timeFactor;

      let projectedBodybuilderSize = baseBodybuilderSize + totalMuscleChange;

      /**
       * CLAMPING: S'assurer que les valeurs restent dans les ranges autorisés
       */
      const originalPearFigure = projectedPearFigure;
      const originalBodybuilderSize = projectedBodybuilderSize;

      projectedPearFigure = Math.max(
        pearFigureRange.min,
        Math.min(pearFigureRange.max, projectedPearFigure)
      );

      projectedBodybuilderSize = Math.max(
        bodybuilderSizeRange.min,
        Math.min(bodybuilderSizeRange.max, projectedBodybuilderSize)
      );

      // Warnings si on a atteint les limites
      if (originalPearFigure !== projectedPearFigure) {
        if (projectedPearFigure === pearFigureRange.max) {
          warnings.push('Limite maximale de masse grasse atteinte');
        } else if (projectedPearFigure === pearFigureRange.min) {
          warnings.push('Limite minimale de masse grasse atteinte');
        }
      }

      if (originalBodybuilderSize !== projectedBodybuilderSize) {
        if (projectedBodybuilderSize === bodybuilderSizeRange.max) {
          warnings.push('Limite maximale de masse musculaire atteinte');
        } else if (projectedBodybuilderSize === bodybuilderSizeRange.min) {
          warnings.push('Limite minimale de masse musculaire atteinte');
        }
      }

      /**
       * VALIDATION INTER-MORPHS
       * Éviter des combinaisons extrêmes irréalistes
       */
      const combinedExtreme = Math.abs(projectedPearFigure) + Math.abs(projectedBodybuilderSize);
      const maxCombinedExtreme = gender === 'male' ? 3.5 : 3.0;

      if (combinedExtreme > maxCombinedExtreme) {
        warnings.push('Combinaison morphologique extrême détectée, résultats ajustés');

        // Réduire proportionnellement les deux valeurs
        const reductionFactor = maxCombinedExtreme / combinedExtreme;
        projectedPearFigure *= reductionFactor;
        projectedBodybuilderSize *= reductionFactor;
      }

      logger.info('PROJECTION_CALCULATOR', 'Projection computed', {
        basePearFigure: basePearFigure.toFixed(3),
        projectedPearFigure: projectedPearFigure.toFixed(3),
        fatChange: totalFatChange.toFixed(3),
        baseBodybuilderSize: baseBodybuilderSize.toFixed(3),
        projectedBodybuilderSize: projectedBodybuilderSize.toFixed(3),
        muscleChange: totalMuscleChange.toFixed(3),
        timeFactor,
        warningsCount: warnings.length,
        philosophy: 'projection_calculation_complete'
      });

      return {
        pearFigure: Number(projectedPearFigure.toFixed(3)),
        bodybuilderSize: Number(projectedBodybuilderSize.toFixed(3)),
        isValid: true,
        warnings
      };
    };
  }, [baseMorphData, gender, getMorphValueRange]);

  return { calculateProjection };
}
