/**
 * AI Provider Router
 *
 * Implements the execution chain:
 *   1. Selected vision provider (Gemini or Ollama) for image analysis
 *   2. Selected text provider for outfit explanations
 *      → optionally falls over to secondary text provider
 *   3. Rule-based fallback (always available if AI_ENABLE_RULE_BASED_FALLBACK=true)
 *
 * Hard protections:
 *   - Never routes to a provider that lacks the required capability
 *   - Never retries after QUOTA_EXCEEDED (uses exponential backoff only for RATE_LIMITED)
 *   - Tracks application-level daily budget; stops AI calls when exhausted
 *   - AI_ALLOW_PAID_MODELS=false prevents any paid-model endpoint calls
 */

import { GeminiProvider } from './geminiProvider';
import { GroqProvider } from './groqProvider';
import { OllamaProvider } from './ollamaProvider';
import { RuleBasedProvider } from './ruleBasedProvider';
import {
  AIProvider,
  ClothingImageInput,
  ClothingAnalysis,
  OutfitExplanationInput,
  OutfitExplanation,
  ProviderCapabilities,
  ProviderError,
  ProviderName,
} from './types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function getConfig() {
  return {
    visionProvider: (process.env.AI_VISION_PROVIDER ?? 'gemini') as ProviderName,
    textProvider: (process.env.AI_TEXT_PROVIDER ?? 'gemini') as ProviderName,
    allowPaidModels: process.env.AI_ALLOW_PAID_MODELS === 'true',
    enableRuleBasedFallback: process.env.AI_ENABLE_RULE_BASED_FALLBACK !== 'false',
    requestsPerUserPerDay: parseInt(process.env.AI_REQUESTS_PER_USER_PER_DAY ?? '20', 10),
  };
}

// ---------------------------------------------------------------------------
// Usage budget (in-memory for serverless; swap to Supabase/Redis in production)
// ---------------------------------------------------------------------------

const dailyUsageMap = new Map<string, { date: string; count: number; lastError?: string }>();

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function checkBudget(userId: string): { allowed: boolean; used: number; limit: number } {
  const limit = getConfig().requestsPerUserPerDay;
  const today = getTodayKey();
  const entry = dailyUsageMap.get(userId);

  if (!entry || entry.date !== today) {
    return { allowed: true, used: 0, limit };
  }
  return { allowed: entry.count < limit, used: entry.count, limit };
}

function recordUsage(userId: string, errorMessage?: string) {
  const today = getTodayKey();
  const entry = dailyUsageMap.get(userId) ?? { date: today, count: 0 };
  if (entry.date !== today) { entry.date = today; entry.count = 0; }
  entry.count += 1;
  if (errorMessage) entry.lastError = errorMessage;
  dailyUsageMap.set(userId, entry);
}

export function getUsageStats(userId: string) {
  const today = getTodayKey();
  const entry = dailyUsageMap.get(userId);
  const limit = getConfig().requestsPerUserPerDay;
  if (!entry || entry.date !== today) return { used: 0, limit, lastError: undefined };
  return { used: entry.count, limit, lastError: entry.lastError };
}

// ---------------------------------------------------------------------------
// Provider registry (lazy singletons)
// ---------------------------------------------------------------------------

let _gemini: GeminiProvider | null = null;
let _groq: GroqProvider | null = null;
let _ollama: OllamaProvider | null = null;
let _ruleBased: RuleBasedProvider | null = null;

function getProvider(name: ProviderName): AIProvider {
  switch (name) {
    case 'gemini':    return (_gemini    ??= new GeminiProvider());
    case 'groq':      return (_groq      ??= new GroqProvider());
    case 'ollama':    return (_ollama    ??= new OllamaProvider());
    case 'rule-based': return (_ruleBased ??= new RuleBasedProvider());
  }
}

export function getAllCapabilities(): ProviderCapabilities[] {
  return (
    ['gemini', 'groq', 'ollama', 'rule-based'] as ProviderName[]
  ).map((n) => getProvider(n).capabilities);
}

// ---------------------------------------------------------------------------
// Routing helpers
// ---------------------------------------------------------------------------

function selectVisionChain(): AIProvider[] {
  const cfg = getConfig();
  const chain: AIProvider[] = [];

  const primary = getProvider(cfg.visionProvider);
  if (primary.capabilities.supportsVision && primary.capabilities.isConfigured) {
    chain.push(primary);
  }

  // Gemini as automatic secondary vision fallback if not already selected
  if (cfg.visionProvider !== 'gemini') {
    const gemini = getProvider('gemini');
    if (gemini.capabilities.isConfigured) chain.push(gemini);
  }

  // Ollama as local fallback
  if (cfg.visionProvider !== 'ollama') {
    chain.push(getProvider('ollama'));
  }

  if (cfg.enableRuleBasedFallback) {
    chain.push(getProvider('rule-based'));
  }

  return chain;
}

