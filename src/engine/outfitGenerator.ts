import { ClothingItem, StyleProfile, Preferences, WearLog } from '../data/types';
import {
  RecommendationContext,
  ScoredOutfit,
  RecommendationResult,
  SwapAlternative,
  FactorBreakdown,
} from './types';
import { scoreColorFit } from './colorScience';
import { scoreProportionFit } from './proportionEngine';
import { scoreFaceHairFit } from './faceHairEngine';
import { scoreWeatherOccasionFit } from './weatherOccasionEngine';
import { scoreTasteFit, scoreFreshnessFit } from './tasteFreshnessEngine';

const DEFAULT_WEIGHTS = {
  color: 0.22,
  proportion: 0.18,
  faceHair: 0.06,
  weatherOccasion: 0.24,
  taste: 0.20,
  freshness: 0.10,
};

/**
 * Filter items by hard eligibility rules.
 */
export function getEligibleItems(
  items: ClothingItem[],
  context: RecommendationContext,
  profile?: StyleProfile | null
): ClothingItem[] {
  const mustIncludeSet = new Set(context.mustInclude || []);
  const avoidList = (context.avoid || []).map((a) => a.toLowerCase());
  const comfortRules = profile?.comfortRules || [];

  return items.filter((item) => {
    // 1. Must be clean (unless specifically requested in mustInclude)
    if (item.status !== 'clean' && !mustIncludeSet.has(item.id)) {
      return false;
    }

    // 2. Avoid list
    if (context.avoid?.includes(item.id)) return false;
    for (const avoidTerm of avoidList) {
      if (item.category === avoidTerm || item.subtype === avoidTerm || item.styleTags.includes(avoidTerm)) {
        return false;
      }
    }

    // 3. Comfort rules
    for (const cr of comfortRules) {
      const lower = cr.label.toLowerCase();
      if (lower.includes('no skinny') && item.fit === 'fitted' && item.category === 'bottom') {
        return false;
      }
      if (lower.includes('avoid wool') && item.material?.toLowerCase().includes('wool')) {
        return false;
      }
      if (lower.includes('no high neckline') && item.neckline === 'high') {
        return false;
      }
      if (lower.includes('sleeveless') && item.subtype === 'tank') {
        return false;
      }
    }

    return true;
  });
}

/**
 * Score a single outfit candidate across all 6 factors.
 */
export function scoreCandidate(
  items: ClothingItem[],
  slots: ScoredOutfit['slots'],
  context: RecommendationContext,
  profile?: StyleProfile | null,
  preferences?: Preferences | null,
  wearLogs?: WearLog[]
): ScoredOutfit {
  const colorFactor = scoreColorFit(items, profile);
  const proportionFactor = scoreProportionFit(items, profile);
  const faceHairFactor = scoreFaceHairFit(items, profile);
  const weatherOccasionFactor = scoreWeatherOccasionFit(items, context);
  const tasteFactor = scoreTasteFit(items, profile, preferences);
  const freshnessFactor = scoreFreshnessFit(items, wearLogs);

  const factorMap: Record<keyof typeof DEFAULT_WEIGHTS, FactorBreakdown> = {
    color: colorFactor,
    proportion: proportionFactor,
    faceHair: faceHairFactor,
    weatherOccasion: weatherOccasionFactor,
    taste: tasteFactor,
    freshness: freshnessFactor,
  };

  // Dynamic weight renormalization
  const userWeights = preferences?.weights || {};
  let totalActiveWeight = 0;
  for (const [key, factor] of Object.entries(factorMap)) {
    const k = key as keyof typeof DEFAULT_WEIGHTS;
    if (factor.hasInput) {
      totalActiveWeight += userWeights[k] ?? DEFAULT_WEIGHTS[k];
    }
  }

  let totalScore = 0;
  for (const [key, factor] of Object.entries(factorMap)) {
    const k = key as keyof typeof DEFAULT_WEIGHTS;
    if (factor.hasInput && totalActiveWeight > 0) {
      const baseWeight = userWeights[k] ?? DEFAULT_WEIGHTS[k];
      const normalizedWeight = baseWeight / totalActiveWeight;
      totalScore += factor.score * normalizedWeight;
    }
  }

  // Label threshold per SPEC: High >= 0.75, Medium 0.55 .. 0.75, Low < 0.55
  let matchLabel: 'High' | 'Medium' | 'Low' = 'Low';
  if (totalScore >= 0.75) matchLabel = 'High';
  else if (totalScore >= 0.55) matchLabel = 'Medium';

  // Generate 2-3 "Why it suits you" chips from highest scoring factors with real inputs
  const eligibleChips: { weight: number; reason: string }[] = [];
  if (colorFactor.hasInput) eligibleChips.push({ weight: colorFactor.score, reason: colorFactor.reason });
  if (proportionFactor.hasInput) eligibleChips.push({ weight: proportionFactor.score, reason: proportionFactor.reason });
  if (faceHairFactor.hasInput) eligibleChips.push({ weight: faceHairFactor.score, reason: faceHairFactor.reason });
  if (weatherOccasionFactor.hasInput) eligibleChips.push({ weight: weatherOccasionFactor.score, reason: weatherOccasionFactor.reason });
  if (tasteFactor.hasInput) eligibleChips.push({ weight: tasteFactor.score, reason: tasteFactor.reason });
  if (freshnessFactor.hasInput) eligibleChips.push({ weight: freshnessFactor.score, reason: freshnessFactor.reason });

  eligibleChips.sort((a, b) => b.weight - a.weight);
  const chips = eligibleChips.slice(0, 3).map((c) => c.reason);

  // Generate descriptive title
  const top = slots.top || slots.dress;
  const bottom = slots.bottom;
  const outerwear = slots.outerwear;

  let title = 'Smart Casual Set';
  if (context.mood === 'cozy') title = 'Relaxed Cozy Layers';
  else if (context.mood === 'polished') title = 'Tailored Modern Set';
  else if (context.mood === 'minimal') title = 'Clean Minimalist Duo';
  else if (context.mood === 'bold') title = 'Expressive Contrast Pairing';
  else if (outerwear && top) title = `${outerwear.name} with ${top.name}`;
  else if (top && bottom) title = `${top.name} & ${bottom.name}`;

  const signature = items.map((i) => i.id).sort().join('+');
  const id = `outfit-${signature}`;

  return {
    id,
    signature,
    items,
    slots,
    totalScore: Math.round(totalScore * 100) / 100,
    matchLabel,
    chips,
    title,
    factors: {
      color: colorFactor,
      proportion: proportionFactor,
      faceHair: faceHairFactor,
      weatherOccasion: weatherOccasionFactor,
      taste: tasteFactor,
      freshness: freshnessFactor,
    },
  };
}

