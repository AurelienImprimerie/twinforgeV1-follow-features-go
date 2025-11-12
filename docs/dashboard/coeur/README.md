# 🎮 Système de Gaming TwinForge - Documentation

**Version:** 3.0 | **Date:** Novembre 2025 | **Statut:** Production Active

---

## 📚 Index des Documents

### 🚀 Pour Commencer

1. **[QUICK_START.md](./QUICK_START.md)** ⭐
   - Installation en 5 minutes
   - Intégration XP en 3 patterns
   - Cas d'usage courants
   - Checklist validation
   - **→ Commencez ici!**

2. **[ARBORESCENCE_ET_INTEGRATION.md](./ARBORESCENCE_ET_INTEGRATION.md)** ⭐
   - Arborescence complète des fichiers
   - Guide d'intégration pas-à-pas
   - Points d'intégration critiques
   - Workflows typiques
   - Schéma flux de données
   - **→ Guide complet d'intégration**

### 🔧 Documentation Technique

3. **[GAMING_SYSTEM_TECHNICAL_DOC.md](./GAMING_SYSTEM_TECHNICAL_DOC.md)**
   - Architecture détaillée des services
   - API complète (méthodes, paramètres, retours)
   - Algorithmes de calcul XP
   - Multiplicateurs et bonus
   - Gestion idempotence
   - Tables SQL et schémas

4. **[PREDICTION_SYSTEM_TECHNICAL_DOC.md](./PREDICTION_SYSTEM_TECHNICAL_DOC.md)**
   - Algorithmes prédictions IA
   - Modèles régression linéaire
   - Calcul confiance adaptative
   - Prédictions niveau à 30/60/90 jours
   - Prédictions poids/corps

### 💡 Documentation Innovation

5. **[GAMING_SYSTEM_INNOVATION_DOC.md](./GAMING_SYSTEM_INNOVATION_DOC.md)**
   - Vision produit et UX
   - Expérience utilisateur cible
   - Motivation et engagement
   - Storytelling et immersion
   - Mécaniques de jeu innovantes

6. **[PREDICTION_SYSTEM_INNOVATION_DOC.md](./PREDICTION_SYSTEM_INNOVATION_DOC.md)**
   - Vision prédictions intelligentes
   - Personnalisation adaptative
   - Motivation par anticipation
   - Gamification du futur

---

## 🎯 Quel Document Lire?

### Vous êtes Développeur et voulez...

**→ Intégrer le système rapidement**
- Lire: `QUICK_START.md` (30 min)
- Puis: `ARBORESCENCE_ET_INTEGRATION.md` si besoin détails

**→ Comprendre l'architecture en profondeur**
- Lire: `GAMING_SYSTEM_TECHNICAL_DOC.md`
- Puis: `PREDICTION_SYSTEM_TECHNICAL_DOC.md`

**→ Ajouter XP à une feature existante**
- Lire: `QUICK_START.md` → Section "Intégrer XP" (5 min)

**→ Afficher les données gaming dans UI**
- Lire: `QUICK_START.md` → Section "Afficher Données" (5 min)

**→ Débugger un problème**
- Lire: `QUICK_START.md` → Section "Dépannage" (2 min)
- Puis: `ARBORESCENCE_ET_INTEGRATION.md` → "Dépannage & FAQ"

### Vous êtes Product Manager et voulez...

**→ Comprendre la vision produit**
- Lire: `GAMING_SYSTEM_INNOVATION_DOC.md`
- Puis: `PREDICTION_SYSTEM_INNOVATION_DOC.md`

**→ Évaluer la complexité technique**
- Lire: `ARBORESCENCE_ET_INTEGRATION.md` → "Guide d'Intégration"

**→ Comprendre l'expérience utilisateur**
- Lire: `GAMING_SYSTEM_INNOVATION_DOC.md` → "Parcours Utilisateur"

---

## 📦 Contenu du Système

### Services Backend (13 fichiers + dossier absence)
```
src/services/dashboard/coeur/
├── 5 services gamification core
├── 4 services prédictions IA
├── 3 services intelligence/analyse
└── absence/ (6 fichiers système d'absence)
```

### Composants UI (18 fichiers)
```
src/components/dashboard/widgets/coeur/
├── GamingProgressWidget/ (widget principal + 6 composants)
├── 6 widgets complémentaires
└── 1 skeleton loading
```

