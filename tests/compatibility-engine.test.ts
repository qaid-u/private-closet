import { describe, it, expect } from 'vitest';
import { CompatibilityEngine } from '../src/services/compatibilityEngine';
import { WardrobeItem } from '../src/types/wardrobe';
import { StylistRequest } from '../src/types/stylist';
import { GarmentAnalysisSchema, OutfitRecommendationSchema } from '../src/lib/ai/validation';

describe('CompatibilityEngine & Styling Logic Tests', () => {
  const sampleItems: WardrobeItem[] = [
    {
      id: 'top-1',
      name: 'White Oxford Shirt',
      category: 'Tops',
      primary_color: 'White',
      secondary_colors: [],
      availability_status: 'Available',
      status: 'Active',
      style_tags: ['Classic', 'Smart Casual'],
      occasion_tags: ['Dinner', 'Office'],
      season_tags: ['All Season'],
      wear_count: 5,
      is_favourite: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'top-dirty',
      name: 'Dirty Shirt',
      category: 'Tops',
      primary_color: 'Blue',
      secondary_colors: [],
      availability_status: 'In Laundry',
      status: 'Active',
      style_tags: ['Casual'],
      occasion_tags: ['Everyday'],
      season_tags: ['Summer'],
      wear_count: 2,
      is_favourite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bottom-1',
      name: 'Beige Chinos',
      category: 'Bottoms',
      primary_color: 'Beige',
      secondary_colors: [],
      availability_status: 'Available',
      status: 'Active',
      style_tags: ['Classic', 'Smart Casual'],
      occasion_tags: ['Dinner', 'Office'],
      season_tags: ['All Season'],
      wear_count: 3,
      is_favourite: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'shoe-1',
      name: 'Brown Leather Loafers',
      category: 'Footwear',
      primary_color: 'Brown',
      secondary_colors: [],
      availability_status: 'Available',
      status: 'Active',
      style_tags: ['Classic', 'Old Money'],
      occasion_tags: ['Dinner'],
      season_tags: ['All Season'],
      wear_count: 4,
      is_favourite: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'outer-1',
      name: 'Navy Blazer',
      category: 'Outerwear',
      primary_color: 'Navy',
      secondary_colors: [],
      availability_status: 'Available',
      status: 'Active',
      style_tags: ['Classic', 'Formal'],
      occasion_tags: ['Dinner', 'Office'],
      season_tags: ['Autumn', 'Winter'],
      wear_count: 1,
      is_favourite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it('filters out unavailable items (e.g. In Laundry) from candidate generation', () => {
    const request: StylistRequest = { occasion: 'Dinner' };
    const eligible = CompatibilityEngine.filterEligibleItems(sampleItems, request);
    expect(eligible.some((i) => i.id === 'top-dirty')).toBe(false);
    expect(eligible.some((i) => i.id === 'top-1')).toBe(true);
  });

  it('strictly respects excluded item constraints', () => {
    const request: StylistRequest = {
      occasion: 'Dinner',
      excluded_item_ids: ['top-1'],
    };
    const eligible = CompatibilityEngine.filterEligibleItems(sampleItems, request);
    expect(eligible.some((i) => i.id === 'top-1')).toBe(false);
  });

  it('accurately scores colour harmony and style consistency across 7 dimensions', () => {
    const combo = [sampleItems[0], sampleItems[2], sampleItems[3]]; // White shirt, Beige chinos, Brown loafers
    const request: StylistRequest = { occasion: 'Dinner' };
    const { overall, breakdown } = CompatibilityEngine.scoreOutfit(combo, request);

    expect(overall).toBeGreaterThanOrEqual(70);
    expect(breakdown.colour).toBeGreaterThanOrEqual(80);
    expect(breakdown.occasion).toBeGreaterThanOrEqual(80);
    expect(breakdown.preference).toBeGreaterThanOrEqual(80);
  });

  it('builds candidates and honors pinned item requirements', () => {
    const eligible = CompatibilityEngine.filterEligibleItems(sampleItems, {});
    const request: StylistRequest = {
      pinned_item_ids: ['outer-1'],
    };
    const candidates = CompatibilityEngine.buildCandidates(eligible, request);
    expect(candidates.length).toBeGreaterThan(0);
    for (const c of candidates) {
      expect(c.some((i) => i.id === 'outer-1')).toBe(true);
    }
  });

  it('validates garment analysis JSON conforming to Zod schema', () => {
    const validJson = {
      category: 'Tops',
      subcategory: 'Oxford Shirt',
      suggested_name: 'White Oxford Button-Down Shirt',
      primary_color: 'White',
      secondary_colors: [],
      pattern: 'Solid',
      material: 'Cotton',
      fit: 'Regular',
      formality: 'Smart Casual',
      styles: ['Minimalist', 'Classic'],
      seasons: ['Spring', 'Summer'],
      occasions: ['Office', 'Dinner'],
      visual_description: 'White collared button-down shirt',
      confidence: 0.95,
      uncertain_fields: [],
    };

    const parsed = GarmentAnalysisSchema.safeParse(validJson);
    expect(parsed.success).toBe(true);
  });

  it('validates outfit recommendations schema conforming to Zod schema', () => {
    const validRecommendations = {
      outfits: [
        {
          title: 'Modern Neutral Smart Casual',
          item_ids: ['top-1', 'bottom-1', 'shoe-1'],
          occasion: 'Dinner',
          style_tags: ['Minimalist', 'Smart Casual'],
          overall_score: 94,
          score_breakdown: {
            colour: 95,
            style: 92,
            occasion: 96,
            preference: 90,
            weather: 90,
            formality: 92,
            freshness: 85,
          },
          styling_reason: 'Balanced neutral contrast.',
          styling_tips: ['Tuck in the shirt.'],
          weather_notes: 'Warm weather ready.',
        },
      ],
    };

    const parsed = OutfitRecommendationSchema.safeParse(validRecommendations);
    expect(parsed.success).toBe(true);
  });
});