function selectTextChain(): AIProvider[] {
  const cfg = getConfig();
  const chain: AIProvider[] = [];

  const primary = getProvider(cfg.textProvider);
  if (primary.capabilities.supportsTextReasoning && primary.capabilities.isConfigured) {
    chain.push(primary);
  }

  // Add Groq as a secondary text provider if not already selected
  if (cfg.textProvider !== 'groq') {
    const groq = getProvider('groq');
    if (groq.capabilities.isConfigured) chain.push(groq);
  }

  if (cfg.enableRuleBasedFallback) {
    chain.push(getProvider('rule-based'));
  }

  return chain;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RouterResult<T> {
  data: T;
  providerUsed: ProviderName;
  isAiGenerated: boolean;
  fallbackReason?: string;
}

export async function routeClothingAnalysis(
  input: ClothingImageInput,
  userId: string = 'anonymous'
): Promise<RouterResult<ClothingAnalysis>> {
  const budget = checkBudget(userId);
  const chain = selectVisionChain();

  // If budget is exceeded, skip to rule-based only
  if (!budget.allowed) {
    const rb = getProvider('rule-based');
    const data = await rb.analyseClothing(input);
    return {
      data,
      providerUsed: 'rule-based',
      isAiGenerated: false,
      fallbackReason: `Daily AI request limit of ${budget.limit} reached. Rule-based analysis used.`,
    };
  }

  let lastError: string | undefined;

  for (const provider of chain) {
    if (!provider.capabilities.supportsVision) continue;

    // Never auto-call paid models
    if (!getConfig().allowPaidModels && isPaidProvider(provider.capabilities.name)) {
      continue;
    }

    try {
      const data = await provider.analyseClothing(input);
      if (provider.capabilities.name !== 'rule-based') {
        recordUsage(userId);
      }
      return {
        data,
        providerUsed: provider.capabilities.name,
        isAiGenerated: data.isAiGenerated,
        fallbackReason: lastError ? `Primary provider failed: ${lastError}` : undefined,
      };
    } catch (err) {
      const pe = err instanceof ProviderError ? err : null;
      lastError = pe?.message ?? (err instanceof Error ? err.message : String(err));

      // On quota exceeded: stop retrying this provider, continue chain
      if (pe?.code === 'QUOTA_EXCEEDED') {
        recordUsage(userId, lastError);
        console.warn(`[AIRouter] ${provider.capabilities.name} quota exceeded, trying next.`);
        continue;
      }

      // On rate limit: log and continue (no retry loop)
      if (pe?.code === 'RATE_LIMITED') {
        console.warn(`[AIRouter] ${provider.capabilities.name} rate-limited, trying next.`);
        continue;
      }

      // Other errors: log and continue
      console.warn(`[AIRouter] ${provider.capabilities.name} failed: ${lastError}, trying next.`);
    }
  }

  // All providers exhausted — should not reach here if rule-based is in chain
  const rb = getProvider('rule-based');
  const data = await rb.analyseClothing(input);
  return {
    data,
    providerUsed: 'rule-based',
    isAiGenerated: false,
    fallbackReason: lastError ?? 'All AI providers unavailable.',
  };
}

export async function routeOutfitExplanation(
  input: OutfitExplanationInput,
  userId: string = 'anonymous'
): Promise<RouterResult<OutfitExplanation>> {
  const budget = checkBudget(userId);
  const chain = selectTextChain();

  if (!budget.allowed) {
    const rb = getProvider('rule-based');
    const data = await rb.explainOutfit(input);
    return {
      data,
      providerUsed: 'rule-based',
      isAiGenerated: false,
      fallbackReason: `Daily AI request limit of ${budget.limit} reached.`,
    };
  }

  let lastError: string | undefined;

  for (const provider of chain) {
    if (!getConfig().allowPaidModels && isPaidProvider(provider.capabilities.name)) continue;

    try {
      const data = await provider.explainOutfit(input);
      if (provider.capabilities.name !== 'rule-based') {
        recordUsage(userId);
      }
      return {
        data,
        providerUsed: provider.capabilities.name,
        isAiGenerated: data.isAiGenerated,
        fallbackReason: lastError ? `Primary failed: ${lastError}` : undefined,
      };
    } catch (err) {
      const pe = err instanceof ProviderError ? err : null;
      lastError = pe?.message ?? (err instanceof Error ? err.message : String(err));
      if (pe?.code === 'QUOTA_EXCEEDED') { recordUsage(userId, lastError); continue; }
      continue;
    }
  }

  const rb = getProvider('rule-based');
  const data = await rb.explainOutfit(input);
  return {
    data,
    providerUsed: 'rule-based',
    isAiGenerated: false,
    fallbackReason: lastError ?? 'All text providers unavailable.',
  };
}

/** Placeholder for a future paid-tier guard. Currently no providers require paid plans. */
function isPaidProvider(_name: ProviderName): boolean {
  // OpenAI is no longer used. Gemini, Groq, and Ollama all have free tiers.
  return false;
}
