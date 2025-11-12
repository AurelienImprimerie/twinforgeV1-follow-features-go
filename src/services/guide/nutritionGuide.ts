import type { GuideContent } from './types';

export const nutritionGuide: GuideContent = {
  page: 'nutrition',
  title: 'Guide de la Forge Nutritionnelle',
  description: 'Maîtrisez le scanner de repas et le suivi nutritionnel quotidien',
  sections: [
    {
      id: 'pipeline',
      title: 'Pipeline de Scanner de Repas',
      description: 'Analysez vos repas en 3 étapes avec l\'IA',
      color: '#10B981',
      icon: 'Camera',
      keyPoints: [
        'Scannez vos repas par photo ou code-barre en quelques secondes',
        'L\'IA analyse automatiquement les aliments et calcule calories, macros et nutriments',
        'Validez et ajustez les résultats avant sauvegarde dans votre historique',
        'Utilisez quotidiennement pour un suivi nutritionnel précis et personnalisé'
      ],
      steps: [
        {
          title: 'Capture du repas',
          description: 'Choisissez votre mode de scan : photo-analyse pour les repas complets (l\'IA détecte les aliments dans l\'assiette) ou code-barre pour les produits emballés (scan instantané du code-barre). Pour la photo, assurez-vous d\'un bon éclairage et que tous les aliments soient visibles. L\'IA supporte les repas complexes avec plusieurs composants.',
          icon: 'Camera'
        },
        {
          title: 'Analyse intelligente IA',
          description: 'L\'IA TwinForge analyse votre capture : reconnaissance des aliments, estimation des portions, calcul des calories et macronutriments (protéines, glucides, lipides), détection du type de repas (petit-déjeuner, déjeuner, dîner, collation). L\'analyse prend 10-20 secondes et s\'affiche avec une progression immersive. Les résultats sont personnalisés selon votre profil nutritionnel.',
          icon: 'Brain'
        },
        {
          title: 'Validation et sauvegarde',
          description: 'Vérifiez les aliments détectés, les quantités estimées, les calories et macros calculées. Ajustez manuellement si nécessaire : modifiez les portions, ajoutez des aliments oubliés, supprimez les erreurs de détection. Les calories se recalculent automatiquement. Validez pour sauvegarder dans votre historique et alimenter vos statistiques quotidiennes.',
          icon: 'CheckCircle'
        }
      ],
      tips: [
        'Scannez immédiatement après la préparation : les souvenirs sont frais et précis',
        'Pour les photos, placez l\'assiette sur fond neutre avec éclairage naturel',
        'L\'IA reconnaît les portions standards : assiette entière, demi-assiette, petit bol, etc.',
        'Les codes-barres sont parfaits pour les snacks emballés, yaourts, boissons',
        'N\'oubliez pas les accompagnements : sauces, huiles, condiments comptent !',
        'Scannez aussi les collations et boissons : tout compte dans votre bilan',
        'L\'IA apprend de vos corrections : plus vous ajustez, plus elle s\'affine',
        'Votre photo est sauvegardée avec le repas pour référence visuelle'
      ],
      faq: [
        {
          question: 'L\'IA peut-elle se tromper dans la détection des aliments ?',
          answer: 'Oui, l\'IA a une précision de 85-90% selon la qualité de la photo. C\'est pourquoi l\'étape de validation est cruciale : vérifiez toujours les aliments détectés et les quantités avant de sauvegarder. Vous gardez le contrôle total.'
        },
        {
          question: 'Comment l\'IA calcule-t-elle les calories et macros ?',
          answer: 'L\'IA utilise une base de données nutritionnelle exhaustive (USDA, CIQUAL) et des algorithmes de vision pour estimer les portions. Les calculs sont précis à ±10% pour les repas standards. Les corrections que vous faites affinent les futurs calculs.'
        },
        {
          question: 'Dois-je vraiment scanner tous mes repas ?',
          answer: 'Oui ! La précision de votre suivi nutritionnel dépend de l\'exhaustivité de vos scans. Les petits repas oubliés s\'accumulent et faussent votre bilan calorique. Prenez l\'habitude de tout scanner, même les collations de 100 kcal.'
        },
        {
          question: 'Que faire si la photo est floue ou mal éclairée ?',
          answer: 'L\'IA vous alertera si la qualité est insuffisante. Reprenez simplement la photo dans de meilleures conditions. Un bon scan prend 5 secondes de plus mais garantit des données fiables pour votre transformation.'
        },
        {
          question: 'Les données scannées sont-elles synchronisées avec mon profil ?',
          answer: 'Oui ! Chaque repas scanné met à jour instantanément votre bilan calorique quotidien, vos statistiques hebdomadaires, et alimente les insights IA. Le système s\'adapte à votre objectif (perte, prise, recomposition) pour vous guider.'
        }
      ],
      relatedActions: [
        {
          label: 'Scanner un repas',
          description: 'Lancez votre premier scan depuis l\'onglet Scanner'
        },
        {
          label: 'Compléter mon profil',
          description: 'Renseignez vos objectifs nutritionnels pour des analyses personnalisées'
        }
      ]
    },
    {
      id: 'scanner',
      title: 'Onglet Scanner',
      description: 'Hub quotidien de suivi nutritionnel',
      color: '#10B981',
      icon: 'Calendar',
      keyPoints: [
        'Scannez rapidement un nouveau repas en 1 clic',
        'Consultez votre bilan calorique du jour en temps réel',
        'Suivez vos macronutriments (protéines, glucides, lipides) avec graphiques',
        'Visualisez vos repas récents avec photos et détails nutritionnels',
        'Recevez des suggestions dynamiques selon votre progression'
      ],
      steps: [
        {
          title: 'Utiliser le CTA de scan dynamique',
          description: 'Le bouton principal "Scanner un repas" lance la pipeline de capture. Il s\'adapte à votre contexte avec des messages motivants : "Excellent départ !" si c\'est votre premier repas du jour, "Continuez comme ça !" si vous êtes régulier, "Atteignez votre objectif" si vous approchez du but calorique. Le CTA est votre point d\'entrée principal.',
          icon: 'Zap'
        },
        {
          title: 'Suivre votre bilan calorique',
          description: 'La carte de progression affiche : calories consommées aujourd\'hui, objectif calorique quotidien (adapté à votre but), progression en pourcentage et barre visuelle, alerte de sécurité si vous dépassez ou êtes trop bas. Le système calcule votre TDEE (dépense énergétique totale) et ajuste l\'objectif selon votre niveau d\'activité.',
          icon: 'TrendingUp'
        },
        {
          title: 'Analyser vos macronutriments',
          description: 'Le graphique circulaire montre la répartition protéines/glucides/lipides en pourcentage et en grammes. Des codes couleur indiquent si l\'équilibre est optimal : vert (bon), orange (à ajuster), rouge (déséquilibré). Le système recommande un ratio adapté à votre objectif : plus de protéines pour la recomposition, glucides pour l\'endurance.',
          icon: 'PieChart'
        },
        {
          title: 'Consulter les repas récents',
          description: 'La liste affiche vos 5 derniers repas scannés avec : photo miniature, type de repas, heure, calories, macros principaux. Cliquez sur un repas pour voir le détail complet dans une modal : tous les aliments, portions, micronutriments. Vous pouvez supprimer un repas erroné, les totaux se recalculent automatiquement.',
          icon: 'List'
        }
      ],
      tips: [
        'Scannez vos repas dans l\'ordre chronologique pour un suivi cohérent',
        'Le bilan calorique se met à jour en temps réel après chaque scan',
        'Votre objectif calorique s\'adapte automatiquement à votre activité du jour',
        'Les statistiques se réinitialisent à minuit selon votre fuseau horaire',
        'Le CTA change de couleur selon votre progression : vert (bon), orange (attention)',
        'Les repas récents incluent ceux des 24 dernières heures pour une vue complète',
        'Utilisez les filtres pour voir uniquement les petits-déjeuners, déjeuners, etc.',
        'Vos données alimentent automatiquement les insights IA et la gamification'
      ],
      faq: [
        {
          question: 'Pourquoi mon objectif calorique change-t-il d\'un jour à l\'autre ?',
          answer: 'L\'objectif s\'adapte à votre niveau d\'activité déclaré dans le profil et aux activités physiques loggées. Un jour d\'entraînement intense augmente l\'objectif. Pour la perte de poids, le système maintient un déficit adapté. Vérifiez votre profil si l\'objectif semble incohérent.'
        },
        {
          question: 'Comment interpréter les alertes de bilan calorique ?',
          answer: 'Rouge/Trop bas (<-1000 kcal de déficit) : risque de fatigue, ralentissement métabolique. Orange/Attention (-500 à -1000) : déficit important, surveiller l\'énergie. Vert/Optimal (-200 à -500) : déficit sain pour perte de poids. Les alertes vous guident vers un déficit durable et safe.'
        },
        {
          question: 'Puis-je voir mes repas de la veille dans l\'onglet Scanner ?',
          answer: 'Non, l\'onglet Scanner affiche uniquement le jour actuel pour rester focus sur votre progression quotidienne. Pour consulter l\'historique complet, utilisez l\'onglet Historique qui regroupe tous vos repas passés avec filtres avancés.'
        },
        {
          question: 'Les macros sont-ils adaptés à mon objectif spécifique ?',
          answer: 'Oui ! Le système recommande des ratios personnalisés : perte de poids (40P/30G/30L), prise de masse (30P/45G/25L), recomposition (35P/35G/30L). Vous pouvez ajuster manuellement dans le profil si vous suivez un protocole spécifique (cétogène, low-carb, etc.).'
        }
      ],
      relatedActions: [
        {
          label: 'Scanner un repas',
          description: 'Enregistrez votre prochain repas maintenant'
        },
        {
          label: 'Voir mes insights',
          description: 'Consultez vos analyses nutritionnelles dans Insights'
        }
      ]
    },
    {
      id: 'insights',
      title: 'Onglet Insights',
      description: 'Analyses nutritionnelles IA personnalisées',
      color: '#F59E0B',
      icon: 'TrendingUp',
      keyPoints: [
        'Sélectionnez votre période d\'analyse (7, 30 ou 90 jours)',
        'Découvrez vos patterns alimentaires détectés par l\'IA',
        'Recevez des recommandations nutritionnelles actionnables',
        'Identifiez les déséquilibres et opportunités d\'optimisation',
        'Suivez votre score de qualité nutritionnelle global'
      ],
      steps: [
        {
          title: 'Choisir la période d\'analyse',
          description: 'Le sélecteur propose 7, 30 ou 90 jours. Chaque période a un seuil minimum de repas scannés : 12 repas pour 7j (moyenne 1-2/jour), 40 repas pour 30j, 100 repas pour 90j. Si vous n\'avez pas assez de données, un message contextuel vous guide vers l\'action appropriée (scanner plus ou attendre quelques jours).',
          icon: 'Calendar'
        },
        {
          title: 'Lire le résumé narratif IA',
          description: 'L\'IA génère un résumé textuel motivant avec score global sur 100 points. Ce score combine : qualité nutritionnelle (40%), équilibre des macros (30%), régularité des repas (20%), variété alimentaire (10%). Le résumé met en avant vos progrès, vos forces, et les tendances observées sur la période.',
          icon: 'FileText'
        },
        {
          title: 'Explorer les insights structurés',
          description: 'Chaque carte présente un insight spécifique avec type (pattern, recommendation, achievement, warning), priorité (low, medium, high), et action concrète. Exemples : "Vous manquez de protéines au petit-déjeuner, ajoutez des œufs ou yaourt grec", "Excellente régularité : 6 jours consécutifs de scans complets", "Vos collations sont trop sucrées, privilégiez les fruits secs".',
          icon: 'Lightbulb'
        },
        {
          title: 'Appliquer les recommandations',
          description: 'Les insights actionnables incluent une suggestion précise avec bénéfices attendus. Par exemple : "Augmentez vos protéines de 20g/jour → meilleure satiété et préservation musculaire" ou "Réduisez les glucides le soir → amélioration du sommeil et perte de gras". Le système priorise les actions à impact maximal.',
          icon: 'CheckSquare'
        }
      ],
      tips: [
        'Les insights sont mis en cache 24h côté serveur pour optimiser les coûts IA',
        'Plus vous scannez régulièrement, plus les insights sont précis et personnalisés',
        'Les patterns temporels détectent vos habitudes : "Vous sautez souvent le petit-déjeuner"',
        'Un score global >80 indique une excellente qualité nutritionnelle',
        'Les warnings ne sont pas des reproches, ce sont des opportunités d\'amélioration',
        'Consultez les insights hebdomadairement pour ajuster votre alimentation',
        'Les insights 90j donnent une vision stratégique de votre nutrition long terme',
        'Le système compare vos données aux recommandations scientifiques (ANSES, OMS)'
      ],
      faq: [
        {
          question: 'Pourquoi mes insights ne se mettent-ils pas à jour immédiatement ?',
          answer: 'Les insights sont cachés 24h côté serveur. L\'IA régénère automatiquement si vos données changent significativement (+5 repas au-delà du seuil). Cette approche optimise les coûts IA tout en garantissant la fraîcheur quand nécessaire. Vous pouvez forcer un refresh manuel si besoin.'
        },
        {
          question: 'Les recommandations sont-elles adaptées à mon objectif spécifique ?',
          answer: 'Oui, l\'IA prend en compte votre objectif déclaré (perte, gain, recomp), votre niveau d\'activité, vos contraintes alimentaires (végétarien, allergies), et vos patterns observés. Les recommandations pour une perte de poids privilégieront le déficit calorique et les protéines, tandis que pour la prise de masse, elles insisteront sur le surplus et les glucides.'
        },
        {
          question: 'Comment interpréter un insight de type "pattern" ?',
          answer: 'Un pattern est une observation factuelle de vos habitudes alimentaires : "Vous consommez plus de calories le weekend" ou "Vos repas du soir sont trop copieux". Ce n\'est ni positif ni négatif, c\'est un constat qui peut révéler des optimisations possibles selon votre objectif.'
        },
        {
          question: 'Que faire si un insight ne me correspond pas ou est impossible à appliquer ?',
          answer: 'Les insights sont des suggestions basées sur des moyennes et meilleures pratiques scientifiques. Si une recommandation ne colle pas à votre style de vie, contraintes culturelles, budget, ou préférences, ignorez-la sans culpabilité. L\'IA s\'améliorera avec plus de données et s\'adaptera à VOTRE réalité unique.'
        },
        {
          question: 'Comment le score nutritionnel est-il calculé exactement ?',
          answer: 'Le score (0-100) combine 4 piliers : Qualité (40%) basée sur densité nutritionnelle et aliments complets vs transformés, Équilibre (30%) selon le respect des ratios macros, Régularité (20%) mesurant la constance du nombre de repas et horaires, Variété (10%) comptant les aliments différents consommés. Un score de 75+ est excellent.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir ma progression',
          description: 'Consultez vos graphiques détaillés dans Progression'
        },
        {
          label: 'Ajuster mon profil',
          description: 'Optimisez vos objectifs nutritionnels dans le profil'
        }
      ]
    },
    {
      id: 'progression',
      title: 'Onglet Progression',
      description: 'Visualisez votre évolution nutritionnelle',
      color: '#06B6D4',
      icon: 'BarChart3',
      keyPoints: [
        'Consultez vos statistiques globales sur la période',
        'Visualisez les graphiques d\'évolution des calories et macros',
        'Analysez le heatmap de régularité des scans',
        'Identifiez vos tendances et patterns visuellement',
        'Comparez vos résultats aux objectifs fixés'
      ],
      steps: [
        {
          title: 'Comprendre les statistiques globales',
          description: 'La carte de stats affiche : nombre total de repas scannés, calories totales consommées, moyennes quotidiennes (calories, protéines, glucides, lipides), ratio macros moyen, repas le plus calorique, type de repas le plus fréquent, jours avec scans complets (3+ repas/jour), et score de régularité (0-100 basé sur constance).',
          icon: 'BarChart2'
        },
        {
          title: 'Lire les graphiques d\'évolution',
          description: 'Graphique linéaire des calories par jour : visualisez vos apports quotidiens avec ligne de tendance et zone d\'objectif. Graphique de macros empilés : suivez l\'évolution des protéines/glucides/lipides dans le temps. Graphique de distribution : répartition des types de repas (petit-déj, déjeuner, dîner, collation) pour identifier les déséquilibres.',
          icon: 'LineChart'
        },
        {
          title: 'Analyser le heatmap de régularité',
          description: 'Le calendrier visuel affiche votre activité de scan quotidienne avec code couleur : gris (aucun scan), jaune clair (1 repas), orange (2 repas), orange foncé (3 repas), rouge foncé (4+ repas/excellent). Repérez vos jours actifs, vos séries de constance, et vos creux d\'activité en un coup d\'œil. Objectif : remplir le calendrier en orange-rouge.',
          icon: 'Calendar'
        },
        {
          title: 'Explorer les métriques de performance',
          description: 'Taux de réussite d\'objectif : pourcentage de jours où vous avez atteint votre objectif calorique (±100 kcal). Série actuelle : nombre de jours consécutifs avec scans complets. Meilleure série : votre record de constance. Variété alimentaire : nombre d\'aliments uniques consommés sur la période. Ces métriques gamifient votre suivi.',
          icon: 'Award'
        }
      ],
      tips: [
        'Le score de régularité combine fréquence de scans (60%) et horaires constants (40%)',
        'Un taux de réussite >70% indique une excellente maîtrise de vos apports',
        'Le heatmap se lit de gauche à droite, ligne par ligne (semaines du mois)',
        'Les graphiques sont interactifs : survolez pour voir les valeurs exactes',
        'Comparez vos périodes 7j, 30j et 90j pour voir l\'évolution long terme',
        'Une série de 7 jours consécutifs déclenche des bonus XP dans la gamification',
        'La variété alimentaire >50 aliments/mois est optimale pour la santé',
        'Exportez vos graphiques pour partager avec un nutritionniste ou coach'
      ],
      faq: [
        {
          question: 'Comment est calculé le score de régularité ?',
          answer: 'Le score combine deux facteurs : fréquence de scans (60%) mesurant le nombre de repas scannés vs attendus selon votre profil, et cohérence temporelle (40%) évaluant la stabilité des horaires de repas. Un score de 80+ signifie que vous scannez régulièrement ET à heures fixes, ce qui est optimal pour le métabolisme.'
        },
        {
          question: 'Pourquoi le graphique de calories fluctue-t-il autant ?',
          answer: 'Les variations quotidiennes sont normales ! Le métabolisme n\'est pas une machine. Une hausse le weekend (sorties, restaurant) compensée par la semaine est saine. L\'important est la tendance moyenne sur 7-14 jours, pas les variations jour à jour. La ligne de tendance (moyenne mobile) montre la vraie direction.'
        },
        {
          question: 'Que signifie "équilibrer les macros" dans le contexte de mon objectif ?',
          answer: 'Un équilibre optimal varie selon votre but : Perte de poids (40% protéines, 30% glucides, 30% lipides) pour satiété et préservation musculaire. Prise de masse (30P/45G/25L) pour énergie et croissance. Recomposition (35P/35G/30L) pour équilibre. Le système vous alerte si vous vous écartez trop de ces ratios cibles.'
        },
        {
          question: 'Pourquoi le heatmap affiche-t-il des cases grises alors que j\'ai scanné ?',
          answer: 'Le heatmap valorise les journées COMPLÈTES avec 3+ repas scannés. Un seul repas scanné dans la journée colorie légèrement la case mais pas pleinement. C\'est voulu : le système encourage un suivi exhaustif quotidien, pas sporadique. Pour voir tous vos scans même isolés, consultez l\'Historique.'
        },
        {
          question: 'Comment interpréter le taux de réussite d\'objectif ?',
          answer: 'Ce taux compte les jours où vous avez atteint votre objectif calorique avec une marge de ±100 kcal (tolérance réaliste). 100% n\'est pas nécessaire ! Un taux de 70-80% est excellent et durable. 60% est correct. <50% indique un besoin d\'ajuster l\'objectif ou le suivi. La perfection n\'existe pas, la constance oui.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir mes insights',
          description: 'Découvrez les recommandations IA détaillées'
        },
        {
          label: 'Consulter l\'historique',
          description: 'Explorez tous vos repas dans Historique'
        }
      ]
    },
    {
      id: 'history',
      title: 'Onglet Historique',
      description: 'Parcourez et gérez tous vos repas scannés',
      color: '#8B5CF6',
      icon: 'History',
      keyPoints: [
        'Consultez tous vos repas enregistrés par jour',
        'Filtrez par type de repas, période ou calories',
        'Visualisez les détails complets avec photos',
        'Supprimez les scans erronés avec recalcul auto',
        'Exportez vos données pour analyse externe'
      ],
      steps: [
        {
          title: 'Naviguer dans l\'historique groupé',
          description: 'Les repas sont groupés par jour, de la plus récente à la plus ancienne. Chaque jour affiche : date formatée en français, nombre de repas scannés, total de calories consommées, répartition macros, et icône de statut (objectif atteint ou non). Cliquez sur un jour pour développer et voir les repas individuels avec miniatures photos.',
          icon: 'FolderOpen'
        },
        {
          title: 'Utiliser les filtres avancés',
          description: 'Filtrez par type de repas (tous, petit-déjeuner, déjeuner, dîner, collation), par période (derniers 7j, 30j, 90j, ou plage personnalisée), par plage calorique (0-300, 300-600, 600+), ou par recherche textuelle (nom d\'aliment). Les filtres se combinent pour affiner votre recherche. Parfait pour retrouver "ce repas de poulet la semaine dernière".',
          icon: 'Filter'
        },
        {
          title: 'Consulter le détail d\'un repas',
          description: 'Cliquez sur un repas pour ouvrir la modal de détail complet. Elle affiche : photo haute résolution, liste de tous les aliments avec portions, calories et macros par aliment, totaux du repas, micronutriments principaux (fibres, calcium, fer, vitamines), timestamp exact, et notes éventuelles. Vous pouvez zoomer sur la photo pour voir les détails.',
          icon: 'Eye'
        },
        {
          title: 'Supprimer et gérer les repas',
          description: 'Si vous avez scanné un repas par erreur ou avec des données incorrectes, cliquez sur le bouton de suppression dans la modal de détail. Une confirmation est demandée car la suppression est définitive. Après suppression, tous vos totaux quotidiens, statistiques globales, et insights IA sont automatiquement recalculés pour refléter la correction.',
          icon: 'Trash2'
        }
      ],
      tips: [
        'L\'historique charge par batch de 50 repas pour des performances optimales',
        'Faites défiler vers le bas pour charger automatiquement les repas plus anciens',
        'Les totaux quotidiens incluent TOUS les repas, même supprimés puis rescannés',
        'La suppression d\'un repas est immédiate et met à jour le cache instantanément',
        'Les repas sont triés par timestamp, pas par ordre de saisie',
        'Vous pouvez voir les repas de n\'importe quel jour passé, sans limite temporelle',
        'Le groupement par jour facilite la vision d\'ensemble de votre régularité',
        'Utilisez la recherche textuelle pour retrouver des aliments spécifiques rapidement',
        'Vos données de repas restent privées, jamais partagées sans votre accord explicite'
      ],
      faq: [
        {
          question: 'Puis-je modifier un repas après l\'avoir scanné et sauvegardé ?',
          answer: 'Actuellement, vous ne pouvez que supprimer. La modification n\'est pas disponible pour garantir l\'intégrité des analyses IA et éviter les incohérences dans les calculs de tendances. Si vous devez corriger, supprimez le repas erroné et rescannez-le correctement via la pipeline. C\'est rapide et garantit la fiabilité.'
        },
        {
          question: 'Que se passe-t-il exactement quand je supprime un repas ?',
          answer: 'La suppression est immédiate et définitive. Le repas disparaît de votre historique, tous vos totaux (quotidiens, hebdo, mensuels) sont recalculés instantanément, vos graphiques de progression se mettent à jour, et les insights IA seront régénérés lors de votre prochaine consultation. Une confirmation est toujours demandée pour éviter les suppressions accidentelles.'
        },
        {
          question: 'L\'historique affiche-t-il les repas importés de montres connectées ?',
          answer: 'Non, l\'historique des repas est spécifique aux scans que VOUS effectuez dans l\'app. Les montres connectées synchronisent les activités physiques (dépenses caloriques), pas les repas (apports). Pour un suivi nutritionnel complet, vous devez scanner manuellement tous vos repas dans TwinForge.'
        },
        {
          question: 'Puis-je exporter mon historique de repas ?',
          answer: 'Oui ! Utilisez le bouton d\'export en haut de l\'historique pour télécharger vos données au format CSV ou JSON. L\'export inclut : dates, heures, aliments, portions, calories, macros, photos. Pratique pour partager avec un nutritionniste, coach, ou analyser dans Excel/Google Sheets.'
        },
        {
          question: 'Combien de repas peuvent être stockés dans l\'historique ?',
          answer: 'Il n\'y a pas de limite. Votre historique complet est conservé indéfiniment dans votre base de données personnelle Supabase. Même avec des années de données (1000+ repas), les performances restent excellentes grâce au chargement progressif, à l\'indexation optimisée, et au cache intelligent.'
        }
      ],
      relatedActions: [
        {
          label: 'Scanner un repas',
          description: 'Enregistrez votre prochain repas maintenant'
        },
        {
          label: 'Voir ma progression',
          description: 'Consultez vos graphiques dans Progression'
        }
      ]
    }
  ]
};
