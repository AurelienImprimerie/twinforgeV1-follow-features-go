import logger from '@/lib/utils/logger';

export interface WeightValidationResult {
  isValid: boolean;
  severity: 'safe' | 'warning' | 'danger';
  warnings: string[];
  changePercentage: number;
  estimatedBodyFat?: number;
  isExtreme: boolean;
  allowSubmit: boolean;
}

type Objective = 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance' | null;

class WeightValidationService {
  validateWeightChange(
    currentWeight: number,
    newWeight: number,
    previousWeight: number | null,
    lastUpdateDate: Date | null,
    objective: Objective
  ): WeightValidationResult {
    const weightDelta = newWeight - currentWeight;
    const changePercentage = (weightDelta / currentWeight) * 100;
    const warnings: string[] = [];
    let severity: 'safe' | 'warning' | 'danger' = 'safe';
    let isExtreme = false;

    const daysSinceLastUpdate = lastUpdateDate
      ? Math.floor((Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (Math.abs(changePercentage) > 10) {
      isExtreme = true;
      severity = 'danger';
      warnings.push(
        `Changement extrême de ${Math.abs(changePercentage).toFixed(1)}%. Veuillez vérifier votre saisie.`
      );
    } else if (Math.abs(changePercentage) > 5) {
      isExtreme = true;
      severity = 'warning';
      warnings.push(
        `Changement important de ${Math.abs(changePercentage).toFixed(1)}% en ${daysSinceLastUpdate} jour(s).`
      );
    }

    if (daysSinceLastUpdate > 0) {
      const dailyChangeRate = Math.abs(weightDelta) / daysSinceLastUpdate;
      if (dailyChangeRate > 0.3) {
        severity = severity === 'danger' ? 'danger' : 'warning';
        warnings.push(
          `Taux de changement élevé: ${dailyChangeRate.toFixed(2)} kg/jour. Le taux recommandé est de 0.5-1 kg/semaine.`
        );
      }
    }

    if (objective) {
      if (objective === 'fat_loss' && weightDelta > 0) {
        warnings.push(
          'Vous êtes en objectif de perte de poids, mais votre poids a augmenté. Cela peut être normal (variation hydrique, masse musculaire).'
        );
      } else if (objective === 'muscle_gain' && weightDelta < 0) {
        warnings.push(
          'Vous êtes en objectif de prise de muscle, mais votre poids a diminué. Vérifiez votre apport calorique.'
        );
      }
    }

    const bmi = newWeight / Math.pow(1.7, 2);
    if (bmi < 16) {
      severity = 'danger';
      warnings.push('Ce poids peut être dans une zone dangereuse. Consultez un professionnel de santé.');
    } else if (bmi < 18.5) {
      severity = severity === 'danger' ? 'danger' : 'warning';
      warnings.push('Ce poids est en dessous de la zone recommandée.');
    } else if (bmi > 35) {
      severity = severity === 'danger' ? 'danger' : 'warning';
      warnings.push('Ce poids est au-dessus de la zone recommandée. Considérez un suivi médical.');
    }

    const isValid = severity === 'safe';
    const allowSubmit = severity !== 'danger';

    logger.info('WEIGHT_VALIDATION', 'Weight change validated', {
      currentWeight,
      newWeight,
      changePercentage: changePercentage.toFixed(2),
      severity,
      isValid,
      allowSubmit,
      warningsCount: warnings.length
    });

    return {
      isValid,
      severity,
      warnings,
      changePercentage,
      isExtreme,
      allowSubmit
    };
  }
}

export const weightValidationService = new WeightValidationService();
