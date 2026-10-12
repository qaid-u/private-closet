/**
 * Rule-Based Provider (Zero-Cost Fallback)
 *
 * Fully deterministic, zero-external-call provider.
 * Used when:
 *   - No AI provider is configured
 *   - All providers have hit their quotas
 *   - AI_ENABLE_RULE_BASED_FALLBACK=true (default)
 *   - User selects "Rule-Based Only" mode
 *
 * Clothing analysis uses heuristic keyword matching + SPEC sample data defaults.
 * Outfit explanations use template-based natural language generation tied
 * to the real score breakdown, occasion, and style profile data.
 */

import {
  AIProvider,
  ClothingImageInput,
  ClothingAnalysis,
  OutfitExplanationInput,
  OutfitExplanation,
  ProviderCapabilities,
} from './types';

// ---------------------------------------------------------------------------
// Heuristic clothing analysis
// ---------------------------------------------------------------------------

type Category = ClothingAnalysis['category'];
type Formality = ClothingAnalysis['formality'];

interface HeuristicMatch {
  category: Category;
  subcategory: string;
  formality: Formality;
  seasons: string[];
  occasions: string[];
  styles: string[];
}

const KEYWORD_MAP: Array<{ patterns: string[]; match: HeuristicMatch }> = [
  {
    patterns: ['pant', 'chino', 'trouser', 'slacks'],
    match: { category: 'Bottoms', subcategory: 'Chinos', formality: 'Smart Casual', seasons: ['Spring', 'Autumn', 'Summer'], occasions: ['Office', 'Everyday', 'Dinner'], styles: ['Classic', 'Smart Casual'] },
  },
  {
    patterns: ['jean', 'denim'],
    match: { category: 'Bottoms', subcategory: 'Jeans', formality: 'Casual', seasons: ['Spring', 'Autumn', 'Winter'], occasions: ['Everyday', 'Weekend'], styles: ['Casual', 'Street'] },
  },
  {
    patterns: ['skirt'],
    match: { category: 'Bottoms', subcategory: 'Skirt', formality: 'Smart Casual', seasons: ['Spring', 'Summer'], occasions: ['Everyday', 'Dinner'], styles: ['Feminine', 'Classic'] },
  },
  {
    patterns: ['dress', 'gown'],
    match: { category: 'One-Piece', subcategory: 'Dress', formality: 'Smart Casual', seasons: ['Spring', 'Summer'], occasions: ['Dinner', 'Date', 'Party'], styles: ['Feminine', 'Elegant'] },
  },
  {
    patterns: ['jumpsuit', 'romper'],
    match: { category: 'One-Piece', subcategory: 'Jumpsuit', formality: 'Smart Casual', seasons: ['Spring', 'Summer'], occasions: ['Party', 'Everyday'], styles: ['Contemporary', 'Bold'] },
  },
  {
    patterns: ['coat', 'overcoat', 'trench'],
    match: { category: 'Outerwear', subcategory: 'Coat', formality: 'Smart Casual', seasons: ['Autumn', 'Winter'], occasions: ['Office', 'Everyday'], styles: ['Classic', 'Sophisticated'] },
  },
  {
    patterns: ['jacket', 'bomber'],
    match: { category: 'Outerwear', subcategory: 'Jacket', formality: 'Casual', seasons: ['Spring', 'Autumn'], occasions: ['Everyday', 'Weekend'], styles: ['Street', 'Casual'] },
  },
  {
    patterns: ['blazer'],
    match: { category: 'Outerwear', subcategory: 'Blazer', formality: 'Business Casual', seasons: ['All Season'], occasions: ['Office', 'Dinner', 'Date'], styles: ['Smart Casual', 'Classic'] },
  },
  {
    patterns: ['sneaker', 'trainer'],
    match: { category: 'Footwear', subcategory: 'Sneakers', formality: 'Casual', seasons: ['All Season'], occasions: ['Everyday', 'Gym', 'Weekend'], styles: ['Street', 'Sporty'] },
  },
  {
    patterns: ['boot', 'ankle boot'],
    match: { category: 'Footwear', subcategory: 'Boots', formality: 'Casual', seasons: ['Autumn', 'Winter'], occasions: ['Everyday', 'Weekend'], styles: ['Classic', 'Casual'] },
  },
  {
    patterns: ['loafer', 'mule', 'flat'],
    match: { category: 'Footwear', subcategory: 'Flats', formality: 'Smart Casual', seasons: ['Spring', 'Summer', 'Autumn'], occasions: ['Office', 'Everyday'], styles: ['Classic', 'Minimal'] },
  },
  {
    patterns: ['heel', 'pump', 'stiletto'],
    match: { category: 'Footwear', subcategory: 'Heels', formality: 'Formal', seasons: ['All Season'], occasions: ['Dinner', 'Party', 'Office'], styles: ['Elegant', 'Classic'] },
  },
  {
    patterns: ['watch', 'bracelet', 'necklace', 'earring', 'ring', 'belt', 'bag', 'sunglass', 'scarf', 'hat', 'cap'],
    match: { category: 'Accessories', subcategory: 'Accessories', formality: 'Casual', seasons: ['All Season'], occasions: ['Everyday'], styles: ['Minimal'] },
  },
];

const COLOR_KEYWORDS: Record<string, string> = {
  white: 'White', black: 'Black', navy: 'Navy', grey: 'Grey', gray: 'Grey',
  blue: 'Blue', red: 'Red', green: 'Green', olive: 'Olive', khaki: 'Khaki',
  beige: 'Beige', cream: 'Cream', brown: 'Brown', tan: 'Tan', camel: 'Camel',
  pink: 'Pink', purple: 'Purple', yellow: 'Yellow', orange: 'Orange',
  floral: 'Multi', stripe: 'Multi', check: 'Multi', plaid: 'Multi',
};

