import type { GuideContent } from './types';

export const culinaireGuide: GuideContent = {
  page: 'fridge',
  title: 'Guide de la Forge Culinaire',
  description: 'Maîtrisez le scanner de frigo, les recettes IA et la planification alimentaire',
  sections: [
    {
      id: 'pipeline-scanner',
      title: 'Pipeline de Scanner de Frigo',
      description: 'Scannez et gérez votre inventaire en 3 étapes',
      color: '#EC4899',
      icon: 'Scan',
      keyPoints: [
        'Photographiez le contenu de votre frigo pour créer un inventaire intelligent',
        'L\'IA détecte automatiquement les aliments, dates de péremption et quantités',
        'Complétez et validez l\'inventaire avec suggestions d\'achats manquants',
        'Utilisez l\'inventaire pour générer recettes, plans et listes de courses'
      ],
      steps: [
        {
          title: 'Capture du frigo',
          description: 'Ouvrez votre réfrigérateur et prenez 2-3 photos : une vue d\'ensemble, puis des zones spécifiques (légumes, produits laitiers, viandes). L\'IA analyse mieux avec de multiples angles. Assurez un bon éclairage, dégagez les étiquettes, et positionnez les aliments visibles. Le système supporte aussi les placards et congélateurs.',
          icon: 'Camera'
        },
        {
          title: 'Analyse et détection IA',
          description: 'L\'IA TwinForge analyse vos photos : reconnaissance des aliments (légumes, fruits, protéines, produits emballés), estimation des quantités (unités, poids approximatif), détection des dates de péremption visibles sur emballages, catégorisation automatique par type et zone de stockage. L\'analyse prend 20-30 secondes et génère un inventaire structuré.',
          icon: 'Brain'
        },
        {
          title: 'Complétion et validation',
          description: 'Revoyez l\'inventaire détecté : vérifiez les aliments, ajoutez ceux oubliés par l\'IA, corrigez les quantités estimées, précisez les dates de péremption. L\'IA suggère des aliments de base manquants (œufs, lait, huile) selon vos habitudes. Validez pour sauvegarder l\'inventaire actif qui servira aux recettes et plans.',
          icon: 'CheckCircle'
        }
      ],
      tips: [
        'Scannez votre frigo 1 fois par semaine pour un inventaire à jour',
        'Placez les aliments proches de la péremption devant pour que l\'IA les détecte',
        'Les codes-barres visibles sur emballages améliorent la détection de produits',
        'L\'IA apprend vos habitudes : plus vous scannez, plus elle anticipe vos besoins',
        'Créez plusieurs sessions de scan : frigo, congélateur, placard pour inventaire complet',
        'Les suggestions de complétion sont basées sur vos recettes favorites et profil',
        'L\'inventaire est synchronisé avec la génération de recettes et plans',
        'Les aliments expirés sont automatiquement retirés après leur date'
      ],
      faq: [
        {
          question: 'L\'IA peut-elle détecter tous les aliments dans mon frigo ?',
          answer: 'L\'IA détecte 80-90% des aliments visibles avec photos de qualité. Les aliments cachés, dans des tupperware opaques, ou très petits peuvent être manqués. C\'est pourquoi l\'étape de complétion manuelle est cruciale : ajoutez ce que l\'IA a raté. La combinaison IA + vous = inventaire parfait.'
        },
        {
          question: 'Comment l\'IA estime-t-elle les quantités des aliments ?',
          answer: 'L\'IA utilise la vision 3D pour estimer les tailles relatives : une pomme ≈ 150g, un paquet de pâtes ≈ 500g, etc. Les estimations ont une marge d\'erreur de ±20%. Pour plus de précision, corrigez manuellement après détection. Les quantités servent à calculer le nombre de portions disponibles pour les recettes.'
        },
        {
          question: 'Dois-je rescanner mon frigo après chaque course ?',
          answer: 'Ce n\'est pas obligatoire mais recommandé pour un inventaire précis. Vous pouvez aussi ajouter manuellement les nouveaux achats sans rescanner entièrement. Le système tracke automatiquement la consommation : quand vous utilisez des ingrédients dans une recette, l\'inventaire se met à jour. Scannez tous les 7-10 jours suffit.'
        },
        {
          question: 'Que se passe-t-il avec les aliments périmés détectés ?',
          answer: 'Les aliments dont la date de péremption est dépassée sont marqués "expiré" dans l\'inventaire mais pas supprimés automatiquement. Vous recevez une notification pour les retirer. L\'IA ne les inclut plus dans les suggestions de recettes. Vous pouvez les supprimer manuellement ou laisser le système les archiver après 3 jours.'
        },
        {
          question: 'L\'inventaire est-il partagé si j\'utilise TwinForge en couple/famille ?',
          answer: 'Actuellement, chaque utilisateur a son propre inventaire. Le partage d\'inventaire familial est en développement. En attendant, désignez un "gestionnaire d\'inventaire" principal qui scanne et met à jour le frigo, et les autres membres consultent les recettes et plans générés à partir de cet inventaire.'
        }
      ],
      relatedActions: [
        {
          label: 'Scanner mon frigo',
          description: 'Créez votre premier inventaire depuis l\'onglet Scanner'
        },
        {
          label: 'Voir mes recettes',
          description: 'Générez des recettes avec votre inventaire actuel'
        }
      ]
    },
    {
      id: 'scanner-tab',
      title: 'Onglet Scanner',
      description: 'Hub de gestion d\'inventaire intelligent',
      color: '#EC4899',
      icon: 'ScanLine',
      keyPoints: [
        'Lancez un nouveau scan de frigo en 1 clic',
        'Consultez votre inventaire actuel avec alertes de péremption',
        'Visualisez les statistiques d\'inventaire et gaspillage',
        'Accédez rapidement aux sessions de scan passées',
        'Recevez des suggestions d\'achats intelligentes'
      ],
      steps: [
        {
          title: 'Utiliser le CTA de scan principal',
          description: 'Le bouton "Scanner mon frigo" lance la pipeline de capture. Il s\'adapte à votre contexte : "Scannez pour la première fois" si nouvel utilisateur, "Mettez à jour votre inventaire" si dernier scan >7 jours, "Rescannez après vos courses" si scan récent mais achats détectés via autres sources. Le CTA est votre point d\'entrée principal.',
          icon: 'Zap'
        },
        {
          title: 'Gérer l\'inventaire actuel',
          description: 'La carte d\'inventaire affiche vos aliments par catégorie (légumes, fruits, protéines, produits laitiers, féculents, condiments) avec quantités, dates de péremption, et alertes colorées : vert (>5 jours), orange (2-5 jours), rouge (<2 jours/urgent). Cliquez sur une catégorie pour voir le détail. Vous pouvez marquer des aliments comme consommés ou ajuster les quantités.',
          icon: 'List'
        },
        {
          title: 'Suivre les statistiques anti-gaspillage',
          description: 'La carte de stats affiche : nombre total d\'aliments en stock, valeur estimée de l\'inventaire (€), aliments proches de péremption nécessitant action, taux de gaspillage sur les 30 derniers jours (aliments expirés non utilisés), économies réalisées grâce aux recettes anti-gaspi. Ces métriques gamifient votre gestion et réduisent le gaspillage alimentaire.',
          icon: 'TrendingUp'
        },
        {
          title: 'Consulter les sessions passées',
          description: 'La liste des scans récents affiche vos 5 dernières sessions avec : date du scan, nombre d\'aliments détectés, photo miniature du frigo, statut (inventaire actif, archivé, ou expiré). Cliquez sur une session pour voir l\'inventaire à cette date. Utile pour comparer l\'évolution de vos stocks et identifier les patterns d\'achats.',
          icon: 'History'
        }
      ],
      tips: [
        'Scannez votre frigo le dimanche soir pour planifier la semaine à venir',
        'Les alertes de péremption apparaissent 2 jours avant pour action préventive',
        'Le système suggère automatiquement des recettes pour utiliser les aliments urgents',
        'L\'inventaire actif se synchronise en temps réel avec les recettes et plans',
        'Vous pouvez ajouter manuellement des aliments sans rescanner (achat unique)',
        'Le taux de gaspillage <10% est excellent, 10-20% est correct, >20% nécessite action',
        'Les sessions archivées restent consultables pour historique et analyses',
        'Activez les notifications push pour alertes de péremption imminente'
      ],
      faq: [
        {
          question: 'Comment le système calcule-t-il la valeur de mon inventaire ?',
          answer: 'Le système utilise une base de prix moyens par aliment (mise à jour mensuelle selon indices INSEE) et applique votre région/pays. La valeur est approximative (±15%) mais donne une bonne idée de votre stock. Utile pour budgétiser et mesurer l\'impact du gaspillage en euros perdus.'
        },
        {
          question: 'Puis-je avoir plusieurs inventaires actifs en parallèle ?',
          answer: 'Oui ! Vous pouvez créer des inventaires séparés pour différents espaces : Frigo principal, Congélateur, Placard, Frigo secondaire. Chaque inventaire est géré indépendamment mais tous sont pris en compte lors de la génération de recettes. Sélectionnez l\'inventaire actif via le dropdown en haut de l\'onglet.'
        },
        {
          question: 'Les quantités d\'inventaire se mettent-elles à jour automatiquement ?',
          answer: 'Partiellement. Quand vous validez une recette générée, le système décrémente automatiquement les ingrédients utilisés de l\'inventaire. Cependant, si vous consommez des aliments hors recettes (snacking, repas externes), vous devez mettre à jour manuellement ou rescanner. Le système détecte les incohérences et suggère un rescan si besoin.'
        },
        {
          question: 'Comment réduire mon taux de gaspillage affiché dans les stats ?',
          answer: 'Stratégies efficaces : 1) Activez les notifications de péremption pour action préventive, 2) Utilisez l\'onglet Recettes pour générer des plats avec aliments urgents en priorité, 3) Planifiez vos repas en début de semaine (onglet Plan) pour consommer méthodiquement, 4) Congelez les aliments proches de péremption si possible, 5) Rescannez régulièrement pour inventaire précis.'
        }
      ],
      relatedActions: [
        {
          label: 'Scanner mon frigo',
          description: 'Mettez à jour votre inventaire maintenant'
        },
        {
          label: 'Générer des recettes',
          description: 'Créez des plats avec vos ingrédients disponibles'
        }
      ]
    },
    {
      id: 'recipes-tab',
      title: 'Onglet Recettes',
      description: 'Génération IA de recettes personnalisées',
      color: '#10B981',
      icon: 'ChefHat',
      keyPoints: [
        'Générez des recettes adaptées à votre inventaire actuel',
        'L\'IA respecte vos contraintes alimentaires et préférences',
        'Consultez votre bibliothèque de recettes générées et favorites',
        'Filtrez par type de plat, temps de préparation et difficulté',
        'Exportez les recettes pour cuisine ou partage'
      ],
      steps: [
        {
          title: 'Lancer la génération IA',
          description: 'Cliquez sur "Générer des recettes" pour accéder au configurateur. Définissez vos critères : nombre de personnes (1-12), type de plat (entrée, plat principal, dessert, complet), temps de préparation max (15min, 30min, 1h, 2h+), difficulté (facile, moyen, expert), et préférences spéciales (utiliser aliments urgents, végétarien, sans gluten, low-carb). L\'IA génère 3-5 recettes adaptées.',
          icon: 'Sparkles'
        },
        {
          title: 'Valider et personnaliser les recettes',
          description: 'L\'IA présente les recettes générées avec : titre créatif, photo IA du plat final, liste d\'ingrédients depuis votre inventaire (avec quantités), ingrédients manquants éventuels (ajoutés à la liste de courses), étapes détaillées, temps total, valeur nutritionnelle (calories, macros). Vous pouvez ajuster les portions, remplacer des ingrédients, ou régénérer si insatisfait.',
          icon: 'Edit'
        },
        {
          title: 'Sauvegarder et cuisiner',
          description: 'Sauvegardez les recettes qui vous plaisent dans votre bibliothèque. Lors de la sauvegarde, choisissez : "Cuisiner maintenant" (décrémente l\'inventaire immédiatement), "Planifier plus tard" (ajoute au plan de repas), ou "Favoris seulement" (garde pour référence). Le mode cuisine affiche les étapes une par une en plein écran, minuteur inclus.',
          icon: 'Bookmark'
        },
        {
          title: 'Gérer votre bibliothèque',
          description: 'Consultez toutes vos recettes générées et favorites avec filtres : type de plat, ingrédients principaux, temps de prép, difficulté, date de création. Les recettes montrent combien de fois vous les avez cuisinées, votre note (1-5 étoiles), et si les ingrédients sont toujours en stock. Supprimez, modifiez, ou dupliquez pour créer des variantes.',
          icon: 'FolderOpen'
        }
      ],
      tips: [
        'Priorisez "utiliser aliments urgents" pour réduire le gaspillage alimentaire',
        'L\'IA adapte les recettes à votre niveau : débutant = instructions détaillées',
        'Les photos IA sont générées spécifiquement pour votre recette, pas stock',
        'Vous pouvez régénérer jusqu\'à 5 fois sans coût de tokens supplémentaires',
        'Les recettes favorites sont prioritaires dans les suggestions de plans',
        'Mode cuisine : posez votre téléphone/tablette en cuisine, écran toujours actif',
        'Les valeurs nutritionnelles sont calculées selon la base CIQUAL/USDA',
        'Partagez vos recettes réussies avec la communauté TwinForge (optionnel)',
        'Les recettes générées sont uniques : l\'IA ne répète jamais exactement'
      ],
      faq: [
        {
          question: 'L\'IA génère-t-elle des recettes réalistes et cuisinables ?',
          answer: 'Oui ! L\'IA est entraînée sur des milliers de recettes validées par chefs et utilisateurs. Elle respecte les associations d\'ingrédients logiques, les temps de cuisson réalistes, et les techniques culinaires standard. Les recettes sont testées automatiquement pour cohérence avant génération. Taux de satisfaction utilisateur : 92%.'
        },
        {
          question: 'Que se passe-t-il si l\'IA utilise un ingrédient que je n\'ai pas ?',
          answer: 'Deux scénarios : 1) Si c\'est un ingrédient de base courant (sel, huile, farine), l\'IA assume que vous l\'avez et marque "à vérifier". 2) Si c\'est spécifique, l\'ingrédient est listé comme "manquant" et ajouté automatiquement à votre liste de courses. Vous pouvez demander à l\'IA de régénérer sans cet ingrédient.'
        },
        {
          question: 'Puis-je modifier une recette générée et la resauvegarder ?',
          answer: 'Oui ! Vous pouvez éditer tous les champs : ingrédients, quantités, étapes, temps. En sauvegardant, le système crée une "version modifiée" liée à l\'originale IA. Vos modifications sont marquées en surbrillance. Si vous cuisinez souvent votre version modifiée, l\'IA l\'apprendra et proposera des recettes similaires.'
        },
        {
          question: 'Les recettes respectent-elles mes contraintes alimentaires du profil ?',
          answer: 'Absolument ! L\'IA lit votre profil : allergies (noix, gluten, lactose...), régime (végétarien, vegan, pescatarien...), intolérances, aversions déclarées, objectifs nutritionnels (low-carb, high-protein...). AUCUNE recette générée ne violera vos contraintes. Si erreur, signalez pour correction et régénération gratuite.'
        },
        {
          question: 'Combien de recettes puis-je générer par jour/mois ?',
          answer: 'Avec l\'abonnement gratuit : 10 générations/mois (3-5 recettes par génération = 30-50 recettes/mois). Abonnement Premium : illimité. Chaque génération coûte des tokens IA (comptabilisés dans votre solde). Les recettes déjà sauvegardées dans votre bibliothèque sont consultables gratuitement à l\'infini.'
        }
      ],
      relatedActions: [
        {
          label: 'Générer des recettes',
          description: 'Créez vos premiers plats avec l\'IA'
        },
        {
          label: 'Voir mon inventaire',
          description: 'Vérifiez vos ingrédients disponibles'
        }
      ]
    },
    {
      id: 'plan-tab',
      title: 'Onglet Plan',
      description: 'Planification alimentaire hebdomadaire intelligente',
      color: '#8B5CF6',
      icon: 'Calendar',
      keyPoints: [
        'Générez un plan de repas complet pour la semaine',
        'L\'IA équilibre nutrition, inventaire et préférences',
        'Visualisez votre semaine avec vue calendrier interactive',
        'Ajustez et personnalisez chaque repas du plan',
        'Générez automatiquement la liste de courses associée'
      ],
      steps: [
        {
          title: 'Configurer votre plan hebdomadaire',
          description: 'Lancez le générateur de plan en définissant : semaine cible (actuelle ou suivante), nombre de repas/jour (2-3), types de repas inclus (petit-déj, déjeuner, dîner, collations), budget hebdomadaire (optionnel), préférences spéciales (utiliser max l\'inventaire, découvrir de nouveaux plats, répéter favoris). L\'IA génère un plan équilibré en 30-40 secondes.',
          icon: 'Settings'
        },
        {
          title: 'Valider le plan généré',
          description: 'L\'IA présente le plan hebdomadaire complet : vue calendrier avec chaque repas affiché dans sa case jour/moment, résumé nutritionnel de la semaine (calories moyennes/jour, équilibre macros), ingrédients nécessaires groupés par type, coût total estimé, et score de faisabilité (basé sur votre inventaire actuel). Chaque repas est cliquable pour voir le détail de la recette.',
          icon: 'Eye'
        },
        {
          title: 'Personnaliser et ajuster',
          description: 'Vous n\'aimez pas un repas ? Cliquez dessus et choisissez : "Régénérer ce repas" (l\'IA propose une alternative), "Échanger avec un autre jour" (glisser-déposer), "Remplacer par une de mes recettes" (sélection depuis bibliothèque), ou "Supprimer" (laisse le créneau vide). Ajustez les portions par repas selon les convives prévus. Le plan se recalcule automatiquement.',
          icon: 'Edit'
        },
        {
          title: 'Activer et suivre le plan',
          description: 'Sauvegardez le plan validé pour l\'activer. Il devient votre plan actif de la semaine. Chaque jour, consultez vos repas prévus, cochez ceux réalisés, et le système décrémente votre inventaire automatiquement. Des notifications vous rappellent les repas à préparer. En fin de semaine, un bilan compare prévu vs réalisé avec suggestions d\'amélioration.',
          icon: 'Play'
        }
      ],
      tips: [
        'Générez votre plan le dimanche pour anticiper la semaine sereinement',
        'Un plan bien suivi réduit le gaspillage de 40% et économise du budget',
        'L\'IA équilibre automatiquement : pas 3 jours de pâtes consécutifs !',
        'Les plans intègrent vos objectifs nutritionnels du profil (calories, macros)',
        'Vous pouvez sauvegarder des "plans templates" pour répéter les semaines types',
        'Mode batch cooking : demandez à l\'IA de regrouper les préparations',
        'Les plans sont synchronisés entre appareils : consultez sur mobile, cuisinez',
        'Un plan actif génère automatiquement la liste de courses optimisée',
        'Les repas du plan non réalisés peuvent être reportés à la semaine suivante'
      ],
      faq: [
        {
          question: 'L\'IA génère-t-elle des plans vraiment équilibrés nutritionnellement ?',
          answer: 'Oui ! L\'IA respecte les recommandations ANSES/OMS : variété alimentaire (tous les groupes alimentaires représentés), équilibre calorique selon votre objectif, répartition macros optimale, apports en micronutriments essentiels (fibres, calcium, fer, vitamines). Chaque plan est validé automatiquement contre ces critères avant génération. Score nutritionnel affiché pour transparence.'
        },
        {
          question: 'Puis-je générer un plan pour ma famille de 4 personnes ?',
          answer: 'Absolument ! Dans la config, précisez le nombre de personnes (1-12). L\'IA adapte toutes les quantités d\'ingrédients proportionnellement. Les préférences/allergies de chaque membre peuvent être combinées (ex: 1 végétarien + 3 omnivores = recettes modulables). Les coûts et liste de courses sont calculés pour le foyer complet.'
        },
        {
          question: 'Que se passe-t-il si je ne peux pas suivre le plan un jour donné ?',
          answer: 'Aucun souci ! Le plan est un guide, pas une obligation. Cochez simplement le repas comme "non réalisé" avec raison (restaurant, invitation, pas faim). Le système n\'a pas décrémenté l\'inventaire, donc les ingrédients restent pour une autre fois. Le bilan de fin de semaine analysera les écarts sans jugement et proposera un plan plus flexible si besoin.'
        },
        {
          question: 'Les plans utilisent-ils en priorité mes ingrédients en stock ?',
          answer: 'Oui ! L\'IA priorise l\'utilisation de votre inventaire actuel, surtout les aliments proches de péremption. Le "score de faisabilité" indique le % de recettes réalisables avec votre stock : >80% = excellent, 50-80% = bon avec quelques achats, <50% = nécessite courses importantes. Vous pouvez forcer "100% avec stock uniquement" en config.'
        },
        {
          question: 'Puis-je avoir plusieurs plans en parallèle (perso + pro) ?',
          answer: 'Vous pouvez créer plusieurs plans mais un seul est "actif" à la fois. Cas d\'usage : Plan Semaine Normale + Plan Batch Cooking Weekend. Basculez entre les plans via le sélecteur. Les deux sont sauvegardés et modifiables. Utile pour tester différentes stratégies avant d\'activer celle qui vous convient.'
        }
      ],
      relatedActions: [
        {
          label: 'Générer un plan',
          description: 'Créez votre plan hebdomadaire personnalisé'
        },
        {
          label: 'Voir mes recettes',
          description: 'Parcourez votre bibliothèque de recettes'
        }
      ]
    },
    {
      id: 'courses-tab',
      title: 'Onglet Courses',
      description: 'Génération automatique de liste de courses',
      color: '#F59E0B',
      icon: 'ShoppingCart',
      keyPoints: [
        'Générez votre liste de courses depuis un plan actif',
        'L\'IA optimise les achats selon votre inventaire actuel',
        'Organisez par rayon pour efficacité en magasin',
        'Estimez le budget total avant de partir faire les courses',
        'Cochez les articles achetés en temps réel'
      ],
      steps: [
        {
          title: 'Générer depuis un plan',
          description: 'Si vous avez un plan de repas actif, cliquez sur "Générer liste de courses". L\'IA analyse le plan, compare avec votre inventaire actuel, identifie les ingrédients manquants, et génère une liste optimisée. Vous pouvez aussi générer sans plan en sélectionnant manuellement des recettes depuis votre bibliothèque. La génération prend 5-10 secondes.',
          icon: 'Sparkles'
        },
        {
          title: 'Organiser par rayon',
          description: 'La liste est automatiquement structurée par rayon de supermarché : Fruits & Légumes, Boucherie/Poissonnerie, Produits Laitiers, Épicerie, Surgelés, Boissons, etc. Cette organisation suit le parcours type en magasin pour efficacité maximale. Vous pouvez réorganiser manuellement ou choisir un template de magasin spécifique (Carrefour, Auchan, Leclerc...) pour ordre optimisé.',
          icon: 'List'
        },
        {
          title: 'Estimer le budget',
          description: 'Chaque article affiche un prix estimé basé sur la base de prix moyens régionaux. Le total en bas de liste donne le budget prévisionnel ±15%. Vous pouvez : marquer des articles "optionnels" si budget serré, définir un budget max (l\'IA suggère quoi retirer), comparer avec listes passées pour voir l\'évolution de vos dépenses alimentaires. Budget serré = focus sur essentiel.',
          icon: 'DollarSign'
        },
        {
          title: 'Faire les courses avec l\'app',
          description: 'Mode Courses : affichez la liste en plein écran, cochez chaque article acheté en temps réel, ajoutez des achats impulsifs (hors liste), scannez les codes-barres pour confirmation d\'article. À la fin, l\'app compare budget prévu vs réel, les articles cochés mettent à jour automatiquement votre inventaire, et un récap affiche vos économies réalisées vs achats inutiles.',
          icon: 'CheckSquare'
        }
      ],
      tips: [
        'Générez votre liste après avoir validé le plan hebdomadaire pour cohérence',
        'Le mode hors-ligne sauvegarde la liste localement : courses sans réseau OK',
        'Partagez la liste avec votre conjoint(e) via lien pour courses collaboratives',
        'Les articles cochés disparaissent ou grisent selon votre préférence (réglages)',
        'L\'IA suggère des marques "meilleur rapport qualité-prix" selon avis utilisateurs',
        'Activez la localisation pour suggestions de magasins proches avec meilleurs prix',
        'Les listes archivées restent consultables pour répéter les courses types',
        'Mode drive : exportez la liste au format compatible avec Carrefour Drive, etc.',
        'La fonctionnalité "scan et compare" vérifie si prix en magasin < prix estimé'
      ],
      faq: [
        {
          question: 'La liste de courses est-elle vraiment exhaustive ?',
          answer: 'Oui, si générée depuis un plan validé ! L\'IA inclut TOUS les ingrédients manquants pour réaliser les recettes du plan. Elle ajoute aussi les ingrédients de base manquants (huile, sel, épices courantes) si non détectés dans l\'inventaire. Cependant, vérifiez toujours manuellement : l\'humain garde le contrôle final.'
        },
        {
          question: 'Comment l\'IA calcule-t-elle les quantités à acheter ?',
          answer: 'L\'IA fait le calcul : Quantité nécessaire (selon recettes du plan) - Quantité en stock (inventaire actuel) = Quantité à acheter. Elle arrondit intelligemment : si recette nécessite 150g de carottes et vous avez 0g, elle suggère "500g (1 sachet)" car c\'est le conditionnement standard. Vous ajustez si vous voulez acheter moins/plus.'
        },
        {
          question: 'Puis-je créer une liste de courses sans plan de repas ?',
          answer: 'Oui ! Deux méthodes : 1) Sélection manuelle : choisissez 3-5 recettes depuis votre bibliothèque, l\'IA génère la liste pour ces recettes uniquement. 2) Liste libre : ajoutez manuellement vos articles sans lien à des recettes (courses du quotidien). Les deux modes coexistent : recettes + extras.'
        },
        {
          question: 'Les prix estimés sont-ils fiables ?',
          answer: 'Les prix sont approximatifs avec marge de ±15%. Ils sont basés sur une base de données de prix moyens par région/ville, mise à jour mensuellement. Les prix réels varient selon magasin, promotions, et marques. Utilisez l\'estimation comme repère budgétaire, pas comme vérité absolue. Les utilisateurs Premium peuvent contribuer aux prix réels pour affiner.'
        },
        {
          question: 'Comment fonctionne le mode courses collaboratif en couple/famille ?',
          answer: 'Générez la liste, cliquez sur "Partager", choisissez "Lien collaboratif". Envoyez ce lien à votre partenaire. Vous voyez tous les deux la même liste en temps réel : si l\'un coche un article, l\'autre le voit instantanément. Parfait pour se répartir les courses en magasin ou si l\'un est à la maison et l\'autre en courses (ajouts en live).'
        }
      ],
      relatedActions: [
        {
          label: 'Générer une liste',
          description: 'Créez votre liste de courses depuis un plan'
        },
        {
          label: 'Voir mon plan',
          description: 'Consultez votre plan de repas hebdomadaire'
        }
      ]
    }
  ]
};
