import type { GuideContent } from './types';

export const profileGuide: GuideContent = {
  page: 'profile',
  title: 'Guide du Profil',
  description: 'Remplissez votre profil pour personnaliser votre suivi',
  sections: [
    {
      id: 'identity',
      title: 'Identité',
      description: 'Vos données de base',
      color: '#60A5FA',
      icon: 'User',
      keyPoints: ['Renseignez votre âge, sexe, taille et poids', 'Définissez votre objectif'],
      steps: [
        {
          title: 'Renseignez vos informations personnelles',
          description: 'Entrez votre âge, sexe biologique, taille et poids actuel. Ces données sont essentielles pour tous les calculs métaboliques, nutritionnels et d\'entraînement. Elles restent strictement confidentielles.',
          icon: 'User'
        },
        {
          title: 'Définissez votre objectif principal',
          description: 'Choisissez entre perte de poids, prise de masse, recomposition corporelle, ou maintien. Votre objectif détermine les recommandations caloriques, les programmes d\'entraînement suggérés, et les conseils nutritionnels.',
          icon: 'Target'
        },
        {
          title: 'Précisez votre niveau d\'activité',
          description: 'Indiquez votre niveau d\'activité quotidienne hors sport : sédentaire, légèrement actif, modérément actif, très actif. Cette information affine le calcul de votre métabolisme de base et de vos besoins caloriques.',
          icon: 'Activity'
        },
        {
          title: 'Validez et mettez à jour régulièrement',
          description: 'Votre profil identité doit être à jour pour des recommandations précises. Mettez à jour votre poids hebdomadairement et révisez votre objectif si nécessaire. Le système s\'adapte automatiquement à vos changements.',
          icon: 'RefreshCw'
        }
      ],
      tips: [
        'Pesez-vous toujours dans les mêmes conditions : le matin, à jeun, après passage aux toilettes',
        'Soyez honnête sur votre niveau d\'activité : surestimer fausse tous les calculs',
        'Changez d\'objectif progressivement : finissez une phase avant d\'en commencer une autre',
        'Un profil complet à 100% débloque les fonctionnalités avancées de l\'application',
        'Vos données ne sont jamais partagées sans votre consentement explicite'
      ],
      faq: [
        {
          question: 'Pourquoi le sexe biologique est-il important ?',
          answer: 'Le sexe biologique influence directement le métabolisme de base, la composition corporelle, et les besoins nutritionnels. Les formules de calcul sont différentes pour optimiser les recommandations. Cette donnée reste strictement confidentielle.'
        },
        {
          question: 'Comment choisir entre perte de poids et recomposition ?',
          answer: 'La perte de poids vise à réduire votre masse totale. La recomposition maintient le poids mais transforme la graisse en muscle. Choisissez recomposition si vous êtes proche de votre poids idéal mais souhaitez améliorer votre composition.'
        },
        {
          question: 'À quelle fréquence mettre à jour mon poids ?',
          answer: 'Une pesée hebdomadaire suffit pour suivre la tendance sans être obsédé. Le poids fluctue quotidiennement (eau, digestion). Si vous vous pesez quotidiennement, le système calcule automatiquement une moyenne mobile sur 7 jours.'
        },
        {
          question: 'Puis-je modifier mon objectif en cours de route ?',
          answer: 'Oui, mais il est recommandé de maintenir un objectif pendant au moins 4-6 semaines pour voir des résultats significatifs. Le système vous préviendra et réajustera progressivement vos recommandations lors du changement.'
        }
      ],
      relatedActions: [
        {
          label: 'Mettre à jour mon poids',
          description: 'Enregistrez votre poids actuel'
        },
        {
          label: 'Changer mon objectif',
          description: 'Modifiez votre objectif de transformation'
        }
      ]
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      description: 'Préférences alimentaires',
      color: '#10B981',
      icon: 'Utensils',
      keyPoints: ['Indiquez vos allergies', 'Choisissez votre régime'],
      steps: [
        {
          title: 'Déclarez vos allergies et intolérances',
          description: 'Listez toutes vos allergies alimentaires et intolérances (lactose, gluten, fruits à coque, etc.). Le système exclura automatiquement ces aliments des suggestions de repas et alertera lors du scan de produits incompatibles.',
          icon: 'AlertTriangle'
        },
        {
          title: 'Choisissez votre régime alimentaire',
          description: 'Sélectionnez votre régime : omnivore, végétarien, végétalien, pescétarien, flexitarien. Vous pouvez aussi préciser des préférences comme sans produits laitiers, low-carb, méditerranéen, etc.',
          icon: 'Salad'
        },
        {
          title: 'Définissez vos préférences et aversions',
          description: 'Indiquez les aliments que vous aimez, n\'aimez pas, ou souhaitez éviter. Le générateur de repas privilégiera vos préférences et écartera ce que vous n\'appréciez pas, tout en maintenant l\'équilibre nutritionnel.',
          icon: 'ThumbsUp'
        },
        {
          title: 'Configurez votre équipement de cuisine',
          description: 'Précisez l\'équipement dont vous disposez : four, micro-ondes, robot, blender, etc. Les recettes suggérées s\'adapteront à vos possibilités de préparation et votre temps disponible.',
          icon: 'CookingPot'
        }
      ],
      tips: [
        'Même les allergies mineures doivent être déclarées pour votre sécurité',
        'Vous pouvez cumuler plusieurs régimes : végétarien + sans gluten par exemple',
        'Les aversions peuvent être temporaires : révisez-les tous les 3-6 mois',
        'Plus votre profil nutrition est détaillé, plus les suggestions sont personnalisées',
        'Le système peut suggérer des alternatives pour élargir votre répertoire alimentaire'
      ],
      faq: [
        {
          question: 'Comment le système gère-t-il les allergies croisées ?',
          answer: 'Le système connaît les allergies croisées courantes (ex: bouleau → pomme). Si vous déclarez une allergie, il proposera de vérifier et exclure les allergènes croisés potentiels pour votre sécurité maximale.'
        },
        {
          question: 'Puis-je avoir un régime sans étiquette particulière ?',
          answer: 'Absolument. Si vous n\'avez pas de régime spécifique, sélectionnez "omnivore" et utilisez les préférences/aversions pour affiner. Vous pouvez créer votre propre style alimentaire unique.'
        },
        {
          question: 'Les suggestions respectent-elles mes macros ET mes préférences ?',
          answer: 'Oui, le système optimise pour atteindre vos objectifs macros tout en respectant vos contraintes alimentaires. Si c\'est impossible, il vous proposera le meilleur compromis et expliquera les ajustements suggérés.'
        },
        {
          question: 'Comment ajouter des aliments que je découvre ?',
          answer: 'Vous pouvez enrichir vos préférences à tout moment. Lors du scan d\'un nouveau produit, le système vous proposera de l\'ajouter à vos favoris ou aliments récurrents pour l\'intégrer aux futures suggestions.'
        }
      ],
      relatedActions: [
        {
          label: 'Gérer mes allergies',
          description: 'Modifiez votre liste d\'allergies et intolérances'
        },
        {
          label: 'Voir les recettes suggérées',
          description: 'Découvrez les recettes adaptées à votre profil'
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Training',
      description: 'Préférences d\'entraînement',
      color: '#18E3FF',
      icon: 'Dumbbell',
      keyPoints: ['Niveau d\'expérience', 'Matériel disponible'],
      steps: [
        {
          title: 'Évaluez votre niveau d\'expérience',
          description: 'Choisissez entre débutant, intermédiaire, avancé, ou expert. Soyez réaliste : votre niveau détermine la complexité des mouvements suggérés, les volumes d\'entraînement, et la progression recommandée.',
          icon: 'Target'
        },
        {
          title: 'Listez votre matériel disponible',
          description: 'Indiquez tout le matériel auquel vous avez accès : poids du corps seulement, haltères, barres, machines, anneaux, TRX, etc. Les programmes générés utiliseront uniquement votre équipement disponible.',
          icon: 'Box'
        },
        {
          title: 'Précisez vos préférences de disciplines',
          description: 'Sélectionnez les types d\'entraînement que vous appréciez : musculation, calisthenics, fonctionnel, endurance, CrossFit, etc. Le système équilibrera vos programmes selon vos affinités.',
          icon: 'Heart'
        },
        {
          title: 'Définissez vos contraintes et disponibilité',
          description: 'Indiquez votre temps disponible par séance, fréquence hebdomadaire, et éventuelles limitations physiques. Les programmes respecteront ces contraintes tout en optimisant vos résultats.',
          icon: 'Clock'
        }
      ],
      tips: [
        'Commencez avec un niveau en-dessous si vous hésitez : progresser est plus motivant',
        'Mettez à jour votre matériel quand vous achetez de nouveaux équipements',
        'Variez les disciplines pour un développement physique complet et éviter la monotonie',
        'Soyez honnête sur votre disponibilité : mieux vaut 3 séances bien faites que 6 ratées',
        'Les limitations physiques ne sont pas des blocages : le système adapte intelligemment'
      ],
      faq: [
        {
          question: 'Comment savoir si je suis débutant ou intermédiaire ?',
          answer: 'Débutant : moins de 6 mois d\'entraînement régulier. Intermédiaire : 6 mois à 2 ans de pratique constante avec bonne technique. Avancé : 2+ ans avec maîtrise technique complète. Expert : compétiteur ou coach certifié.'
        },
        {
          question: 'Que faire si je n\'ai aucun matériel ?',
          answer: 'Le poids du corps suffit largement pour progresser ! Le système propose des programmes complets de calisthenics et street workout sans aucun équipement. Vous pouvez atteindre d\'excellents résultats.'
        },
        {
          question: 'Puis-je mélanger plusieurs disciplines ?',
          answer: 'Non seulement vous pouvez, mais c\'est recommandé ! Le système créera des programmes hybrides équilibrés. Par exemple : 3 jours de musculation + 2 jours de fonctionnel + 1 jour d\'endurance.'
        },
        {
          question: 'Comment évoluer de niveau ?',
          answer: 'Le système détecte automatiquement votre progression et suggèrera de passer au niveau supérieur quand vos performances l\'indiquent. Vous pouvez aussi changer manuellement, mais attendez d\'être à l\'aise avant.'
        }
      ],
      relatedActions: [
        {
          label: 'Générer un programme',
          description: 'Créez un programme d\'entraînement personnalisé'
        },
        {
          label: 'Mettre à jour mon matériel',
          description: 'Modifiez la liste de votre équipement disponible'
        }
      ]
    },
    {
      id: 'fasting',
      title: 'Jeûne',
      description: 'Protocoles de jeûne',
      color: '#F59E0B',
      icon: 'Timer',
      keyPoints: ['Choisissez votre protocole', 'Définissez votre fenêtre'],
      steps: [
        {
          title: 'Comprendre le jeûne intermittent',
          description: 'Le jeûne intermittent alterne périodes d\'alimentation et de jeûne. Les protocoles courants : 16/8 (16h jeûne, 8h alimentation), 18/6, 20/4, OMAD (un repas par jour), 5:2 (2 jours réduits par semaine). Chaque protocole a ses spécificités.',
          icon: 'Info'
        },
        {
          title: 'Choisissez votre protocole',
          description: 'Débutez avec 16/8, le plus accessible et efficace. Augmentez progressivement si vous le souhaitez. Le système vous guide dans le choix selon votre objectif, mode de vie, et niveau d\'expérience avec le jeûne.',
          icon: 'Calendar'
        },
        {
          title: 'Définissez votre fenêtre alimentaire',
          description: 'Fixez vos heures de début et fin d\'alimentation. Exemple : 12h-20h pour un 16/8. Adaptez selon votre emploi du temps, entraînements, et rythme naturel. Le timer de l\'app vous accompagne en temps réel.',
          icon: 'Clock'
        },
        {
          title: 'Suivez et ajustez votre protocole',
          description: 'Le système suit vos périodes de jeûne et signale les différentes phases (cétose, autophagie). Analysez vos sensations, énergie, et résultats pour ajuster. Le jeûne doit rester confortable et durable.',
          icon: 'TrendingUp'
        }
      ],
      tips: [
        'Commencez progressivement : réduisez d\'abord votre fenêtre de 1h par semaine',
        'Restez hydraté pendant le jeûne : eau, thé, café noir sans sucre sont autorisés',
        'Planifiez vos entraînements en fin de fenêtre de jeûne ou début d\'alimentation',
        'Les premiers jours sont difficiles : votre corps s\'adapte en 5-7 jours généralement',
        'Le jeûne n\'est pas obligatoire : c\'est un outil, pas une règle absolue'
      ],
      faq: [
        {
          question: 'Le jeûne fait-il perdre du muscle ?',
          answer: 'Non, si vous maintenez un apport protéique suffisant et continuez l\'entraînement. Le jeûne préserve même mieux la masse musculaire qu\'une restriction calorique classique grâce à l\'hormone de croissance. L\'app optimise vos apports.'
        },
        {
          question: 'Puis-je m\'entraîner à jeun ?',
          answer: 'Oui ! Beaucoup trouvent même de meilleures performances. Commencez par des séances légères à jeun, puis progressez. Restez hydraté et écoutez votre corps. Si vous ressentez des vertiges, mangez avant l\'entraînement.'
        },
        {
          question: 'Que puis-je consommer pendant le jeûne ?',
          answer: 'Eau, thé, café noir, infusions sans sucre. Évitez tout ce qui a des calories ou édulcorants qui pourraient interrompre l\'état de jeûne. Un bouillon léger est acceptable si vous ressentez une faiblesse inhabituelle.'
        },
        {
          question: 'Comment gérer les occasions sociales ?',
          answer: 'Le jeûne doit s\'adapter à votre vie, pas l\'inverse. Décalez votre fenêtre ponctuellement, ou prenez un jour off sans culpabilité. La régularité compte plus que la perfection. Le système comprend ces flexibilités.'
        }
      ],
      relatedActions: [
        {
          label: 'Démarrer un jeûne',
          description: 'Lancez votre timer de jeûne intermittent'
        },
        {
          label: 'Changer de protocole',
          description: 'Modifiez votre protocole ou fenêtre de jeûne'
        }
      ]
    },
    {
      id: 'health',
      title: 'Santé',
      description: 'Informations médicales',
      color: '#EF4444',
      icon: 'Heart',
      keyPoints: ['Conditions médicales', 'Traitements'],
      steps: [
        {
          title: 'Déclarez vos conditions médicales',
          description: 'Listez vos pathologies chroniques : diabète, hypertension, troubles thyroïdiens, maladies cardiovasculaires, etc. Ces informations permettent d\'adapter les recommandations nutritionnelles et d\'entraînement à votre santé.',
          icon: 'Stethoscope'
        },
        {
          title: 'Indiquez vos traitements en cours',
          description: 'Précisez vos médicaments réguliers et leur posologie. Certains traitements influencent le métabolisme, l\'appétit, ou les performances. Le système tiendra compte de ces facteurs dans ses calculs.',
          icon: 'Pill'
        },
        {
          title: 'Notez vos antécédents et interventions',
          description: 'Mentionnez les chirurgies passées, blessures importantes, ou limitations physiques permanentes. Ces données aident à prévenir les exercices contre-indiqués et suggérer des adaptations appropriées.',
          icon: 'FileText'
        },
        {
          title: 'Partagez avec votre médecin si besoin',
          description: 'Le système peut générer des rapports médicaux complets de votre suivi pour votre médecin ou nutritionniste. Vos données santé restent cryptées et ne sont jamais partagées sans votre autorisation explicite.',
          icon: 'Shield'
        }
      ],
      tips: [
        'Consultez votre médecin avant de commencer un programme si vous avez des pathologies',
        'Mettez à jour immédiatement si un nouveau traitement est prescrit',
        'Les données de santé sont les plus sensibles : elles sont cryptées et isolées',
        'Le système alerte automatiquement si une recommandation semble incompatible',
        'N\'hésitez pas à être exhaustif : mieux vaut trop d\'infos que pas assez'
      ],
      faq: [
        {
          question: 'Mes données médicales sont-elles vraiment protégées ?',
          answer: 'Oui, absolument. Elles sont cryptées de bout en bout, stockées séparément de vos autres données, et jamais transmises à des tiers. Seul vous pouvez les consulter et décider de les partager. Conformité totale RGPD et normes médicales.'
        },
        {
          question: 'L\'application peut-elle remplacer un suivi médical ?',
          answer: 'Non, jamais. L\'application est un outil de suivi et d\'optimisation, pas un dispositif médical. Consultez toujours un professionnel de santé pour le diagnostic, traitement, ou modification de protocole médical.'
        },
        {
          question: 'Comment le système adapte-t-il les recommandations ?',
          answer: 'Selon vos pathologies, le système ajuste les objectifs caloriques, exclut certains exercices à risque, adapte l\'intensité, et peut suggérer des nutriments spécifiques. Par exemple : index glycémique bas pour diabétiques.'
        },
        {
          question: 'Puis-je exporter mes données pour mon médecin ?',
          answer: 'Oui, depuis les paramètres vous pouvez générer un rapport PDF médical complet : historique de poids, nutrition, activité, constantes vitales si saisies. Format standardisé lisible par les professionnels de santé.'
        }
      ],
      relatedActions: [
        {
          label: 'Générer un rapport médical',
          description: 'Exportez vos données santé pour votre médecin'
        },
        {
          label: 'Configurer les alertes',
          description: 'Personnalisez les alertes santé et sécurité'
        }
      ]
    },
    {
      id: 'menstrual',
      title: 'Cycle',
      description: 'Suivi du cycle',
      color: '#EC4899',
      icon: 'Calendar',
      keyPoints: ['Dates des dernières règles', 'Symptômes'],
      steps: [
        {
          title: 'Enregistrez votre cycle menstruel',
          description: 'Notez la date de début de vos règles et la durée de votre cycle habituel. Le système prédit vos prochaines périodes et adapte automatiquement les recommandations d\'entraînement et nutrition selon votre phase hormonale.',
          icon: 'CalendarDays'
        },
        {
          title: 'Suivez vos symptômes',
          description: 'Documentez vos symptômes : douleurs, humeur, énergie, rétention d\'eau, sommeil. Ces données permettent d\'identifier des patterns et d\'optimiser votre routine selon les phases de votre cycle pour de meilleurs résultats.',
          icon: 'Heart'
        },
        {
          title: 'Optimisez selon vos phases',
          description: 'Phase folliculaire : plus d\'énergie, idéal pour entraînements intenses. Phase lutéale : privilégier récupération et volume modéré. Le système ajuste automatiquement intensité et nutrition selon votre phase actuelle.',
          icon: 'TrendingUp'
        },
        {
          title: 'Gérez grossesse et allaitement',
          description: 'Activez le mode grossesse ou allaitement pour adapter complètement les recommandations. Objectifs caloriques, exercices autorisés, nutriments essentiels, tout est recalculé pour cette période particulière.',
          icon: 'Baby'
        }
      ],
      tips: [
        'Les 3 premiers mois de suivi permettent au système d\'identifier vos patterns uniques',
        'Ne vous découragez pas si vos performances baissent en phase lutéale : c\'est normal',
        'La rétention d\'eau pré-menstruelle peut masquer votre vraie perte de poids',
        'Augmentez légèrement les glucides en phase lutéale pour gérer les fringales',
        'Le suivi du cycle améliore la précision des prédictions de poids de 30%'
      ],
      faq: [
        {
          question: 'Le cycle affecte-t-il vraiment mes performances ?',
          answer: 'Oui, significativement. Les fluctuations hormonales influencent force, endurance, récupération, métabolisme. En optimisant selon votre cycle, vous maximisez résultats et minimisez frustration. C\'est un avantage exploitable, pas une contrainte.'
        },
        {
          question: 'Que faire si mon cycle est irrégulier ?',
          answer: 'Le système s\'adapte aux cycles irréguliers. Il apprend vos patterns uniques même s\'ils varient. Consultez un médecin si l\'irrégularité est nouvelle ou accompagnée de symptômes inhabituels. L\'app peut documer pour votre consultation.'
        },
        {
          question: 'Comment gérer la rétention d\'eau pré-menstruelle ?',
          answer: 'C\'est normal et temporaire. Le système le sait et ajuste les interprétations de votre poids. Ne vous pesez pas juste avant les règles si ça vous affecte mentalement. La tendance sur 30 jours reste fiable malgré ces fluctuations.'
        },
        {
          question: 'L\'allaitement change quoi concrètement ?',
          answer: 'L\'allaitement augmente vos besoins caloriques de 300-500 kcal/jour et modifie vos besoins nutritionnels (calcium, oméga-3, hydratation). Le système recalcule tout et suggère des aliments galactogènes. Pas de déficit agressif pendant l\'allaitement.'
        }
      ],
      relatedActions: [
        {
          label: 'Enregistrer mes règles',
          description: 'Notez le début de votre cycle actuel'
        },
        {
          label: 'Voir mes prédictions',
          description: 'Consultez les prévisions de votre cycle'
        }
      ]
    },
    {
      id: 'geo',
      title: 'Géo',
      description: 'Données environnementales',
      color: '#3B82F6',
      icon: 'MapPin',
      keyPoints: ['Pays', 'Climat'],
      steps: [
        {
          title: 'Définissez votre localisation',
          description: 'Indiquez votre pays et région pour adapter les recommandations nutritionnelles selon la disponibilité locale des aliments, les habitudes culturelles, et les données de santé publique de votre zone géographique.',
          icon: 'MapPin'
        },
        {
          title: 'Configurez vos préférences climatiques',
          description: 'Le système prend en compte votre climat pour ajuster l\'hydratation, les recommandations d\'activité en extérieur, et les suggestions nutritionnelles saisonnières. Tropical, tempéré, froid : chaque climat a ses spécificités.',
          icon: 'Cloud'
        },
        {
          title: 'Activez les données environnementales',
          description: 'Avec votre permission, l\'app accède à la météo, qualité de l\'air, UV, température pour optimiser timing d\'entraînements outdoor, hydratation, et vous alerter si conditions défavorables.',
          icon: 'Droplets'
        },
        {
          title: 'Adaptez selon vos déplacements',
          description: 'En voyage ou déménagement, mettez à jour votre localisation. Le système adapte automatiquement suggestions alimentaires selon disponibilité locale et recalcule selon nouveau fuseau horaire et climat.',
          icon: 'Navigation'
        }
      ],
      tips: [
        'Les données géographiques affinent les calculs métaboliques selon votre population',
        'Le système intègre données santé publique pour prévenir carences régionales',
        'Les suggestions nutritionnelles privilégient aliments locaux et de saison',
        'En voyage, le système vous aide à maintenir routine malgré changements',
        'Vous pouvez désactiver géolocalisation et entrer localisation manuellement'
      ],
      faq: [
        {
          question: 'Pourquoi ma localisation est-elle utile ?',
          answer: 'Elle permet d\'adapter les recommandations nutritionnelles aux aliments disponibles localement, d\'intégrer les données de santé publique de votre région (carences courantes), et d\'ajuster selon climat et saison pour optimiser votre progression.'
        },
        {
          question: 'Mes données de localisation sont-elles partagées ?',
          answer: 'Jamais. Votre localisation sert uniquement à adapter les algorithmes localement sur votre appareil. Aucune donnée GPS n\'est stockée ou transmise. On utilise seulement votre pays/région pour les calculs.'
        },
        {
          question: 'Comment le climat affecte-t-il mes besoins ?',
          answer: 'Climat chaud : augmentation besoins hydratation et électrolytes, timing d\'entraînement ajusté. Climat froid : besoins caloriques légèrement supérieurs, attention vitamine D. Le système adapte automatiquement selon saisons.'
        },
        {
          question: 'Que se passe-t-il si je voyage souvent ?',
          answer: 'Vous pouvez créer plusieurs profils géographiques et switcher facilement. Le système conserve vos données et adapte temporairement selon votre destination. Idéal pour nomades digitaux ou voyageurs fréquents.'
        }
      ],
      relatedActions: [
        {
          label: 'Mettre à jour ma localisation',
          description: 'Modifiez votre pays ou région'
        },
        {
          label: 'Voir les données environnementales',
          description: 'Consultez météo et qualité de l\'air'
        }
      ]
    },
    {
      id: 'avatar',
      title: 'Avatar',
      description: 'Scanner 3D',
      color: '#A855F7',
      icon: 'Camera',
      keyPoints: ['Créez votre avatar 3D', 'Suivez vos transformations'],
      steps: [
        {
          title: 'Préparez votre premier scan',
          description: 'Portez des vêtements moulants ou sous-vêtements. Trouvez un endroit bien éclairé avec fond neutre. Retirez accessoires et bijoux. Le scan 3D analyse vos proportions réelles pour créer votre avatar numérique fidèle.',
          icon: 'Info'
        },
        {
          title: 'Réalisez le scan corporel',
          description: 'Suivez les instructions visuelles : positionnez-vous face caméra, bras légèrement écartés. L\'app capture automatiquement photos de face, profil, dos. Le processus prend 2-3 minutes et génère modèle 3D complet.',
          icon: 'Camera'
        },
        {
          title: 'Validez et ajustez votre avatar',
          description: 'Vérifiez votre avatar 3D généré. Ajustez si nécessaire les proportions détectées automatiquement. L\'avatar sert de référence pour projections futures et visualisation de votre transformation en temps réel.',
          icon: 'User'
        },
        {
          title: 'Suivez votre évolution corporelle',
          description: 'Rescannez toutes les 2-4 semaines pour voir votre transformation 3D. Comparez avatars dans le temps, visualisez zones de progression, mesurez mensurations automatiquement. Motivation garantie !',
          icon: 'TrendingUp'
        }
      ],
      tips: [
        'Scannez toujours dans conditions similaires : même heure, même tenue, même lieu',
        'Un scan mensuel suffit pour suivre évolution sans être obsessionnel',
        'Les scans face permettent aussi analyse faciale pour avatar complet si activé',
        'Qualité du scan dépend de luminosité : lumière naturelle indirecte est idéale',
        'Vous pouvez refaire scan immédiatement si résultat vous semble imprécis'
      ],
      faq: [
        {
          question: 'Le scanner 3D est-il précis ?',
          answer: 'Oui, très. Il utilise analyse photogrammétrique avancée pour reconstruire modèle 3D avec précision au centimètre près. Les mensurations calculées sont comparables à celles prises manuellement, mais plus objectives et reproductibles.'
        },
        {
          question: 'Mes photos sont-elles stockées ?',
          answer: 'Les photos brutes sont traitées localement puis supprimées. Seul le modèle 3D anonymisé est conservé crypté sur serveurs sécurisés. Vous pouvez supprimer tous vos scans à tout moment depuis paramètres de confidentialité.'
        },
        {
          question: 'Puis-je scanner sans montrer mon visage ?',
          answer: 'Oui, le scan corporel n\'inclut pas le visage par défaut. Le scan facial est optionnel et séparé, pour avatar complet. Vous contrôlez totalement ce qui est scanné et peut désactiver tout scan 3D si vous préférez.'
        },
        {
          question: 'Comment sont calculées les mensurations ?',
          answer: 'Le modèle 3D permet mesure virtuelle précise de tour de taille, hanches, cuisses, poitrine, bras, etc. Les mesures sont cohérentes entre scans contrairement à mesures manuelles sujettes à variations de tension du mètre.'
        }
      ],
      relatedActions: [
        {
          label: 'Lancer un scan corporel',
          description: 'Créez ou mettez à jour votre avatar 3D'
        },
        {
          label: 'Voir ma galerie de progression',
          description: 'Comparez vos avatars dans le temps'
        }
      ]
    }
  ]
};
