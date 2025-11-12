/*
  # Mise à jour des titres de niveaux - Thématique Forge

  ## Résumé
  Remplace les titres de niveaux génériques par des titres inspirés de l'univers
  de la forge, renforçant l'identité narrative de TwinForge et rendant la progression
  plus immersive et engageante.

  ## 1. Modifications
  
  ### level_milestones
  - Mise à jour des `milestone_name` pour les niveaux 1-25 avec des titres de forge
  - Mise à jour des `milestone_name` pour les niveaux 26-100 avec progression forge
  - Conservation des niveaux majeurs (paliers de 10) avec titres spéciaux
  
  ## 2. Titres de Forge par Tranches
  
  ### Niveaux 1-10: L'Apprentissage
  Titres inspirés de l'apprenti forgeron qui découvre son métier
  
  ### Niveaux 11-25: Le Compagnon
  Titres inspirés du forgeron confirmé qui maîtrise son art
  
  ### Niveaux 26-50: Le Maître
  Titres inspirés du maître artisan reconnu
  
  ### Niveaux 51-75: Le Légendaire
  Titres inspirés des légendes de la forge
  
  ### Niveaux 76-100: L'Immortel
  Titres inspirés des mythes et de la perfection absolue

  ## 3. Sécurité
  - Aucun changement RLS nécessaire
  - Simple mise à jour des données existantes
*/

-- ============================================
-- Mise à jour des titres niveaux 1-25
-- ============================================

-- Niveaux 1-10: L'Apprentissage
UPDATE level_milestones SET milestone_name = 'Apprenti Forgeron', milestone_description = 'Bienvenue dans ta forge de transformation!' WHERE level = 1;
UPDATE level_milestones SET milestone_name = 'Aide-Forgeron', milestone_description = 'Tu découvres les outils de la forge' WHERE level = 2;
UPDATE level_milestones SET milestone_name = 'Porteur de Charbon', milestone_description = 'Le feu de la motivation brûle' WHERE level = 3;
UPDATE level_milestones SET milestone_name = 'Souffleur de Forge', milestone_description = 'Tu attises les flammes de ta volonté' WHERE level = 4;
UPDATE level_milestones SET milestone_name = 'Marteleur', milestone_description = 'Chaque coup forge ta détermination' WHERE level = 5;
UPDATE level_milestones SET milestone_name = 'Façonneur de Métal', milestone_description = 'Ton corps commence à se modeler' WHERE level = 6;
UPDATE level_milestones SET milestone_name = 'Forgeron Aspirant', milestone_description = 'La maîtrise se dessine' WHERE level = 7;
UPDATE level_milestones SET milestone_name = 'Artisan du Feu', milestone_description = 'Tu contrôles la flamme intérieure' WHERE level = 8;
UPDATE level_milestones SET milestone_name = 'Maître des Enclumes', milestone_description = 'Ton art s''affine avec constance' WHERE level = 9;
UPDATE level_milestones SET milestone_name = 'Forgeron Qualifié', milestone_description = 'Premier palier de maîtrise atteint!' WHERE level = 10;

-- Niveaux 11-25: Le Compagnon
UPDATE level_milestones SET milestone_name = 'Compagnon Forgeron', milestone_description = 'Tu rejoins les rangs des artisans' WHERE level = 11;
UPDATE level_milestones SET milestone_name = 'Gardien des Flammes', milestone_description = 'Le feu sacré brûle en toi' WHERE level = 12;
UPDATE level_milestones SET milestone_name = 'Sculpteur de Force', milestone_description = 'Ton corps est ta plus belle création' WHERE level = 13;
UPDATE level_milestones SET milestone_name = 'Forgeron de l''Endurance', milestone_description = 'Résistant comme l''acier trempé' WHERE level = 14;
UPDATE level_milestones SET milestone_name = 'Maître de l''Acier', milestone_description = 'Dur et flexible à la fois' WHERE level = 15;
UPDATE level_milestones SET milestone_name = 'Artisan d''Élite', milestone_description = 'Chaque geste est précision' WHERE level = 16;
UPDATE level_milestones SET milestone_name = 'Forgeron Réputé', milestone_description = 'Ta transformation inspire' WHERE level = 17;
UPDATE level_milestones SET milestone_name = 'Maître Artisan', milestone_description = 'L''excellence est ton standard' WHERE level = 18;
UPDATE level_milestones SET milestone_name = 'Forgeron Virtuose', milestone_description = 'Chaque jour est un chef-d''œuvre' WHERE level = 19;
UPDATE level_milestones SET milestone_name = 'Gardien de la Forge', milestone_description = 'Deuxième palier de maîtrise!' WHERE level = 20;

