import { Preferences } from '../data/types';
import { ScoredOutfit } from './types';

export const DEFAULT_PREFERENCES: Preferences = {
  id: 'current',
  weights: {
    color: 0.22,
    proportion: 0.18,
    faceHair: 0.06,
    weatherOccasion: 0.24,
    taste: 0.20,
    freshness: 0.10,
  },
  hueAffinity: {},
  itemAffinity: {},
  pairAffinity: {},
  formalityBias: 0,
};

/**
 * Pure preference learning module.
 * Updates local preferences based on explicit user feedback and wear actions.
 */
export function learnFromFeedback(
  currentPrefs: Preferences | undefined | null,
  outfit: ScoredOutfit,
  kind: 'up' | 'down' | 'not-me' | 'wear',
  reasons: string[] = []
): Preferences {
  const safePrefs = currentPrefs || DEFAULT_PREFERENCES;
  const updated: Preferences = {
    ...safePrefs,
    hueAffinity: { ...(safePrefs.hueAffinity || {}) },
    itemAffinity: { ...(safePrefs.itemAffinity || {}) },
    pairAffinity: { ...(safePrefs.pairAffinity || {}) },
  };

  const delta = kind === 'up' || kind === 'wear' ? 0.15 : kind === 'down' ? -0.15 : -0.2;

  // 1. Update item affinity
  for (const item of outfit.items) {
    const cur = updated.itemAffinity[item.id] || 0;
    updated.itemAffinity[item.id] = Math.max(-1.0, Math.min(1.0, cur + delta));
  }

  // 2. Update pair affinity
  if (outfit.items.length >= 2) {
    for (let i = 0; i < outfit.items.length; i++) {
      for (let j = i + 1; j < outfit.items.length; j++) {
        const pairKey = [outfit.items[i].id, outfit.items[j].id].sort().join('+');
        const curPair = updated.pairAffinity[pairKey] || 0;
        updated.pairAffinity[pairKey] = Math.max(-1.0, Math.min(1.0, curPair + delta * 0.8));
      }
    }
  }

  // 3. Handle 'not-me' specific reason signals
  if (kind === 'not-me') {
    if (reasons.includes('Wrong colors')) {
      for (const item of outfit.items) {
        if (item.colors[0]) {
          const cName = item.colors[0].name.toLowerCase();
          const curHue = updated.hueAffinity[cName] || 0;
          updated.hueAffinity[cName] = Math.max(-1.0, curHue - 0.25);
        }
      }
    }

    if (reasons.includes('Too formal')) {
      updated.formalityBias = Math.max(-1.0, (updated.formalityBias || 0) - 0.2);
    } else if (reasons.includes('Too casual')) {
      updated.formalityBias = Math.min(1.0, (updated.formalityBias || 0) + 0.2);
    }
  }

  return updated;
}
