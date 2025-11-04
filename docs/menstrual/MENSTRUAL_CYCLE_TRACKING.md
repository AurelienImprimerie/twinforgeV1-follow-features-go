# Suivi du Cycle Menstruel - Documentation Technique

## Vue d'ensemble

Le système de suivi du cycle menstruel de TwinForge permet aux utilisatrices de bénéficier de recommandations personnalisées basées sur leur phase cyclique actuelle. Cette fonctionnalité est entièrement intégrée au système Head/Brain pour enrichir les prompts AI.

## Architecture

### 1. Base de données (Supabase)

#### Tables

**menstrual_cycles**
- `id` (uuid, PK) - Identifiant unique du cycle
- `user_id` (uuid, FK) - Référence à l'utilisatrice
- `cycle_start_date` (date) - Date de début du cycle (premier jour des règles)
- `cycle_end_date` (date, nullable) - Date de fin du cycle
- `cycle_length` (integer, nullable) - Durée totale du cycle en jours
- `period_duration` (integer, nullable) - Durée des règles en jours
- `flow_intensity` (text, nullable) - Intensité du flux (light, moderate, heavy)
- `cycle_regularity` (text) - Régularité du cycle (regular, irregular, very_irregular)
- `notes` (text, nullable) - Notes libres
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**menstrual_symptoms_tracking**
- `id` (uuid, PK) - Identifiant unique du symptôme
- `cycle_id` (uuid, FK) - Référence au cycle
- `user_id` (uuid, FK) - Référence à l'utilisatrice
- `symptom_date` (date) - Date du symptôme
- `symptom_type` (text) - Type de symptôme
- `intensity` (integer) - Intensité 1-10
- `notes` (text, nullable) - Notes additionnelles

#### Sécurité (RLS)

Toutes les tables ont Row Level Security activé avec des politiques strictes :
- SELECT : Uniquement les données de l'utilisatrice authentifiée
- INSERT : Uniquement pour l'utilisatrice authentifiée
- UPDATE : Uniquement ses propres données
- DELETE : Uniquement ses propres données

### 2. Services Backend

#### MenstrualCycleCalculator (`src/lib/health/menstrualCycleCalculator.ts`)

Service de calcul des phases et recommandations :

```typescript
class MenstrualCycleCalculator {
  // Calcul de la phase actuelle du cycle
  calculateCurrentPhase(lastPeriodDate: Date, averageCycleLength: number): CyclePhase

  // Prédiction de la prochaine période
  predictNextPeriod(lastPeriodDate: Date, averageCycleLength: number): Date

  // Recommandations d'intensité d'entraînement
  getTrainingIntensityRecommendation(phase: CyclePhase): {
    intensity: 'low' | 'moderate' | 'high'
    description: string
  }

  // Calcul des variations de poids attendues
  getExpectedWeightVariation(phase: CyclePhase): {
    min: number
    max: number
    reason: string
  }
}
```

#### MenstrualCycleDataCollector (`src/system/head/knowledge/collectors/MenstrualCycleDataCollector.ts`)

Collecteur de données pour le système Head :

```typescript
class MenstrualCycleDataCollector {
  // Collecte les données menstruelles pour enrichir le contexte AI
  async collect(userId: string): Promise<MenstrualKnowledge>
}
```

### 3. Intégration système Head/Brain

#### Types (`src/system/head/types.ts`)

```typescript
interface MenstrualKnowledge {
  hasActiveTracking: boolean
  currentPhase: CyclePhase | null
  dayInCycle: number | null
  daysUntilNextPeriod: number | null
  recentCycles: MenstrualCycleSummary[]
  cycleStats: CycleStatistics
  commonSymptoms: SymptomFrequency[]
  phaseRecommendations: string[]
  trainingIntensityRecommendation: IntensityRecommendation | null
  expectedWeightVariation: WeightVariation | null
  lastCycleDate: string | null
  hasData: boolean
}
```

#### UserKnowledgeBase

Le collecteur menstruel est intégré uniquement pour les femmes :

```typescript
// Chargement conditionnel
const menstrual = results[8].status === 'fulfilled'
  ? results[8].value
  : undefined;

// Ajout au knowledge
menstrual: profile.sex === 'female' && menstrual?.hasData ? menstrual : undefined
```

#### UnifiedPromptBuilder

Enrichissement des prompts AI avec contexte menstruel complet :

- Phase actuelle avec emoji et description
- Jour du cycle et prochaines règles
- Statistiques de cycle (durée, régularité)
- Recommandations d'entraînement adaptées
- Variations de poids attendues
- Symptômes récurrents
- Alertes proactives selon la phase

