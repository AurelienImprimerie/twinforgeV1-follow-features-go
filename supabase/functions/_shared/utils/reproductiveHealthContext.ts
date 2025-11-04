/**
 * Reproductive Health Context - Shared Utility for Edge Functions
 *
 * Retrieves menstrual cycle or menopause data and formats it for AI prompts
 */

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

interface ReproductiveHealthContext {
  hasData: boolean;
  status: 'menstruating' | 'perimenopause' | 'menopause' | 'postmenopause' | null;
  formattedContext: string;
}

/**
 * Get reproductive health context for a user
 * Handles both menstrual cycles and menopause tracking
 */
export async function getReproductiveHealthContext(
  userId: string,
  supabase: SupabaseClient
): Promise<ReproductiveHealthContext> {
  try {
    const { data: menopause, error: menopauseError } = await supabase
      .from('menopause_tracking')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (menopauseError) {
      console.error('Error fetching menopause data:', menopauseError);
    }

    if (menopause && menopause.reproductive_status !== 'menstruating') {
      return {
        hasData: true,
        status: menopause.reproductive_status,
        formattedContext: formatMenopauseContext(menopause),
      };
    }

    const { data: menstrual, error: menstrualError } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', userId)
      .order('cycle_start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (menstrualError) {
      console.error('Error fetching menstrual data:', menstrualError);
    }

    if (menstrual) {
      return {
        hasData: true,
        status: 'menstruating',
        formattedContext: formatMenstrualContext(menstrual),
      };
    }

    return {
      hasData: false,
      status: null,
      formattedContext: '',
    };
  } catch (error) {
    console.error('Error in getReproductiveHealthContext:', error);
    return {
      hasData: false,
      status: null,
      formattedContext: '',
    };
  }
}

/**
 * Format menopause data for AI context
 */
function formatMenopauseContext(data: any): string {
  const statusLabels: Record<string, string> = {
    menstruating: 'Cycle menstruel actif',
    perimenopause: 'Périménopause',
    menopause: 'Ménopause',
    postmenopause: 'Post-ménopause',
  };

  const today = new Date();
  let daysSinceLastPeriod: number | null = null;
  let daysUntilConfirmation: number | null = null;

  if (data.last_period_date) {
    const lastPeriod = new Date(data.last_period_date);
    daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));

    if (data.reproductive_status === 'perimenopause' && daysSinceLastPeriod < 365) {
      daysUntilConfirmation = 365 - daysSinceLastPeriod;
    }
  }

  let context = `\n## STATUT REPRODUCTIF\n\nStatut actuel: ${statusLabels[data.reproductive_status] || data.reproductive_status}\n`;

  if (data.perimenopause_stage) {
    context += `Stade: ${data.perimenopause_stage === 'early' ? 'Précoce' : 'Tardif'}\n`;
  }

  if (daysSinceLastPeriod !== null) {
    context += `Jours depuis dernières règles: ${daysSinceLastPeriod}\n`;
  }

  if (daysUntilConfirmation !== null) {
    context += `Jours jusqu'à confirmation ménopause: ${daysUntilConfirmation}\n`;
  }

  if (data.fsh_level) {
    context += `Niveau FSH: ${data.fsh_level} UI/L\n`;
  }

  if (data.estrogen_level) {
    context += `Niveau œstrogène: ${data.estrogen_level} pg/mL\n`;
  }

  context += `\n## RECOMMANDATIONS ADAPTÉES\n\n`;

  if (data.reproductive_status === 'perimenopause') {
    context += `### Nutrition\n`;
    context += `- Augmenter protéines: 25-30g par repas (préservation masse musculaire)\n`;
    context += `- Calcium 1200mg/jour: produits laitiers, légumes verts, tofu\n`;
    context += `- Vitamine D 800-1000 UI/jour: poissons gras, œufs, suppléments\n`;
    context += `- Oméga-3 anti-inflammatoires: saumon, sardines, noix\n`;
    context += `- Phytoestrogènes: soja, graines de lin\n`;
    context += `- Limiter caféine et alcool (bouffées de chaleur)\n\n`;

    context += `### Exercice\n`;
    context += `- PRIORITÉ: Musculation 3x/semaine minimum\n`;
    context += `- Exercices de résistance avec poids\n`;
    context += `- Cardio modéré 150min/semaine\n`;
    context += `- HIIT 1-2x/semaine (métabolisme)\n`;
    context += `- Récupération: 48h entre sessions de force\n\n`;

    context += `### Jeûne\n`;
    context += `- Fenêtre réduite: 14-16h maximum\n`;
    context += `- Éviter jeûnes prolongés (stress hormonal)\n`;
    context += `- Flexibilité importante\n`;
    context += `- Breaking OK si hypoglycémie ou fatigue\n\n`;
  } else if (data.reproductive_status === 'menopause' || data.reproductive_status === 'postmenopause') {
    context += `### Nutrition\n`;
    context += `- Protéines élevées: 1,2-1,5g/kg (maintien musculaire)\n`;
    context += `- Calcium et vitamine D prioritaires (ostéoporose)\n`;
    context += `- Fibres solubles (santé cardiovasculaire)\n`;
    context += `- Limiter sel (hypertension)\n`;
    context += `- Antioxydants: baies, légumes colorés\n\n`;

    context += `### Exercice\n`;
    context += `- Musculation 3-4x/semaine (essentiel)\n`;
    context += `- Focus exercices composés\n`;
    context += `- Cardio 30-45min, 4-5x/semaine\n`;
    context += `- Exercices d'équilibre (prévention chutes)\n`;
    context += `- Stretching quotidien\n\n`;

    context += `### Jeûne\n`;
    context += `- Fenêtre modérée: 12-14h recommandé\n`;
    context += `- Priorité régularité des repas\n`;
    context += `- Éviter OMAD ou jeûnes > 16h\n`;
    context += `- Protéines à chaque repas\n\n`;
  }

  context += `IMPORTANT: Adapte toutes tes recommandations à ce statut hormonal et métabolique.\n`;

  return context;
}

