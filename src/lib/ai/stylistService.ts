/**
 * Stylist Service — Outfit Recommendation Generation
 *
 * Generates outfits deterministically using the CompatibilityEngine,
 * then optionally enriches them with AI explanations via the provider router.
 *
 * Architecture:
 *   1. Filter eligible items from the user's real wardrobe (no AI)
 *   2. Build candidate combinations (no AI)
 *   3. Score and rank candidates (no AI)
 *   4. Generate rule-based natural language for the top outfits (no AI)
 *   5. Optionally enhance explanations via AI provider (Gemini / Groq / Ollama)
 *      – only when "enhance" flag is set, AI is configured, and budget allows
 *
 * Result: routine outfit generation requires zero AI calls.
 */

import { WardrobeItem } from '@/types/wardrobe';
import { StylistRequest, RecommendedOutfit } from '@/types/stylist';
import { CompatibilityEngine } from '@/services/compatibilityEngine';
import { routeOutfitExplanation } from './providers/router';
import { OutfitExplanationInput } from './providers/types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GenerateOptions {
  /**
   * When true, attempts to enrich the top outfit explanations via AI.
   * When false (default), generates purely rule-based explanations instantly.
   */
  enhanceWithAi?: boolean;
  userId?: string;
  styleProfile?: OutfitExplanationInput['styleProfile'];
}

export async function generateOutfitRecommendations(
  wardrobe: WardrobeItem[],
  request: StylistRequest,
  options: GenerateOptions = {}
): Promise<RecommendedOutfit[]> {
  const { enhanceWithAi = false, userId = 'anonymous', styleProfile } = options;

  // Step 1 & 2: Filter and build candidates — pure TypeScript, no AI
  const eligibleItems = CompatibilityEngine.filterEligibleItems(wardrobe, request);
  if (eligibleItems.length < 2) return [];

  const candidates = CompatibilityEngine.buildCandidates(eligibleItems, request);
  if (candidates.length === 0) return [];

  // Step 3: Score and rank
  const scoredCandidates = candidates
    .map((combo) => {
      const { overall, breakdown } = CompatibilityEngine.scoreOutfit(combo, request);
      return { combo, overall, breakdown };
    })
    .sort((a, b) => b.overall - a.overall);

  const targetQuantity = Math.min(request.quantity ?? 3, scoredCandidates.length);
  const topCandidates = scoredCandidates.slice(0, targetQuantity);

  // Step 4: Generate base rule-based outfits
  const baseOutfits: RecommendedOutfit[] = topCandidates.map((c, idx) => {
    const { title, reason, tips, weather } = CompatibilityEngine.generateReasoning(
      c.combo,
      request.occasion ?? 'Everyday',
      c.overall
    );

    return {
      id: `outfit-${Date.now()}-${idx}`,
      title,
      item_ids: c.combo.map((i) => i.id),
      items: c.combo,
      occasion: request.occasion ?? 'Everyday',
      style_tags: Array.from(new Set(c.combo.flatMap((i) => i.style_tags))).slice(0, 3),
      overall_score: c.overall,
      score_breakdown: c.breakdown,
      styling_reason: reason,
      styling_tips: tips,
      weather_notes: weather,
      why_chips: [],
      ai_enhanced: false,
      provider_used: 'rule-based',
      created_at: new Date().toISOString(),
    };
  });

  if (!enhanceWithAi) {
    return baseOutfits;
  }

  // Step 5: Optionally enhance with AI explanations
  // Only the top outfit gets AI enhancement by default to minimise quota use.
  const enhanced = await Promise.allSettled(
    baseOutfits.map(async (outfit) => {
      const input: OutfitExplanationInput = {
        outfit: {
          title: outfit.title,
          items: outfit.items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            color: i.primary_color,
            formality: i.formality ?? 'Smart Casual',
          })),
          score: outfit.overall_score,
        },
        occasion: outfit.occasion,
        weather: request.weather,
        styleProfile,
      };

      const result = await routeOutfitExplanation(input, userId);

      return {
        ...outfit,
        styling_reason: result.data.styling_reason,
        styling_tips: result.data.styling_tips,
        weather_notes: result.data.weather_notes,
        why_chips: result.data.why_chips,
        ai_enhanced: result.isAiGenerated,
        provider_used: result.providerUsed,
      } satisfies RecommendedOutfit;
    })
  );

  return enhanced.map((r, i) =>
    r.status === 'fulfilled' ? r.value : baseOutfits[i]
  );
}
