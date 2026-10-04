import { ClothingItem, StyleProfile } from '../data/types';
import { FactorBreakdown } from './types';

/**
 * Pure face shape and hair synergy engine.
 */
export function scoreFaceHairFit(
  items: ClothingItem[],
  profile?: StyleProfile | null
): FactorBreakdown {
  const faceShape = profile?.faceShape;
  const hair = profile?.hair;

  const hasFace = Boolean(faceShape && faceShape !== 'unsure');
  const hasHair = Boolean(hair && hair.colorName);

  if (!hasFace && !hasHair) {
    return {
      score: 0.7,
      hasInput: false,
      reason: 'Add face shape or hair color to your Style Profile for sharper neckline harmony.',
    };
  }

  const top = items.find((i) => i.category === 'top' || i.category === 'dress');
  let score = 0.75;
  const reasons: string[] = [];

  // Face shape vs neckline
  if (hasFace && top?.neckline) {
    if (faceShape === 'round' || faceShape === 'square') {
      if (top.neckline === 'v' || top.neckline === 'open-collar' || top.neckline === 'scoop') {
        score += 0.2;
        reasons.push(`Open collar works well with a ${faceShape} face shape`);
      } else if (top.neckline === 'high') {
        score -= 0.1;
      }
    } else if (faceShape === 'heart' || faceShape === 'oval') {
      score += 0.15;
      if (top.neckline === 'crew' || top.neckline === 'high') {
        reasons.push(`Crew neckline complements an ${faceShape} profile`);
      }
    } else if (faceShape === 'oblong') {
      if (top.neckline === 'crew' || top.neckline === 'high') {
        score += 0.2;
        reasons.push('Horizontal collar line frames an oblong profile');
      }
    }
  }

  // Hair color contrast
  if (hair && hair.colorName && top?.colors[0]) {
    const topColor = top.colors[0].name.toLowerCase();
    const hairColor = hair.colorName.toLowerCase();

    if (hairColor.includes('brown') || hairColor.includes('black') || hairColor.includes('dark')) {
      if (topColor.includes('navy') || topColor.includes('blue')) {
        score += 0.1;
        reasons.push(`${top.colors[0].name} complements ${hair.colorName} hair`);
      } else if (topColor.includes('cream') || topColor.includes('white') || topColor.includes('beige')) {
        score += 0.1;
        reasons.push(`Light tones bring clean contrast with ${hair.colorName} hair`);
      }
    } else if (hairColor.includes('blonde') || hairColor.includes('light')) {
      if (topColor.includes('navy') || topColor.includes('charcoal') || topColor.includes('olive')) {
        score += 0.1;
        reasons.push(`Rich tones highlight ${hair.colorName} hair`);
      }
    }
  }

  const finalScore = Math.min(1.0, Math.max(0.3, score));
  const reason = reasons.length > 0
    ? reasons[0]
    : 'Necklines and colors frame your features harmoniously.';

  return {
    score: finalScore,
    hasInput: true,
    reason,
  };
}
