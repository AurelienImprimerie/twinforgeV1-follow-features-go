import type { GuideContent } from './types';

export const activityGuide: GuideContent = {
  page: 'activity',
  title: 'Guide de la Forge Énergétique',
  description: 'Suivez et optimisez vos activités physiques avec l\'analyse IA',
  sections: [
    {
      id: 'pipeline',
      title: 'Pipeline de Logger d\'Activité',
      description: 'Enregistrez vos activités en 3 étapes intelligentes',
      color: '#3B82F6',
      icon: 'Activity',
      keyPoints: [
        'Capturez vos activités par audio ou texte en langage naturel',
        'L\'IA analyse et extrait automatiquement les activités avec calories',
        'Validez et ajustez avant sauvegarde dans votre historique'
      ],
      steps: [
        {
          title: 'Capture de l\'activité',
          description: 'Choisissez votre mode de saisie : enregistrement vocal (naturel et rapide) ou saisie texte (précis et flexible). Décrivez vos activités en langage libre : "J\'ai couru 30 minutes puis fait 20 minutes de pompes et tractions". Le système accepte plusieurs activités dans une seule description.',
          icon: 'Mic'
        },
        {
          title: 'Analyse intelligente',
          description: 'L\'IA transcrit votre audio (si besoin), nettoie le texte, puis extrait chaque activité avec sa durée, son intensité, et calcule les calories brûlées selon votre profil et les tables MET scientifiques. L\'analyse dure 10-20 secondes et affiche une progression immersive.',
          icon: 'Brain'
        },
        {
          title: 'Revue et validation',
          description: 'Vérifiez les activités détectées : durations, intensités, types. Modifiez si nécessaire, ajoutez des activités manuellement, ou supprimez celles qui sont erronées. Les calories se recalculent automatiquement. Validez pour sauvegarder dans votre historique.',
          icon: 'CheckCircle'
        }
      ],
      tips: [
        'Le mode audio est plus rapide : décrivez votre séance immédiatement après l\'effort',
        'Soyez précis sur les durées pour un calcul de calories optimal',
        'L\'IA comprend les descriptions naturelles : "footing", "muscu", "cardio", etc.',
        'Vous pouvez décrire plusieurs activités d\'une traite : "30min course puis 15min abdos"',
        'Le système supporte les accents et créoles, l\'IA nettoie automatiquement',
        'Les calories sont estimées selon VOTRE poids, mettez-le à jour régulièrement'
      ],
      faq: [
        {
          question: 'L\'IA peut-elle se tromper dans l\'analyse ?',
          answer: 'Oui, l\'IA est très performante (85% de précision moyenne) mais pas infaillible. C\'est pourquoi l\'étape de revue est cruciale : vérifiez toujours les activités détectées avant de valider. Vous pouvez corriger toute erreur avant sauvegarde.'
        },
        {
          question: 'Comment l\'IA calcule-t-elle les calories ?',
          answer: 'Le calcul utilise les tables MET (Metabolic Equivalent of Task) scientifiquement validées. Chaque activité a une valeur MET selon son intensité. La formule est : (MET × Poids_kg × Durée_heures) = Calories. C\'est pourquoi votre poids dans le profil est crucial.'
        },
        {
          question: 'Puis-je logger une activité d\'hier ?',
          answer: 'Oui, après la validation, les activités sont enregistrées avec l\'horodatage actuel. Pour une date antérieure, il faudra temporairement ajouter cette fonctionnalité ou logger avec une note précisant la date réelle.'
        },
        {
          question: 'Que faire si le mode audio ne fonctionne pas ?',
          answer: 'Vérifiez que vous avez autorisé l\'accès au micro dans votre navigateur. Si le problème persiste, utilisez le mode texte qui est tout aussi efficace. L\'analyse IA fonctionne identiquement quel que soit le mode de saisie.'
        }
      ],
      relatedActions: [
        {
          label: 'Logger une activité',
          description: 'Enregistrez votre première séance depuis l\'onglet Tracker'
        },
        {
          label: 'Compléter mon profil',
          description: 'Renseignez votre poids pour des calories précises'
        }
      ]
    },
    {
      id: 'tracker',
      title: 'Onglet Tracker',
      description: 'Suivez vos activités et calories du jour',
      color: '#3B82F6',
      icon: 'Calendar',
      keyPoints: [
        'Loggez rapidement une nouvelle activité',
        'Consultez vos métriques quotidiennes en temps réel',
        'Suivez votre progression vers l\'objectif calorique adapté à votre but',
        'Gérez vos activités récentes avec possibilité de suppression'
      ],
      steps: [
        {
          title: 'Utiliser le CTA dynamique',
          description: 'Le bouton principal "Logger une activité" lance la pipeline de capture. Il s\'adapte à votre progression quotidienne avec des messages motivants : "Excellent départ !" si vous avez déjà loggé, "Atteignez votre objectif" si vous êtes proche, etc.',
          icon: 'Zap'
        },
        {
          title: 'Consulter la grille de statistiques',
          description: 'Les 4 cartes affichent : calories brûlées aujourd\'hui, nombre d\'activités, durée totale, et dernière activité enregistrée. Ces métriques se mettent à jour en temps réel à chaque nouvelle activité.',
          icon: 'Grid'
        },
        {
          title: 'Suivre la progression calorique',
          description: 'La carte de progression affiche votre avancement vers l\'objectif quotidien. L\'objectif s\'adapte automatiquement à votre profil : plus élevé pour la perte de poids, modéré pour la recomposition, focus sur la musculation pour la prise de masse.',
          icon: 'TrendingUp'
        },
        {
          title: 'Gérer les activités récentes',
          description: 'La liste affiche vos activités du jour avec type, durée, intensité et calories. Un clic ouvre le détail complet. Vous pouvez supprimer une activité erronée, ce qui recalcule automatiquement vos totaux.',
          icon: 'List'
        }
      ],
      tips: [
        'Loggez vos activités immédiatement après la séance pour ne rien oublier',
        'L\'alerte de complétude du profil vous guide si des champs critiques manquent',
        'Votre objectif calorique quotidien est calculé selon votre niveau d\'activité déclaré',
        'Les statistiques se réinitialisent à minuit selon votre fuseau horaire',
        'Le résumé d\'activité montre les types dominants et l\'intensité moyenne du jour',
        'Les cartes utilisent des codes couleur selon votre objectif (perte, gain, recomp)'
      ],
      faq: [
        {
          question: 'Pourquoi mon objectif calorique semble-t-il bas/élevé ?',
          answer: 'L\'objectif est calculé selon votre profil complet : objectif (perte/gain/recomp), niveau d\'activité déclaré, et métabolisme de base. Pour la perte de poids, l\'objectif inclut un déficit. Pour la prise de masse, un surplus. Vérifiez et ajustez votre profil si nécessaire.'
        },
        {
          question: 'Les calories affichées sont-elles fiables ?',
          answer: 'Oui, elles sont basées sur les tables MET scientifiques et votre poids réel. Cependant, ce sont des estimations : votre métabolisme individuel peut varier. Utilisez les calories comme repère relatif plutôt que comme vérité absolue. La tendance sur plusieurs jours est plus importante.'
        },
        {
          question: 'Puis-je voir mes activités des jours précédents ici ?',
          answer: 'Non, l\'onglet Tracker affiche uniquement le jour actuel pour rester focus sur votre progression quotidienne. Pour consulter l\'historique complet, utilisez l\'onglet Historique qui regroupe toutes vos activités passées.'
        }
      ],
      relatedActions: [
        {
          label: 'Logger une activité',
          description: 'Enregistrez une nouvelle séance d\'entraînement'
        },
        {
          label: 'Voir mes insights',
          description: 'Consultez vos analyses IA dans l\'onglet Insights'
        }
      ]
    },
    {
      id: 'insights',
      title: 'Onglet Insights',
      description: 'Analyses IA de vos patterns d\'activité',
      color: '#F97316',
      icon: 'TrendingUp',
      keyPoints: [
        'Sélectionnez votre période d\'analyse (7, 30 ou 90 jours)',
        'Découvrez vos patterns temporels et préférences d\'activité',
        'Recevez des recommandations personnalisées pour optimiser',
        'Suivez votre régularité et équilibre des intensités'
      ],
      steps: [
        {
          title: 'Choisir la période d\'analyse',
          description: 'Le sélecteur propose 7, 30 ou 90 jours. Chaque période a un seuil minimum d\'activités : 3 pour 7j, 8 pour 30j, 20 pour 90j. Si vous n\'avez pas assez de données, un message contextuel vous guide vers l\'action appropriée (logger plus ou attendre).',
          icon: 'Calendar'
        },
        {
          title: 'Lire le résumé narratif',
          description: 'L\'IA génère un résumé textuel motivant avec les principales observations : votre régularité, vos types d\'activité dominants, votre intensité moyenne, et une évaluation globale de votre pratique sur la période.',
          icon: 'FileText'
        },
        {
          title: 'Explorer les insights structurés',
          description: 'Chaque carte présente un insight spécifique avec type (pattern, trend, recommendation, achievement), priorité (low, medium, high), et une action concrète si applicable. Les insights révèlent vos habitudes : "Vous préférez vous entraîner le matin", "Ajoutez 15min de cardio".',
          icon: 'Lightbulb'
        },
        {
          title: 'Appliquer les recommandations',
          description: 'Les insights actionnables incluent une action suggérée précise. Par exemple : "Équilibrez avec 2 séances cardio/semaine" ou "Augmentez l\'intensité progressivement sur 2 semaines". Ces actions sont personnalisées selon votre objectif et votre historique.',
          icon: 'CheckSquare'
        }
      ],
      tips: [
        'Les insights sont mis en cache 24h côté serveur pour optimiser les coûts IA',
        'Plus vous loggez d\'activités variées, plus les insights sont riches et précis',
        'Les patterns temporels détectent vos créneaux préférés (matin, après-midi, soir)',
        'Un score de régularité >70 indique une excellente discipline',
        'Les warnings ne sont pas des reproches, ce sont des opportunités d\'optimisation',
        'Consultez les insights hebdomadairement pour ajuster votre routine',
        'Les insights 90j donnent une vision stratégique de votre entraînement'
      ],
      faq: [
        {
          question: 'Pourquoi mes insights ne se mettent-ils pas à jour immédiatement ?',
          answer: 'Les insights sont cachés 24h côté serveur. L\'IA régénère automatiquement si vos données changent significativement (+2 activités au-delà du seuil). Cette approche optimise les coûts IA tout en garantissant la fraîcheur quand nécessaire.'
        },
        {
          question: 'Les recommandations sont-elles adaptées à mon objectif ?',
          answer: 'Oui, l\'IA prend en compte votre objectif déclaré (perte, gain, recomp), votre niveau d\'activité, et vos patterns observés. Les recommandations pour une perte de poids privilégieront le cardio, tandis que pour la prise de masse, elles insisteront sur la musculation et l\'intensité.'
        },
        {
          question: 'Comment interpréter un insight de type "pattern" ?',
          answer: 'Un pattern est une observation factuelle de vos habitudes : "Vous vous entraînez principalement le weekend" ou "Vos séances cardio sont plus longues que vos séances de musculation". Ce n\'est ni positif ni négatif, c\'est un constat qui peut révéler des optimisations possibles.'
        },
        {
          question: 'Que faire si un insight ne me correspond pas ?',
          answer: 'Les insights sont des suggestions basées sur des moyennes et meilleures pratiques. Si une recommandation ne colle pas à votre style de vie, contraintes, ou préférences, ignorez-la. L\'IA s\'améliorera avec plus de données et s\'adaptera à VOTRE réalité unique.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir ma progression',
          description: 'Consultez vos graphiques dans l\'onglet Progression'
        },
        {
          label: 'Ajuster mon profil',
          description: 'Optimisez vos préférences d\'entraînement'
        }
      ]
    },
    {
      id: 'progression',
      title: 'Onglet Progression',
      description: 'Visualisez votre évolution avec graphiques avancés',
      color: '#10B981',
      icon: 'BarChart3',
      keyPoints: [
        'Consultez vos statistiques globales sur la période',
        'Visualisez la distribution de vos types d\'activités et intensités',
        'Analysez le heatmap pour identifier vos patterns de régularité',
        'Lisez les insights de performance avec priorités visuelles'
      ],
      steps: [
        {
          title: 'Comprendre les statistiques globales',
          description: 'La carte de stats affiche : nombre total d\'activités, calories totales brûlées, durée totale, calories et durée moyennes par jour, type d\'activité le plus fréquent, intensité moyenne, et score de régularité (0-100 basé sur fréquence et cohérence).',
          icon: 'BarChart2'
        },
        {
          title: 'Lire les graphiques de distribution',
          description: 'Trois graphiques circulaires montrent : 1) répartition par types d\'activité (course, muscu, natation...), 2) répartition par intensités (low, medium, high, very_high), 3) patterns temporels (matin, après-midi, soir). Identifiez vos préférences et déséquilibres.',
          icon: 'PieChart'
        },
        {
          title: 'Analyser le heatmap d\'activité',
          description: 'Le calendrier visuel affiche votre activité quotidienne avec code couleur : gris (rien), jaune (faible), orange (moyen), orange foncé (élevé), rouge (excellent). Repérez vos jours actifs, vos séries, et vos creux d\'activité en un coup d\'œil.',
          icon: 'Calendar'
        },
        {
          title: 'Explorer les insights de performance',
          description: 'Les cartes d\'insights affichent les mêmes données que l\'onglet Insights mais dans un contexte visuel enrichi. Chaque insight inclut une icône de priorité, une couleur thématique, et une action concrète si applicable.',
          icon: 'Award'
        }
      ],
      tips: [
        'Le score de régularité combine fréquence (60%) et cohérence des intensités (40%)',
        'Un déséquilibre majeur dans les types d\'activité peut générer une recommandation',
        'Le heatmap se lit de gauche à droite, ligne par ligne (semaines)',
        'Les stats "jours excellents" comptent les jours avec >500 kcal brûlées',
        'Comparez vos périodes 7j, 30j et 90j pour voir l\'évolution long terme',
        'Les graphiques sont interactifs : survolez pour voir les détails exacts'
      ],
      faq: [
        {
          question: 'Comment est calculé le score de régularité ?',
          answer: 'Le score combine deux facteurs : fréquence d\'activité (60%) et cohérence des intensités (40%). Un score de 80 signifie que vous vous entraînez régulièrement ET avec des intensités équilibrées. Un score bas peut indiquer des trous dans votre planning ou des intensités trop variables.'
        },
        {
          question: 'Que signifie "équilibrer les intensités" ?',
          answer: 'Un entraînement optimal alterne les intensités : 50% medium, 30% high, 15% low, 5% very_high. Trop de high/very_high augmente le risque de surentraînement. Trop de low limite les progrès. L\'IA vous alerte si votre distribution s\'éloigne trop des recommandations.'
        },
        {
          question: 'Pourquoi le heatmap affiche-t-il des cases grises alors que je m\'entraîne ?',
          answer: 'Le heatmap a des seuils : une activité très courte ou très basse intensité peut ne pas "colorer" la case. C\'est normal, le système valorise les séances significatives. Si vous voulez voir toutes vos activités, consultez l\'onglet Historique qui liste tout.'
        },
        {
          question: 'Les graphiques sont-ils exportables ?',
          answer: 'Pas directement pour l\'instant, mais vous pouvez faire des captures d\'écran. Une fonctionnalité d\'export PDF est prévue dans une future mise à jour pour partager vos progressions avec un coach ou sur les réseaux sociaux.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir mes insights',
          description: 'Consultez les recommandations détaillées dans Insights'
        },
        {
          label: 'Consulter l\'historique',
          description: 'Explorez toutes vos activités dans Historique'
        }
      ]
    },
    {
      id: 'history',
      title: 'Onglet Historique',
      description: 'Parcourez et gérez toutes vos activités',
      color: '#8B5CF6',
      icon: 'History',
      keyPoints: [
        'Consultez toutes vos activités enregistrées par jour',
        'Visualisez les totaux quotidiens (calories et durée)',
        'Ouvrez le détail complet d\'une activité dans une modal',
        'Supprimez les activités erronées avec confirmation'
      ],
      steps: [
        {
          title: 'Naviguer dans l\'historique groupé',
          description: 'Les activités sont groupées par jour, de la plus récente à la plus ancienne. Chaque jour affiche : date formatée en français, nombre d\'activités, total de calories brûlées, durée totale. Cliquez sur un jour pour développer et voir les activités individuelles.',
          icon: 'FolderOpen'
        },
        {
          title: 'Consulter le détail d\'une activité',
          description: 'Cliquez sur une activité pour ouvrir la modal de détail. Elle affiche : type précis, durée, intensité, calories calculées, valeur MET utilisée, timestamp exact d\'enregistrement, et notes éventuelles. C\'est utile pour comprendre comment les calories ont été calculées.',
          icon: 'Eye'
        },
        {
          title: 'Supprimer une activité',
          description: 'Si vous avez enregistré une activité par erreur ou avec des données incorrectes, cliquez sur le bouton de suppression dans la modal de détail. Une confirmation est demandée. La suppression est définitive et met à jour tous vos totaux et statistiques.',
          icon: 'Trash2'
        },
        {
          title: 'Utiliser le chargement progressif',
          description: 'Si vous avez beaucoup d\'activités, l\'historique charge par batch de 50. Faites défiler vers le bas pour charger automatiquement les activités plus anciennes. Cette approche garantit des performances optimales même avec des centaines d\'entrées.',
          icon: 'RefreshCw'
        }
      ],
      tips: [
        'Les totaux quotidiens incluent TOUTES les activités du jour, même supprimées puis re-loggées',
        'La suppression d\'une activité recalcule immédiatement vos stats globales',
        'Les activités sont triées par timestamp, pas par ordre de saisie',
        'Vous pouvez voir les activités de n\'importe quel jour passé, sans limite',
        'Le groupement par jour facilite la vision d\'ensemble de votre régularité',
        'Vos données d\'activité restent privées, jamais partagées sans votre accord'
      ],
      faq: [
        {
          question: 'Puis-je modifier une activité après l\'avoir enregistrée ?',
          answer: 'Actuellement, vous ne pouvez que supprimer. La modification n\'est pas disponible pour garantir l\'intégrité des analyses IA et éviter les incohérences. Si vous devez corriger, supprimez l\'activité erronée et re-loggez correctement via la pipeline.'
        },
        {
          question: 'Que se passe-t-il quand je supprime une activité ?',
          answer: 'La suppression est immédiate et définitive. L\'activité disparaît de votre historique, tous vos totaux (quotidiens, hebdo, mensuels) sont recalculés, vos statistiques mises à jour, et les insights IA seront régénérés lors de votre prochaine consultation. Une confirmation est toujours demandée.'
        },
        {
          question: 'L\'historique affiche-t-il les activités connectées (montres) ?',
          answer: 'Si vous avez une montre connectée configurée, ses activités synchronisées apparaissent dans l\'historique avec un badge "wearable". Elles sont traitées exactement comme les activités loggées manuellement et comptent dans toutes vos statistiques.'
        },
        {
          question: 'Combien d\'activités peuvent être stockées ?',
          answer: 'Il n\'y a pas de limite. Votre historique complet est conservé indéfiniment dans votre base de données personnelle. Les performances restent excellentes grâce au chargement progressif et aux optimisations de requêtes.'
        }
      ],
      relatedActions: [
        {
          label: 'Logger une activité',
          description: 'Enregistrez une nouvelle séance depuis le Tracker'
        },
        {
          label: 'Voir ma progression',
          description: 'Consultez vos graphiques dans l\'onglet Progression'
        }
      ]
    }
  ]
};
