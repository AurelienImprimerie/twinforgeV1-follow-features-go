import { supabase } from '@/system/supabase/client';
import logger from '@/lib/utils/logger';
import { tokenService } from '@/system/services/tokenService';
import { dashboardIntelligenceService } from '../DashboardIntelligenceService';
import { adaptiveScoreCalculator } from './AdaptiveScoreCalculator';
import type { BrainContext } from '@/system/head/types';
import type { TransformationObjective, AITransformationAnalysis } from '../DashboardIntelligenceService';

interface AnalysisRequest {
  userId: string;
  analysisType: 'weekly_summary' | 'monthly_review' | 'milestone_check' | 'on_demand';
  periodStart: string;
  periodEnd: string;
  brainContext: BrainContext;
  objective: TransformationObjective | null;
  forceRegenerate?: boolean;
}

interface AIInsightsResponse {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  motivationalMessage: string;
}

const ANALYSIS_TOKEN_COSTS = {
  weekly_summary: 500,
  monthly_review: 800,
  milestone_check: 300,
  on_demand: 600
};

class AITransformationAnalyzer {
  async requestAnalysis(request: AnalysisRequest): Promise<AITransformationAnalysis> {
    try {
      logger.info('AI_ANALYZER', 'Requesting transformation analysis', {
        userId: request.userId,
        analysisType: request.analysisType
      });

      if (!request.forceRegenerate) {
        const existingAnalysis = await this.checkExistingAnalysis(
          request.userId,
          request.analysisType,
          request.periodStart,
          request.periodEnd
        );

        if (existingAnalysis) {
          logger.info('AI_ANALYZER', 'Using existing analysis', { analysisId: existingAnalysis.id });
          return existingAnalysis;
        }
      }

      const tokenCost = ANALYSIS_TOKEN_COSTS[request.analysisType];

      const hasEnoughTokens = await tokenService.checkTokenAvailability(request.userId, tokenCost);

      if (!hasEnoughTokens) {
        throw new Error('Tokens insuffisants pour l\'analyse');
      }

      const consistencyData = await dashboardIntelligenceService.getTodayConsistency(request.userId);
      const streak = await dashboardIntelligenceService.getCurrentStreak(request.userId);

      const adaptiveScores = await adaptiveScoreCalculator.calculateAdaptiveScores(
        request.brainContext,
        request.objective,
        consistencyData?.consistencyScore || 0,
        streak,
        request.userId
      );

      // Générer les insights IA - la consommation atomique se fait dans chat-ai edge function
      const aiInsights = await this.generateAIInsights(
        request.userId,
        request.brainContext,
        request.objective,
        adaptiveScores.forgeScores,
        adaptiveScores.trend,
        request.analysisType
      );

      if (!aiInsights) {
        throw new Error('Échec de la génération des insights IA');
      }

      const { data, error } = await supabase
        .from('ai_transformation_analysis')
        .insert({
          user_id: request.userId,
          analysis_type: request.analysisType,
          period_start: request.periodStart,
          period_end: request.periodEnd,
          ai_insights: aiInsights,
          transformation_score: adaptiveScores.overallScore,
          forge_scores: {
            training: {
              score: adaptiveScores.forgeScores.training.score,
              details: adaptiveScores.forgeScores.training.details
            },
            nutrition: {
              score: adaptiveScores.forgeScores.nutrition.score,
              details: adaptiveScores.forgeScores.nutrition.details
            },
            bodyScan: {
              score: adaptiveScores.forgeScores.bodyScan.score,
              details: adaptiveScores.forgeScores.bodyScan.details
            },
            fasting: {
              score: adaptiveScores.forgeScores.fasting.score,
              details: adaptiveScores.forgeScores.fasting.details
            },
            wearable: {
              score: adaptiveScores.forgeScores.wearable.score,
              details: adaptiveScores.forgeScores.wearable.details
            },
            consistency: {
              score: adaptiveScores.forgeScores.consistency.score,
              details: adaptiveScores.forgeScores.consistency.details
            }
          },
          tokens_consumed: tokenCost,
          metadata: {
            objectiveProgress: adaptiveScores.objectiveProgress,
            trend: adaptiveScores.trend,
            confidence: adaptiveScores.confidence,
            streakDays: streak
          }
        })
        .select()
        .single();

      if (error) throw error;

      logger.info('AI_ANALYZER', 'Analysis generated successfully', {
        userId: request.userId,
        analysisId: data.id,
        tokensConsumed: tokenCost
      });

      return {
        id: data.id,
        userId: data.user_id,
        analysisType: data.analysis_type,
        periodStart: data.period_start,
        periodEnd: data.period_end,
        aiInsights: data.ai_insights,
        transformationScore: data.transformation_score,
        forgeScores: data.forge_scores,
        tokensConsumed: data.tokens_consumed,
        createdAt: data.created_at,
        metadata: data.metadata || {}
      };
    } catch (error) {
      logger.error('AI_ANALYZER', 'Failed to generate analysis', { error, request });
      throw error;
    }
  }