### Hooks React (6 fichiers)
```
src/hooks/coeur/
├── useGamification.ts (queries + mutations XP)
├── useDailyActionsTracking.ts (tracking actions)
└── 4 hooks prédictions/scoring
```

### Migrations SQL (12+ fichiers)
```
supabase/migrations/
├── Tables gamification (5 tables)
├── Tables prédictions (3 tables)
├── Tables actions quotidiennes (2 tables)
└── Tables absence/réconciliation (4 tables)
```

---

## 🔑 Fonctionnalités Principales

### ✅ Système de Gamification
- Attribution XP sur 6+ types d'actions
- Multiplicateurs intelligents (streak, combos)
- Niveaux et progression
- Idempotence garantie
- Animations et célébrations

### ✅ Prédictions IA
- Prédictions niveaux à 30/60/90 jours
- Prédictions poids/corps
- Confiance adaptative
- Timeline visuelle
- Score transformation

### ✅ Actions Quotidiennes
- Tracking multiple par action/jour
- Détection combos automatique
- Bonus first-time (x2 XP)
- État completion temps réel

### ✅ Système d'Absence
- Détection automatique (3+ jours)
- Estimation XP manquants
- Réconciliation intelligente
- Validation anti-triche
- Messages coaching

---

## 🚀 Quick Start (30 secondes)

```bash
# 1. Copier 3 dossiers
cp -r src/services/dashboard/coeur/ YOUR_PROJECT/
cp -r src/components/dashboard/widgets/coeur/ YOUR_PROJECT/
cp -r src/hooks/coeur/ YOUR_PROJECT/

# 2. Appliquer migrations SQL
supabase db push

# 3. Utiliser dans votre Dashboard
import GamingProgressWidgetV3 from '@/components/dashboard/widgets/coeur/GamingProgressWidgetV3';

<GamingProgressWidgetV3 />
```

✅ **C'est tout!** Voir `QUICK_START.md` pour détails.

---

## 📊 Statistiques Techniques

- **13 services** backend
- **18 composants** UI React
- **6 hooks** React Query
- **12 migrations** SQL minimum
- **14 tables** Supabase
- **50+ RLS policies** sécurisées
- **6 actions XP** intégrées
- **3 niveaux** prédictions (30/60/90j)

---

## 🔗 Dépendances

### NPM (déjà dans votre projet)
- `@tanstack/react-query` ^5.84.2
- `@supabase/supabase-js` ^2.54.0
- `framer-motion` ^12.23.12
- `lucide-react` ^0.344.0

### Supabase
- PostgreSQL 15+
- Row Level Security (RLS) activé
- Triggers et fonctions SQL

### Optionnel
- Brain/IA (si système IA présent)
- Edge Functions (prédictions automatiques)

---

## 🎓 Ressources Complémentaires

### Code Source
- Services: `/src/services/dashboard/coeur/`
- Composants: `/src/components/dashboard/widgets/coeur/`
- Hooks: `/src/hooks/coeur/`

### Tests & Debug
- DevTools: `DevGamificationDebugPageV2.tsx`
- React Query Devtools
- Supabase Studio

### Support
- Issues GitHub (si applicable)
- Documentation Supabase
- Documentation React Query

---

## 📝 Notes de Version

### Version 3.0 (Nov 2025) - Actuelle
- ✨ Nouvelle arborescence unifiée (`coeur/`)
- ✨ Système d'absence intégré (`absence/`)
- ✨ Actions multiples par jour
- ✨ First-time bonus (x2 XP)
- ✨ Hooks React refactorisés
- 🐛 Corrections imports

### Version 2.0 (Nov 2025)
- ✨ Système d'actions quotidiennes
- ✨ Combos et bonus
- ✨ Prédictions universelles
- ✨ Score transformation

### Version 1.0 (Oct 2025)
- 🎉 Version initiale
- ✨ Gamification de base
- ✨ Attribution XP
- ✨ Niveaux et progression

---

## 🎉 Prêt à Commencer?

**→ [QUICK_START.md](./QUICK_START.md)** - Installation en 5 minutes!

**Questions?** Voir la section "Dépannage & FAQ" dans `ARBORESCENCE_ET_INTEGRATION.md`

---

**Bon gaming! 🎮🔥**