/**
 * Format menstrual cycle data for AI context
 */
function formatMenstrualContext(data: any): string {
  const today = new Date();
  const lastPeriod = new Date(data.cycle_start_date);
  const dayInCycle = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const ovulationDay = Math.floor(data.cycle_length / 2);
  const daysUntilNextPeriod = data.cycle_length - dayInCycle;

  let phase = 'unknown';
  let phaseDescription = '';
  let energyLevel = '';
  let metabolicRate = '';

  if (dayInCycle <= 5) {
    phase = 'menstruation';
    phaseDescription = 'Phase menstruelle en cours';
    energyLevel = 'low';
    metabolicRate = 'reduced';
  } else if (dayInCycle < ovulationDay - 2) {
    phase = 'follicular';
    phaseDescription = 'Énergie croissante, bon moment pour l\'entraînement';
    energyLevel = 'high';
    metabolicRate = 'elevated';
  } else if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) {
    phase = 'ovulation';
    phaseDescription = 'Pic d\'énergie, performances maximales possibles';
    energyLevel = 'peak';
    metabolicRate = 'elevated';
  } else {
    phase = 'luteal';
    phaseDescription = 'Énergie décroissante, privilégiez la récupération';
    energyLevel = dayInCycle < data.cycle_length - 5 ? 'moderate' : 'low';
    metabolicRate = 'reduced';
  }

  let context = `\n## CYCLE MENSTRUEL\n\nPhase actuelle: ${phase}\n`;
  context += `Jour du cycle: J${dayInCycle}/${data.cycle_length}\n`;
  context += `Régularité: ${data.cycle_regularity}\n`;
  context += `Prochaines règles dans: ${Math.max(0, daysUntilNextPeriod)} jours\n`;
  context += `Niveau d'énergie: ${energyLevel}\n`;
  context += `Métabolisme: ${metabolicRate}\n\n`;
  context += `${phaseDescription}\n\n`;

  context += `CONSIDÉRATIONS HORMONALES PAR PHASE:\n\n`;

  if (phase === 'menstruation') {
    context += `**Menstruation (J1-J5)**\n`;
    context += `- Besoins accrus: Fer, vitamine C, magnésium\n`;
    context += `- Hydratation importante\n`;
    context += `- Éviter aliments pro-inflammatoires\n`;
    context += `- Intensité entraînement: Modérée à légère\n`;
    context += `- Jeûne: 12-14h maximum\n`;
  } else if (phase === 'follicular') {
    context += `**Phase Folliculaire**\n`;
    context += `- Énergie croissante, métabolisme optimal\n`;
    context += `- Bon moment pour déficit calorique si objectif perte de poids\n`;
    context += `- Favoriser glucides complexes pré-entraînement\n`;
    context += `- Intensité entraînement: Haute (PRs possibles)\n`;
    context += `- Jeûne: 16-18h bien toléré\n`;
  } else if (phase === 'ovulation') {
    context += `**Ovulation**\n`;
    context += `- Pic d'énergie et performances\n`;
    context += `- Métabolisme et sensibilité insuline optimaux\n`;
    context += `- Bon timing pour repas plus riches en glucides\n`;
    context += `- Intensité entraînement: Maximale\n`;
    context += `- Jeûne: Excellente tolérance\n`;
  } else if (phase === 'luteal') {
    context += `**Phase Lutéale**\n`;
    context += `- Métabolisme ralentit légèrement\n`;
    context += `- Rétention d'eau possible\n`;
    context += `- Augmenter fibres et magnésium\n`;
    context += `- Gérer envies sucrées avec alternatives saines\n`;
    context += `- Intensité entraînement: Modérée (maintien)\n`;
    context += `- Jeûne: Raccourcir de 1-2h\n`;
  }

  context += `\nAdapte tes recommandations à la phase actuelle.\n`;

  return context;
}
