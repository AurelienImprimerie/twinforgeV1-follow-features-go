// supabase/functions/scan-refine-morphs/index.ts
import { corsHeaders, jsonResponse } from './response.ts';
import { validateRefineRequest } from './requestValidator.ts';
import { refetchMorphologyMapping } from '../_shared/utils/mappingRefetcher.ts';
import { buildAIRefinementPrompt } from './promptBuilder.ts';
import { callOpenAIForRefinement } from './openaiClient.ts';
import { validateAndClampAIResults } from './aiResultValidator.ts';
import { calculateRefinementDeltas, countActiveKeys } from './aiResultValidator.ts';
import { checkTokenBalance, consumeTokensAtomic, createInsufficientTokensResponse } from '../_shared/tokenMiddleware.ts';

// AJOUTEZ UN LOG POUR VÉRIFIER L'ACCÈS À LA VARIABLE D'ENVIRONNEMENT
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
if (!openaiApiKey) {
  console.error('ERROR: [scan-refine-morphs] OPENAI_API_KEY is NOT set!');
} else {
  console.log('DEBUG: [scan-refine-morphs] OPENAI_API_KEY is set.');
}

/**
 * Scan Refine Morphs Edge Function - AI-Driven Morphological Refinement
 * Takes blended morphs and photos, uses AI to produce photo-realistic final vector
 * Respects ONLY physiological bounds from database (no rigid policies)
 */ 
