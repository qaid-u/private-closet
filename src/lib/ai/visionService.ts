/**
 * Vision Service — Clothing Image Analysis
 *
 * Server-side entry point for garment analysis.
 * Routes through the AI provider chain (Gemini → Ollama → Rule-Based).
 * Never calls OpenAI or any paid provider by default.
 *
 * Caching strategy:
 *   - Analysis results are keyed by a SHA-256 of the first 4096 chars of the
 *     image data URI (fast, good-enough uniqueness for deduplication).
 *   - In-memory cache only in this module; for production, persist to Supabase.
 */

import { routeClothingAnalysis } from './providers/router';
import { ClothingAnalysis } from './providers/types';

// ---------------------------------------------------------------------------
// In-memory result cache (deduplication within a server process)
// ---------------------------------------------------------------------------

const analysisCache = new Map<string, ClothingAnalysis>();

async function hashImageKey(imageDataUri: string): Promise<string> {
  const sample = imageDataUri.slice(0, 4096);
  // Deterministic hash without crypto module (works in Edge runtime too)
  let hash = 0;
  for (let i = 0; i < sample.length; i++) {
    hash = (Math.imul(31, hash) + sample.charCodeAt(i)) | 0;
  }
  return `img-${Math.abs(hash).toString(36)}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface AnalysisResponse {
  data: ClothingAnalysis;
  providerUsed: string;
  isAiGenerated: boolean;
  fromCache: boolean;
  fallbackReason?: string;
}

export async function analyzeGarmentImage(
  imageDataUri: string,
  hintName?: string,
  userId?: string
): Promise<AnalysisResponse> {
  const cacheKey = await hashImageKey(imageDataUri + (hintName ?? ''));

  // Return cached result if available (avoids duplicate AI calls)
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    return {
      data: cached,
      providerUsed: cached.provider,
      isAiGenerated: cached.isAiGenerated,
      fromCache: true,
    };
  }

  const result = await routeClothingAnalysis(
    { imageDataUri, hintName },
    userId ?? 'anonymous'
  );

  // Cache successful results
  analysisCache.set(cacheKey, result.data);

  return {
    data: result.data,
    providerUsed: result.providerUsed,
    isAiGenerated: result.isAiGenerated,
    fromCache: false,
    fallbackReason: result.fallbackReason,
  };
}

/**
 * Simulate garment analysis using only heuristics (no AI call).
 * Used in demo mode and by the rule-based provider.
 */
export function simulateGarmentAnalysis(
  _imageDataUri: string,
  hintName?: string
): ClothingAnalysis {
  const lower = (hintName ?? '').toLowerCase();

  let category: ClothingAnalysis['category'] = 'Tops';
  let subcategory = 'Shirt';
  let formality: ClothingAnalysis['formality'] = 'Smart Casual';

  if (lower.includes('pant') || lower.includes('chino') || lower.includes('trouser')) {
    category = 'Bottoms'; subcategory = 'Chinos';
  } else if (lower.includes('jean')) {
    category = 'Bottoms'; subcategory = 'Jeans'; formality = 'Casual';
  } else if (lower.includes('dress')) {
    category = 'One-Piece'; subcategory = 'Dress';
  } else if (lower.includes('coat') || lower.includes('jacket') || lower.includes('blazer')) {
    category = 'Outerwear';
    subcategory = lower.includes('blazer') ? 'Blazer' : lower.includes('coat') ? 'Coat' : 'Jacket';
    formality = lower.includes('blazer') ? 'Business Casual' : 'Casual';
  } else if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot')) {
    category = 'Footwear';
    subcategory = lower.includes('sneaker') ? 'Sneakers' : 'Boots';
    formality = lower.includes('sneaker') ? 'Casual' : 'Smart Casual';
  }

  const primary_color =
    lower.includes('black') ? 'Black' :
    lower.includes('white') ? 'White' :
    lower.includes('navy') ? 'Navy' :
    lower.includes('grey') || lower.includes('gray') ? 'Grey' :
    lower.includes('olive') ? 'Olive' :
    lower.includes('cream') ? 'Cream' :
    lower.includes('tan') ? 'Tan' : 'Neutral';

  return {
    category,
    subcategory,
    suggested_name: hintName ?? 'Wardrobe Item',
    primary_color,
    secondary_colors: [],
    pattern: lower.includes('stripe') ? 'Striped' : lower.includes('floral') ? 'Floral' : 'Solid',
    material: null,
    fit: 'Regular',
    formality,
    styles: ['Classic', 'Minimal'],
    seasons: ['All Season'],
    occasions: ['Everyday'],
    visual_description: `A ${primary_color.toLowerCase()} ${subcategory.toLowerCase()} for ${formality.toLowerCase()} occasions.`,
    confidence: 0.7,
    uncertain_fields: ['material', 'pattern'],
    provider: 'rule-based',
    isAiGenerated: false,
  };
}