  private async checkExistingAnalysis(
    userId: string,
    analysisType: string,
    periodStart: string,
    periodEnd: string
  ): Promise<AITransformationAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('ai_transformation_analysis')
        .select('*')
        .eq('user_id', userId)
        .eq('analysis_type', analysisType)
        .eq('period_start', periodStart)
        .eq('period_end', periodEnd)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const analysisAge = Date.now() - new Date(data.created_at).getTime();
      const maxAge = 24 * 60 * 60 * 1000;

      if (analysisAge > maxAge) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        analysisType: data.analysis_type,
        periodStart: data.period_start,
        periodEnd: data.period_end,
        aiInsights: data.ai_insights,
        transformationScore: data.transformation_score,
        forgeScores: data.forge_scores,
        tokensConsumed: data.tokens_consumed,
        createdAt: data.created_at,
        metadata: data.metadata || {}
      };
    } catch (error) {
      logger.error('AI_ANALYZER', 'Failed to check existing analysis', { error });
      return null;
    }
  }

  private async generateAIInsights(
    userId: string,
    context: BrainContext,
    objective: TransformationObjective | null,
    forgeScores: any,
    trend: string,
    analysisType: string
  ): Promise<AIInsightsResponse | null> {
    try {
      const prompt = this.buildAnalysisPrompt(context, objective, forgeScores, trend, analysisType);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // L'edge function chat-ai gère la consommation atomique des tokens
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session?.access_token}`
        },
        body: JSON.stringify({
          conversationId: `dashboard-analysis-${userId}-${Date.now()}`,
          message: prompt,
          context: {
            systemPrompt: this.getSystemPrompt(),
            temperature: 0.7,
            maxTokens: 1000
          },
          metadata: {
            analysisType,
            userId
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI analysis request failed');
      }

      const result = await response.json();
      const aiResponse = result.response || '';

      return this.parseAIResponse(aiResponse, context, forgeScores, trend);
    } catch (error) {
      logger.error('AI_ANALYZER', 'Failed to generate AI insights', { error });
      // En cas d'erreur, retourner null pour signaler l'échec
      return null;
    }
  }

  private buildAnalysisPrompt(
    context: BrainContext,
    objective: TransformationObjective | null,
    forgeScores: any,
    trend: string,
    analysisType: string
  ): string {
    const objectiveText = objective
      ? `Objectif actif: ${this.translateObjectiveType(objective.objectiveType)} - Cible: ${objective.targetValue} ${objective.targetUnit} d'ici le ${new Date(objective.targetDate).toLocaleDateString('fr-FR')}`
      : 'Aucun objectif défini';

    const trainingText = context.training.hasData
      ? `${context.training.weeklySessionsCount} séances cette semaine, ${context.training.totalSessions} au total. Dernière: ${context.training.lastSessionDate ? new Date(context.training.lastSessionDate).toLocaleDateString('fr-FR') : 'N/A'}`
      : 'Aucune donnée d\'entraînement';

    const nutritionText = context.nutrition.hasData
      ? `${context.nutrition.scanFrequency} repas scannés, ${Math.round(context.nutrition.averageProtein)}g protéines/jour en moyenne. Plan actif: ${context.nutrition.mealPlans.hasActivePlan ? 'Oui' : 'Non'}`
      : 'Aucune donnée nutritionnelle';

    const bodyScanText = context.bodyScan.hasData
      ? `${context.bodyScan.totalScans} scans effectués. Poids: ${context.bodyScan.currentWeight}kg. Dernière analyse: ${context.bodyScan.lastScanDate ? new Date(context.bodyScan.lastScanDate).toLocaleDateString('fr-FR') : 'N/A'}`
      : 'Aucun scan corporel';

    const fastingText = context.fasting.hasData
      ? `${context.fasting.totalSessions} sessions de jeûne, ${context.fasting.currentStreak} jours de suite, ${Math.round(context.fasting.successRate)}% de réussite`
      : 'Aucune donnée de jeûne';

    const wearableText = context.activity.hasData
      ? `${context.activity.weeklyActivities} activités cette semaine, ${Math.round(context.activity.totalCaloriesBurned)} calories brûlées, FC moyenne: ${Math.round(context.activity.avgHeartRate)} bpm`
      : 'Aucune donnée wearable';

    return `Analyse de transformation ${analysisType}:

${objectiveText}

Données utilisateur:
- Forge Musculation: Score ${Math.round(forgeScores.training.score)}/100 - ${trainingText}
- Forge Nutritionnelle: Score ${Math.round(forgeScores.nutrition.score)}/100 - ${nutritionText}
- Forge Corporelle: Score ${Math.round(forgeScores.bodyScan.score)}/100 - ${bodyScanText}
- Forge Temporelle: Score ${Math.round(forgeScores.fasting.score)}/100 - ${fastingText}
- Forge Énergétique: Score ${Math.round(forgeScores.wearable.score)}/100 - ${wearableText}
- Consistance: Score ${Math.round(forgeScores.consistency.score)}/100

Tendance globale: ${trend === 'improving' ? 'En amélioration' : trend === 'stable' ? 'Stable' : 'En déclin'}

Génère une analyse personnalisée au format JSON avec:
{
  "summary": "Résumé de la transformation en 2-3 phrases",
  "strengths": ["Force 1", "Force 2", "Force 3"],
  "areasForImprovement": ["Axe 1", "Axe 2", "Axe 3"],
  "recommendations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
  "motivationalMessage": "Message motivant personnalisé"
}`;
  }

  private getSystemPrompt(): string {
    return `Tu es un coach de transformation physique expert, spécialisé dans l'analyse de données de santé et fitness.
Ton rôle est d'analyser les progrès de l'utilisateur et de fournir des insights actionnables, motivants et personnalisés.
Tu dois être direct, encourageant et fournir des recommandations concrètes basées sur les données réelles.
Utilise un ton professionnel mais bienveillant. Évite le jargon technique et privilégie la clarté.
Réponds UNIQUEMENT en JSON valide, sans texte additionnel.`;
  }

  private parseAIResponse(
    aiResponse: string,
    context: BrainContext,
    forgeScores: any,
    trend: string
  ): AIInsightsResponse {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || 'Analyse en cours...',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        areasForImprovement: Array.isArray(parsed.areasForImprovement)
          ? parsed.areasForImprovement
          : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        motivationalMessage: parsed.motivationalMessage || 'Continue tes efforts!'
      };
    } catch (error) {
      logger.error('AI_ANALYZER', 'Failed to parse AI response', { error, aiResponse });
      return this.getFallbackInsights(context, null, forgeScores, trend);
    }
  }

  private getFallbackInsights(
    context: BrainContext,
    objective: TransformationObjective | null,
    forgeScores: any,
    trend: string
  ): AIInsightsResponse {
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    const recommendations: string[] = [];

    if (forgeScores.training.score >= 70) {
      strengths.push('Excellente régularité dans les entraînements');
    } else if (forgeScores.training.score < 40) {
      areasForImprovement.push('Augmenter la fréquence des entraînements');
      recommendations.push('Vise 3 séances par semaine minimum');
    }

    if (forgeScores.nutrition.score >= 70) {
      strengths.push('Bon suivi nutritionnel');
    } else if (forgeScores.nutrition.score < 40) {
      areasForImprovement.push('Améliorer le suivi nutritionnel');
      recommendations.push('Scanne tes repas quotidiennement');
    }

    if (forgeScores.consistency.score >= 70) {
      strengths.push('Excellente consistance dans tes habitudes');
    } else if (forgeScores.consistency.score < 40) {
      areasForImprovement.push('Développer une routine plus régulière');
      recommendations.push('Fixe des horaires réguliers pour tes activités');
    }

    if (strengths.length === 0) {
      strengths.push('Tu as commencé ton parcours de transformation');
    }

    if (areasForImprovement.length === 0) {
      areasForImprovement.push('Continue sur cette lancée');
    }

    if (recommendations.length === 0) {
      recommendations.push('Utilise toutes les forges pour maximiser tes résultats');
    }

    const summary =
      trend === 'improving'
        ? 'Tu progresses bien, continue comme ça!'
        : trend === 'stable'
          ? 'Tes efforts sont réguliers, il est temps de passer au niveau supérieur.'
          : 'Il faut reprendre le rythme, mais tu peux le faire!';

    const motivationalMessage =
      trend === 'improving'
        ? 'Excellent travail! Chaque effort compte et tu es sur la bonne voie.'
        : trend === 'stable'
          ? 'La régularité paie toujours. Continue à challenger tes limites.'
          : 'Ce n\'est qu\'un passage à vide. Reprends tes habitudes une par une.';

    return {
      summary,
      strengths,
      areasForImprovement,
      recommendations,
      motivationalMessage
    };
  }

  private translateObjectiveType(type: string): string {
    const translations: Record<string, string> = {
      weight_loss: 'Perte de poids',
      muscle_gain: 'Prise de masse musculaire',
      endurance: 'Amélioration de l\'endurance',
      strength: 'Gain de force',
      health_optimization: 'Optimisation de la santé',
      body_recomposition: 'Recomposition corporelle'
    };
    return translations[type] || type;
  }
}

export const aiTransformationAnalyzer = new AITransformationAnalyzer();