/**
 * Generates 3 top diverse outfit recommendations from available closet items.
 */
export function generateRecommendations(
  allItems: ClothingItem[],
  context: RecommendationContext,
  profile?: StyleProfile | null,
  preferences?: Preferences | null,
  wearLogs?: WearLog[]
): RecommendationResult {
  const eligibleItems = getEligibleItems(allItems, context, profile);

  const tops = eligibleItems.filter((i) => i.category === 'top');
  const bottoms = eligibleItems.filter((i) => i.category === 'bottom');
  const dresses = eligibleItems.filter((i) => i.category === 'dress');
  const outerwears = eligibleItems.filter((i) => i.category === 'outerwear');
  const shoes = eligibleItems.filter((i) => i.category === 'shoes');

  const mustIncludeIds = context.mustInclude || [];
  const needsOuterwear = context.tempC <= 14 || context.condition === 'rain';

  const candidates: ScoredOutfit[] = [];

  // Generate 2-piece (top + bottom) combos
  for (const t of tops) {
    for (const b of bottoms) {
      // Pick matching shoes
      const shoeChoices = shoes.length > 0 ? shoes.slice(0, 3) : [undefined];
      for (const s of shoeChoices) {
        // Outerwear options
        const outerChoices = needsOuterwear
          ? outerwears.length > 0 ? outerwears.slice(0, 3) : [undefined]
          : [undefined, ...outerwears.slice(0, 2)];

        for (const o of outerChoices) {
          const itemsInOutfit: ClothingItem[] = [t, b];
          if (s) itemsInOutfit.push(s);
          if (o) itemsInOutfit.push(o);

          // Check mustInclude
          if (mustIncludeIds.length > 0) {
            const hasAllMustInclude = mustIncludeIds.every((id) =>
              itemsInOutfit.some((item) => item.id === id)
            );
            if (!hasAllMustInclude) continue;
          }

          const scored = scoreCandidate(
            itemsInOutfit,
            { top: t, bottom: b, shoes: s, outerwear: o },
            context,
            profile,
            preferences,
            wearLogs
          );
          candidates.push(scored);

          if (candidates.length >= 500) break;
        }
        if (candidates.length >= 500) break;
      }
      if (candidates.length >= 500) break;
    }
    if (candidates.length >= 500) break;
  }

  // Generate dress combos
  for (const d of dresses) {
    const shoeChoices = shoes.length > 0 ? shoes.slice(0, 3) : [undefined];
    for (const s of shoeChoices) {
      const outerChoices = needsOuterwear
        ? outerwears.length > 0 ? outerwears.slice(0, 3) : [undefined]
        : [undefined, ...outerwears.slice(0, 2)];

      for (const o of outerChoices) {
        const itemsInOutfit: ClothingItem[] = [d];
        if (s) itemsInOutfit.push(s);
        if (o) itemsInOutfit.push(o);

        if (mustIncludeIds.length > 0) {
          const hasAllMustInclude = mustIncludeIds.every((id) =>
            itemsInOutfit.some((item) => item.id === id)
          );
          if (!hasAllMustInclude) continue;
        }

        const scored = scoreCandidate(
          itemsInOutfit,
          { dress: d, shoes: s, outerwear: o },
          context,
          profile,
          preferences,
          wearLogs
        );
        candidates.push(scored);
      }
    }
  }

  // Sort descending by totalScore
  candidates.sort((a, b) => b.totalScore - a.totalScore);

  // Diversity selection (MMR): pick top 3 where each differs by at least 2 items
  const selected: ScoredOutfit[] = [];
  for (const cand of candidates) {
    if (selected.length === 0) {
      selected.push(cand);
    } else {
      const isDiverse = selected.every((prev) => {
        const candIds = new Set(cand.items.map((i) => i.id));
        let common = 0;
        for (const item of prev.items) {
          if (candIds.has(item.id)) common++;
        }
        // At least 2 items different or total items <= 2
        return prev.items.length - common >= 2 || common <= 1;
      });

      if (isDiverse) {
        selected.push(cand);
      }
    }

    if (selected.length >= 3) break;
  }

  // If diversity was too strict and gave < 3 picks, backfill with next best
  if (selected.length < 3) {
    for (const cand of candidates) {
      if (!selected.some((s) => s.id === cand.id)) {
        selected.push(cand);
      }
      if (selected.length >= 3) break;
    }
  }

  const lowConfidence =
    selected.length < 3 ||
    selected.every((s) => s.matchLabel === 'Low') ||
    eligibleItems.length < 6;

  return {
    outfits: selected,
    lowConfidence,
    totalEligibleItems: eligibleItems.length,
    context,
  };
}

