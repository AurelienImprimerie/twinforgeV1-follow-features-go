import type { GuideContent } from './types';

export const dashboardGuide: GuideContent = {
  page: 'dashboard',
  title: 'Guide du Dashboard',
  description: 'Découvrez comment utiliser votre tableau de bord',
  sections: [
    {
      id: 'twingame',
      title: 'Cœur - Gamification',
      description: 'Transformez chaque action en progression',
      color: '#F7931E',
      icon: 'Hammer',
      keyPoints: [
        'Gagnez des points pour chaque action de suivi',
        'Montez en niveau et débloquez de nouveaux titres',
        'Consultez vos prédictions de poids et niveau',
        'Plus vous utilisez l\'app, plus vite vous atteignez votre objectif'
      ],
      steps: [
        {
          title: 'Comprendre le système de points',
          description: 'Chaque action que vous effectuez dans l\'application vous rapporte des points d\'expérience . Logger un repas, enregistrer une séance d\'entraînement, mettre à jour votre poids, ou compléter votre profil contribue à votre progression.',
          icon: 'Sparkles'
        },
        {
          title: 'Suivre votre niveau actuel',
          description: 'Votre niveau reflète votre engagement et votre régularité. Chaque niveau débloqué vous attribue un nouveau titre de Forgeron, symbolisant votre maîtrise croissante de votre transformation.',
          icon: 'TrendingUp'
        },
        {
          title: 'Consulter vos prédictions',
          description: 'Le système analyse vos données et prédit votre évolution future : poids estimé, niveau projeté, et date d\'atteinte de vos objectifs. Ces prédictions s\'affinent avec le temps et la régularité de vos entrées.',
          icon: 'Rocket'
        },
        {
          title: 'Activer les bonus quotidiens',
          description: 'Complétez toutes vos actions quotidiennes (repas, poids, activité) pour déclencher des bonus de points. Les séries de jours consécutifs augmentent vos récompenses et accélèrent votre progression.',
          icon: 'Gift'
        }
      ],
      tips: [
        'Enregistrez votre poids tous les matins à jeun pour une cohérence optimale',
        'Ne sautez pas de jours : la régularité est la clé de prédictions précises',
        'Les actions bonus apparaissent dynamiquement selon votre contexte',
        'Utilisez le système de partage pour gagner des points supplémentaires',
        'Consultez votre prédiction hebdomadaire pour ajuster votre stratégie'
      ],
      faq: [
        {
          question: 'Comment gagner plus de points rapidement ?',
          answer: 'La méthode la plus efficace est de maintenir une routine quotidienne complète : enregistrer tous vos repas, logger vos activités, mettre à jour votre poids, et compléter les actions suggérées. Les bonus de série multiplient vos gains.'
        },
        {
          question: 'Que signifient les titres de Forgeron ?',
          answer: 'Les titres représentent votre progression : Apprenti, Compagnon, Maître Forgeron, etc. Chaque titre reflète votre expérience et votre maîtrise des outils de transformation. Il n\'y a pas de limite de niveau.'
        },
        {
          question: 'Les prédictions sont-elles fiables ?',
          answer: 'La précision des prédictions augmente avec la quantité et la régularité de vos données. Après 2 semaines de suivi complet, les prédictions deviennent très fiables et s\'ajustent automatiquement selon vos résultats réels.'
        },
        {
          question: 'Que se passe-t-il si je saute des jours ?',
          answer: 'Le système détecte les absences et propose un système de réconciliation : vous pouvez rattraper les données manquantes pour conserver vos séries de bonus. Cependant, il est toujours préférable de maintenir une routine régulière.'
        }
      ],
      relatedActions: [
        {
          label: 'Scanner un repas',
          description: 'Gagnez des points en enregistrant vos repas quotidiens'
        },
        {
          label: 'Logger une activité',
          description: 'Enregistrez vos entraînements et activités physiques'
        },
        {
          label: 'Mettre à jour votre poids',
          description: 'Suivez votre évolution pondérale régulièrement'
        }
      ]
    },
    {
      id: 'suivi',
      title: 'Suivi - Bilan Énergétique',
      description: 'Suivez votre déficit calorique en temps réel',
      color: '#F97316',
      icon: 'Activity',
      keyPoints: [
        'Visualisez votre balance calorique du jour',
        'Scanner vos repas et logger vos activités sont ESSENTIELS',
        'Le système calcule automatiquement votre métabolisme'
      ],
      steps: [
        {
          title: 'Comprendre votre métabolisme',
          description: 'Le système calcule automatiquement votre TDEE (dépense énergétique totale quotidienne) en fonction de votre âge, sexe, poids, taille, et niveau d\'activité. Ce calcul inclut votre métabolisme de base, l\'effet thermique des aliments, et votre activité physique.',
          icon: 'Flame'
        },
        {
          title: 'Suivre vos calories entrantes',
          description: 'Utilisez le scanner de repas pour enregistrer facilement vos aliments. Le système reconnaît automatiquement les produits et calcule les calories, macros, et nutriments. Plus vous êtes précis, plus votre suivi est efficace.',
          icon: 'Utensils'
        },
        {
          title: 'Logger vos dépenses caloriques',
          description: 'Enregistrez vos activités et entraînements pour comptabiliser vos dépenses. Le système intègre les données de vos objets connectés si vous en avez, sinon il estime intelligemment selon votre activité déclarée.',
          icon: 'Activity'
        },
        {
          title: 'Interpréter votre balance',
          description: 'La balance calorique affiche la différence entre vos entrées et sorties. Un déficit (négatif) favorise la perte de poids, un surplus (positif) la prise. Le système vous guide avec des alertes de sécurité si le déficit est trop important.',
          icon: 'Scale'
        }
      ],
      tips: [
        'Scannez vos repas immédiatement après les avoir préparés ou achetés',
        'N\'oubliez pas les collations et boissons : tout compte !',
        'Vérifiez les portions suggérées par le scanner pour plus de précision',
        'Un déficit de 300-500 kcal/jour est optimal pour une perte durable',
        'Consultez la tendance hebdomadaire plutôt que les variations quotidiennes'
      ],
      faq: [
        {
          question: 'Mon métabolisme est-il calculé correctement ?',
          answer: 'Le calcul utilise les formules scientifiques les plus récentes (Mifflin-St Jeor pour le métabolisme de base) et s\'ajuste selon vos données réelles. Après quelques semaines, le système affine automatiquement le calcul selon votre évolution de poids.'
        },
        {
          question: 'Dois-je vraiment tout scanner ?',
          answer: 'Oui ! La précision de votre bilan dépend de l\'exhaustivité de vos entrées. Les petits oublis s\'accumulent et faussent votre déficit réel. Prenez l\'habitude de tout enregistrer, même les petites collations.'
        },
        {
          question: 'Comment sont calculées les dépenses d\'activité ?',
          answer: 'Si vous avez une montre connectée, les données sont synchronisées automatiquement. Sinon, le système utilise des tables MET (Metabolic Equivalent of Task) scientifiquement validées pour estimer vos dépenses selon l\'activité et sa durée.'
        },
        {
          question: 'Que signifie l\'alerte de sécurité ?',
          answer: 'Si votre déficit dépasse -1000 kcal/jour, le système vous alerte pour prévenir les risques de fatigue, perte musculaire, ou ralentissement métabolique. Il est important de maintenir un déficit raisonnable pour une transformation durable.'
        }
      ],
      relatedActions: [
        {
          label: 'Scanner un repas',
          description: 'Enregistrez vos apports caloriques facilement'
        },
        {
          label: 'Logger une activité',
          description: 'Comptabilisez vos dépenses énergétiques'
        },
        {
          label: 'Voir les tendances',
          description: 'Analysez votre évolution sur 7, 14 ou 30 jours'
        }
      ]
    },
    {
      id: 'records',
      title: 'Records - Performances',
      description: 'Partagez vos meilleures performances',
      color: '#EC4899',
      icon: 'Award',
      keyPoints: [
        'Consultez vos records personnels',
        'Partagez vos séances et transformations',
        'Visualisez votre évolution'
      ],
      steps: [
        {
          title: 'Consulter vos records personnels',
          description: 'Le système détecte automatiquement vos meilleures performances par exercice et discipline. Vos records sont classés par catégorie : force, endurance, calisthenics, fonctionnel. Chaque record est daté et contextualisé.',
          icon: 'Trophy'
        },
        {
          title: 'Visualiser vos transformations',
          description: 'Accédez à vos records de transformation corporelle : perte de poids maximale sur différentes périodes, évolution des mensurations, progression de la composition corporelle. Les graphiques montrent votre parcours complet.',
          icon: 'TrendingUp'
        },
        {
          title: 'Générer des cartes de partage',
          description: 'Créez automatiquement des visuels professionnels de vos records et séances. Chaque carte inclut vos statistiques, graphiques de progression, et éléments de branding. Plusieurs templates sont disponibles selon le type de performance.',
          icon: 'Image'
        },
        {
          title: 'Partager vos réussites',
          description: 'Partagez vos cartes sur les réseaux sociaux ou avec votre coach. Chaque partage vous rapporte des points bonus et inspire la communauté. Vous pouvez choisir de rendre vos records publics ou privés.',
          icon: 'Share2'
        }
      ],
      tips: [
        'Les records d\'exercice nécessitent au moins 2 séances pour être validés',
        'Vos transformations corporelles se calculent sur minimum 7 jours d\'écart',
        'Les cartes générées sont optimisées pour Instagram, Facebook et Twitter',
        'Gagnez 50 bonus de points à chaque partage de record ou séance',
        'Téléchargez vos cartes en haute résolution pour les imprimer'
      ],
      faq: [
        {
          question: 'Comment un record est-il validé ?',
          answer: 'Un record est automatiquement détecté lorsque vous dépassez votre meilleure performance précédente sur un exercice ou une métrique. Le système vérifie la cohérence des données et peut demander confirmation pour les progressions exceptionnelles.'
        },
        {
          question: 'Puis-je modifier ou supprimer un record ?',
          answer: 'Vous pouvez supprimer un record erroné depuis l\'historique de la séance concernée. Les records recalculent automatiquement. Cependant, vous ne pouvez pas modifier un record directement : il faut corriger la séance source.'
        },
        {
          question: 'Mes records sont-ils comparés aux autres utilisateurs ?',
          answer: 'Par défaut, vos records restent privés. Si vous activez la participation au classement, vos records peuvent être comparés anonymement aux autres membres de même profil (âge, sexe, poids). Vous gardez le contrôle total sur la visibilité.'
        },
        {
          question: 'Comment fonctionnent les cartes de transformation ?',
          answer: 'Les cartes compilent automatiquement vos données sur la période choisie : poids, mensurations, photos de progression si disponibles, statistiques clés. Elles sont générées en temps réel et s\'actualisent avec vos dernières données.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir tous mes records',
          description: 'Accédez à l\'historique complet de vos performances'
        },
        {
          label: 'Générer une carte',
          description: 'Créez un visuel professionnel de vos progrès'
        },
        {
          label: 'Configurer le partage',
          description: 'Gérez la visibilité de vos records'
        }
      ]
    },
    {
      id: 'classement',
      title: 'Classement - Compétition',
      description: 'Comparez votre progression',
      color: '#8B5CF6',
      icon: 'Trophy',
      keyPoints: [
        'Participation automatique au classement',
        'Comparez-vous aux autres membres',
        'Montez dans le classement global'
      ],
      steps: [
        {
          title: 'Comprendre le système de classement',
          description: 'Le classement global classe tous les membres actifs selon leur niveau, points, et progression. Le classement est équitable : il compare des profils similaires (âge, sexe, objectif) pour garantir une compétition juste et motivante.',
          icon: 'BarChart3'
        },
        {
          title: 'Suivre votre position',
          description: 'Votre position dans le classement s\'affiche en temps réel. Vous voyez les membres juste au-dessus et en-dessous de vous pour visualiser l\'écart. Des badges spéciaux récompensent les Top 10, Top 100, et les progressions remarquables.',
          icon: 'Medal'
        },
        {
          title: 'Analyser les stratégies gagnantes',
          description: 'Consultez les profils publics des meilleurs pour comprendre leurs routines. Le classement met en avant les membres exemplaires qui maintiennent régularité, équilibre nutrition-entraînement, et progression mesurée.',
          icon: 'Target'
        },
        {
          title: 'Participer aux défis hebdomadaires',
          description: 'Des défis communautaires sont lancés régulièrement : séries de jours parfaits, objectifs collectifs, thématiques mensuelles. Participer augmente vos chances de grimper rapidement et crée une émulation positive.',
          icon: 'Zap'
        }
      ],
      tips: [
        'Le classement se réinitialise chaque mois pour offrir de nouvelles opportunités',
        'La régularité compte plus que l\'intensité : 30 min/jour > 3h le weekend',
        'Complétez votre profil à 100% pour débloquer le classement avancé',
        'Les absences sont pénalisées : maintenez votre série de jours actifs',
        'Vous pouvez vous désinscrire du classement à tout moment depuis les paramètres'
      ],
      faq: [
        {
          question: 'Comment est calculé le classement ?',
          answer: 'Le classement combine plusieurs facteurs : niveau total (40%), XP gagnés sur la période (30%), régularité des actions (20%), et progression vers l\'objectif (10%). Cette formule valorise l\'engagement global plutôt qu\'une seule métrique.'
        },
        {
          question: 'Mon classement est-il public ?',
          answer: 'Par défaut, vous participez au classement mais votre profil reste privé. Vous apparaissez sous un pseudonyme généré. Vous pouvez activer le profil public pour partager vos statistiques, ou vous désinscrire complètement du classement.'
        },
        {
          question: 'Y a-t-il des récompenses pour les meilleurs classés ?',
          answer: 'Les Top 10 mensuels reçoivent des badges permanents sur leur profil. Les Top 3 débloquent des tokens IA bonus et des fonctionnalités exclusives pour le mois suivant. Tout le monde peut gagner, le classement se réinitialise mensuellement.'
        },
        {
          question: 'Comment remonter rapidement dans le classement ?',
          answer: 'La clé est la régularité : complétez toutes vos actions quotidiennes sans exception. Participez aux défis communautaires qui offrent des multiplicateurs de points. Partagez vos performances pour gagner des bonus. La progression est exponentielle avec la constance.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir le classement complet',
          description: 'Consultez votre position et les Top performers'
        },
        {
          label: 'Rejoindre un défi',
          description: 'Participez aux défis communautaires actifs'
        },
        {
          label: 'Configurer la visibilité',
          description: 'Gérez votre profil public et participation'
        }
      ]
    }
  ]
};
