import { WardrobeItem } from '@/types/wardrobe';
import { StylistRequest, RecommendedOutfit, ScoreBreakdown } from '@/types/stylist';

// Color harmony matrix for classic fashion theory
const HARMONIOUS_COLOR_PAIRS: Record<string, string[]> = {
  White: ['Black', 'Navy', 'Beige', 'Blue', 'Grey', 'Olive', 'Brown', 'Cream'],
  Black: ['White', 'Grey', 'Beige', 'Olive', 'Blue', 'Cream'],
  Navy: ['White', 'Beige', 'Grey', 'Brown', 'Cream', 'Blue'],
  Beige: ['White', 'Navy', 'Black', 'Brown', 'Olive', 'Blue', 'Grey'],
  Grey: ['White', 'Black', 'Navy', 'Blue', 'Burgundy', 'Beige'],
  Blue: ['White', 'Beige', 'Grey', 'Brown', 'Cream'],
  Olive: ['White', 'Black', 'Beige', 'Cream', 'Brown', 'Grey'],
  Brown: ['White', 'Navy', 'Beige', 'Cream', 'Blue'],
  Cream: ['Navy', 'Brown', 'Olive', 'Black', 'Blue', 'White'],
};

// Formality mapping
const FORMALITY_LEVELS: Record<string, number> = {
  Casual: 1,
  'Smart Casual': 2,
  'Business Casual': 3,
  Formal: 4,
  Sporty: 1,
};

export class CompatibilityEngine {
  /**
   * Filter wardrobe down to eligible candidates based on request constraints
   */
  static filterEligibleItems(items: WardrobeItem[], request: StylistRequest): WardrobeItem[] {
    const excludedSet = new Set(request.excluded_item_ids || []);

    return items.filter((item) => {
      // Must be active and not deleted
      if (item.status !== 'Active') return false;

      // Must be available
      if (item.availability_status !== 'Available') return false;

      // Cannot be explicitly excluded
      if (excludedSet.has(item.id)) return false;

      return true;
    });
  }

  /**
   * Deterministically assemble combination candidates
   */
  static buildCandidates(eligibleItems: WardrobeItem[], request: StylistRequest): WardrobeItem[][] {
    const pinnedSet = new Set(request.pinned_item_ids || []);
    const pinnedItems = eligibleItems.filter((item) => pinnedSet.has(item.id));

    const tops = eligibleItems.filter((i) => i.category === 'Tops');
    const bottoms = eligibleItems.filter((i) => i.category === 'Bottoms');
    const shoes = eligibleItems.filter((i) => i.category === 'Footwear');
    const outer = eligibleItems.filter((i) => i.category === 'Outerwear');
    const accessories = eligibleItems.filter((i) => i.category === 'Accessories');
    const onePieces = eligibleItems.filter((i) => i.category === 'One-Piece');

    const candidates: WardrobeItem[][] = [];

    // Approach A: Two-piece combinations (Top + Bottom + Shoes + optional Outer/Acc)
    for (const t of tops) {
      for (const b of bottoms) {
        for (const s of shoes) {
          const combo: WardrobeItem[] = [t, b, s];

          // Optional outerwear if weather warrants or for variety
          if (outer.length > 0) {
            combo.push(outer[Math.floor(Math.random() * outer.length)]);
          }

          // Optional accessory
          if (accessories.length > 0) {
            combo.push(accessories[Math.floor(Math.random() * accessories.length)]);
          }

          // Check if all pinned items are satisfied
          if (pinnedItems.length > 0) {
            const comboIds = new Set(combo.map((i) => i.id));
            const satisfiesPinned = pinnedItems.every((p) => comboIds.has(p.id));
            if (!satisfiesPinned) {
              // Try to inject pinned items if slot matches
              let valid = true;
              for (const p of pinnedItems) {
                if (!comboIds.has(p.id)) {
                  // Replace same category slot
                  const idx = combo.findIndex((c) => c.category === p.category);
                  if (idx >= 0) {
                    combo[idx] = p;
                  } else {
                    valid = false;
                  }
                }
              }
              if (!valid) continue;
            }
          }

          candidates.push(combo);
          if (candidates.length >= 25) break;
        }
        if (candidates.length >= 25) break;
      }
      if (candidates.length >= 25) break;
    }

    // Approach B: One-piece combinations (Dress/Set + Shoes + optional Outer/Acc)
    for (const op of onePieces) {
      for (const s of shoes) {
        const combo: WardrobeItem[] = [op, s];
        if (outer.length > 0) combo.push(outer[0]);
        if (accessories.length > 0) combo.push(accessories[0]);
        candidates.push(combo);
      }
    }

    return candidates;
  }

