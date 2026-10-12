/**
 * Groq Provider Adapter (Text-Only)
 *
 * Uses the Groq Cloud API for fast, free-tier text reasoning.
 * Model: llama-3.3-70b-versatile — free plan, high quality text generation.
 *
 * NOTE: Groq does NOT support image input.
 * This provider is used ONLY for outfit explanation and styling reasoning.
 * Never route image analysis requests to Groq.
 *
 * Environment:
 *   GROQ_API_KEY  – required
 *   GROQ_MODEL    – optional override (default: llama-3.3-70b-versatile)
 */

import {
  AIProvider,
  ClothingImageInput,
  ClothingAnalysis,
  OutfitExplanationInput,
  OutfitExplanation,
  ProviderCapabilities,
  ProviderError,
} from './types';
import { OutfitExplanationAISchema } from '../validation';
import { internalFetch } from '@/net/guardedFetch';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';

const OUTFIT_SYSTEM_PROMPT = `You are MyStyle AI, a warm personal fashion stylist.
Return ONLY valid JSON with no markdown fences. Schema:
{
  "styling_reason": string,
  "styling_tips": string[],
  "weather_notes": string,
  "why_chips": string[]
}
"why_chips" are short phrases (max 8 words) explaining why this outfit works.
Be concise, positive, and proportion-aware. Never reference weight or body metrics.`;

export class GroqProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly modelId: string;

  readonly capabilities: ProviderCapabilities;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY ?? '';
    this.modelId = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

    this.capabilities = {
      name: 'groq',
      supportsVision: false, // Groq text models do not accept images
      supportsTextReasoning: true,
      isConfigured: !!this.apiKey && !this.apiKey.includes('your-'),
      modelId: this.modelId,
      displayName: `GroqCloud (${this.modelId})`,
    };
  }

  /** Groq does not support vision — always throws. */
  async analyseClothing(_input: ClothingImageInput): Promise<ClothingAnalysis> {
    throw new ProviderError(
      'VISION_NOT_SUPPORTED',
      'Groq does not support image analysis. Use Gemini or Ollama for vision tasks.',
      'groq'
    );
  }

  async explainOutfit(input: OutfitExplanationInput): Promise<OutfitExplanation> {
    this.assertConfigured();

    const userContent = `
Occasion: ${input.occasion ?? 'Everyday'}
Weather: ${input.weather ?? 'Moderate'}
Outfit title: "${input.outfit.title}" (score: ${input.outfit.score}/100)
Items: ${input.outfit.items.map((i) => `${i.name} (${i.category}, ${i.color}, ${i.formality})`).join('; ')}
${input.styleProfile ? `Style profile: ${JSON.stringify(input.styleProfile)}` : ''}
`.trim();

    const response = await this.callGroq([
      { role: 'system', content: OUTFIT_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ]);

    const raw = response.choices?.[0]?.message?.content ?? '';
    const json = this.extractJson(raw);
    const validated = OutfitExplanationAISchema.parse(json);
    return { ...validated, provider: 'groq', isAiGenerated: true };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private assertConfigured(): void {
    if (!this.capabilities.isConfigured) {
      throw new ProviderError(
        'CONFIGURATION_MISSING',
        'GROQ_API_KEY is not set or is a placeholder.',
        'groq'
      );
    }
  }

  private async callGroq(messages: Array<{ role: string; content: string }>) {
    let resp: Response;
    try {
      resp = await internalFetch(GROQ_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelId,
          messages,
          temperature: 0.3,
          max_tokens: 512,
          response_format: { type: 'json_object' },
        }),
      });
    } catch (err) {
      throw new ProviderError('NETWORK_ERROR', `Groq network error: ${String(err)}`, 'groq');
    }

    if (resp.status === 429) {
      const retryAfter = Number(resp.headers.get('retry-after') ?? '30') * 1000;
      throw new ProviderError('RATE_LIMITED', 'Groq rate limit reached.', 'groq', retryAfter);
    }
    if (resp.status === 402) {
      throw new ProviderError('QUOTA_EXCEEDED', 'Groq free-plan quota exhausted.', 'groq');
    }
    if (!resp.ok) {
      throw new ProviderError('PROVIDER_UNAVAILABLE', `Groq returned HTTP ${resp.status}.`, 'groq');
    }

    return resp.json() as Promise<{ choices: Array<{ message: { content: string } }> }>;
  }

  private extractJson(raw: string): unknown {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      throw new ProviderError('INVALID_RESPONSE', `Groq returned non-JSON: ${raw.slice(0, 200)}`, 'groq');
    }
  }
}
