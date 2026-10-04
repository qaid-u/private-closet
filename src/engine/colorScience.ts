import { ClothingItem, StyleProfile } from '../data/types';
import { FactorBreakdown } from './types';

export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [128, 128, 128];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB to sRGB linear
  let rLin = r / 255;
  let gLin = g / 255;
  let bLin = b / 255;

  rLin = rLin > 0.04045 ? Math.pow((rLin + 0.055) / 1.055, 2.4) : rLin / 12.92;
  gLin = gLin > 0.04045 ? Math.pow((gLin + 0.055) / 1.055, 2.4) : gLin / 12.92;
  bLin = bLin > 0.04045 ? Math.pow((bLin + 0.055) / 1.055, 2.4) : bLin / 12.92;

  // Observer. = 2°, Illuminant = D65
  const x = (rLin * 0.4124 + gLin * 0.3576 + bLin * 0.1805) * 100 / 95.047;
  const y = (rLin * 0.2126 + gLin * 0.7152 + bLin * 0.0722) * 100 / 100.0;
  const z = (rLin * 0.0193 + gLin * 0.1192 + bLin * 0.9505) * 100 / 108.883;

  const f = (t: number) => (t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const L = Math.max(0, 116 * fy - 16);
  const a = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  return [L, a, bVal];
}

export function labDeltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

// Palette anchors in Lab space
const WARM_ANCHORS: [number, number, number][] = [
  rgbToLab(245, 235, 220), // cream
  rgbToLab(193, 154, 107), // camel
  rgbToLab(107, 122, 90),  // olive
  rgbToLab(180, 84, 52),   // rust
  rgbToLab(110, 75, 50),   // warm brown
  rgbToLab(212, 175, 55),  // warm gold
];

const COOL_ANCHORS: [number, number, number][] = [
  rgbToLab(24, 43, 73),    // navy
  rgbToLab(54, 69, 79),    // charcoal
  rgbToLab(248, 250, 252), // crisp white
  rgbToLab(20, 90, 60),    // emerald
  rgbToLab(136, 30, 65),   // berry
  rgbToLab(140, 160, 180), // slate blue
];

export function isWarmColor(lab: [number, number, number]): boolean {
  // In Lab, positive 'b' is yellowish/warm, positive 'a' is reddish
  // If b > 5 or (a > 5 and b > 0), tends warm
  return lab[2] > 6 || (lab[1] > 8 && lab[2] > -2);
}

export function isCoolColor(lab: [number, number, number]): boolean {
  // Negative 'b' is blue/cool, negative 'a' is greenish
  return lab[2] < -4 || (lab[1] < -6 && lab[2] < 8);
}

export function isNeutralColor(lab: [number, number, number]): boolean {
  // Low chroma (sqrt(a^2 + b^2) is low)
  const chroma = Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]);
  return chroma < 16;
}

/**
 * Evaluates color fit factor for an outfit against profile and internal harmony.
 */
export function scoreColorFit(
  items: ClothingItem[],
  profile?: StyleProfile | null
): FactorBreakdown {
  if (items.length === 0) {
    return { score: 0.5, hasInput: false, reason: 'Add items to evaluate color harmony.' };
  }

  const undertone = profile?.skin?.undertone;
  const hasProfileColor = Boolean(undertone && undertone !== 'unsure');

  let totalWeight = 0;
  let undertoneScoreSum = 0;
  let topGarmentColorName = '';

  for (const item of items) {
    const isNearFace = item.category === 'top' || item.category === 'outerwear' || item.category === 'dress';
    const weight = isNearFace ? 1.0 : 0.4;
    totalWeight += weight;

    // Get dominant color
    const domColor = item.colors[0];
    if (!domColor) continue;

    if (isNearFace && !topGarmentColorName) {
      topGarmentColorName = domColor.name;
    }

    const lab = domColor.lab || rgbToLab(...hexToRgb(domColor.hex));

    if (hasProfileColor && undertone === 'warm') {
      let minDistance = Infinity;
      for (const anchor of WARM_ANCHORS) {
        const d = labDeltaE(lab, anchor);
        if (d < minDistance) minDistance = d;
      }
      // Distance < 30 is great match
      const fit = Math.max(0.3, Math.min(1.0, 1.0 - minDistance / 75));
      undertoneScoreSum += fit * weight;
    } else if (hasProfileColor && undertone === 'cool') {
      let minDistance = Infinity;
      for (const anchor of COOL_ANCHORS) {
        const d = labDeltaE(lab, anchor);
        if (d < minDistance) minDistance = d;
      }
      const fit = Math.max(0.3, Math.min(1.0, 1.0 - minDistance / 75));
      undertoneScoreSum += fit * weight;
    } else {
      // Neutral or unsure or no profile: neutral/balanced scoring
      undertoneScoreSum += 0.8 * weight;
    }
  }

  const undertoneRatio = totalWeight > 0 ? undertoneScoreSum / totalWeight : 0.7;

  // Evaluate internal harmony between top and bottom
  const top = items.find((i) => i.category === 'top' || i.category === 'dress');
  const bottom = items.find((i) => i.category === 'bottom');

  let internalHarmony = 0.8;
  if (top && bottom && top.colors[0] && bottom.colors[0]) {
    const topLab = top.colors[0].lab || rgbToLab(...hexToRgb(top.colors[0].hex));
    const bottomLab = bottom.colors[0].lab || rgbToLab(...hexToRgb(bottom.colors[0].hex));

    const topNeutral = isNeutralColor(topLab);
    const bottomNeutral = isNeutralColor(bottomLab);

    if (topNeutral || bottomNeutral) {
      // Neutrals pair effortlessly with anything
      internalHarmony = 0.95;
    } else {
      // Check tone consistency (both warm or both cool)
      const topWarm = isWarmColor(topLab);
      const bottomWarm = isWarmColor(bottomLab);
      if (topWarm === bottomWarm) {
        internalHarmony = 0.9;
      } else {
        internalHarmony = 0.65;
      }
    }

    // Pattern harmony check: avoid multiple heavy patterns
    const topPatterned = top.pattern !== 'solid';
    const bottomPatterned = bottom.pattern !== 'solid';
    if (topPatterned && bottomPatterned) {
      internalHarmony *= 0.75;
    }
  }

  const finalScore = hasProfileColor
    ? undertoneRatio * 0.65 + internalHarmony * 0.35
    : internalHarmony * 0.9;

  let reason = '';
  if (hasProfileColor && undertone === 'warm') {
    reason = topGarmentColorName
      ? `${topGarmentColorName} harmonizes with your warm undertone.`
      : 'Earthy and warm tones harmonize with your warm undertone.';
  } else if (hasProfileColor && undertone === 'cool') {
    reason = topGarmentColorName
      ? `${topGarmentColorName} complements your cool undertone.`
      : 'Cool neutrals and balanced tones complement your cool undertone.';
  } else if (hasProfileColor && undertone === 'neutral') {
    reason = 'Balanced tones work smoothly with your neutral undertone.';
  } else {
    reason = 'Add skin undertone to your Style Profile for sharper color harmony.';
  }

  return {
    score: Math.min(1.0, Math.max(0, finalScore)),
    hasInput: hasProfileColor,
    reason,
  };
}