-- Niveaux 21-25
UPDATE level_milestones SET milestone_name = 'Sage de la Trempe', milestone_description = 'Sagesse et puissance fusionnent' WHERE level = 21;
UPDATE level_milestones SET milestone_name = 'Mentor des Forges', milestone_description = 'Tu guides par l''exemple' WHERE level = 22;
UPDATE level_milestones SET milestone_name = 'Seigneur du Marteau', milestone_description = 'Chaque frappe est décisive' WHERE level = 23;
UPDATE level_milestones SET milestone_name = 'Roi des Forgerons', milestone_description = 'Ta forge rayonne de puissance' WHERE level = 24;
UPDATE level_milestones SET milestone_name = 'Empereur de l''Acier', milestone_description = 'Maîtrise absolue du corps et de l''esprit' WHERE level = 25;

-- ============================================
-- Mise à jour des titres niveaux 26-100
-- ============================================

-- Niveaux 26-50: Le Maître (avec paliers spéciaux à 30, 40, 50)
UPDATE level_milestones SET milestone_name = 'Titan de la Forge', milestone_description = 'Force et technique légendaires' WHERE level = 26;
UPDATE level_milestones SET milestone_name = 'Héros du Métal', milestone_description = 'Tes exploits deviennent légendes' WHERE level = 27;
UPDATE level_milestones SET milestone_name = 'Champion des Flammes', milestone_description = 'Le feu te répond' WHERE level = 28;
UPDATE level_milestones SET milestone_name = 'Conquérant d''Acier', milestone_description = 'Rien ne résiste à ta volonté' WHERE level = 29;
UPDATE level_milestones SET milestone_name = 'Maître Forge Suprême', milestone_description = 'Troisième palier: excellence reconnue!' WHERE level = 30;

UPDATE level_milestones SET milestone_name = 'Archonte de la Trempe', milestone_description = 'Perfection dans l''adversité' WHERE level = 31;
UPDATE level_milestones SET milestone_name = 'Phénix du Brasier', milestone_description = 'Tu renais plus fort chaque jour' WHERE level = 32;
UPDATE level_milestones SET milestone_name = 'Seigneur des Enclumes', milestone_description = 'Maître de ton destin' WHERE level = 33;
UPDATE level_milestones SET milestone_name = 'Oracle du Feu', milestone_description = 'Sagesse et puissance incarnées' WHERE level = 34;
UPDATE level_milestones SET milestone_name = 'Gardien Éternel', milestone_description = 'Constance et excellence' WHERE level = 35;
UPDATE level_milestones SET milestone_name = 'Forgeron Mythique', milestone_description = 'Entre mythe et réalité' WHERE level = 36;
UPDATE level_milestones SET milestone_name = 'Titan Immortel', milestone_description = 'Ta légende transcende le temps' WHERE level = 37;
UPDATE level_milestones SET milestone_name = 'Maître Céleste', milestone_description = 'L''excellence faite corps' WHERE level = 38;
UPDATE level_milestones SET milestone_name = 'Roi des Titans', milestone_description = 'Puissance inégalée' WHERE level = 39;
UPDATE level_milestones SET milestone_name = 'Forgeron Divin', milestone_description = 'Quatrième palier: le divin!' WHERE level = 40;

