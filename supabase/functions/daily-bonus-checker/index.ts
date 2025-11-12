/**
 * Edge Function: Daily Bonus Checker
 *
 * Vérifie chaque jour à minuit (00h00) les bonus quotidiens éligibles
 * et attribue automatiquement les XP aux utilisateurs.
 *
 * À exécuter chaque jour à 00h00 via un cron job Supabase
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];

    console.log('🔍 Checking daily bonuses for date:', yesterdayDate);

    // Récupérer les règles de bonus quotidiennes actives
    const { data: dailyRules, error: rulesError } = await supabase
      .from('bonus_xp_rules')
      .select('*')
      .eq('is_active', true)
      .eq('period', 'daily')
      .order('priority', { ascending: true });

    if (rulesError) {
      console.error('Error fetching daily rules:', rulesError);
      throw rulesError;
    }

    console.log(`📋 Found ${dailyRules?.length || 0} daily bonus rules`);

    // Si pas de règles quotidiennes, rien à faire
    if (!dailyRules || dailyRules.length === 0) {
      console.log('ℹ️  No daily bonus rules configured');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No daily bonus rules to check',
          results: {
            rulesChecked: 0,
            usersChecked: 0,
            bonusesAwarded: 0,
            totalXpAwarded: 0,
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Récupérer tous les utilisateurs actifs
    const { data: activeUsers, error: usersError } = await supabase
      .from('user_gamification_progress')
      .select('user_id');

    if (usersError) {
      console.error('Error fetching active users:', usersError);
      throw usersError;
    }

    console.log(`👥 Found ${activeUsers?.length || 0} active users`);

    const results = {
      rulesChecked: dailyRules.length,
      usersChecked: 0,
      bonusesAwarded: 0,
      totalXpAwarded: 0,
      errors: 0,
      details: [] as any[],
    };

    // Pour chaque utilisateur, vérifier chaque règle
    for (const user of (activeUsers || [])) {
      try {
        results.usersChecked++;
        const userId = user.user_id;

        // Calculer score de performance pour hier
        const { data: perfScore, error: perfError } = await supabase.rpc(
          'calculate_overall_performance_score',
          {
            p_user_id: userId,
            p_period_type: 'daily',
            p_start_date: yesterdayDate,
            p_end_date: yesterdayDate,
          }
        );

        if (perfError) {
          console.error(`Error calculating performance for user ${userId}:`, perfError);
          results.errors++;
          continue;
        }

        console.log(`👤 User ${userId} performance:`, perfScore);

        // Vérifier chaque règle quotidienne
        for (const rule of dailyRules) {
          try {
            // Vérifier si bonus déjà attribué
            const { data: existing } = await supabase
              .from('user_bonus_history')
              .select('id')
              .eq('user_id', userId)
              .eq('rule_id', rule.id)
              .eq('period_start', yesterdayDate)
              .eq('period_end', yesterdayDate)
              .maybeSingle();

            if (existing) {
              console.log(`ℹ️  Bonus already awarded: ${rule.rule_name} for user ${userId}`);
              continue;
            }

            // Note: Logique d'éligibilité simplifiée pour daily
            // Dans une vraie implémentation, appeler des fonctions de vérification détaillées
            const eligible = perfScore?.overall_score >= 70; // Seuil minimum 70/100

            if (!eligible) {
              console.log(`❌ User ${userId} not eligible for ${rule.rule_name}`);
              continue;
            }

            // Enregistrer dans historique
            const { error: historyError } = await supabase.from('user_bonus_history').insert({
              user_id: userId,
              rule_id: rule.id,
              rule_name: rule.rule_name,
              xp_awarded: rule.xp_reward,
              period_start: yesterdayDate,
              period_end: yesterdayDate,
              performance_score: perfScore.overall_score,
              condition_details: rule.condition,
            });

            if (historyError) {
              console.error(`Error recording bonus for user ${userId}:`, historyError);
              results.errors++;
              continue;
            }

            // Attribuer XP
            const { error: xpError } = await supabase.rpc('award_xp', {
              p_user_id: userId,
              p_event_type: `bonus_${rule.rule_type}`,
              p_event_category: 'performance_bonus',
              p_base_xp: rule.xp_reward,
              p_event_metadata: {
                rule_id: rule.id,
                rule_name: rule.rule_name,
                period: 'daily',
                performance_score: perfScore.overall_score,
              },
            });

            if (xpError) {
              console.error(`Error awarding XP to user ${userId}:`, xpError);
              results.errors++;
              continue;
            }

            results.bonusesAwarded++;
            results.totalXpAwarded += rule.xp_reward;

            console.log(`✅ Awarded ${rule.rule_name} to user ${userId}: +${rule.xp_reward} XP`);

            results.details.push({
              userId,
              ruleName: rule.rule_name,
              xpAwarded: rule.xp_reward,
              performanceScore: perfScore.overall_score,
            });
          } catch (ruleError) {
            console.error(`Error processing rule ${rule.rule_name} for user ${userId}:`, ruleError);
            results.errors++;
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.user_id}:`, userError);
        results.errors++;
      }
    }

    console.log('📈 Final results:', {
      rulesChecked: results.rulesChecked,
      usersChecked: results.usersChecked,
      bonusesAwarded: results.bonusesAwarded,
      totalXpAwarded: results.totalXpAwarded,
      errors: results.errors,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily bonuses checked successfully',
        results: {
          rulesChecked: results.rulesChecked,
          usersChecked: results.usersChecked,
          bonusesAwarded: results.bonusesAwarded,
          totalXpAwarded: results.totalXpAwarded,
          errors: results.errors,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Fatal error in daily-bonus-checker:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
