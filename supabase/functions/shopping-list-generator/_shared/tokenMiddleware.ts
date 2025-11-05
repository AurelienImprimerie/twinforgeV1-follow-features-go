import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface TokenConsumptionRequest {
  userId: string;
  edgeFunctionName: string;
  operationType: string;
  openaiModel?: string;
  openaiInputTokens?: number;
  openaiOutputTokens?: number;
  openaiCostUsd?: number;
  metadata?: Record<string, any>;
}

export interface TokenConsumptionResult {
  success: boolean;
  remainingBalance: number;
  consumed: number;
  error?: string;
  needsUpgrade?: boolean;
  requestId?: string;
  duplicate?: boolean;
  retryAfterSeconds?: number;
}

export interface TokenCheckResult {
  hasEnoughTokens: boolean;
  currentBalance: number;
  requiredTokens: number;
  isSubscribed: boolean;
  subscriptionStatus?: string;
  error?: string;
}

const OPENAI_PRICING = {
  "gpt-5": { inputCostPer1M: 1.25, outputCostPer1M: 10.00 },
  "gpt-5-mini": { inputCostPer1M: 0.25, outputCostPer1M: 2.00 },
  "gpt-5-nano": { inputCostPer1M: 0.05, outputCostPer1M: 0.40 },
  "gpt-4o": { inputCostPer1M: 2.50, outputCostPer1M: 10.00 },
  "gpt-4o-mini": { inputCostPer1M: 0.15, outputCostPer1M: 0.60 },
  "gpt-4-turbo": { inputCostPer1M: 10.00, outputCostPer1M: 30.00 },
  "gpt-4": { inputCostPer1M: 30.00, outputCostPer1M: 60.00 },
  "gpt-image-1": { perImage: 0.015 },
  "dall-e-3": { standard: 0.040, hd: 0.080 },
  "whisper-1": { perMinute: 0.006 },
  "tts-1": { perMillionChars: 15.00 },
  "tts-1-hd": { perMillionChars: 30.00 },
  "gpt-4o-realtime-preview": { inputCostPer1M: 5.00, outputCostPer1M: 20.00, audioCostPer1M: 100.00 }
};

function calculateOpenAICost(model: string, inputTokens?: number, outputTokens?: number, audioTokens?: number, imageCount?: number): number {
  const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING];
  if (!pricing) return 0;
  let totalCost = 0;
  if ("inputCostPer1M" in pricing && inputTokens) totalCost += (inputTokens / 1_000_000) * pricing.inputCostPer1M;
  if ("outputCostPer1M" in pricing && outputTokens) totalCost += (outputTokens / 1_000_000) * pricing.outputCostPer1M;
  if ("audioCostPer1M" in pricing && audioTokens) totalCost += (audioTokens / 1_000_000) * pricing.audioCostPer1M;
  if ("perImage" in pricing && imageCount) totalCost += imageCount * pricing.perImage;
  return totalCost;
}

const PROFIT_MARGIN_MULTIPLIER = 5.0;

function convertUsdToTokens(usdAmount: number): number {
  const TOKEN_USD_RATE = 0.001;
  const costWithMargin = usdAmount * PROFIT_MARGIN_MULTIPLIER;
  return Math.ceil(costWithMargin / TOKEN_USD_RATE);
}

export interface TokenConsumptionLog {
  edgeFunctionName: string;
  userId: string;
  operationType: string;
  openaiModel?: string;
  openaiCostUsd: number;
  tokensCharged: number;
  marginMultiplier: number;
  marginPercentage: number;
  profitUsd: number;
  timestamp: string;
}

export function logTokenConsumption(log: TokenConsumptionLog): void {
  const logEntry = {
    timestamp: log.timestamp,
    level: 'info',
    service: log.edgeFunctionName,
    event: 'TOKEN_CONSUMPTION',
    data: {
      userId: log.userId,
      operationType: log.operationType,
      openaiModel: log.openaiModel || 'N/A',
      openaiCostUsd: log.openaiCostUsd.toFixed(6),
      tokensCharged: log.tokensCharged,
      marginMultiplier: log.marginMultiplier,
      marginPercentage: `${log.marginPercentage.toFixed(1)}%`,
      profitUsd: log.profitUsd.toFixed(6),
      revenueUsd: (log.tokensCharged * 0.001).toFixed(6)
    }
  };
  console.log(`💰 [TOKEN_CONSUMPTION] ${JSON.stringify(logEntry)}`);
}

