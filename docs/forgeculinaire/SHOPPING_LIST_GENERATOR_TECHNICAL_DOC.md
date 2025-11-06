# Générateur de Liste de Courses - Documentation Technique

## Vue d'Ensemble

Le Générateur de Liste de Courses transforme automatiquement un plan alimentaire en liste de courses optimisée avec estimation budget.

### Chiffres Clés
- **< 10 secondes** génération complète
- **1 agent IA** (GPT-5-mini)
- **Coût optimisé** : ~15 tokens (~$0.01)
- **Estimation budget** automatique par région

---

## Architecture Simple et Efficace

```
┌────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Zustand)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   useShoppingListGenerationPipeline                  │  │
│  │   • Configuration (meal plan + mode)                 │  │
│  │   • Appel API unique                                 │  │
│  │   • Affichage résultat instantané                    │  │
│  └────────────────────┬─────────────────────────────────┘  │
└─────────────────────┬─┴──────────────────────────────────────┘
                      │
              Appel API simple
                      │
┌─────────────────────▼────────────────────────────────────────┐
│              BACKEND (Supabase Edge Function)                │
│                                                               │
│  ┌────────────────────────────────────────────────┐          │
│  │ shopping-list-generator                       │          │
│  │ • GPT-5-mini Chat                             │          │
│  │ • Consolidation intelligente                  │          │
│  │ • Catégorisation automatique                  │          │
│  │ • Suggestions complémentaires                 │          │
│  │ • Estimation budget par région                │          │
│  │ • Cache: Aucun (toujours personnalisé)        │          │
│  │ • Coût: ~15 tokens (~$0.01)                   │          │
│  └────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Innovations Techniques Clés

### 1. Consolidation Intelligente des Ingrédients

**Innovation** : Agrégation automatique des ingrédients avec quantités cumulées

**Fichier** : `supabase/functions/shopping-list-generator/index.ts`

**Logique** :
```
Plan alimentaire 7 jours :
- Lundi : Poulet 150g
- Mercredi : Poulet 150g
- Vendredi : Poulet 150g

→ Liste consolidée :
✅ Poulet : 450g (au lieu de 3 lignes séparées)
```

**Avantage** : Liste courte et claire, facile à utiliser en magasin

### 2. Catégorisation Automatique par Rayon

**Innovation** : Organisation par catégories magasin pour parcours optimisé

**Catégories détectées** :
- Fruits et légumes
- Viandes et poissons
- Produits laitiers
- Épicerie salée
- Épicerie sucrée
- Surgelés
- Boissons

**Résultat** : Gain de temps en magasin, parcours logique

### 3. Suggestions Complémentaires Intelligentes

**Innovation** : Détection automatique des items manquants pour équilibre

**Exemples** :
```
Plan détecté :
- Beaucoup de protéines
- Peu de fibres
- Manque légumes verts