const PATTERN_KEYWORDS: Record<string, string> = {
  stripe: 'Striped', check: 'Check', plaid: 'Plaid', floral: 'Floral',
  polka: 'Polka Dot', print: 'Print', solid: 'Solid',
};

function heuristicAnalysis(hintName: string): Partial<HeuristicMatch & { primary_color: string; pattern: string }> {
  const lower = hintName.toLowerCase();

  let match: HeuristicMatch | undefined;
  for (const entry of KEYWORD_MAP) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      match = entry.match;
      break;
    }
  }

  let primary_color = 'Grey';
  for (const [kw, color] of Object.entries(COLOR_KEYWORDS)) {
    if (lower.includes(kw)) { primary_color = color; break; }
  }

  let pattern = 'Solid';
  for (const [kw, pat] of Object.entries(PATTERN_KEYWORDS)) {
    if (lower.includes(kw)) { pattern = pat; break; }
  }

  return { ...match, primary_color, pattern };
}

// ---------------------------------------------------------------------------
// Outfit explanation templates
// ---------------------------------------------------------------------------

const OCCASION_PHRASES: Record<string, string> = {
  Work: 'polished enough for a professional setting',
  Office: 'office-ready without sacrificing comfort',
  Casual: 'relaxed yet put-together for everyday wear',
  Everyday: 'easy to wear throughout the day',
  Date: 'effortlessly stylish for a special occasion',
  Dinner: 'elevated and appropriate for dining out',
  Party: 'fun and eye-catching for a social event',
  Weekend: 'comfortable and casual for a relaxed day',
  Gym: 'practical and performance-ready',
  Travel: 'versatile and comfortable for travel days',
};

const MOOD_TIPS: string[] = [
  'Layer with a light scarf for extra dimension.',
  'Keep accessories minimal for a clean finish.',
  'A structured bag elevates the overall look.',
  'Roll sleeves for a relaxed, approachable feel.',
  'Tuck the top for a more defined silhouette.',
  'Add a watch to complete the smart-casual balance.',
];

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

export class RuleBasedProvider implements AIProvider {
  readonly capabilities: ProviderCapabilities = {
    name: 'rule-based',
    supportsVision: false,
    supportsTextReasoning: true,
    isConfigured: true,
    modelId: 'rule-based-v1',
    displayName: 'Rule-Based Engine (No AI)',
  };

  async analyseClothing(input: ClothingImageInput): Promise<ClothingAnalysis> {
    const hint = input.hintName ?? 'item';
    const h = heuristicAnalysis(hint);

    return {
      category: h.category ?? 'Tops',
      subcategory: h.subcategory ?? 'Shirt',
      suggested_name: input.hintName ?? 'Wardrobe Item',
      primary_color: h.primary_color ?? 'Grey',
      secondary_colors: [],
      pattern: h.pattern ?? 'Solid',
      material: null,
      fit: 'Regular',
      formality: h.formality ?? 'Smart Casual',
      styles: h.styles ?? ['Classic'],
      seasons: h.seasons ?? ['All Season'],
      occasions: h.occasions ?? ['Everyday'],
      visual_description: `A ${(h.primary_color ?? 'neutral').toLowerCase()} ${(h.subcategory ?? 'garment').toLowerCase()} suitable for ${(h.occasions?.[0] ?? 'everyday').toLowerCase()} wear.`,
      confidence: 0.6,
      uncertain_fields: ['category', 'color', 'material'],
      provider: 'rule-based',
      isAiGenerated: false,
    };
  }

  async explainOutfit(input: OutfitExplanationInput): Promise<OutfitExplanation> {
    const occasion = input.occasion ?? 'Everyday';
    const occasionPhrase = OCCASION_PHRASES[occasion] ?? 'versatile for most occasions';
    const categories = input.outfit.items.map((i) => i.category.toLowerCase());
    const colors = [...new Set(input.outfit.items.map((i) => i.color))].slice(0, 2);

    const colorDesc = colors.length > 1
      ? `The ${colors[0]} and ${colors[1]} combination creates a harmonious palette`
      : `The ${colors[0] ?? 'neutral'} palette keeps the look cohesive`;

    const styling_reason = `${colorDesc}, ${occasionPhrase}. ${
      categories.includes('outerwear') ? 'The layer adds dimension and versatility. ' : ''
    }Each piece complements the others for a balanced, complete look.`;

    const styling_tips = MOOD_TIPS.slice(0, 3);

    const weather = input.weather?.toLowerCase() ?? '';
    const weather_notes =
      weather.includes('cold') || weather.includes('winter')
        ? 'Add extra layers or a warm coat if temperatures drop.'
        : weather.includes('rain')
        ? 'Opt for water-resistant outerwear if rain is forecast.'
        : weather.includes('hot') || weather.includes('warm')
        ? 'Choose breathable fabrics and lighter tones to stay comfortable.'
        : 'Suitable for mild, temperate weather conditions.';

    const why_chips: string[] = [];
    if (input.styleProfile?.skinUndertone) {
      why_chips.push(`Complements your ${input.styleProfile.skinUndertone} undertone`);
    }
    if (categories.includes('outerwear')) {
      why_chips.push('Layering adds depth and versatility');
    }
    why_chips.push(`Works well for ${occasion.toLowerCase()} occasions`);
    if (input.styleProfile?.tasteTags?.length) {
      why_chips.push(`Matches your ${input.styleProfile.tasteTags[0]} style`);
    }

    return {
      styling_reason,
      styling_tips,
      weather_notes,
      why_chips: why_chips.slice(0, 4),
      provider: 'rule-based',
      isAiGenerated: false,
    };
  }
}
