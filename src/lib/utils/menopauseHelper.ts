/**
 * Menopause Helper
 * Utility functions for menopause phase calculation and recommendations
 */

import type {
  ReproductiveStatus,
  PerimenopauseStage,
  MenopausePhaseData,
  MenopauseRecommendations,
} from '../../domain/menopause';

/**
 * Calculate menopause phase data from tracking information
 */
export function calculateMenopausePhase(
  status: ReproductiveStatus,
  lastPeriodDate: string | null,
  menopauseConfirmationDate: string | null,
  perimenopauseStage: PerimenopauseStage | null
): MenopausePhaseData | null {
  if (!status) return null;

  const today = new Date();
  let daysSinceLastPeriod: number | null = null;
  let daysUntilMenopauseConfirmation: number | null = null;

  if (lastPeriodDate) {
    const lastPeriod = new Date(lastPeriodDate);
    daysSinceLastPeriod = Math.floor(
      (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (status === 'perimenopause' && daysSinceLastPeriod < 365) {
      daysUntilMenopauseConfirmation = 365 - daysSinceLastPeriod;
    }
  }

  let energyLevel: 'low' | 'moderate' | 'high';
  let metabolicRate: 'reduced' | 'normal';
  let phaseDescription: string;
  let isInTransition: boolean;

  switch (status) {
    case 'menstruating':
      energyLevel = 'high';
      metabolicRate = 'normal';
      phaseDescription = 'Cycle menstruel actif';
      isInTransition = false;
      break;

    case 'perimenopause':
      energyLevel = perimenopauseStage === 'early' ? 'moderate' : 'low';
      metabolicRate = 'reduced';
      phaseDescription =
        perimenopauseStage === 'early'
          ? 'Périménopause précoce - Cycles irréguliers'
          : 'Périménopause tardive - Symptômes plus marqués';
      isInTransition = true;
      break;

    case 'menopause':
      energyLevel = 'low';
      metabolicRate = 'reduced';
      phaseDescription = 'Transition vers la ménopause - Stabilisation hormonale';
      isInTransition = true;
      break;

    case 'postmenopause':
      energyLevel = 'moderate';
      metabolicRate = 'reduced';
      phaseDescription = 'Post-ménopause - Hormones stabilisées';
      isInTransition = false;
      break;
  }

  return {
    status,
    stage: perimenopauseStage,
    daysSinceLastPeriod,
    daysUntilMenopauseConfirmation,
    isInTransition,
    phaseDescription,
    energyLevel,
    metabolicRate,
  };
}

/**
 * Get status emoji for UI display
 */
export function getStatusEmoji(status: ReproductiveStatus): string {
  const emojiMap: Record<ReproductiveStatus, string> = {
    menstruating: '🌸',
    perimenopause: '🌅',
    menopause: '🌙',
    postmenopause: '🌟',
  };
  return emojiMap[status];
}

/**
 * Get status color for UI styling
 */
export function getStatusColor(status: ReproductiveStatus): string {
  const colorMap: Record<ReproductiveStatus, string> = {
    menstruating: '#EC4899',
    perimenopause: '#F59E0B',
    menopause: '#8B5CF6',
    postmenopause: '#10B981',
  };
  return colorMap[status];
}

/**
 * Get nutrition recommendations for menopause status
 */
export function getNutritionRecommendations(
  status: ReproductiveStatus
): string[] {
  const recommendations: Record<ReproductiveStatus, string[]> = {
    menstruating: [
      'Alimentation équilibrée standard',
      'Fer et vitamine C pendant les règles',
      'Hydratation régulière',
    ],
    perimenopause: [
      'Augmenter protéines: 25-30g par repas pour préserver masse musculaire',
      'Calcium (1200mg/jour): produits laitiers, légumes verts, tofu',
      'Vitamine D (800-1000 UI/jour): poissons gras, œufs, suppléments',
      'Oméga-3 anti-inflammatoires: saumon, sardines, noix, graines de lin',
      'Phytoestrogènes: soja, graines de lin, légumineuses',
      'Limiter caféine et alcool (peuvent aggraver bouffées de chaleur)',
      'Éviter aliments épicés si bouffées de chaleur',
      'Magnésium: amandes, épinards, chocolat noir (sommeil et humeur)',
    ],
    menopause: [
      'Protéines élevées: 1,2-1,5g/kg pour maintien musculaire',
      'Calcium et vitamine D prioritaires (risque ostéoporose)',
      'Fibres solubles: avoine, légumineuses (santé cardiovasculaire)',
      'Limiter sel (hypertension et rétention d\'eau)',
      'Antioxydants: baies, légumes colorés (santé cellulaire)',
      'Graisses saines: avocat, huile d\'olive (santé hormonale)',
    ],
    postmenopause: [
      'Maintenir apport protéique élevé (1,2-1,5g/kg)',
      'Calcium et vitamine D continus (densité osseuse)',
      'Focus santé cardiovasculaire: oméga-3, fibres, légumes',
      'Limiter sucres raffinés (risque diabète type 2)',
      'Hydratation accrue (sécheresse des muqueuses)',
      'Aliments riches en vitamine K: légumes verts feuillus (os)',
    ],
  };
  return recommendations[status];
}

/**
 * Get exercise recommendations for menopause status
 */
export function getExerciseRecommendations(status: ReproductiveStatus): string[] {
  const recommendations: Record<ReproductiveStatus, string[]> = {
    menstruating: [
      'Entraînement standard adapté au cycle',
      'Force, cardio et flexibilité équilibrés',
    ],
    perimenopause: [
      'PRIORITÉ: Musculation 3x/semaine minimum (préservation masse musculaire)',
      'Exercices de résistance avec poids: squats, deadlifts, presses',
      'Cardio modéré 150min/semaine: marche rapide, vélo, natation',
      'HIIT 1-2x/semaine (métabolisme et santé cardiovasculaire)',
      'Yoga ou Pilates pour flexibilité et stress',
      'Exercices d\'impact modéré pour densité osseuse',
      'Temps de récupération: 48h entre sessions de force',
    ],
    menopause: [
      'Musculation 3-4x/semaine (essentiel contre sarcopénie)',
      'Focus exercices composés: développe plusieurs groupes musculaires',
      'Entraînement en résistance progressive',
      'Cardio: 30-45min, 4-5x/semaine (santé cardiaque)',
      'Exercices d\'équilibre (prévention chutes)',
      'Stretching quotidien (mobilité articulaire)',
      'Écouter son corps: plus de repos si fatigue',
    ],
    postmenopause: [
      'Musculation continue 3x/semaine (maintien masse musculaire)',
      'Charge adaptée mais régulière',
      'Marche quotidienne 30min (santé globale)',
      'Exercices portés: danse, randonnée (densité osseuse)',
      'Tai-chi ou yoga (équilibre et prévention chutes)',
      'Natation ou aquagym (articulations)',
    ],
  };
  return recommendations[status];
}

/**
 * Get fasting recommendations for menopause status
 */
export function getFastingRecommendations(status: ReproductiveStatus): string[] {
  const recommendations: Record<ReproductiveStatus, string[]> = {
    menstruating: [
      'Jeûne intermittent standard (16:8) bien toléré',
      'Adaptation selon phase du cycle',
    ],
    perimenopause: [
      'Fenêtre de jeûne réduite: 14-16h maximum recommandé',
      'Éviter jeûnes prolongés (stress hormonal supplémentaire)',
      'Flexibilité importante: écouter les signaux du corps',
      'Breaking du jeûne OK si hypoglycémie ou fatigue intense',
      'Meilleur timing: débuter jeûne après dîner',
      'Hydratation accrue pendant le jeûne',
      'Ne pas forcer si bouffées de chaleur ou troubles sommeil',
    ],
    menopause: [
      'Jeûne intermittent modéré: 12-14h recommandé',
      'Priorité à la régularité des repas',
      'Éviter OMAD ou jeûnes > 16h (stress métabolique)',
      'Focus sur qualité nutritionnelle lors des repas',
      'Protéines à chaque repas (préservation musculaire)',
    ],
    postmenopause: [
      'Jeûne intermittent doux: 12-14h',
      'Stabilité des repas importante',
      'Éviter jeûnes prolongés (risque perte musculaire)',
      'Fenêtre d\'alimentation: 10h-12h idéale',
    ],
  };
  return recommendations[status];
}

/**
 * Get lifestyle recommendations for menopause status
 */
export function getLifestyleRecommendations(status: ReproductiveStatus): string[] {
  const recommendations: Record<ReproductiveStatus, string[]> = {
    menstruating: [
      'Gestion du stress standard',
      'Sommeil régulier 7-9h',
    ],
    perimenopause: [
      'Sommeil prioritaire: viser 7-8h minimum',
      'Environnement frais pour dormir (bouffées de chaleur nocturnes)',
      'Techniques de relaxation: méditation, respiration profonde',
      'Limiter écrans avant coucher (mélatonine)',
      'Couches de vêtements adaptables (thermorégulation)',
      'Suivi médical régulier (tension, cholestérol)',
      'Connexion sociale importante (soutien émotionnel)',
    ],
    menopause: [
      'Routine de sommeil stricte',
      'Gestion du stress: yoga, méditation quotidienne',
      'Suivi médical: densité osseuse, santé cardiovasculaire',
      'Hydratation de la peau (sécheresse)',
      'Lubrifiants si besoin (sécheresse vaginale)',
    ],
    postmenopause: [
      'Dépistages réguliers (cancer, ostéoporose)',
      'Maintien activité sociale',
      'Stimulation cognitive',
      'Check-ups cardiovasculaires annuels',
    ],
  };
  return recommendations[status];
}

/**
 * Get all recommendations bundled together
 */
export function getAllRecommendations(
  status: ReproductiveStatus
): MenopauseRecommendations {
  return {
    nutrition: getNutritionRecommendations(status),
    exercise: getExerciseRecommendations(status),
    fasting: getFastingRecommendations(status),
    lifestyle: getLifestyleRecommendations(status),
  };
}

/**
 * Format menopause data for AI context (used in edge functions)
 */
export function formatMenopauseForAI(data: MenopausePhaseData): string {
  const statusLabels: Record<ReproductiveStatus, string> = {
    menstruating: 'Cycle menstruel actif',
    perimenopause: 'Périménopause',
    menopause: 'Ménopause',
    postmenopause: 'Post-ménopause',
  };

  let context = `
## STATUT REPRODUCTIF

Statut actuel: ${statusLabels[data.status]}
${data.stage ? `Stade: ${data.stage === 'early' ? 'Précoce' : 'Tardif'}` : ''}
${data.daysSinceLastPeriod !== null ? `Jours depuis dernières règles: ${data.daysSinceLastPeriod}` : ''}
${data.daysUntilMenopauseConfirmation !== null ? `Jours jusqu'à confirmation ménopause: ${data.daysUntilMenopauseConfirmation}` : ''}
Niveau d'énergie: ${data.energyLevel}
Métabolisme: ${data.metabolicRate}

${data.phaseDescription}
  `.trim();

  if (data.status !== 'menstruating') {
    const recs = getAllRecommendations(data.status);
    context += `\n\n## RECOMMANDATIONS ADAPTÉES À LA ${statusLabels[data.status].toUpperCase()}\n`;

    context += '\n### Nutrition\n';
    recs.nutrition.forEach((rec) => {
      context += `- ${rec}\n`;
    });

    context += '\n### Exercice\n';
    recs.exercise.forEach((rec) => {
      context += `- ${rec}\n`;
    });

    context += '\n### Jeûne\n';
    recs.fasting.forEach((rec) => {
      context += `- ${rec}\n`;
    });

    context += '\n### Style de vie\n';
    recs.lifestyle.forEach((rec) => {
      context += `- ${rec}\n`;
    });

    context += '\n\nADAPTE tes recommandations en tenant compte de ces spécificités hormonales et métaboliques.';
  }

  return context;
}

/**
 * Determine if transition suggestion should be shown
 */
export function shouldSuggestTransition(
  currentStatus: ReproductiveStatus,
  daysSinceLastPeriod: number | null
): {
  shouldSuggest: boolean;
  suggestedStatus: ReproductiveStatus | null;
  reason: string;
} {
  if (!daysSinceLastPeriod) {
    return { shouldSuggest: false, suggestedStatus: null, reason: '' };
  }

  if (currentStatus === 'menstruating' && daysSinceLastPeriod >= 60) {
    return {
      shouldSuggest: true,
      suggestedStatus: 'perimenopause',
      reason: 'Absence de règles depuis plus de 60 jours',
    };
  }

  if (currentStatus === 'perimenopause' && daysSinceLastPeriod >= 365) {
    return {
      shouldSuggest: true,
      suggestedStatus: 'menopause',
      reason: '12 mois consécutifs sans règles',
    };
  }

  return { shouldSuggest: false, suggestedStatus: null, reason: '' };
}

/**
 * Get symptom label for display
 */
export function getSymptomLabel(symptomKey: string): string {
  const labels: Record<string, string> = {
    hot_flashes_intensity: 'Bouffées de chaleur',
    night_sweats_intensity: 'Sueurs nocturnes',
    sleep_quality: 'Qualité du sommeil',
    mood_changes_intensity: 'Changements d\'humeur',
    vaginal_dryness_intensity: 'Sécheresse vaginale',
    energy_level: 'Niveau d\'énergie',
    brain_fog_intensity: 'Brouillard mental',
    joint_pain_intensity: 'Douleurs articulaires',
    heart_palpitations: 'Palpitations cardiaques',
    weight_gain: 'Prise de poids',
  };
  return labels[symptomKey] || symptomKey;
}

/**
 * Get intensity description
 */
export function getIntensityDescription(intensity: number): string {
  if (intensity <= 2) return 'Léger';
  if (intensity <= 5) return 'Modéré';
  if (intensity <= 7) return 'Important';
  return 'Sévère';
}

/**
 * Calculate average symptom intensity from logs
 */
export function calculateAverageIntensity(
  symptoms: Array<{ [key: string]: number | null }>
): number {
  const intensityFields = [
    'hot_flashes_intensity',
    'night_sweats_intensity',
    'mood_changes_intensity',
    'vaginal_dryness_intensity',
    'brain_fog_intensity',
    'joint_pain_intensity',
  ];

  let total = 0;
  let count = 0;

  symptoms.forEach((symptom) => {
    intensityFields.forEach((field) => {
      const value = symptom[field];
      if (value !== null && value !== undefined) {
        total += value;
        count++;
      }
    });
  });

  return count > 0 ? Math.round(total / count) : 0;
}
