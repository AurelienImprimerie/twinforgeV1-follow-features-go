import type { GuideContent } from './types';

export const settingsGuide: GuideContent = {
  page: 'settings',
  title: 'Guide des Paramètres',
  description: 'Personnalisez votre expérience',
  sections: [
    {
      id: 'preferences',
      title: 'Préférences',
      description: 'Personnalisation',
      color: '#60A5FA',
      icon: 'Sliders',
      keyPoints: ['Mode Performance', 'Qualité 3D'],
      steps: [
        {
          title: 'Comprendre les modes de rendu',
          description: 'L\'application propose deux modes : Performance (optimisé pour autonomie et fluidité) et Qualité (effets visuels complets). Le mode se choisit automatiquement selon votre appareil, mais vous pouvez forcer manuellement.',
          icon: 'Sliders'
        },
        {
          title: 'Ajuster la qualité 3D',
          description: 'Les avatars 3D peuvent être affichés en qualité Basse, Moyenne, ou Haute. Basse : rendu simplifié, Moyenne : équilibre optimal, Haute : détails maximaux. Adaptez selon performances de votre appareil.',
          icon: 'Maximize2'
        },
        {
          title: 'Configurer les animations',
          description: 'Activez ou désactivez les animations d\'interface, transitions de page, effets de particules. Désactiver améliore fluidité sur appareils anciens et économise batterie sans réduire fonctionnalités.',
          icon: 'Sparkles'
        },
        {
          title: 'Personnaliser l\'interface',
          description: 'Choisissez votre thème préféré, taille de police, espacement. L\'application s\'adapte à vos préférences d\'accessibilité et peut fonctionner entièrement en mode sombre pour réduire fatigue visuelle.',
          icon: 'Palette'
        }
      ],
      tips: [
        'Le mode Performance double l\'autonomie sur mobile sans perdre de fonctionnalités',
        'La qualité 3D Moyenne offre le meilleur rapport qualité/performance',
        'Désactivez animations si vous utilisez l\'app intensivement toute la journée',
        'Le système détecte automatiquement les appareils bas de gamme et s\'adapte',
        'Testez les différents modes pour trouver votre préférence personnelle'
      ],
      faq: [
        {
          question: 'Comment savoir quel mode choisir ?',
          answer: 'Si votre appareil a plus de 3 ans, privilégiez Mode Performance. Si vous remarquez ralentissements ou surchauffe, passez en Performance. Les appareils récents (moins de 2 ans) gèrent parfaitement le mode Qualité.'
        },
        {
          question: 'Les modes affectent-ils la précision des données ?',
          answer: 'Non, absolument pas. Seul l\'affichage change. Tous les calculs, analyses, et fonctionnalités IA restent identiques quel que soit le mode. C\'est purement visuel pour optimiser votre confort d\'utilisation.'
        },
        {
          question: 'Puis-je changer de mode en cours d\'utilisation ?',
          answer: 'Oui, instantanément depuis les paramètres. Le changement prend effet immédiatement sans redémarrage. Vous pouvez basculer selon contexte : Performance en déplacement, Qualité à la maison sur secteur.'
        },
        {
          question: 'Le mode Performance réduit-il vraiment la consommation ?',
          answer: 'Oui, significativement. Jusqu\'à 40% d\'économie batterie en désactivant effets GPU-intensifs, ombres, flous, animations complexes. Parfait pour longues sessions d\'entraînement sans accès à chargeur.'
        }
      ],
      relatedActions: [
        {
          label: 'Changer de mode',
          description: 'Basculez entre Performance et Qualité'
        },
        {
          label: 'Réinitialiser préférences',
          description: 'Restaurez les paramètres par défaut'
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Rappels et alertes',
      color: '#F59E0B',
      icon: 'Bell',
      keyPoints: ['Rappels de repas', 'Notifications de motivation'],
      steps: [
        {
          title: 'Activer les notifications système',
          description: 'Autorisez les notifications dans les paramètres de votre système d\'exploitation. Sans cette autorisation, l\'app ne peut pas vous envoyer de rappels. Cette étape est indispensable pour le suivi automatisé.',
          icon: 'Bell'
        },
        {
          title: 'Configurer les rappels de repas',
          description: 'Définissez les horaires de vos repas habituels. L\'app vous rappellera de scanner vos repas aux moments appropriés. Fréquence ajustable : jamais, une fois, ou plusieurs rappels selon vos besoins.',
          icon: 'Utensils'
        },
        {
          title: 'Personnaliser les alertes d\'entraînement',
          description: 'Choisissez quand recevoir rappels d\'entraînement : selon votre planning habituel, ou lorsque vous n\'avez pas bougé depuis X heures. Motivants sans être intrusifs, ils s\'adaptent à votre rythme.',
          icon: 'Dumbbell'
        },
        {
          title: 'Gérer les notifications de progression',
          description: 'Activez alertes de records battus, niveaux débloqués, objectifs atteints, séries maintenues. Ces notifications célèbrent vos victoires et maintiennent motivation. Fréquence modérable selon préférence.',
          icon: 'Trophy'
        }
      ],
      tips: [
        'Commencez avec notifications activées, vous pourrez toujours réduire ensuite',
        'Les rappels de repas sont les plus utiles pour maintenir un suivi complet',
        'Désactivez notifications nocturnes pour ne pas être dérangé pendant sommeil',
        'Mode silencieux respecte les paramètres système : pas de sons en mode silencieux',
        'Vous pouvez snoozer temporairement les rappels sans les désactiver définitivement'
      ],
      faq: [
        {
          question: 'Comment éviter d\'être spammé de notifications ?',
          answer: 'L\'app regroupe intelligemment les notifications. Maximum 3 par jour si vous configurez correctement. Privilégiez rappels critiques (repas, poids) et désactivez les secondaires (conseils, motivationnels).'
        },
        {
          question: 'Les notifications fonctionnent-elles hors connexion ?',
          answer: 'Les rappels programmés (repas, entraînement) fonctionnent offline car planifiés localement. Les notifications de progression (records, niveaux) nécessitent connexion car calculées serveur en temps réel.'
        },
        {
          question: 'Puis-je personnaliser le son des notifications ?',
          answer: 'Les sons suivent les paramètres système de votre appareil. Vous ne pouvez pas définir son spécifique par type de notification, mais pouvez activer/désactiver sons globalement depuis paramètres app.'
        },
        {
          question: 'Que faire si je ne reçois aucune notification ?',
          answer: 'Vérifiez : 1) Autorisation système accordée, 2) App non en mode économie batterie agressive, 3) Notifications activées dans paramètres app, 4) Appareil connecté internet pour notifs temps réel. Guide dépannage disponible.'
        }
      ],
      relatedActions: [
        {
          label: 'Tester les notifications',
          description: 'Recevez une notification de test immédiatement'
        },
        {
          label: 'Configurer les horaires',
          description: 'Définissez vos plages de disponibilité'
        }
      ]
    },
    {
      id: 'appareils',
      title: 'Appareils',
      description: 'Objets connectés',
      color: '#18E3FF',
      icon: 'Watch',
      keyPoints: ['Connectez votre montre', 'Synchronisation automatique'],
      steps: [
        {
          title: 'Vérifier la compatibilité',
          description: 'L\'app supporte Apple Watch, montres Wear OS, Garmin, Fitbit, Polar, Suunto, Whoop, Oura Ring. Vérifiez que votre appareil est dans la liste des compatibles avant de tenter connexion.',
          icon: 'CheckCircle'
        },
        {
          title: 'Connecter votre appareil',
          description: 'Activez Bluetooth sur smartphone et montre. Dans l\'app, allez Paramètres > Appareils > Ajouter. Suivez instructions spécifiques à votre marque. La connexion prend généralement 1-2 minutes.',
          icon: 'Bluetooth'
        },
        {
          title: 'Configurer la synchronisation',
          description: 'Choisissez données à synchroniser : fréquence cardiaque, pas, calories, sommeil, activités, GPS. Plus vous synchronisez, plus suivi est précis, mais consommation batterie augmente. Trouvez votre équilibre.',
          icon: 'RefreshCw'
        },
        {
          title: 'Résoudre les problèmes courants',
          description: 'Connexion échoue ? 1) Redémarrez montre et smartphone, 2) Vérifiez dernière version app montre installée, 3) Réinitialisez Bluetooth, 4) Consultez FAQ spécifique marque. Support disponible 24/7.',
          icon: 'AlertCircle'
        }
      ],
      tips: [
        'Synchronisez une fois par jour suffit pour la plupart des besoins',
        'La synchronisation auto consomme 5-10% batterie montre supplémentaire',
        'Données cardio sont les plus précieuses pour calculs métaboliques',
        'Vous pouvez connecter plusieurs appareils simultanément (montre + balance)',
        'Les données montre écrasent estimations app pour calculs plus précis'
      ],
      faq: [
        {
          question: 'Ma montre n\'apparaît pas dans la liste ?',
          answer: 'Si modèle récent et absent, tentez connexion générique de sa marque. Si ancienne génération (5+ ans), peut ne pas être supportée. Consultez liste exhaustive compatibilité sur site web, mise à jour régulièrement.'
        },
        {
          question: 'Comment savoir si synchronisation fonctionne ?',
          answer: 'Vérifiez onglet Appareils : dernière synchro affichée avec timestamp. Si données apparaissent dans tableau de bord (cardio, pas), c\'est bon. Icône montre avec coche verte = connecté et synchronisé.'
        },
        {
          question: 'Puis-je utiliser plusieurs sources pour mêmes données ?',
          answer: 'Oui, mais l\'app priorise automatiquement : montre > balance > smartphone > saisie manuelle. Si conflit, source la plus fiable (généralement montre) est retenue. Vous voyez source utilisée pour chaque métrique.'
        },
        {
          question: 'Les données montre sont-elles plus précises que l\'app ?',
          answer: 'Oui, significativement. Montres mesurent cardio continu, GPS précis, mouvements réels. App estime avec algorithmes validés scientifiquement, mais rien ne remplace mesures réelles. Différence 10-30% selon métrique.'
        }
      ],
      relatedActions: [
        {
          label: 'Ajouter un appareil',
          description: 'Connectez une nouvelle montre ou balance'
        },
        {
          label: 'Forcer une synchronisation',
          description: 'Synchronisez manuellement vos appareils maintenant'
        }
      ]
    },
    {
      id: 'export',
      title: 'Export',
      description: 'Extraction de données',
      color: '#10B981',
      icon: 'Download',
      keyPoints: ['Générez un rapport PDF', 'Format médical'],
      steps: [
        {
          title: 'Choisir le type d\'export',
          description: 'Plusieurs formats disponibles : Export personnel (PDF lisible), Export médical (format standardisé pour professionnels santé), Export brut (CSV/JSON pour analyse avancée), Export RGPD (toutes vos données).',
          icon: 'FileText'
        },
        {
          title: 'Sélectionner la période et données',
          description: 'Définissez période à exporter : dernière semaine, mois, année, ou dates personnalisées. Cochez catégories désirées : poids, nutrition, entraînement, santé, mensurations. Export partiel ou complet.',
          icon: 'Calendar'
        },
        {
          title: 'Générer et télécharger',
          description: 'Lancez génération. Selon volume, prend 5 secondes à 2 minutes. Notification quand prêt. Fichier téléchargeable pendant 7 jours, puis supprimé automatiquement serveurs pour sécurité.',
          icon: 'Download'
        },
        {
          title: 'Partager avec professionnels',
          description: 'Pour médecins/nutritionnistes, utilisez Export médical. Format standardisé, anonymisable, graphiques professionnels inclus. Partagez par email sécurisé directement depuis app ou téléchargez puis transmettez.',
          icon: 'Share2'
        }
      ],
      tips: [
        'Export médical génère PDF 20-50 pages selon période et complétude données',
        'Format CSV permet analyse dans Excel, Google Sheets, ou outils statistiques',
        'Générez export mensuel comme backup personnel de vos progrès',
        'L\'export RGPD complet prend 24-48h, contient TOUTES vos données',
        'Les exports sont chiffrés pendant stockage temporaire sur serveurs'
      ],
      faq: [
        {
          question: 'Quelle différence entre export personnel et médical ?',
          answer: 'Personnel : PDF format narratif, graphiques grand public, explications simplifiées, focus motivation. Médical : format standardisé professionnel, terminologie technique, graphiques cliniques, données brutes incluses.'
        },
        {
          question: 'Puis-je automatiser les exports réguliers ?',
          answer: 'Oui, depuis paramètres avancés : export automatique mensuel par email. Utile pour archivage personnel ou suivi médical régulier. Format et contenu configurables. Désactivable à tout moment.'
        },
        {
          question: 'Les exports incluent-ils mes photos et scans 3D ?',
          answer: 'Export personnel/médical : graphiques et mensurations uniquement, pas photos brutes. Export RGPD complet : inclut tout, y compris photos et modèles 3D. Fichier volumineux (plusieurs GB potentiellement).'
        },
        {
          question: 'Comment supprimer mes données après export ?',
          answer: 'Depuis Confidentialité > Supprimer compte ou données. Export ne supprime rien automatiquement. Vous pouvez exporter puis supprimer définitivement si souhaitez quitter service. Suppression irréversible.'
        }
      ],
      relatedActions: [
        {
          label: 'Générer export médical',
          description: 'Créez un rapport pour votre médecin'
        },
        {
          label: 'Télécharger export RGPD',
          description: 'Obtenez toutes vos données personnelles'
        }
      ]
    },
    {
      id: 'confidentialite',
      title: 'Confidentialité',
      description: 'Protection des données',
      color: '#EF4444',
      icon: 'Shield',
      keyPoints: ['Données privées', 'Contrôle de visibilité'],
      steps: [
        {
          title: 'Comprendre vos droits RGPD',
          description: 'Vous avez contrôle total sur vos données : droit d\'accès, rectification, suppression, portabilité, limitation traitement. L\'app respecte strictement RGPD européen, même pour utilisateurs hors UE.',
          icon: 'Shield'
        },
        {
          title: 'Gérer la visibilité de votre profil',
          description: 'Trois niveaux : Privé (invisible), Semi-public (classement anonyme), Public (profil consultable). Changez à tout moment. Public donne accès stats globales, pas données sensibles (santé, nutrition détaillée).',
          icon: 'Eye'
        },
        {
          title: 'Contrôler le partage des données',
          description: 'Définissez précisément quelles données peuvent être : 1) Utilisées pour améliorer IA (anonymisées), 2) Partagées statistiques agrégées (recherche), 3) Absolument privées. Granularité par catégorie.',
          icon: 'Lock'
        },
        {
          title: 'Supprimer votre compte et données',
          description: 'Suppression définitive en 2 clics. Données effacées sous 30 jours (délai légal). Export complet proposé avant. Suppression irréversible. Réactivation impossible après délai. Prenez cette décision sérieusement.',
          icon: 'Trash2'
        }
      ],
      tips: [
        'Mode privé reste par défaut : aucune donnée visible sans votre autorisation',
        'Contribuer amélioration IA anonymement aide tous utilisateurs, zéro risque',
        'Vos données santé ne sont JAMAIS partagées, même anonymisées',
        'Vous recevez notification à chaque accès à vos données par équipe support',
        'Audit complet accès à vos données disponible dans paramètres avancés'
      ],
      faq: [
        {
          question: 'Qui a accès à mes données exactement ?',
          answer: 'Vous seul. Équipe support technique peut accéder temporairement sur votre demande explicite pour résoudre problème. Accès tracé et notifié. Aucun accès marketing, aucune vente à tiers. Certifié ISO 27001.'
        },
        {
          question: 'Mes données sont-elles vraiment sécurisées ?',
          answer: 'Oui : chiffrement AES-256 au repos, TLS 1.3 en transit, serveurs européens certifiés, audits sécurité trimestriels, conformité RGPD totale. Même nous ne pouvons pas lire vos données santé chiffrées avec votre clé.'
        },
        {
          question: 'Que se passe-t-il si je participe au classement ?',
          answer: 'Votre pseudo généré et stats globales (niveau, XP) deviennent visibles. Aucune donnée personnelle (nom, photo, localisation précise, données santé, nutrition détaillée). Vous restez anonyme.'
        },
        {
          question: 'Comment récupérer mes données si je change d\'app ?',
          answer: 'Export RGPD fournit tout dans formats standards (JSON, CSV). Données portables vers n\'importe quelle app supportant import standard. Ne restez jamais prisonnier : vos données vous appartiennent.'
        }
      ],
      relatedActions: [
        {
          label: 'Gérer mes autorisations',
          description: 'Contrôlez le partage de vos données'
        },
        {
          label: 'Voir l\'audit d\'accès',
          description: 'Consultez qui a accédé à vos données'
        }
      ]
    },
    {
      id: 'account',
      title: 'Forfait',
      description: 'Abonnement et tokens',
      color: '#8B5CF6',
      icon: 'CreditCard',
      keyPoints: ['Tokens IA', 'Gestion abonnement'],
      steps: [
        {
          title: 'Comprendre le système de tokens',
          description: 'Les tokens alimentent fonctionnalités IA : génération programmes, recommandations nutrition, analyses avancées, chat coach. Forfait gratuit : tokens limités mensuels. Abonnements : tokens illimités + fonctionnalités premium.',
          icon: 'Coins'
        },
        {
          title: 'Suivre votre consommation',
          description: 'Tableau de bord tokens affiche : restants ce mois, historique consommation, prévision épuisement. Notifications avant épuisement. Fonctionnalités essentielles restent accessibles même sans tokens.',
          icon: 'BarChart3'
        },
        {
          title: 'Choisir votre forfait',
          description: 'Gratuit : idéal découverte, limites raisonnables. Essentiel : tokens généreux, fonctions IA étendues. Premium : illimité total, fonctionnalités exclusives, support prioritaire. Comparez tableaux détaillés.',
          icon: 'Layers'
        },
        {
          title: 'Gérer votre abonnement',
          description: 'Souscrivez, upgradez, downgradez, ou annulez directement dans app. Changements prennent effet cycle suivant. Remboursement proportionnel si downgrade. Annulation : gardez accès jusqu\'à fin période payée.',
          icon: 'Settings'
        }
      ],
      tips: [
        'Gratuit suffit largement si vous utilisez app régulièrement mais modérément',
        'Les tokens gratuits se renouvellent chaque 1er du mois',
        'Abonnez-vous seulement si vous utilisez IA quotidiennement ou fonctions avancées',
        'Pas de contrat : résiliez à tout moment, effet fin période en cours',
        'Périodes de forte utilisation (début transformation) consomment plus de tokens'
      ],
      faq: [
        {
          question: 'Que se passe-t-il si j\'épuise mes tokens gratuits ?',
          answer: 'Fonctionnalités de base restent : suivi poids, scanning repas basique, logging activités. Fonctions IA avancées (programmes personnalisés, analyses, chat coach) limitées jusqu\'au renouvellement mensuel.'
        },
        {
          question: 'Puis-je acheter des tokens supplémentaires ponctuellement ?',
          answer: 'Oui, packs de tokens disponibles sans abonnement : 1000, 5000, 10000 tokens. Pas d\'expiration. Utile si besoin ponctuel (préparation compétition, objectif intensif) sans abonnement mensuel.'
        },
        {
          question: 'Les abonnements incluent-ils toutes les fonctionnalités ?',
          answer: 'Essentiel : 95% fonctionnalités, tokens confortables. Premium : 100% fonctionnalités, tokens illimités, fonctions exclusives (export avancé, analyses prédictives approfondies, support prioritaire). Détails tableau comparatif.'
        },
        {
          question: 'Comment fonctionne le remboursement si j\'annule ?',
          answer: 'Si annulation avant renouvellement : aucun prélèvement suivant, accès jusqu\'à fin période payée. Si downgrade : prorata calculé, différence créditée compte ou remboursée selon préférence. Processus automatique, aucune justification requise.'
        }
      ],
      relatedActions: [
        {
          label: 'Voir les forfaits',
          description: 'Comparez et souscrivez à un abonnement'
        },
        {
          label: 'Acheter des tokens',
          description: 'Achetez un pack de tokens ponctuellement'
        }
      ]
    }
  ]
};