UPDATE level_milestones SET milestone_name = 'Avatar de la Forge', milestone_description = 'Incarnation de la perfection' WHERE level = 41;
UPDATE level_milestones SET milestone_name = 'Architecte du Corps', milestone_description = 'Sculpteur de ta destinée' WHERE level = 42;
UPDATE level_milestones SET milestone_name = 'Maître des Éléments', milestone_description = 'Feu, métal et volonté unis' WHERE level = 43;
UPDATE level_milestones SET milestone_name = 'Champion Éternel', milestone_description = 'Excellence sans compromis' WHERE level = 44;
UPDATE level_milestones SET milestone_name = 'Seigneur Légendaire', milestone_description = 'Les légendes parlent de toi' WHERE level = 45;
UPDATE level_milestones SET milestone_name = 'Forgeron Transcendant', milestone_description = 'Au-delà de la maîtrise' WHERE level = 46;
UPDATE level_milestones SET milestone_name = 'Empereur Céleste', milestone_description = 'Règne absolu sur ta forme' WHERE level = 47;
UPDATE level_milestones SET milestone_name = 'Prophète de la Trempe', milestone_description = 'Chaque geste inspire' WHERE level = 48;
UPDATE level_milestones SET milestone_name = 'Maître Ascendant', milestone_description = 'L''ascension continue' WHERE level = 49;
UPDATE level_milestones SET milestone_name = 'Demi-Dieu de la Forge', milestone_description = 'Cinquième palier: semi-divin!' WHERE level = 50;

-- Niveaux 51-75: Le Légendaire (avec paliers à 60, 70)
UPDATE level_milestones SET milestone_name = 'Légende Vivante', milestone_description = 'Mythe incarné' WHERE level = 51;
UPDATE level_milestones SET milestone_name = 'Forgeron des Dieux', milestone_description = 'Artisan du panthéon' WHERE level = 52;
UPDATE level_milestones SET milestone_name = 'Titan Primordial', milestone_description = 'Force ancestrale' WHERE level = 53;
UPDATE level_milestones SET milestone_name = 'Maître de l''Infini', milestone_description = 'Limites repoussées à jamais' WHERE level = 54;
UPDATE level_milestones SET milestone_name = 'Champion Cosmique', milestone_description = 'Ta force rayonne dans l''univers' WHERE level = 55;
UPDATE level_milestones SET milestone_name = 'Seigneur Omnipotent', milestone_description = 'Pouvoir sans limite' WHERE level = 56;
UPDATE level_milestones SET milestone_name = 'Gardien de l''Éternité', milestone_description = 'Au-delà du temps' WHERE level = 57;
UPDATE level_milestones SET milestone_name = 'Maître Suprême', milestone_description = 'Sommet de la maîtrise' WHERE level = 58;
UPDATE level_milestones SET milestone_name = 'Forgeron Omniscient', milestone_description = 'Savoir et pouvoir absolus' WHERE level = 59;
UPDATE level_milestones SET milestone_name = 'Dieu de la Transformation', milestone_description = 'Sixième palier: divinité incarnée!' WHERE level = 60;

UPDATE level_milestones SET milestone_name = 'Architecte Divin', milestone_description = 'Créateur de perfection' WHERE level = 61;
UPDATE level_milestones SET milestone_name = 'Titan Éternel', milestone_description = 'Force impérissable' WHERE level = 62;
UPDATE level_milestones SET milestone_name = 'Maître Universel', milestone_description = 'Sagesse cosmique' WHERE level = 63;
UPDATE level_milestones SET milestone_name = 'Champion Absolu', milestone_description = 'Perfection incarnée' WHERE level = 64;
UPDATE level_milestones SET milestone_name = 'Seigneur du Cosmos', milestone_description = 'Pouvoir stellaire' WHERE level = 65;
UPDATE level_milestones SET milestone_name = 'Forgeron Immortel', milestone_description = 'Art éternel' WHERE level = 66;
UPDATE level_milestones SET milestone_name = 'Avatar Suprême', milestone_description = 'Manifestation divine' WHERE level = 67;
UPDATE level_milestones SET milestone_name = 'Maître Transcendant', milestone_description = 'Au-delà de tout' WHERE level = 68;
UPDATE level_milestones SET milestone_name = 'Roi des Dieux', milestone_description = 'Souverain absolu' WHERE level = 69;
UPDATE level_milestones SET milestone_name = 'Créateur Primordial', milestone_description = 'Septième palier: origine divine!' WHERE level = 70;

