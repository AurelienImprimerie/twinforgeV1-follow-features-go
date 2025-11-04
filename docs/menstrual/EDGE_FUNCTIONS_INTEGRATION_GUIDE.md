# Guide d'Intégration du Contexte Reproductif dans les Edge Functions

## Vue d'ensemble

Ce guide explique comment intégrer le contexte de santé reproductive (cycles menstruels ou ménopause) dans les edge functions TwinForge pour fournir des recommandations AI personnalisées.

## Fonction Utilitaire Partagée

Le fichier `supabase/functions/_shared/utils/reproductiveHealthContext.ts` fournit une fonction unifiée qui:
- Détecte automatiquement si l'utilisatrice est en cycle menstruel ou en ménopause
- Récupère les données pertinentes depuis la base de données
- Formate le contexte pour les prompts AI

## Intégration dans une Edge Function

### 1. Importer la fonction

```typescript
import { getReproductiveHealthContext } from '../_shared/utils/reproductiveHealthContext.ts';
```

### 2. Récupérer le contexte

Dans votre edge function, après avoir créé le client Supabase:

```typescript
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Récupérer le contexte reproductif
const reproductiveContext = await getReproductiveHealthContext(userId, supabase);
```

### 3. Ajouter au prompt AI

Dans la fonction qui construit votre prompt pour OpenAI/GPT:

```typescript
function buildAIPrompt(userData: any, reproductiveContext: any): string {
  let prompt = `Votre prompt de base...`;

  // Ajouter le contexte reproductif si disponible
  if (reproductiveContext.hasData && reproductiveContext.formattedContext) {
    prompt += reproductiveContext.formattedContext;
  }

  prompt += `\n\nInstructions supplémentaires...`;

  return prompt;
}
```

## Exemples d'Intégration par Forge

### Forge Nutritionnelle (nutrition-trend-analysis)

```typescript
// Dans createTrendAnalysisPrompt()
async function createTrendAnalysisPrompt(
  meals: any[],
  userProfile: any,
  period: string,
  userId: string,
  supabase: any
): Promise<string> {
  let prompt = `Analysez ces données nutritionnelles...`;

  // Ajouter contexte reproductif
  const reproductiveContext = await getReproductiveHealthContext(userId, supabase);
  if (reproductiveContext.hasData) {
    prompt += reproductiveContext.formattedContext;
  }

  return prompt;
}
```

### Forge Temporelle (fasting-insights-generator)

```typescript
// Dans buildFastingPrompt()
async function buildFastingPrompt(
  fastingSessions: any[],
  userProfile: any,
  userId: string,
  supabase: any
): Promise<string> {
  let prompt = `Analysez ces sessions de jeûne...`;

  // Contexte reproductif pour recommandations de jeûne adaptées
  const reproductiveContext = await getReproductiveHealthContext(userId, supabase);
  if (reproductiveContext.hasData) {
    prompt += reproductiveContext.formattedContext;
  }

  return prompt;
}
```

### Forge Énergétique (activity-progress-generator)

```typescript
// Dans buildActivityPrompt()
async function buildActivityPrompt(
  activities: any[],
  userProfile: any,
  userId: string,
  supabase: any
): Promise<string> {
  let prompt = `Analysez ces activités physiques...`;

  // Contexte reproductif pour périodisation d'entraînement
  const reproductiveContext = await getReproductiveHealthContext(userId, supabase);
  if (reproductiveContext.hasData) {
    prompt += reproductiveContext.formattedContext;
  }

  return prompt;
}
```

### Forge Culinaire (meal-plan-generator)

```typescript
// Dans buildMealPlanPrompt()
async function buildMealPlanPrompt(
  userPreferences: any,
  nutritionGoals: any,
  userId: string,
  supabase: any
): Promise<string> {
  let prompt = `Générez un plan de repas...`;

  // Contexte reproductif pour besoins nutritionnels spécifiques
  const reproductiveContext = await getReproductiveHealthContext(userId, supabase);
  if (reproductiveContext.hasData) {
    prompt += reproductiveContext.formattedContext;
  }

  return prompt;
}
```

## Format du Contexte Retourné

Le contexte reproductif inclut:

### Pour Cycle Menstruel
- Phase actuelle (menstruation, folliculaire, ovulation, lutéale)
- Jour du cycle et durée
- Niveau d'énergie et métabolisme
- Recommandations nutrition/exercice/jeûne par phase

### Pour Ménopause
- Statut (périménopause, ménopause, post-ménopause)
- Stade (précoce/tardif si périménopause)
- Jours depuis dernières règles
- Niveaux hormonaux (FSH, œstrogène) si disponibles
- Recommandations spécifiques:
  - Nutrition: protéines augmentées, calcium, vitamine D
  - Exercice: focus musculation et densité osseuse
  - Jeûne: fenêtres réduites et flexibilité

## Modifications Nécessaires par Edge Function

Pour chaque edge function à intégrer:

1. Ajouter l'import de `reproductiveHealthContext.ts`
2. Passer le client Supabase et userId à la fonction de génération de prompt
3. Appeler `getReproductiveHealthContext()` avant de construire le prompt
4. Ajouter `reproductiveContext.formattedContext` au prompt si `hasData` est true
5. Tester avec des utilisatrices en différents statuts

## Avantages

- **Personnalisation maximale**: Recommandations adaptées au statut hormonal
- **Réutilisabilité**: Même fonction pour toutes les forges
- **Maintenance**: Un seul endroit pour gérer la logique de formatage
- **Performance**: Requête unique pour récupérer les données nécessaires
- **Sécurité**: RLS automatiquement appliqué via Supabase client

## Prochaines Étapes

1. Intégrer dans nutrition-trend-analysis (priorité haute)
2. Intégrer dans fasting-insights-generator
3. Intégrer dans activity-progress-generator
4. Intégrer dans meal-plan-generator
5. Tester avec des utilisatrices réelles
6. Collecter feedback et ajuster les recommandations
