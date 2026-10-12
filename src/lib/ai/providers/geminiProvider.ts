/**
 * Gemini Provider Adapter
 *
 * Uses Google's @google/generative-ai SDK.
 * Model: gemini-2.0-flash — supports image input, JSON mode, free tier.
 *
 * Environment:
 *   GEMINI_API_KEY  – required
 *   GEMINI_MODEL    – optional override (default: gemini-2.0-flash)
 *
 * Rate-limit / quota errors from the API are mapped to ProviderError
 * with QUOTA_EXCEEDED or RATE_LIMITED codes so the router can fall back
 * gracefully without infinite retries.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
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

const FREE_TIER_GEMINI_MODELS = new Set([
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
]);

function isFreeTierEligibleModel(modelId: string): boolean {
  return FREE_TIER_GEMINI_MODELS.has(modelId);
}

// ---------------------------------------------------------------------------
// Prompt helpers
// ---------------------------------------------------------------------------

const GARMENT_SYSTEM_PROMPT = `You are MyStyle AI, an expert digital clothing recognition assistant.
Analyse the provided clothing image and extract visual properties.
Return ONLY valid JSON with no markdown or code fences.
Schema:
{
  "category": "Tops" | "Bottoms" | "Outerwear" | "Footwear" | "One-Piece" | "Accessories",
  "subcategory": string,
  "suggested_name": string,
  "primary_color": string,
  "secondary_colors": string[],
  "pattern": string,
  "material": string | null,
  "fit": string | null,
  "formality": "Casual" | "Smart Casual" | "Business Casual" | "Formal" | "Sporty",
  "styles": string[],
  "seasons": string[],
  "occasions": string[],
  "visual_description": string,
  "confidence": number,
  "uncertain_fields": string[]
}
Never guess people or body measurements. Base properties strictly on the visible garment.`;

const OUTFIT_SYSTEM_PROMPT = `You are MyStyle AI, a warm and sophisticated personal fashion stylist.
Generate concise, positive, proportion-aware outfit explanations using ONLY the items provided.
Return ONLY valid JSON with no markdown. Schema:
{
  "styling_reason": string,
  "styling_tips": string[],
  "weather_notes": string,
  "why_chips": string[]
}
"why_chips" are short phrases (max 8 words) explaining why this outfit works for this person.
Use kind, positive, proportion-based language. Never reference weight or body metrics.`;

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

export class GeminiProvider implements AIProvider {
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelId: string;

  readonly capabilities: ProviderCapabilities;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY ?? '';
    const allowPaidModels = process.env.AI_ALLOW_PAID_MODELS === 'true';
    this.modelId = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.capabilities = {
      name: 'gemini',
      supportsVision: true,
      supportsTextReasoning: true,
      isConfigured: !!apiKey && !apiKey.includes('your-') && (allowPaidModels || isFreeTierEligibleModel(this.modelId)),
      modelId: this.modelId,
      displayName: `Google Gemini (${this.modelId})`,
    };
  }

  async analyseClothing(input: ClothingImageInput): Promise<ClothingAnalysis> {
    this.assertConfigured();

    const model = this.genAI.getGenerativeModel({
      model: this.modelId,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const imagePart = this.buildImagePart(input.imageDataUri);
    const promptText = `${GARMENT_SYSTEM_PROMPT}\n\nAnalyse this wardrobe garment.${
      input.hintName ? ` User hint: ${input.hintName}` : ''
    }`;

    try {
      const result = await model.generateContent([promptText, imagePart]);
      const raw = result.response.text().trim();
      const json = this.extractJson(raw);
      const validated = GarmentAnalysisSchema.parse(json);
      return { ...validated, provider: 'gemini', isAiGenerated: true };
    } catch (err) {
      throw this.mapError(err, 'analyseClothing');
    }
  }

  async explainOutfit(input: OutfitExplanationInput): Promise<OutfitExplanation> {
    this.assertConfigured();

    const model = this.genAI.getGenerativeModel({ model: this.modelId });

    const userContent = `
Occasion: ${input.occasion ?? 'Everyday'}
Weather: ${input.weather ?? 'Moderate'}
Outfit title: "${input.outfit.title}" (score: ${input.outfit.score}/100)
Items: ${input.outfit.items.map((i) => `${i.name} (${i.category}, ${i.color}, ${i.formality})`).join('; ')}
${input.styleProfile ? `Style profile: ${JSON.stringify(input.styleProfile)}` : ''}
`.trim();

    const prompt = `${OUTFIT_SYSTEM_PROMPT}\n\n${userContent}`;

    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim();
      const json = this.extractJson(raw);
      const validated = OutfitExplanationAISchema.parse(json);
      return { ...validated, provider: 'gemini', isAiGenerated: true };
    } catch (err) {
      throw this.mapError(err, 'explainOutfit');
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private assertConfigured(): void {
    if (!this.capabilities.isConfigured) {
      if (!isFreeTierEligibleModel(this.modelId) && process.env.AI_ALLOW_PAID_MODELS !== 'true') {
        throw new ProviderError(
          'CONFIGURATION_MISSING',
          `Gemini model "${this.modelId}" is not enabled because AI_ALLOW_PAID_MODELS is not true.`,
          'gemini'
        );
      }
      throw new ProviderError(
        'CONFIGURATION_MISSING',
        'GEMINI_API_KEY is not set or is a placeholder.',
        'gemini'
      );
    }
  }

  /** Convert a base-64 data URI or public URL into a Gemini inline image part. */
  private buildImagePart(imageDataUri: string) {
    if (imageDataUri.startsWith('data:')) {
      const [header, data] = imageDataUri.split(',');
      const mimeType = (header.match(/data:(.*?);/) ?? [])[1] ?? 'image/jpeg';
      return { inlineData: { mimeType, data } };
    }
    // Public URL — use fileData
    return { fileData: { mimeType: 'image/jpeg', fileUri: imageDataUri } };
  }

  private extractJson(raw: string): unknown {
    // Strip possible markdown fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      throw new ProviderError('INVALID_RESPONSE', `Gemini returned non-JSON: ${raw.slice(0, 200)}`, 'gemini');
    }
  }

  private mapError(err: unknown, operation: string): ProviderError {
    if (err instanceof ProviderError) return err;
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();

    if (lower.includes('quota') || lower.includes('429') || lower.includes('resource_exhausted')) {
      return new ProviderError('QUOTA_EXCEEDED', `Gemini quota exceeded during ${operation}.`, 'gemini', 60_000);
    }
    if (lower.includes('rate') || lower.includes('too many')) {
      return new ProviderError('RATE_LIMITED', `Gemini rate-limited during ${operation}.`, 'gemini', 10_000);
    }
    if (lower.includes('network') || lower.includes('fetch')) {
      return new ProviderError('NETWORK_ERROR', `Gemini network error during ${operation}: ${message}`, 'gemini');
    }
    return new ProviderError('PROVIDER_UNAVAILABLE', `Gemini error during ${operation}: ${message}`, 'gemini');
  }
}