UPDATE level_milestones SET milestone_name = 'Essence Pure', milestone_description = 'Quintessence de force' WHERE level = 71;
UPDATE level_milestones SET milestone_name = 'Forgeron Cosmique', milestone_description = 'Façonneur d''étoiles' WHERE level = 72;
UPDATE level_milestones SET milestone_name = 'Titan Absolu', milestone_description = 'Puissance primale' WHERE level = 73;
UPDATE level_milestones SET milestone_name = 'Maître de l''Existence', milestone_description = 'Réalité malléable' WHERE level = 74;
UPDATE level_milestones SET milestone_name = 'Champion Infini', milestone_description = 'Sans borne ni limite' WHERE level = 75;

-- Niveaux 76-100: L'Immortel (avec paliers à 80, 90, 100)
UPDATE level_milestones SET milestone_name = 'Seigneur Omnipotent', milestone_description = 'Tout pouvoir, toute sagesse' WHERE level = 76;
UPDATE level_milestones SET milestone_name = 'Gardien de l''Univers', milestone_description = 'Protecteur cosmique' WHERE level = 77;
UPDATE level_milestones SET milestone_name = 'Maître Éternel', milestone_description = 'Hors du temps' WHERE level = 78;
UPDATE level_milestones SET milestone_name = 'Forgeron Suprême', milestone_description = 'Apogée de l''art' WHERE level = 79;
UPDATE level_milestones SET milestone_name = 'Divinité Incarnée', milestone_description = 'Huitième palier: essence divine!' WHERE level = 80;

UPDATE level_milestones SET milestone_name = 'Avatar de Perfection', milestone_description = 'Idéal manifesté' WHERE level = 81;
UPDATE level_milestones SET milestone_name = 'Titan Omniscient', milestone_description = 'Savoir infini' WHERE level = 82;
UPDATE level_milestones SET milestone_name = 'Maître de Tout', milestone_description = 'Omnipotence totale' WHERE level = 83;
UPDATE level_milestones SET milestone_name = 'Champion Légendaire', milestone_description = 'Légende ultime' WHERE level = 84;
UPDATE level_milestones SET milestone_name = 'Seigneur de l''Infini', milestone_description = 'Sans commencement ni fin' WHERE level = 85;
UPDATE level_milestones SET milestone_name = 'Forgeron Mythique', milestone_description = 'Au-delà du mythe' WHERE level = 86;
UPDATE level_milestones SET milestone_name = 'Créateur Absolu', milestone_description = 'Source de toute force' WHERE level = 87;
UPDATE level_milestones SET milestone_name = 'Maître de la Destinée', milestone_description = 'Façonneur du futur' WHERE level = 88;
UPDATE level_milestones SET milestone_name = 'Roi de l''Éternité', milestone_description = 'Souverain du temps' WHERE level = 89;
UPDATE level_milestones SET milestone_name = 'Dieu Suprême', milestone_description = 'Neuvième palier: suprématie!' WHERE level = 90;

UPDATE level_milestones SET milestone_name = 'Essence Cosmique', milestone_description = 'Force universelle' WHERE level = 91;
UPDATE level_milestones SET milestone_name = 'Forgeron Transcendant', milestone_description = 'Par-delà toute limite' WHERE level = 92;
UPDATE level_milestones SET milestone_name = 'Titan Ultime', milestone_description = 'Puissance finale' WHERE level = 93;
UPDATE level_milestones SET milestone_name = 'Maître Omnipotent', milestone_description = 'Pouvoir total' WHERE level = 94;
UPDATE level_milestones SET milestone_name = 'Champion Divin', milestone_description = 'Victoire éternelle' WHERE level = 95;
UPDATE level_milestones SET milestone_name = 'Seigneur de la Création', milestone_description = 'Architecte suprême' WHERE level = 96;
UPDATE level_milestones SET milestone_name = 'Forgeron de l''Absolu', milestone_description = 'Artisan de l''impossible' WHERE level = 97;
UPDATE level_milestones SET milestone_name = 'Avatar de l''Éternité', milestone_description = 'Manifestation éternelle' WHERE level = 98;
UPDATE level_milestones SET milestone_name = 'Maître Ultime', milestone_description = 'L''apothéose approche' WHERE level = 99;
UPDATE level_milestones SET milestone_name = 'Légende Absolue', milestone_description = 'Perfection accomplie! Tu as atteint le sommet!' WHERE level = 100;