→ Suggestions automatiques :
✅ Brocoli (fibres + vitamines)
✅ Épinards (fer + vitamines)
✅ Lentilles (protéines végétales + fibres)
```

**Avantage** : Plan nutritionnel complet et équilibré

### 4. Estimation Budget par Région

**Innovation** : Calcul coûts automatique selon pays avec coefficients régionaux

**Coefficients région** (`src/system/store/shoppingListGenerationPipeline/constants.ts`) :
```typescript
REGION_PRICE_COEFFICIENTS = {
  'FR': 1.00,  // France (référence)
  'BE': 1.05,  // Belgique (+5%)
  'CH': 1.40,  // Suisse (+40%)
  'DE': 0.95,  // Allemagne (-5%)
  'ES': 0.85,  // Espagne (-15%)
  'IT': 0.90,  // Italie (-10%)
  'UK': 1.15   // Royaume-Uni (+15%)
}
```

**Résultat** :
```
Estimation budget :
- France : 45-55€
- Suisse : 63-77€ (+40%)
- Espagne : 38-47€ (-15%)
```

---

## Gestion d'État Frontend

### Store Zustand Simple

**Fichier principal** : `src/system/store/shoppingListGenerationPipeline/index.ts`

**Architecture** :
```typescript
useShoppingListGenerationPipeline = {
  // État
  currentStep: 'configuration' | 'generating' | 'validation',
  shoppingListCandidate: ShoppingList | null,
  config: {
    selectedMealPlanId: string,
    generationMode: 'user_only' | 'user_and_family'
  },

  // Actions
  generateShoppingList: async () => Promise<void>,
  saveShoppingList: async () => Promise<void>,
  discardShoppingList: () => void
}
```

**Persistance** :
- ✅ Liste générée sauvegardée immédiatement
- ✅ Budget estimation inclus

---

## Système de Tokens

### Middleware Unifié

**Fichier** : `supabase/functions/_shared/tokenMiddleware.ts`

**Estimation tokens** :
- Shopping List Generator : **15 tokens** (~$0.01)
- **Le moins coûteux** de tous les agents

**Tables Supabase** :
- `ai_token_balances` : Solde utilisateur
- `ai_token_consumption` : Historique consommation

---

## Performance & Métriques

### Temps de Traitement

| Étape | Durée |
|-------|-------|
| Fetch meal plan | < 1 sec |
| AI generation | 5-8 sec |
| Budget calculation | < 1 sec |
| **Total** | **< 10 sec** |

### Qualité de Génération

**Personnalisation** :
- ✅ Consolidation ingrédients intelligente
- ✅ Catégorisation par rayon magasin
- ✅ Suggestions complémentaires (équilibre nutritionnel)
- ✅ Estimation budget régionalisée
- ✅ Conseils courses (fraîcheur, saisonnalité)

**Fichier** : `supabase/functions/shopping-list-generator/index.ts`

### Coûts Optimisés

**Scénario** : 1000 users × 2 listes/mois

| Item | Coût |
|------|------|
| Sans cache | $30/mois |
| **Agent le moins cher** | ✅ |

---

## Stack Technologique

### Frontend
- **React 18** + TypeScript
- **Zustand** (state management)
- **Vite** (build tool)

### Backend
- **Supabase Edge Functions** (Deno runtime)
- **PostgreSQL** (via Supabase)
- **OpenAI GPT-5-mini** (Chat)

### Infrastructure
- **Storage** : Tables `shopping_lists` + `shopping_list_items`
- **Auth** : Supabase Auth (JWT)

---

## Références Fichiers Clés

### Backend (Edge Functions)
```
supabase/functions/
├── shopping-list-generator/
│   ├── index.ts                       # Agent principal
│   └── _shared/
│       ├── cors.ts                    # CORS headers
│       └── tokenMiddleware.ts         # Gestion tokens
```

### Frontend (React)
```
src/
├── app/pages/
│   └── ShoppingListGeneration/
│       ├── ShoppingListGenerationPage.tsx
│       ├── components/
│       │   └── ShoppingListGenerationProgressHeader.tsx
│       └── stages/
│           ├── ConfigurationStage.tsx
│           ├── GeneratingStage.tsx
│           └── ValidationStage.tsx
├── system/store/shoppingListGenerationPipeline/
│   ├── index.ts                       # Store Zustand
│   ├── constants.ts                   # Coefficients régionaux
│   └── types.ts
└── system/store/shoppingListStore.ts  # Gestion listes sauvegardées
```

---

## Bibliothèque de Listes de Courses

### Tables Supabase : `shopping_lists` + `shopping_list_items`

**Fonctionnalités UI** (`src/app/pages/Fridge/tabs/ShoppingListTab.tsx`) :
- ✅ Affichage listes sauvegardées
- ✅ Organisation par catégories
- ✅ Checkbox items (cocher pendant courses)
- ✅ Budget estimation affiché
- ✅ Export PDF/texte
- ✅ Partage WhatsApp/Email
- ✅ Suppression listes

---

## Points Clés pour Site Web

### Arguments Techniques Différenciants

1. **Consolidation Intelligente**
   - Agrégation automatique ingrédients
   - Quantités cumulées
   - Liste courte et claire

2. **Catégorisation par Rayon**
   - Organisation magasin automatique
   - Parcours optimisé
   - Gain de temps en magasin

3. **Suggestions Complémentaires**
   - Détection items manquants
   - Équilibre nutritionnel
   - Conseils personnalisés

4. **Estimation Budget Régionalisée**
   - Calcul automatique par région
   - 7 pays supportés
   - Coefficients précis

5. **Simplicité et Rapidité**
   - < 10 secondes génération
   - Agent le moins coûteux
   - UX fluide

---

**Dernière mise à jour** : Novembre 2025
**Version** : 1.0 (Concise)
