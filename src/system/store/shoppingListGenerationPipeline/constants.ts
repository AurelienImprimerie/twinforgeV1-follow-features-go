/**
 * Shopping List Generation Pipeline Constants
 */

import { ShoppingListPipelineStep } from './types';

export const SHOPPING_LIST_GENERATION_STEPS: ShoppingListPipelineStep[] = [
  {
    id: 'configuration',
    label: 'Configuration',
    description: 'Choisissez votre plan de repas et vos préférences'
  },
  {
    id: 'generating',
    label: 'Génération',
    description: 'Création de votre liste de courses personnalisée'
  },
  {
    id: 'validation',
    label: 'Validation',
    description: 'Vérifiez et sauvegardez votre liste'
  }
];

export const LOADING_MESSAGES = {
  generating: [
    {
      title: 'Analyse du plan de repas...',
      subtitle: 'Examen détaillé de vos repas planifiés'
    },
    {
      title: 'Calcul des quantités nécessaires...',
      subtitle: 'Adaptation selon vos préférences alimentaires'
    },
    {
      title: 'Génération de la liste intelligente...',
      subtitle: 'Optimisation personnalisée en cours'
    },
    {
      title: 'Optimisation des catégories...',
      subtitle: 'Organisation par rayons de magasin'
    },
    {
      title: 'Ajout de suggestions personnalisées...',
      subtitle: 'Conseils personnalisés basés sur votre profil'
    },
    {
      title: 'Estimation budgétaire en cours...',
      subtitle: 'Calcul des coûts selon votre région'
    }
  ],
  saving: [
    {
      title: 'Sauvegarde en cours...',
      subtitle: 'Enregistrement de votre liste de courses'
    }
  ]
};

// DOM-TOM price coefficients based on INSEE 2022 official data
// Source: https://www.insee.fr/fr/statistiques/7648939
export const REGION_PRICE_COEFFICIENTS: Record<string, number> = {
  'FR': 1.00,        // France métropolitaine
  'GP': 1.42,        // Guadeloupe (+42%)
  'MQ': 1.40,        // Martinique (+40%)
  'GF': 1.39,        // Guyane (+39%)
  'RE': 1.37,        // Réunion (+37%)
  'YT': 1.30,        // Mayotte (+30%)
  'NC': 1.30,        // Nouvelle-Calédonie (estimation)
  'PF': 1.35,        // Polynésie française (estimation)
  'PM': 1.25,        // Saint-Pierre-et-Miquelon (estimation)
  'BL': 1.35,        // Saint-Barthélemy (estimation)
  'MF': 1.35,        // Saint-Martin (estimation)
  'WF': 1.30         // Wallis-et-Futuna (estimation)
};

export const REGION_NAMES: Record<string, string> = {
  'FR': 'France métropolitaine',
  'GP': 'Guadeloupe',
  'MQ': 'Martinique',
  'GF': 'Guyane',
  'RE': 'Réunion',
  'YT': 'Mayotte',
  'NC': 'Nouvelle-Calédonie',
  'PF': 'Polynésie française',
  'PM': 'Saint-Pierre-et-Miquelon',
  'BL': 'Saint-Barthélemy',
  'MF': 'Saint-Martin',
  'WF': 'Wallis-et-Futuna'
};