export async function checkTokenBalance(supabase: SupabaseClient, userId: string, requiredTokens: number): Promise<TokenCheckResult> {
  try {
    const { data: balance, error: balanceError } = await supabase.from("user_token_balance").select("available_tokens, user_id").eq("user_id", userId).single();
    if (balanceError) {
      if (balanceError.code === "PGRST116") {
        const { error: insertError } = await supabase.from("user_token_balance").insert({ user_id: userId, available_tokens: 0, subscription_tokens: 0, onetime_tokens: 0, bonus_tokens: 0, last_monthly_reset: new Date().toISOString() });
        if (insertError) return { hasEnoughTokens: false, currentBalance: 0, requiredTokens, isSubscribed: false, error: "Failed to initialize token balance" };
        return { hasEnoughTokens: false, currentBalance: 0, requiredTokens, isSubscribed: false };
      }
      return { hasEnoughTokens: false, currentBalance: 0, requiredTokens, isSubscribed: false, error: balanceError.message };
    }
    const { data: subscription } = await supabase.from("user_subscriptions").select("status, stripe_subscription_id").eq("user_id", userId).single();
    const isSubscribed = subscription?.status === "active";
    const hasEnoughTokens = balance.available_tokens >= requiredTokens;
    return { hasEnoughTokens, currentBalance: balance.available_tokens, requiredTokens, isSubscribed, subscriptionStatus: subscription?.status };
  } catch (error) {
    return { hasEnoughTokens: false, currentBalance: 0, requiredTokens, isSubscribed: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function consumeTokensAtomic(supabase: SupabaseClient, request: TokenConsumptionRequest, requestId?: string): Promise<TokenConsumptionResult> {
  try {
    const actualRequestId = requestId || crypto.randomUUID();
    let tokensToConsume = 0;
    let actualCostUsd = request.openaiCostUsd || 0;
    if (request.openaiModel && (request.openaiInputTokens || request.openaiOutputTokens)) {
      actualCostUsd = calculateOpenAICost(request.openaiModel, request.openaiInputTokens, request.openaiOutputTokens);
      tokensToConsume = convertUsdToTokens(actualCostUsd);
    } else if (request.openaiCostUsd) {
      tokensToConsume = convertUsdToTokens(request.openaiCostUsd);
    } else {
      const estimatedCosts: Record<string, number> = { "image-generation": 15, "audio-transcription": 10, "voice-realtime": 100, "chat-completion": 20, "body-scan-analysis": 150, "meal-analysis": 100, "training-analysis": 120 };
      tokensToConsume = estimatedCosts[request.operationType] || 50;
    }
    const { data, error } = await supabase.rpc("consume_tokens_atomic", { p_request_id: actualRequestId, p_user_id: request.userId, p_token_amount: tokensToConsume, p_edge_function_name: request.edgeFunctionName, p_operation_type: request.operationType, p_openai_model: request.openaiModel || null, p_openai_input_tokens: request.openaiInputTokens || null, p_openai_output_tokens: request.openaiOutputTokens || null, p_openai_cost_usd: actualCostUsd || null, p_metadata: request.metadata || {} });
    if (error) return { success: false, remainingBalance: 0, consumed: 0, error: error.message, requestId: actualRequestId };
    if (!data.success) {
      if (data.duplicate) return { success: true, duplicate: true, remainingBalance: data.balance_after || 0, consumed: 0, requestId: actualRequestId };
      if (data.error === 'rate_limit_exceeded') return { success: false, remainingBalance: 0, consumed: 0, error: data.message, retryAfterSeconds: data.retry_after_seconds || 5, requestId: actualRequestId };
      if (data.error === 'insufficient_tokens') {
        const { data: subscription } = await supabase.from("user_subscriptions").select("status").eq("user_id", request.userId).single();
        return { success: false, remainingBalance: data.available_tokens || 0, consumed: 0, error: data.message, needsUpgrade: subscription?.status !== "active", requestId: actualRequestId };
      }
      return { success: false, remainingBalance: 0, consumed: 0, error: data.message || data.error, requestId: actualRequestId };
    }
    const marginPercentage = ((PROFIT_MARGIN_MULTIPLIER - 1) / PROFIT_MARGIN_MULTIPLIER) * 100;
    const profitUsd = actualCostUsd * (PROFIT_MARGIN_MULTIPLIER - 1);
    const revenueUsd = tokensToConsume * 0.001;
    logTokenConsumption({ edgeFunctionName: request.edgeFunctionName, userId: request.userId, operationType: request.operationType, openaiModel: request.openaiModel, openaiCostUsd: actualCostUsd, tokensCharged: tokensToConsume, marginMultiplier: PROFIT_MARGIN_MULTIPLIER, marginPercentage, profitUsd, timestamp: new Date().toISOString() });
    try {
      await supabase.from('ai_cost_analytics').insert({ user_id: request.userId, edge_function_name: request.edgeFunctionName, operation_type: request.operationType, openai_model: request.openaiModel || null, openai_cost_usd: actualCostUsd, tokens_charged: tokensToConsume, margin_multiplier: PROFIT_MARGIN_MULTIPLIER, margin_percentage: marginPercentage, profit_usd: profitUsd, revenue_usd: revenueUsd });
    } catch (analyticsError) {}
    return { success: true, remainingBalance: data.balance_after, consumed: data.tokens_consumed, requestId: actualRequestId };
  } catch (error) {
    return { success: false, remainingBalance: 0, consumed: 0, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function consumeTokens(supabase: SupabaseClient, request: TokenConsumptionRequest): Promise<TokenConsumptionResult> {
  console.warn('[DEPRECATED] consumeTokens is deprecated. Use consumeTokensAtomic instead.');
  return consumeTokensAtomic(supabase, request);
}

export function createInsufficientTokensResponse(balance: number, required: number, needsUpgrade: boolean, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify({ error: "Insufficient tokens", code: "INSUFFICIENT_TOKENS", details: { currentBalance: balance, requiredTokens: required, needsUpgrade, message: needsUpgrade ? "You need a subscription to continue using AI features." : "You have run out of tokens. Please purchase more tokens or upgrade your subscription." } }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
