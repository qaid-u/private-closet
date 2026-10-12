/**
 * AI Status API — /api/ai/status
 *
 * Returns current provider capabilities, configuration state,
 * and application-level usage stats for the AI Settings page.
 * Server-side only — never exposes API keys or secrets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllCapabilities, getUsageStats } from '@/lib/ai/providers/router';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id') ?? 'anonymous';

  const capabilities = getAllCapabilities();
  const usage = getUsageStats(userId);

  // Determine effective providers
  const visionProvider = process.env.AI_VISION_PROVIDER ?? 'gemini';
  const textProvider = process.env.AI_TEXT_PROVIDER ?? 'gemini';

  const visionCap = capabilities.find((c) => c.name === visionProvider);
  const textCap = capabilities.find((c) => c.name === textProvider);

  return NextResponse.json({
    providers: capabilities.map((cap) => ({
      name: cap.name,
      displayName: cap.displayName,
      modelId: cap.modelId,
      isConfigured: cap.isConfigured,
      supportsVision: cap.supportsVision,
      supportsTextReasoning: cap.supportsTextReasoning,
      isActive: cap.name === visionProvider || cap.name === textProvider,
      isVisionProvider: cap.name === visionProvider,
      isTextProvider: cap.name === textProvider,
    })),
    active: {
      vision: {
        provider: visionProvider,
        model: visionCap?.modelId ?? 'unknown',
        isConfigured: visionCap?.isConfigured ?? false,
      },
      text: {
        provider: textProvider,
        model: textCap?.modelId ?? 'unknown',
        isConfigured: textCap?.isConfigured ?? false,
      },
    },
    usage: {
      requests_used_today: usage.used,
      requests_limit_per_day: usage.limit,
      last_error: usage.lastError ?? null,
    },
    config: {
      rule_based_fallback_enabled: process.env.AI_ENABLE_RULE_BASED_FALLBACK !== 'false',
      allow_paid_models: process.env.AI_ALLOW_PAID_MODELS === 'true',
      ollama_base_url: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
      ollama_vision_model: process.env.OLLAMA_VISION_MODEL ?? 'qwen2.5vl:7b',
    },
  });
}
