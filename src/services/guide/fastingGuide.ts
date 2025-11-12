import type { GuideContent } from './types';

export const fastingGuide: GuideContent = {
  page: 'fasting',
  title: 'Guide de la Forge Temporelle',
  description: 'Maîtrisez le jeûne intermittent avec le suivi intelligent',
  sections: [
    {
      id: 'pipeline',
      title: 'Pipeline de Jeûne',
      description: 'Lancez et suivez vos sessions de jeûne en 3 étapes',
      color: '#F59E0B',
      icon: 'Timer',
      keyPoints: [
        'Choisissez votre protocole de jeûne (16:8, 18:6, 20:4, OMAD ou personnalisé)',
        'Suivez votre session en temps réel avec les phases métaboliques',
        'Finalisez et analysez vos résultats avec des insights IA'
      ],
      steps: [
        {
          title: 'Configuration du jeûne',
          description: 'Sélectionnez votre protocole parmi les options prédéfinies (16:8, 18:6, 20:4, OMAD) ou créez un protocole personnalisé. Définissez votre durée cible et votre fenêtre d\'alimentation selon vos préférences et votre chronotype.',
          icon: 'Settings'
        },
        {
          title: 'Session active',
          description: 'Une fois la session démarrée, suivez votre progression en temps réel avec un timer précis. Le système détecte automatiquement votre phase métabolique actuelle (Fed State, Early Fasting, Fat Burning, Autophagy, Deep Autophagy) et affiche les bénéfices associés.',
          icon: 'Play'
        },
        {
          title: 'Finalisation',
          description: 'Terminez votre session pour obtenir un résumé détaillé : durée effective, phases atteintes, calories estimées brûlées, et statut de réussite. Le système enregistre automatiquement vos données pour alimenter vos statistiques et analyses.',
          icon: 'CheckCircle'
        }
      ],
      tips: [
        'Commencez par un protocole 16:8 si vous débutez, c\'est le plus accessible',
        'Lancez votre session le soir après votre dernier repas pour comptabiliser le sommeil',
        'Les phases métaboliques sont indicatives et basées sur des moyennes scientifiques',
        'Vous pouvez arrêter une session à tout moment si nécessaire',
        'Le système garde en mémoire votre session même si vous rechargez la page'
      ],
      faq: [
        {
          question: 'Que faire si je dois interrompre mon jeûne avant l\'objectif ?',
          answer: 'Vous pouvez arrêter votre session à tout moment. Si vous atteignez au moins 50% de votre objectif, la session sera marquée comme "partielle". Moins de 50% sera considéré comme "manqué". Il n\'y a aucune pénalité, c\'est simplement pour suivre votre progression réelle.'
        },
        {
          question: 'Les phases métaboliques sont-elles précises pour tout le monde ?',
          answer: 'Les phases sont basées sur des études scientifiques moyennes. Le timing exact varie selon votre métabolisme, votre composition corporelle, et votre historique de jeûne. Utilisez-les comme repères généraux plutôt que comme vérités absolues.'
        },
        {
          question: 'Puis-je faire plusieurs sessions dans la même journée ?',
          answer: 'Oui, vous pouvez enchaîner plusieurs sessions. Cependant, pour les protocoles comme 16:8, une seule session quotidienne est recommandée. Le système tracke toutes vos sessions et calcule vos statistiques globales.'
        },
        {
          question: 'Que se passe-t-il si je ferme l\'application pendant une session ?',
          answer: 'Votre session active est sauvegardée localement. Si vous fermez l\'app et revenez, votre session reprendra exactement où vous l\'aviez laissée, avec le timer toujours actif. Aucune donnée n\'est perdue.'
        }
      ],
      relatedActions: [
        {
          label: 'Démarrer une session',
          description: 'Lancez votre premier jeûne depuis l\'onglet Tracker'
        },
        {
          label: 'Configurer mon profil',
          description: 'Définissez votre protocole préféré dans le profil'
        }
      ]
    },
    {
      id: 'tracker',
      title: 'Onglet Tracker',
      description: 'Suivez vos sessions de jeûne au quotidien',
      color: '#F59E0B',
      icon: 'Calendar',
      keyPoints: [
        'Démarrez une nouvelle session avec un clic',
        'Suivez votre progression en temps réel avec timer et phases',
        'Consultez le résumé de vos sessions du jour',
        'Accédez aux conseils pour optimiser votre pratique'
      ],
      steps: [
        {
          title: 'Utiliser le CTA dynamique',
          description: 'Le bouton d\'action principal s\'adapte à votre situation : "Démarrer un jeûne" si aucune session n\'est active, "Voir ma session" si une session est en cours, ou "Continuer" si vous avez terminé une session aujourd\'hui.',
          icon: 'Zap'
        },
        {
          title: 'Suivre votre session active',
          description: 'Pendant votre jeûne, la carte de session affiche le timer en temps réel, votre progression vers l\'objectif, la phase métabolique actuelle avec ses bénéfices, et une estimation des calories brûlées basée sur votre poids.',
          icon: 'Eye'
        },
        {
          title: 'Consulter le résumé quotidien',
          description: 'La carte de résumé montre toutes vos sessions terminées aujourd\'hui : durée totale, nombre de sessions, durée moyenne, et votre record du jour. Suivez votre cohérence quotidienne d\'un coup d\'œil.',
          icon: 'BarChart2'
        },
        {
          title: 'Lire les conseils pratiques',
          description: 'La carte de conseils affiche des tips adaptés à votre situation : comment gérer la faim, quoi boire pendant le jeûne, quand faire du sport, comment rompre le jeûne intelligemment.',
          icon: 'Lightbulb'
        }
      ],
      tips: [
        'Le timer continue de tourner même si vous fermez l\'application',
        'Les phases métaboliques changent automatiquement selon votre temps écoulé',
        'Hydratez-vous régulièrement : eau, thé, café noir sont autorisés',
        'Consultez régulièrement l\'onglet Tracker pour rester motivé',
        'Le résumé quotidien se réinitialise à minuit selon votre fuseau horaire'
      ],
      faq: [
        {
          question: 'Pourquoi mon timer ne correspond pas exactement à mon objectif ?',
          answer: 'Le timer affiche le temps écoulé depuis le début réel de votre session. Si vous avez défini un objectif de 16h mais commencé à 20h, le timer montrera 16h à midi le lendemain, ce qui correspond bien à votre fenêtre de jeûne.'
        },
        {
          question: 'Puis-je boire du café avec du lait pendant mon jeûne ?',
          answer: 'Un nuage de lait (moins de 50 calories) ne rompra pas techniquement votre jeûne pour la plupart des bénéfices. Cependant, pour l\'autophagie maximale, privilégiez le café noir. Le système ne tracke pas ces micro-détails, c\'est à votre jugement.'
        },
        {
          question: 'Comment le système calcule-t-il les calories brûlées ?',
          answer: 'L\'estimation est basée sur votre poids et la phase métabolique. En Fat Burning et Autophagy, votre corps puise plus dans les réserves. C\'est une approximation scientifique, les valeurs exactes varient selon votre métabolisme individuel.'
        }
      ],
      relatedActions: [
        {
          label: 'Démarrer un jeûne',
          description: 'Lancez une nouvelle session depuis l\'onglet Tracker'
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
      description: 'Analyses IA de vos patterns de jeûne',
      color: '#10B981',
      icon: 'TrendingUp',
      keyPoints: [
        'Sélectionnez votre période d\'analyse (7, 30 ou 90 jours)',
        'Découvrez vos patterns comportementaux détectés par l\'IA',
        'Recevez des recommandations personnalisées actionnables',
        'Comprenez vos forces et points d\'amélioration'
      ],
      steps: [
        {
          title: 'Choisir la période d\'analyse',
          description: 'Utilisez le sélecteur pour analyser vos 7, 30 ou 90 derniers jours. Chaque période a un seuil minimum de sessions : 3 pour 7j, 8 pour 30j, 20 pour 90j. Si vous n\'avez pas assez de données, le système vous encouragera à continuer votre pratique.',
          icon: 'Calendar'
        },
        {
          title: 'Lire le résumé narratif',
          description: 'L\'IA génère un résumé motivant de vos performances avec un score global sur 100. Ce résumé met en avant vos progrès, votre régularité, et les tendances observées sur la période sélectionnée.',
          icon: 'FileText'
        },
        {
          title: 'Explorer les insights individuels',
          description: 'Chaque carte d\'insight présente une observation spécifique : un pattern détecté (vous jeûnez mieux le weekend), une recommandation actionnable (ajustez votre fenêtre selon votre chronotype), un achievement (excellente régularité), ou un warning (durées trop variables).',
          icon: 'Search'
        },
        {
          title: 'Appliquer les actions suggérées',
          description: 'Certains insights incluent une action concrète à mettre en œuvre. Par exemple : "Préparez vos repas du weekend à l\'avance pour maintenir votre régularité" ou "Décalez votre fenêtre d\'1h pour l\'aligner sur votre chronotype matinal".',
          icon: 'CheckSquare'
        }
      ],
      tips: [
        'Attendez d\'avoir au moins 3 sessions complètes avant de consulter les insights 7j',
        'Les insights sont mis en cache 24h pour optimiser les coûts IA',
        'Si vos données changent significativement, l\'IA régénère automatiquement',
        'Plus vous avez de sessions, plus les insights sont précis et personnalisés',
        'Les warnings ne sont pas des critiques, ce sont des opportunités d\'optimisation',
        'Consultez vos insights hebdomadairement pour suivre votre évolution',
        'Les insights 90j donnent une vision stratégique de votre pratique'
      ],
      faq: [
        {
          question: 'Pourquoi mes insights ne se mettent-ils pas à jour immédiatement ?',
          answer: 'Les insights sont mis en cache pendant 24h pour éviter des coûts IA inutiles. Si vous ajoutez beaucoup de nouvelles sessions, le système peut régénérer automatiquement si le seuil de changement est atteint (+2 sessions minimum).'
        },
        {
          question: 'Les insights sont-ils vraiment personnalisés ?',
          answer: 'Oui, l\'IA analyse vos données réelles : sessions complètes, patterns temporels, durées moyennes, régularité, et les corrèle avec votre profil (âge, sexe, objectif, chronotype, niveau de stress). Les recommandations sont adaptées à VOTRE situation unique.'
        },
        {
          question: 'Que signifie un score de 85/100 ?',
          answer: 'Le score global combine plusieurs facteurs : régularité (40%), atteinte des objectifs (30%), progression (20%), diversité des protocoles (10%). Un score de 85 indique une excellente pratique avec quelques petites marges d\'amélioration identifiées dans les insights.'
        },
        {
          question: 'Puis-je ignorer certaines recommandations ?',
          answer: 'Absolument ! Les recommandations sont des suggestions basées sur les données moyennes et les meilleures pratiques. Si une recommandation ne correspond pas à votre style de vie ou vos contraintes, ignorez-la. L\'important est de trouver ce qui fonctionne pour VOUS.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir ma progression',
          description: 'Consultez vos graphiques détaillés dans l\'onglet Progression'
        },
        {
          label: 'Ajuster mon profil',
          description: 'Optimisez votre protocole de jeûne dans le profil'
        }
      ]
    },
    {
      id: 'progression',
      title: 'Onglet Progression',
      description: 'Visualisez votre évolution avec métriques et graphiques',
      color: '#06B6D4',
      icon: 'BarChart3',
      keyPoints: [
        'Consultez vos métriques clés sur la période sélectionnée',
        'Visualisez votre régularité avec le heatmap d\'activité',
        'Analysez vos tendances de durée et de cohérence',
        'Lisez l\'analyse narrative IA de votre progression'
      ],
      steps: [
        {
          title: 'Comprendre les métriques globales',
          description: 'La carte de résumé affiche vos statistiques clés : nombre total de sessions, heures totales jeûnées, durée moyenne par session, record personnel, meilleure série de jours consécutifs, série actuelle, taux de réussite (≥90% objectif), et score de régularité (0-100).',
          icon: 'PieChart'
        },
        {
          title: 'Lire le heatmap d\'activité',
          description: 'Le calendrier visuel montre votre activité quotidienne avec un code couleur : gris (aucun jeûne), jaune clair (faible), orange (moyen), orange foncé (élevé), rouge (excellent). Identifiez vos patterns hebdomadaires et vos séries en un coup d\'œil.',
          icon: 'Calendar'
        },
        {
          title: 'Analyser les graphiques de tendance',
          description: 'Le graphique de régularité montre vos jours de jeûne vs non-jeûne sur la période. Le graphique de durée affiche l\'évolution de vos durées moyennes dans le temps. Ces visualisations révèlent vos patterns et votre progression.',
          icon: 'LineChart'
        },
        {
          title: 'Explorer l\'analyse IA narrative',
          description: 'L\'IA génère une analyse textuelle détaillée : résumé narratif de votre période, analyse des tendances observées, insights de performance (2-3 points forts), recommandations stratégiques (3-4 actions), message motivationnel personnalisé, et prochain objectif suggéré.',
          icon: 'MessageSquare'
        }
      ],
      tips: [
        'Le heatmap est plus lisible sur grand écran, faites défiler horizontalement sur mobile',
        'Un score de régularité >80 indique une excellente discipline',
        'Les durées moyennes devraient être stables, évitez les variations extrêmes',
        'Une série de 7 jours consécutifs déclenche des bonus XP dans le système de gamification',
        'Comparez vos périodes 7j, 30j et 90j pour voir votre évolution long terme',
        'L\'analyse IA nécessite 5 sessions minimum pour 7j, 12 pour 30j, 20 pour 90j'
      ],
      faq: [
        {
          question: 'Pourquoi mon score de régularité est-il bas alors que je jeûne souvent ?',
          answer: 'Le score combine fréquence ET cohérence. Si vous jeûnez 5 jours/semaine mais avec des durées très variables (12h un jour, 20h le lendemain), votre score sera pénalisé. La régularité valorise la constance dans la pratique.'
        },
        {
          question: 'Comment améliorer mon taux de réussite ?',
          answer: 'Le taux de réussite compte les sessions atteignant ≥90% de l\'objectif. Pour l\'améliorer : définissez des objectifs réalistes selon votre niveau, maintenez une routine stable, préparez votre environnement (hydratation, activités pour occuper l\'esprit), et soyez patient les premières semaines.'
        },
        {
          question: 'Que représente exactement le heatmap ?',
          answer: 'Chaque case du calendrier représente un jour. La couleur indique l\'intensité de votre jeûne ce jour-là : combien d\'heures jeûnées et combien de sessions. Les statistiques sous le heatmap (jours excellents, taux d\'activité) quantifient votre performance globale.'
        },
        {
          question: 'L\'analyse narrative change-t-elle à chaque visite ?',
          answer: 'Non, elle est mise en cache 24h. L\'IA ne régénère que si vos données changent significativement (nouvelles sessions au-delà d\'un seuil). Cela optimise les coûts tout en garantissant la fraîcheur des insights quand nécessaire.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir mes insights',
          description: 'Découvrez les recommandations IA dans l\'onglet Insights'
        },
        {
          label: 'Consulter l\'historique',
          description: 'Explorez toutes vos sessions dans l\'onglet Historique'
        }
      ]
    },
    {
      id: 'history',
      title: 'Onglet Historique',
      description: 'Parcourez et gérez toutes vos sessions de jeûne',
      color: '#8B5CF6',
      icon: 'History',
      keyPoints: [
        'Consultez toutes vos sessions enregistrées',
        'Filtrez par statut, protocole, durée ou période',
        'Visualisez les statistiques globales de votre historique',
        'Supprimez les sessions erronées si nécessaire'
      ],
      steps: [
        {
          title: 'Naviguer dans l\'historique complet',
          description: 'Toutes vos sessions sont affichées chronologiquement, des plus récentes aux plus anciennes. Chaque carte affiche : date et heure de début, durée effective, protocole utilisé, statut (réussi, partiel, manqué), et phases métaboliques atteintes.',
          icon: 'List'
        },
        {
          title: 'Utiliser les filtres avancés',
          description: 'Filtrez par statut (toutes, complétées, annulées), par protocole (16:8, 18:6, etc.), par durée (min/max en heures), ou par période personnalisée avec sélecteur de dates. Les filtres se combinent pour affiner votre recherche.',
          icon: 'Filter'
        },
        {
          title: 'Consulter les statistiques globales',
          description: 'La carte de stats affiche : nombre total de sessions, sessions complétées vs annulées, heures totales jeûnées, durée moyenne, session la plus longue, session la plus courte, protocole le plus utilisé, date de première et dernière session.',
          icon: 'BarChart2'
        },
        {
          title: 'Gérer vos sessions',
          description: 'Cliquez sur une session pour voir tous les détails dans une modal. Si vous avez enregistré une session par erreur ou avec des données incorrectes, vous pouvez la supprimer. La suppression est définitive et met à jour toutes vos statistiques.',
          icon: 'Settings'
        }
      ],
      tips: [
        'Les sessions se chargent progressivement pour optimiser les performances',
        'Utilisez les filtres pour analyser des périodes ou protocoles spécifiques',
        'Les statistiques globales se recalculent automatiquement après chaque changement',
        'La suppression d\'une session est immédiate et irréversible, une confirmation est demandée',
        'L\'historique est paginé si vous avez beaucoup de sessions (>50)',
        'Vos sessions restent privées, elles ne sont jamais partagées sans votre consentement'
      ],
      faq: [
        {
          question: 'Puis-je modifier une session après l\'avoir enregistrée ?',
          answer: 'Actuellement, vous ne pouvez que supprimer une session. La modification n\'est pas disponible pour garantir l\'intégrité des données et des analyses IA. Si vous devez corriger, supprimez la session erronée et relancez-en une nouvelle si nécessaire.'
        },
        {
          question: 'Que se passe-t-il quand je supprime une session ?',
          answer: 'La suppression est définitive. La session disparaît de votre historique, toutes vos statistiques sont recalculées (total, moyennes, séries), et les insights IA seront régénérés lors de votre prochaine consultation. Une confirmation est toujours demandée avant suppression.'
        },
        {
          question: 'Pourquoi certaines sessions apparaissent comme "manquées" ?',
          answer: 'Une session est marquée "manquée" si vous l\'avez arrêtée avant d\'atteindre 50% de votre objectif. Ce n\'est pas un jugement, c\'est un tracking factuel. Si vous deviez vraiment arrêter (urgence, santé), c\'est tout à fait normal. L\'important est la tendance globale.'
        },
        {
          question: 'Combien de sessions peuvent être stockées ?',
          answer: 'Il n\'y a pas de limite au nombre de sessions. Votre historique complet est conservé indéfiniment dans votre base de données personnelle. Les performances restent optimales grâce à la pagination et au chargement progressif.'
        }
      ],
      relatedActions: [
        {
          label: 'Démarrer une session',
          description: 'Lancez un nouveau jeûne depuis l\'onglet Tracker'
        },
        {
          label: 'Voir ma progression',
          description: 'Consultez vos graphiques dans l\'onglet Progression'
        }
      ]
    }
  ]
};
