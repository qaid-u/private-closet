import { describe, it, expect } from 'vitest';
import { SAMPLE_CLOTHING_ITEMS, SAMPLE_STYLE_PROFILE } from '../src/data/seedData';
import {
  generateRecommendations,
  rankAlternatives,
  learnFromFeedback,
  DEFAULT_PREFERENCES,
  RecommendationContext,
} from '../src/engine';
import { ClothingItem } from '../src/data/types';

describe('Pure Recommendation Engine', () => {
  const baseContext: RecommendationContext = {
    tempC: 18,
    condition: 'rain',
    occasion: 'casual',
    mood: 'cozy',
  };

  it('generates 3 diverse outfits for the sample wardrobe', () => {
    const result = generateRecommendations(
      SAMPLE_CLOTHING_ITEMS,
      baseContext,
      SAMPLE_STYLE_PROFILE,
      DEFAULT_PREFERENCES
    );

    expect(result.outfits.length).toBeGreaterThanOrEqual(1);
    expect(result.outfits[0].items.length).toBeGreaterThanOrEqual(2);
    expect(['High', 'Medium', 'Low']).toContain(result.outfits[0].matchLabel);
    expect(result.outfits[0].chips.length).toBeGreaterThan(0);
  });

  it('produces deterministic output for identical inputs', () => {
    const res1 = generateRecommendations(
      SAMPLE_CLOTHING_ITEMS,
      baseContext,
      SAMPLE_STYLE_PROFILE,
      DEFAULT_PREFERENCES
    );
    const res2 = generateRecommendations(
      SAMPLE_CLOTHING_ITEMS,
      baseContext,
      SAMPLE_STYLE_PROFILE,
      DEFAULT_PREFERENCES
    );

    expect(res1.outfits[0].id).toBe(res2.outfits[0].id);
    expect(res1.outfits[0].totalScore).toBe(res2.outfits[0].totalScore);
  });

  it('excludes dirty items and items marked in avoid list', () => {
    const dirtyItems: ClothingItem[] = SAMPLE_CLOTHING_ITEMS.map((item) =>
      item.id === 'sample-cream-sweater' ? { ...item, status: 'dirty' } : item
    );

    const result = generateRecommendations(
      dirtyItems,
      baseContext,
      SAMPLE_STYLE_PROFILE,
      DEFAULT_PREFERENCES
    );

    for (const outfit of result.outfits) {
      expect(outfit.items.some((i) => i.id === 'sample-cream-sweater')).toBe(false);
    }
  });

  it('honors comfort rules from StyleProfile', () => {
    const profileWithRule = {
      ...SAMPLE_STYLE_PROFILE,
      comfortRules: [
        { id: 'cr-1', label: 'Avoid wool fabrics', kind: 'custom' as const },
      ],
    };

    const itemsWithWool: ClothingItem[] = SAMPLE_CLOTHING_ITEMS.map((item) =>
      item.id === 'sample-navy-shirt' ? { ...item, material: '100% Wool' } : item
    );

    const result = generateRecommendations(
      itemsWithWool,
      baseContext,
      profileWithRule,
      DEFAULT_PREFERENCES
    );

    for (const outfit of result.outfits) {
      expect(outfit.items.some((i) => i.id === 'sample-navy-shirt')).toBe(false);
    }
  });

  it('renormalizes weights and generates no profile chips when StyleProfile is empty', () => {
    const result = generateRecommendations(
      SAMPLE_CLOTHING_ITEMS,
      baseContext,
      null, // No profile
      DEFAULT_PREFERENCES
    );

    expect(result.outfits.length).toBeGreaterThan(0);
    const topOutfit = result.outfits[0];
    expect(topOutfit.factors.color.hasInput).toBe(false);
    expect(topOutfit.factors.proportion.hasInput).toBe(false);
    // Chips should only come from weather, occasion, or freshness
    for (const chip of topOutfit.chips) {
      expect(chip.toLowerCase()).not.toContain('your warm undertone');
      expect(chip.toLowerCase()).not.toContain('longer torso');
    }
  });

  it('ranks swap alternatives for a slot correctly', () => {
    const result = generateRecommendations(
      SAMPLE_CLOTHING_ITEMS,
      baseContext,
      SAMPLE_STYLE_PROFILE,
      DEFAULT_PREFERENCES
    );
    const outfit = result.outfits[0];

    const alternatives = rankAlternatives(
      outfit,
      'top',
      SAMPLE_CLOTHING_ITEMS,
      baseContext,
      SAMPLE_STYLE_PROFILE,
      DEFAULT_PREFERENCES
    );

    expect(Array.isArray(alternatives)).toBe(true);
    if (alternatives.length > 0) {
      expect(alternatives[0].rank).toBe(1);
      expect(alternatives[0].item.category).toBe('top');
      expect(alternatives[0].item.id).not.toBe(outfit.slots.top?.id);
    }
  });

  it('learns from user feedback and adjusts preferences', () => {
    const result = generateRecommendations(
      SAMPLE_CLOTHING_ITEMS,
      baseContext,
      SAMPLE_STYLE_PROFILE,
      DEFAULT_PREFERENCES
    );
    const outfit = result.outfits[0];

    const updated = learnFromFeedback(
      DEFAULT_PREFERENCES,
      outfit,
      'not-me',
      ['Wrong colors', 'Too formal']
    );

    expect(updated.formalityBias).toBeLessThan(0);
    expect(updated.itemAffinity[outfit.items[0].id]).toBeLessThan(0);
  });
});
