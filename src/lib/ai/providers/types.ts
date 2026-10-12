/**
 * AI Provider Abstraction Layer
 *
 * Defines the shared contracts for all AI providers (Gemini, Groq, Ollama, Rule-Based).
 * Never import external SDKs here — only pure TypeScript types.
 */

// ---------------------------------------------------------------------------
// Shared I/O types
// ---------------------------------------------------------------------------

export interface ClothingImageInput {
  /** Base-64 data URI (data:image/jpeg;base64,...) or public HTTPS URL */
  imageDataUri: string;
  /** Optional user-supplied name hint for heuristics */
  hintName?: string;
}

export interface ClothingAnalysis {
  category: 'Tops' | 'Bottoms' | 'Outerwear' | 'Footwear' | 'One-Piece' | 'Accessories';
  subcategory: string;
  suggested_name: string;
  primary_color: string;
  secondary_colors: string[];
  pattern: string;
  material: string | null;
  fit: string | null;
  formality: 'Casual' | 'Smart Casual' | 'Business Casual' | 'Formal' | 'Sporty';
  styles: string[];
  seasons: string[];
  occasions: string[];
  visual_description: string;
  confidence: number;
  uncertain_fields: string[];
  /** Which provider produced this result */
  provider: ProviderName;
  /** Whether this was a real AI call or a fallback */
  isAiGenerated: boolean;
}

export interface OutfitExplanationInput {
  outfit: {
    title: string;
    items: Array<{
      id: string;
      name: string;
      category: string;
      color: string;
      formality: string;
    }>;
    score: number;
  };
  occasion?: string;
  weather?: string;
  styleProfile?: {
    skinUndertone?: string;
    hairColor?: string;
    faceShape?: string;
    height?: number;
    buildTags?: string[];
    tasteTags?: string[];
  };
}

export interface OutfitExplanation {
  styling_reason: string;
  styling_tips: string[];
  weather_notes: string;
  why_chips: string[];
  provider: ProviderName;
  isAiGenerated: boolean;
}

// ---------------------------------------------------------------------------
// Provider capability registry
// ---------------------------------------------------------------------------

export type ProviderName = 'gemini' | 'groq' | 'ollama' | 'rule-based';

export interface ProviderCapabilities {
  name: ProviderName;
  /** Accepts image input for clothing analysis */
  supportsVision: boolean;
  /** Can reason about outfits in text */
  supportsTextReasoning: boolean;
  /** Provider is configured (has required env vars or URL) */
  isConfigured: boolean;
  /** Human-readable model identifier */
  modelId: string;
  /** Human-readable label for UI */
  displayName: string;
}

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

export interface AIProvider {
  readonly capabilities: ProviderCapabilities;

  /**
   * Analyse a clothing image and return structured metadata.
   * Only valid if capabilities.supportsVision === true.
   * Throws ProviderError if quota exceeded or unavailable.
   */
  analyseClothing(input: ClothingImageInput): Promise<ClothingAnalysis>;

  /**
   * Generate a human-readable outfit explanation.
   * Valid for both vision and text-only providers.
   * Throws ProviderError if quota exceeded or unavailable.
   */
  explainOutfit(input: OutfitExplanationInput): Promise<OutfitExplanation>;
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export type ProviderErrorCode =
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'VISION_NOT_SUPPORTED'
  | 'CONFIGURATION_MISSING'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR';

export class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
    public readonly provider: ProviderName,
    public readonly retryAfterMs?: number
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

// ---------------------------------------------------------------------------
// Usage budget types (application-level, provider-agnostic)
// ---------------------------------------------------------------------------

export interface UsageBudget {
  userId: string;
  dateKey: string; // YYYY-MM-DD
  requestsUsed: number;
  requestsLimit: number;
  lastError?: string;
  lastErrorAt?: string;
}
