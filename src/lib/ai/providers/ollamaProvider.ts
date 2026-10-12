/**
 * Ollama Provider Adapter (Self-Hosted / Local)
 *
 * Connects to a locally running Ollama server.
 * Default vision model: qwen2.5vl:7b (Qwen 2.5 VL — strong open-weight vision LLM)
 * Text model fallback: same model or configurable separately.
 *
 * Environment:
 *   OLLAMA_BASE_URL       – default: http://localhost:11434
 *   OLLAMA_VISION_MODEL   – default: qwen2.5vl:7b
 *
 * SECURITY NOTE:
 *   Never expose Ollama directly to the public internet without an authenticating
 *   reverse-proxy (e.g. Nginx + Basic Auth or Cloudflare Tunnel).
 *   This adapter only makes server-side requests via Next.js API routes.
 *   Client browsers cannot connect to Ollama directly.
 *
 * HARDWARE NOTE:
 *   qwen2.5vl:7b requires ~6 GB VRAM (or ~10 GB unified RAM on Apple Silicon).
 *   Smaller variants (3b, 1.5b) are available if resources are limited.
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
import { GarmentAnalysisSchema, OutfitExplanationAISchema } from '../validation';
import { internalFetch } from '@/net/guardedFetch';

const GARMENT_PROMPT = `You are a clothing recognition assistant.
Analyse the provided garment image and return ONLY valid JSON — no markdown, no explanation.
JSON schema:
{
  "category": "Tops"|"Bottoms"|"Outerwear"|"Footwear"|"One-Piece"|"Accessories",
  "subcategory": string,
  "suggested_name": string,
  "primary_color": string,
  "secondary_colors": string[],
  "pattern": string,
  "material": string|null,
  "fit": string|null,
  "formality": "Casual"|"Smart Casual"|"Business Casual"|"Formal"|"Sporty",
  "styles": string[],
  "seasons": string[],
  "occasions": string[],
  "visual_description": string,
  "confidence": number,
  "uncertain_fields": string[]
}`;

const OUTFIT_PROMPT = `You are a personal fashion stylist assistant.
Return ONLY valid JSON with no markdown. Schema:
{
  "styling_reason": string,
  "styling_tips": string[],
  "weather_notes": string,
  "why_chips": string[]
}
"why_chips": 2–4 short phrases (max 8 words each) explaining why this outfit works.`;

export class OllamaProvider implements AIProvider {
  private readonly baseUrl: string;
  private readonly visionModel: string;

  readonly capabilities: ProviderCapabilities;

  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '');
    this.visionModel = process.env.OLLAMA_VISION_MODEL ?? 'qwen2.5vl:7b';

    this.capabilities = {
      name: 'ollama',
      supportsVision: true,
      supportsTextReasoning: true,
      isConfigured: true, // Always "configured" — availability is checked at runtime
      modelId: this.visionModel,
      displayName: `Ollama / ${this.visionModel}`,
    };
  }

  async analyseClothing(input: ClothingImageInput): Promise<ClothingAnalysis> {
    const imageBase64 = this.extractBase64(input.imageDataUri);

    const prompt = `${GARMENT_PROMPT}\n\nAnalyse this garment.${
      input.hintName ? ` User hint: ${input.hintName}` : ''
    }`;

    const body = {
      model: this.visionModel,
      prompt,
      images: imageBase64 ? [imageBase64] : undefined,
      stream: false,
      format: 'json',
      options: { temperature: 0.1 },
    };

    const raw = await this.callOllama('/api/generate', body);
    const json = this.extractJson(raw.response ?? raw);
    const validated = GarmentAnalysisSchema.parse(json);
    return { ...validated, provider: 'ollama', isAiGenerated: true };
  }

  async explainOutfit(input: OutfitExplanationInput): Promise<OutfitExplanation> {
    const userContent = `
Occasion: ${input.occasion ?? 'Everyday'}
Weather: ${input.weather ?? 'Moderate'}
Outfit: "${input.outfit.title}" (score ${input.outfit.score}/100)
Items: ${input.outfit.items.map((i) => `${i.name} (${i.category}, ${i.color}, ${i.formality})`).join('; ')}
${input.styleProfile ? `Profile: ${JSON.stringify(input.styleProfile)}` : ''}
`.trim();

    const body = {
      model: this.visionModel,
      prompt: `${OUTFIT_PROMPT}\n\n${userContent}`,
      stream: false,
      format: 'json',
      options: { temperature: 0.3 },
    };

    const raw = await this.callOllama('/api/generate', body);
    const json = this.extractJson(raw.response ?? raw);
    const validated = OutfitExplanationAISchema.parse(json);
    return { ...validated, provider: 'ollama', isAiGenerated: true };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async callOllama(path: string, body: unknown): Promise<Record<string, unknown>> {
    let resp: Response;
    try {
      resp = await internalFetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // Give local inference adequate time
        signal: AbortSignal.timeout(120_000),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Ollama server not running or wrong URL
      throw new ProviderError(
        'PROVIDER_UNAVAILABLE',
        `Ollama not reachable at ${this.baseUrl}. Ensure the server is running. Error: ${msg}`,
        'ollama'
      );
    }

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new ProviderError(
        'PROVIDER_UNAVAILABLE',
        `Ollama HTTP ${resp.status}: ${text.slice(0, 200)}`,
        'ollama'
      );
    }

    return resp.json() as Promise<Record<string, unknown>>;
  }

  /** Strip the base64 payload from a data URI — Ollama expects raw base64. */
  private extractBase64(dataUri: string): string | null {
    if (!dataUri.startsWith('data:')) return null;
    const comma = dataUri.indexOf(',');
    return comma === -1 ? null : dataUri.slice(comma + 1);
  }

  private extractJson(raw: unknown): unknown {
    if (typeof raw !== 'string') return raw;
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      throw new ProviderError('INVALID_RESPONSE', `Ollama returned non-JSON: ${cleaned.slice(0, 200)}`, 'ollama');
    }
  }
}
