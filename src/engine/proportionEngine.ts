import { ClothingItem, StyleProfile } from '../data/types';
import { FactorBreakdown } from './types';

/**
 * Pure proportion and fit engine.
 * strictly respects positive, proportion-based wording.
 * Never uses prohibited body copy (zero slimming, zero BMI, zero shape-correction).
 */
export function scoreProportionFit(
  items: ClothingItem[],
  profile?: StyleProfile | null
): FactorBreakdown {
  if (items.length === 0) {
    return { score: 0.5, hasInput: false, reason: 'Add items to evaluate silhouette balance.' };
  }

  const proportions = profile?.proportions || [];
  const fitPref = profile?.fitPreference; // 0 = fitted, 0.5 = regular, 1 = relaxed
  const heightCm = profile?.heightCm;

  const hasInput = proportions.length > 0 || fitPref !== undefined || Boolean(heightCm);

  if (!hasInput) {
    return {
      score: 0.75, // Balanced default
      hasInput: false,
      reason: 'Add proportion notes to your Style Profile for sharper silhouette balance.',
    };
  }

  let scoreSum = 0;
  let checksCount = 0;
  const reasons: string[] = [];

  const top = items.find((i) => i.category === 'top');
  const bottom = items.find((i) => i.category === 'bottom');
  const outerwear = items.find((i) => i.category === 'outerwear');

  // 1. Torso proportion synergy
  if (proportions.includes('longer-torso')) {
    checksCount++;
    if (outerwear && (outerwear.length === 'cropped' || outerwear.length === 'regular')) {
      scoreSum += 0.95;
      reasons.push('Cropped outer layer balances a longer torso');
    } else if (bottom && (bottom.rise === 'high' || bottom.rise === 'mid')) {
      scoreSum += 0.9;
      reasons.push('High-rise silhouette balances a longer torso');
    } else {
      scoreSum += 0.7;
    }
  } else if (proportions.includes('shorter-torso')) {
    checksCount++;
    if (top && (top.length === 'regular' || top.length === 'long')) {
      scoreSum += 0.9;
      reasons.push('Regular-length top complements your torso line');
    } else if (bottom && bottom.rise === 'mid') {
      scoreSum += 0.9;
      reasons.push('Mid-rise waistline works naturally with your proportions');
    } else {
      scoreSum += 0.7;
    }
  }

  // 2. Shoulder line synergy
  if (proportions.includes('broad-shoulders')) {
    checksCount++;
    if (top && (top.neckline === 'v' || top.neckline === 'open-collar' || top.neckline === 'scoop')) {
      scoreSum += 0.95;
      reasons.push('Open neckline balances broader shoulders');
    } else if (top && top.neckline === 'high') {
      scoreSum += 0.65;
    } else {
      scoreSum += 0.8;
    }
  } else if (proportions.includes('narrow-shoulders')) {
    checksCount++;
    if (outerwear || (top && (top.neckline === 'crew' || top.neckline === 'high'))) {
      scoreSum += 0.9;
      reasons.push('Structured neckline highlights your shoulder line');
    } else {
      scoreSum += 0.75;
    }
  }

  // 3. Height preference synergy
  if (heightCm) {
    checksCount++;
    if (heightCm < 162) {
      // Petite range: favors regular or cropped pieces, avoids dragging hems
      const hasCroppedOrClean = items.some((i) => i.length === 'cropped' || i.length === 'regular');
      if (hasCroppedOrClean) {
        scoreSum += 0.9;
        reasons.push('Proportioned hem lines keep your outfit balanced');
      } else {
        scoreSum += 0.75;
      }
    } else if (heightCm > 178) {
      // Taller range: favors full drape and regular/long cuts
      const hasLong = items.some((i) => i.length === 'long' || i.length === 'regular');
      if (hasLong) {
        scoreSum += 0.9;
        reasons.push('Clean vertical lines work with your taller frame');
      } else {
        scoreSum += 0.8;
      }
    } else {
      scoreSum += 0.85;
    }
  }

  // 4. Fit preference alignment (0 fitted .. 1 relaxed)
  if (fitPref !== undefined) {
    checksCount++;
    let fitMatchTotal = 0;
    for (const item of items) {
      // item.fit: 'fitted' (0.1), 'regular' (0.5), 'relaxed' (0.8), 'oversized' (1.0)
      let itemVal = 0.5;
      if (item.fit === 'fitted') itemVal = 0.15;
      if (item.fit === 'regular') itemVal = 0.5;
      if (item.fit === 'relaxed') itemVal = 0.8;
      if (item.fit === 'oversized') itemVal = 0.95;

      const diff = Math.abs(fitPref - itemVal);
      const match = Math.max(0.4, 1.0 - diff * 0.8);
      fitMatchTotal += match;
    }
    const avgFitMatch = items.length > 0 ? fitMatchTotal / items.length : 0.8;
    scoreSum += avgFitMatch;

    if (fitPref > 0.6 && items.some((i) => i.fit === 'relaxed' || i.fit === 'oversized')) {
      reasons.push('Relaxed drape follows your comfort rules');
    } else if (fitPref < 0.4 && items.some((i) => i.fit === 'fitted')) {
      reasons.push('Tailored cut aligns with your preferred fit');
    }
  }

  const finalScore = checksCount > 0 ? scoreSum / checksCount : 0.8;
  const reason = reasons.length > 0
    ? reasons[0]
    : 'Silhouettes and cuts work with your proportions.';

  return {
    score: Math.min(1.0, Math.max(0, finalScore)),
    hasInput,
    reason,
  };
}