Deno.serve(async (req)=>{
  const processingStartTime = performance.now();
  const traceId = `refine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log(`DEBUG: [scan-refine-morphs] [${traceId}] Handling OPTIONS request.`);
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    console.log(`DEBUG: [scan-refine-morphs] [${traceId}] Method not allowed: ${req.method}.`);
    return jsonResponse({
      error: "Method not allowed"
    }, 405);
  }
  let requestData; // Declare requestData here to ensure it's always defined
  try {
    // Parse and validate request
    requestData = await req.json(); // Assign requestData here
    const validationError = validateRefineRequest(requestData);
    if (validationError) {
      console.error(`❌ [scan-refine-morphs] [${traceId}] Request validation failed:`, validationError);
      return jsonResponse({
        error: validationError
      }, 400);
    }
    const { scan_id, user_id, resolvedGender, photos, blend_shape_params, blend_limb_masses, mapping_version, k5_envelope, vision_classification, user_measurements } = requestData;
    console.log(`📥 [scan-refine-morphs] [${traceId}] AI refinement request received:`, {
      scan_id,
      user_id,
      resolvedGender,
      photosCount: photos?.length,
      blendShapeParamsKeys: Object.keys(blend_shape_params || {}),
      blendLimbMassesKeys: Object.keys(blend_limb_masses || {}),
      mapping_version,
      hasK5Envelope: !!k5_envelope,
      hasVisionClassification: !!vision_classification,
      hasUserMeasurements: !!user_measurements,
      traceId,
      philosophy: 'phase_b_ai_driven_k5_envelope_constrained'
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    const { createClient } = await import('npm:@supabase/supabase-js@2.54.0');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const estimatedTokensForRefine = 150;
    const tokenCheck = await checkTokenBalance(supabase, user_id, estimatedTokensForRefine);

    if (!tokenCheck.hasEnoughTokens) {
      console.warn('SCAN_REFINE_MORPHS', 'Insufficient tokens for morph refinement', {
        traceId,
        userId: user_id,
        currentBalance: tokenCheck.currentBalance,
        requiredTokens: estimatedTokensForRefine,
        timestamp: new Date().toISOString()
      });

      return createInsufficientTokensResponse(
        tokenCheck.currentBalance,
        estimatedTokensForRefine,
        !tokenCheck.isSubscribed,
        corsHeaders
      );
    }

    console.log('💰 [SCAN_REFINE_MORPHS] Token check passed', {
      traceId,
      userId: user_id,
      currentBalance: tokenCheck.currentBalance,
      requiredTokens: estimatedTokensForRefine,
      timestamp: new Date().toISOString()
    });

    // Fetch morphology mapping from database
    console.log(`🔍 [scan-refine-morphs] [${traceId}] Fetching morphology mapping for ${resolvedGender}`);
    const mappingResult = await refetchMorphologyMapping(supabase, resolvedGender);

    if (!mappingResult.success || !mappingResult.mapping) {
      throw new Error(`Failed to fetch morphology mapping: ${mappingResult.error || 'Unknown error'}`);
    }

    const { morph_values: morphMapping, limb_masses: limbMapping } = mappingResult.mapping;

    console.log(`✅ [scan-refine-morphs] [${traceId}] Morphology mapping fetched:`, {
      morphValuesCount: Object.keys(morphMapping || {}).length,
      limbMassesCount: Object.keys(limbMapping || {}).length,
      philosophy: 'mapping_fetched_for_constraints'
    });

    // Build AI refinement prompt
    const prompt = buildAIRefinementPrompt({
      blend_shape_params,
      blend_limb_masses,
      k5_envelope,
      vision_classification,
      user_measurements,
      resolvedGender,
      morphMapping,
      limbMapping
    });

    console.log(`📝 [scan-refine-morphs] [${traceId}] AI prompt built:`, {
      promptLength: prompt.length,
      hasK5Envelope: !!k5_envelope,
      hasVisionClassification: !!vision_classification,
      philosophy: 'ai_prompt_preparation'
    });

    // Call OpenAI for AI-driven refinement
    const aiStartTime = performance.now();
    const aiResult = await callOpenAIForRefinement(prompt, photos, traceId);
    const aiDuration = performance.now() - aiStartTime;

    console.log(`🤖 [scan-refine-morphs] [${traceId}] OpenAI refinement completed:`, {
      durationMs: aiDuration.toFixed(2),
      hasResult: !!aiResult,
      philosophy: 'ai_refinement_complete'
    });

    // Validate and clamp AI results
    const validationResult = validateAndClampAIResults(
      aiResult,
      morphMapping,
      limbMapping,
      k5_envelope,
      traceId
    );

    if (!validationResult.success) {
      throw new Error(`AI result validation failed: ${validationResult.error}`);
    }

    const { final_shape_params, final_limb_masses, clamping_metadata } = validationResult;

    console.log(`✅ [scan-refine-morphs] [${traceId}] Validation and clamping completed:`, {
      finalShapeParamsCount: Object.keys(final_shape_params).length,
      finalLimbMassesCount: Object.keys(final_limb_masses).length,
      clampingMetadata: clamping_metadata,
      philosophy: 'validation_and_clamping_complete'
    });

    // Calculate refinement deltas for audit
    const deltas = calculateRefinementDeltas(blend_shape_params, final_shape_params);
    const activeKeysCount = countActiveKeys(final_shape_params, final_limb_masses);

    // Consume tokens atomically
    const actualTokensUsed = Math.ceil(estimatedTokensForRefine * 0.95); // Adjust based on actual usage
    await consumeTokensAtomic(
      supabase,
      user_id,
      actualTokensUsed,
      'ai-morph-refinement',
      {
        scan_id,
        traceId,
        aiDurationMs: aiDuration,
        philosophy: 'token_consumption_after_successful_refinement'
      }
    );

    const totalProcessingTime = performance.now() - processingStartTime;

    console.log(`✅ [scan-refine-morphs] [${traceId}] AI refinement completed successfully:`, {
      totalProcessingTimeMs: totalProcessingTime.toFixed(2),
      aiDurationMs: aiDuration.toFixed(2),
      finalShapeParamsCount: Object.keys(final_shape_params).length,
      finalLimbMassesCount: Object.keys(final_limb_masses).length,
      activeKeysCount,
      tokensConsumed: actualTokensUsed,
      philosophy: 'phase_b_ai_refinement_success'
    });

    // Return refined morphology with CORS headers
    return jsonResponse({
      success: true,
      final_shape_params,
      final_limb_masses,
      clamping_metadata,
      audit: {
        deltas,
        activeKeysCount,
        aiDurationMs: aiDuration,
        totalProcessingTimeMs: totalProcessingTime,
        tokensConsumed: actualTokensUsed,
        traceId
      }
    }, 200);

  } catch (error: any) {
    console.error(`❌ [scan-refine-morphs] [${traceId}] Error:`, error);

    // Always return CORS headers even on error
    return jsonResponse({
      success: false,
      error: error.message || 'Internal server error',
      traceId
    }, 500);
  }
});