import { ClothingItem } from '../data/types';
import { RecommendationContext, FactorBreakdown } from './types';

/**
 * Pure weather, occasion, and mood engine.
 */
export function scoreWeatherOccasionFit(
  items: ClothingItem[],
  context: RecommendationContext
): FactorBreakdown {
  if (items.length === 0) {
    return { score: 0.5, hasInput: true, reason: 'Add items to match today\'s weather.' };
  }

  const { tempC, condition, occasion, mood } = context;
  const reasons: string[] = [];

  // 1. Temperature & Warmth matching
  let totalWarmth = 0;
  for (const item of items) {
    totalWarmth += item.warmth;
  }
  const hasOuterwear = items.some((i) => i.category === 'outerwear');

  let tempScore = 0.8;
  if (tempC <= 10) {
    // Very cold: target warmth >= 4, outerwear essential
    if (hasOuterwear && totalWarmth >= 4) {
      tempScore = 0.95;
      reasons.push(`Substantial layering for chilly ${tempC}°C`);
    } else if (hasOuterwear) {
      tempScore = 0.8;
    } else {
      tempScore = 0.4; // Too cold without jacket
    }
  } else if (tempC <= 18) {
    // Mild / crisp (11-18°C): layering or light jacket is great
    if (hasOuterwear || totalWarmth >= 2) {
      tempScore = 0.95;
      reasons.push(`Light layers for ${tempC}°C`);
    } else {
      tempScore = 0.75;
    }
  } else if (tempC <= 24) {
    // Warm (19-24°C): light clothing, outerwear optional or light
    if (!hasOuterwear || items.find((i) => i.category === 'outerwear')?.warmth === 1) {
      tempScore = 0.95;
      reasons.push(`Breathable pieces for pleasant ${tempC}°C`);
    } else {
      tempScore = 0.6; // Heavy outerwear in warm weather
    }
  } else {
    // Hot (>24°C): light pieces, no heavy jackets
    if (!hasOuterwear && totalWarmth <= 2) {
      tempScore = 0.95;
      reasons.push(`Light, cool fabrics for warm ${tempC}°C`);
    } else {
      tempScore = 0.5;
    }
  }

  // 2. Rain condition
  let rainScore = 0.9;
  if (condition === 'rain') {
    const shoes = items.find((i) => i.category === 'shoes');
    const shoesAreClosed = shoes && (shoes.subtype === 'sneakers' || shoes.subtype === 'boots' || shoes.subtype === 'shoes');
    if (shoesAreClosed) {
      rainScore = 0.95;
      reasons.push('Weather-ready footwear for rain');
    } else {
      rainScore = 0.6;
    }
    if (hasOuterwear) {
      rainScore = Math.min(1.0, rainScore + 0.1);
    }
  }

  // 3. Occasion Formality target
  let targetFormality: [number, number] = [1, 2];
  if (occasion === 'gym') targetFormality = [0, 1];
  else if (occasion === 'casual' || occasion === 'class') targetFormality = [1, 2];
  else if (occasion === 'work') targetFormality = [2, 3];
  else if (occasion === 'date') targetFormality = [2, 3];
  else if (occasion === 'party') targetFormality = [3, 4];
  else if (occasion === 'travel') targetFormality = [1, 2];

  let avgFormality = 0;
  for (const item of items) {
    avgFormality += item.formality;
  }
  avgFormality = items.length > 0 ? avgFormality / items.length : 1;

  let occasionScore = 0.8;
  if (avgFormality >= targetFormality[0] && avgFormality <= targetFormality[1]) {
    occasionScore = 0.95;
    reasons.push(`Clean balance for ${occasion}`);
  } else {
    const dist = Math.min(
      Math.abs(avgFormality - targetFormality[0]),
      Math.abs(avgFormality - targetFormality[1])
    );
    occasionScore = Math.max(0.4, 0.9 - dist * 0.25);
  }

  // 4. Mood alignment
  let moodScore = 0.85;
  if (mood) {
    if (mood === 'cozy' && (items.some((i) => i.subtype === 'knitwear' || i.fit === 'relaxed') || totalWarmth >= 2)) {
      moodScore = 0.95;
      reasons.push('Soft texture suited for a cozy day');
    } else if (mood === 'polished' && (items.some((i) => i.formality >= 2 || i.pattern === 'solid'))) {
      moodScore = 0.95;
      reasons.push('Structured silhouette for a polished aesthetic');
    } else if (mood === 'minimal' && items.every((i) => i.pattern === 'solid')) {
      moodScore = 0.95;
      reasons.push('Clean solids for a minimal aesthetic');
    }
  }

  const finalScore = tempScore * 0.4 + rainScore * 0.2 + occasionScore * 0.3 + moodScore * 0.1;
  const reason = reasons.length > 0
    ? reasons[0]
    : `Balanced setup for ${tempC}°C and ${occasion}.`;

  return {
    score: Math.min(1.0, Math.max(0, finalScore)),
    hasInput: true,
    reason,
  };
}