/**
 * Rank swap alternatives for an item in a specific slot.
 */
export function rankAlternatives(
  currentOutfit: ScoredOutfit,
  slot: keyof ScoredOutfit['slots'],
  allItems: ClothingItem[],
  context: RecommendationContext,
  profile?: StyleProfile | null,
  preferences?: Preferences | null,
  wearLogs?: WearLog[]
): SwapAlternative[] {
  const eligibleItems = getEligibleItems(allItems, context, profile);
  const currentSlotItem = currentOutfit.slots[slot];

  // Candidates for this slot
  const slotCandidates = eligibleItems.filter((item) => {
    if (currentSlotItem && item.id === currentSlotItem.id) return false;
    if (slot === 'top') return item.category === 'top';
    if (slot === 'bottom') return item.category === 'bottom';
    if (slot === 'dress') return item.category === 'dress';
    if (slot === 'outerwear') return item.category === 'outerwear';
    if (slot === 'shoes') return item.category === 'shoes';
    if (slot === 'accessory') return item.category === 'accessory';
    return false;
  });

  const ranked: SwapAlternative[] = [];

  for (const altItem of slotCandidates) {
    // New slot map
    const newSlots = { ...currentOutfit.slots, [slot]: altItem };
    const newItems = Object.values(newSlots).filter((i): i is ClothingItem => Boolean(i));

    const rescored = scoreCandidate(
      newItems,
      newSlots,
      context,
      profile,
      preferences,
      wearLogs
    );

    let reason = 'Harmonious swap for this outfit.';
    if (rescored.factors.color.score > currentOutfit.factors.color.score) {
      reason = rescored.factors.color.reason;
    } else if (rescored.factors.proportion.score > currentOutfit.factors.proportion.score) {
      reason = rescored.factors.proportion.reason;
    } else if (rescored.factors.weatherOccasion.score > currentOutfit.factors.weatherOccasion.score) {
      reason = rescored.factors.weatherOccasion.reason;
    }

    ranked.push({
      item: altItem,
      rank: 0,
      score: rescored.totalScore,
      matchLabel: rescored.matchLabel,
      reason,
    });
  }

  // Sort descending by score
  ranked.sort((a, b) => b.score - a.score);
  ranked.forEach((alt, idx) => {
    alt.rank = idx + 1;
  });

  return ranked;
}
