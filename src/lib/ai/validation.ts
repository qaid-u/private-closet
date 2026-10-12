import { z } from 'zod';

// ---------------------------------------------------------------------------
// Garment analysis (used by Gemini, Ollama, and rule-based providers)
// ---------------------------------------------------------------------------

export const GarmentAnalysisSchema = z.object({
  category: z.enum(['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'One-Piece', 'Accessories']),
  subcategory: z.string().default('General'),
  suggested_name: z.string().min(2),
  primary_color: z.string(),
  secondary_colors: z.array(z.string()).default([]),
  pattern: z.string().default('Solid'),
  material: z.string().nullable().default(null),
  fit: z.string().nullable().default(null),
  formality: z.enum(['Casual', 'Smart Casual', 'Business Casual', 'Formal', 'Sporty']).default('Smart Casual'),
  styles: z.array(z.string()).default(['Minimalist', 'Smart Casual']),
  seasons: z.array(z.string()).default(['All Season']),
  occasions: z.array(z.string()).default(['Everyday']),
  visual_description: z.string(),
  confidence: z.number().min(0).max(1).default(0.9),
  uncertain_fields: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------------
// Outfit explanation — returned by all providers including text-only (Groq)
// ---------------------------------------------------------------------------

export const OutfitExplanationAISchema = z.object({
  styling_reason: z.string().min(10),
  styling_tips: z.array(z.string()).min(1).max(5),
  weather_notes: z.string().min(5),
  why_chips: z.array(z.string()).min(1).max(5),
});

// ---------------------------------------------------------------------------
// Full outfit recommendation set — used by stylistService generate endpoint
// ---------------------------------------------------------------------------

export const OutfitRecommendationSchema = z.object({
  outfits: z.array(
    z.object({
      title: z.string(),
      item_ids: z.array(z.string()).min(2),
      occasion: z.string(),
      style_tags: z.array(z.string()),
      overall_score: z.number().min(0).max(100),
      score_breakdown: z.object({
        colour: z.number().min(0).max(100),
        style: z.number().min(0).max(100),
        occasion: z.number().min(0).max(100),
        preference: z.number().min(0).max(100),
        weather: z.number().min(0).max(100),
        formality: z.number().min(0).max(100),
        freshness: z.number().min(0).max(100),
      }),
      styling_reason: z.string(),
      styling_tips: z.array(z.string()),
      weather_notes: z.string(),
    })
  ),
});

export type ValidatedGarmentAnalysis = z.infer<typeof GarmentAnalysisSchema>;
export type ValidatedOutfitRecommendations = z.infer<typeof OutfitRecommendationSchema>;
export type ValidatedOutfitExplanation = z.infer<typeof OutfitExplanationAISchema>;