### 4. Interface utilisateur

#### Composants

**ProfileMenstrualTab** (`src/app/pages/Profile/ProfileMenstrualTab.tsx`)
- Onglet principal visible uniquement pour les femmes
- Intégration complète avec validation et sauvegarde

**MenstrualCycleSection**
- Formulaire de saisie : date dernières règles, durée cycle, durée règles
- Validation temps réel

**CycleRegularitySection**
- Sélection régularité du cycle
- Option suivi des symptômes

**CurrentCycleInfoCard**
- Affichage phase actuelle avec emoji
- Calcul jour du cycle
- Prédiction prochaines règles
- Recommandations contextuelles

#### Hook personnalisé

**useProfileMenstrualForm** (`src/app/pages/Profile/hooks/useProfileMenstrualForm.ts`)

Gestion complète du formulaire :
- Chargement des données depuis Supabase
- Validation des champs
- Sauvegarde avec upsert
- Gestion des erreurs et loading states

### 5. Intégration Profile

L'onglet "Cycle" apparaît conditionnellement :

```typescript
const isFemale = profile?.sex === 'female';

// Dans les tabs
{isFemale && (
  <Tabs.Trigger value="menstrual" icon="Heart">
    <span className="tab-text">Cycle</span>
  </Tabs.Trigger>
)}

// Dans les panels
{isFemale && (
  <Tabs.Panel value="menstrual">
    <ProfileMenstrualTab />
  </Tabs.Panel>
)}
```

## Phases du cycle

### 1. Menstruation (Jours 1-5)
- **Emoji**: 🔴
- **Énergie**: Faible
- **Intensité training**: Légère (yoga, stretching, marche)
- **Nutrition**: Anti-inflammatoires, fer
- **Variation poids**: +0.5 à +2kg (rétention d'eau)

### 2. Phase Folliculaire (Jours 6-13)
- **Emoji**: 🌱
- **Énergie**: Croissante
- **Intensité training**: Modérée à haute
- **Nutrition**: Glucides complexes, protéines
- **Variation poids**: -1 à +0.5kg

### 3. Ovulation (Jours 14-16)
- **Emoji**: ✨
- **Énergie**: Maximale
- **Intensité training**: Haute (performances optimales)
- **Nutrition**: Équilibrée, hydratation
- **Variation poids**: Stable

### 4. Phase Lutéale (Jours 17-28)
- **Emoji**: 🌙
- **Énergie**: Décroissante
- **Intensité training**: Modérée, privilégier récupération
- **Nutrition**: Magnésium, B6, limiter sel
- **Variation poids**: +1 à +3kg (rétention d'eau)

## Recommandations AI

Le système génère automatiquement des recommandations contextuelles :

### Training
- **Menstruation**: "Privilégie repos et activités douces"
- **Ovulation**: "Pic d'énergie, parfait pour performances maximales"
- **Lutéale**: "Rétention d'eau possible, ne t'inquiète pas des variations de poids"

### Nutrition
- Adaptation des besoins caloriques selon la phase
- Recommandations macro selon besoins hormonaux
- Conseils hydratation phase lutéale

### Énergie
- Explication des variations d'énergie
- Ajustement des objectifs de training
- Alertes fatigue si en menstruation

## Confidentialité et sécurité

### Protection des données
- Chiffrement des données en base
- RLS strict (accès uniquement à ses propres données)
- Aucun partage avec des tiers
- Conformité RGPD

### Utilisation des données
- Uniquement pour personnalisation recommandations
- Enrichissement prompts AI (local, non partagé)
- Calculs et prédictions côté serveur sécurisé

## Tests et validation

### Validation des données
- Date dernières règles : obligatoire
- Durée cycle : 21-45 jours
- Durée règles : 2-10 jours
- Régularité : regular, irregular, very_irregular

### Edge cases gérés
- Cycle irrégulier : prédictions avec marge d'erreur
- Première utilisation : valeurs par défaut sensées
- Données manquantes : affichage graceful degradation

## Évolutions futures

### Court terme
- Ajout suivi symptômes détaillé
- Graphiques d'évolution du cycle
- Export données (PDF, CSV)

### Moyen terme
- Prédictions ML basées sur historique
- Alertes push avant règles
- Intégration wearables (température basale)

### Long terme
- Suivi fertilité
- Détection anomalies cycle
- Recommandations contraception naturelle

## Support

Pour toute question technique, contacter l'équipe de développement.
Pour les questions médicales, consulter un professionnel de santé.