  /**
   * Score an outfit combination using the 7-dimension weighted model
   */
  static scoreOutfit(combo: WardrobeItem[], request: StylistRequest): { overall: number; breakdown: ScoreBreakdown } {
    // 1. Colour Harmony (20%)
    let colourScore = 80;
    const colors = combo.map((c) => c.primary_color);
    let pairsChecked = 0;
    let harmoniousPairs = 0;
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        pairsChecked++;
        const c1 = colors[i];
        const c2 = colors[j];
        if (c1 === c2) {
          harmoniousPairs += 0.9; // Monochromatic
        } else if (HARMONIOUS_COLOR_PAIRS[c1]?.includes(c2) || HARMONIOUS_COLOR_PAIRS[c2]?.includes(c1)) {
          harmoniousPairs += 1.0;
        } else {
          harmoniousPairs += 0.5;
        }
      }
    }
    if (pairsChecked > 0) {
      colourScore = Math.min(100, Math.round((harmoniousPairs / pairsChecked) * 100));
    }

    // 2. Style Consistency (20%)
    let styleScore = 85;
    const allStyles = combo.flatMap((i) => i.style_tags);
    if (allStyles.length > 0) {
      const styleCounts: Record<string, number> = {};
      allStyles.forEach((s) => (styleCounts[s] = (styleCounts[s] || 0) + 1));
      const maxOverlap = Math.max(...Object.values(styleCounts));
      styleScore = Math.min(100, 70 + maxOverlap * 10);
    }

    // 3. Occasion Match (20%)
    let occasionScore = 85;
    const targetOccasion = request.occasion || 'Everyday';
    const matchesOccasion = combo.filter((i) =>
      i.occasion_tags.some((o) => o.toLowerCase() === targetOccasion.toLowerCase())
    ).length;
    occasionScore = Math.min(100, 65 + Math.round((matchesOccasion / combo.length) * 35));

    // 4. Personal Preference (15%)
    let preferenceScore = 88;
    const favCount = combo.filter((i) => i.is_favourite).length;
    preferenceScore = Math.min(100, 75 + favCount * 8);

    // 5. Weather Suitability (10%)
    let weatherScore = 88;
    const hasOuter = combo.some((i) => i.category === 'Outerwear');
    if (request.weather === 'Cold' || (request.temperature_celsius && request.temperature_celsius < 18)) {
      weatherScore = hasOuter ? 96 : 70;
    } else if (request.weather === 'Hot' || (request.temperature_celsius && request.temperature_celsius > 28)) {
      weatherScore = hasOuter ? 65 : 95;
    }

    // 6. Formality Balance (10%)
    let formalityScore = 90;
    const formalities = combo.map((i) => FORMALITY_LEVELS[i.formality || 'Smart Casual'] || 2);
    const minF = Math.min(...formalities);
    const maxF = Math.max(...formalities);
    const delta = maxF - minF;
    formalityScore = Math.max(60, 100 - delta * 15);

    // 7. Freshness (5%)
    let freshnessScore = 90;
    const avgWear = combo.reduce((acc, i) => acc + (i.wear_count || 0), 0) / combo.length;
    freshnessScore = Math.max(60, Math.min(100, Math.round(100 - avgWear * 1.5)));

    // Total Weighted Score (100%)
    const overall = Math.round(
      colourScore * 0.2 +
        styleScore * 0.2 +
        occasionScore * 0.2 +
        preferenceScore * 0.15 +
        weatherScore * 0.1 +
        formalityScore * 0.1 +
        freshnessScore * 0.05
    );

    const breakdown: ScoreBreakdown = {
      colour: colourScore,
      style: styleScore,
      occasion: occasionScore,
      preference: preferenceScore,
      weather: weatherScore,
      formality: formalityScore,
      freshness: freshnessScore,
    };

    return { overall, breakdown };
  }

  /**
   * Deterministic styling reason generator
   */
  static generateReasoning(combo: WardrobeItem[], occasion: string, overall: number): {
    title: string;
    reason: string;
    tips: string[];
    weather: string;
  } {
    const top = combo.find((i) => i.category === 'Tops');
    const bottom = combo.find((i) => i.category === 'Bottoms');
    const shoes = combo.find((i) => i.category === 'Footwear');
    const outer = combo.find((i) => i.category === 'Outerwear');

    const title = outer
      ? `Layered ${outer.name} with ${bottom?.name || 'Trousers'}`
      : `${top?.name || 'Top'} & ${bottom?.name || 'Bottom'} Ensemble`;

    const reason = `The combination of ${top?.primary_color || 'neutral'} ${top?.name || 'top'} with ${bottom?.primary_color || 'tailored'} ${bottom?.name || 'bottom'} creates a balanced, proportion-conscious look that is refined for ${occasion}.`;

    const tips = [
      `Keep your silhouette neat: tuck or half-tuck ${top?.name || 'the top'} to highlight your natural waist proportions.`,
      `The ${shoes?.primary_color || 'chosen'} ${shoes?.name || 'footwear'} anchors the tone without overpowering the ensemble.`,
    ];

    if (outer) {
      tips.push(`Wear the ${outer.name} unbuttoned for an effortless layered aesthetic.`);
    }

    const weather = 'Comfortable across moderate indoor and outdoor settings.';

    return { title, reason, tips, weather };
  }
}
