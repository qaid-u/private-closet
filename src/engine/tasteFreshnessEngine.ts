import { ClothingItem, StyleProfile, Preferences, WearLog } from '../data/types';
import { FactorBreakdown } from './types';

/**
 * Pure taste preference engine.
 */
export function scoreTasteFit(
  items: ClothingItem[],
  profile?: StyleProfile | null,
  preferences?: Preferences | null
): FactorBreakdown {
  if (items.length === 0) {
    return { score: 0.5, hasInput: false, reason: 'Add items to evaluate style preferences.' };
  }

  const profileTags = profile?.taste?.tags || [];
  const hasProfileTaste = profileTags.length > 0;

  let totalTasteScore = 0.75;
  const reasons: string[] = [];

  if (hasProfileTaste) {
    let tagMatches = 0;
    for (const item of items) {
      const match = item.styleTags.some((t) => profileTags.includes(t));
      if (match) tagMatches++;
    }
    const ratio = items.length > 0 ? tagMatches / items.length : 0;
    totalTasteScore = 0.5 + ratio * 0.5;

    const matchedTag = profileTags.find((pt) => items.some((i) => i.styleTags.includes(pt)));
    if (matchedTag) {
      reasons.push(`Follows your ${matchedTag} aesthetic`);
    }
  }

  // Learned affinities from user feedback
  if (preferences?.itemAffinity) {
    let learnedBoost = 0;
    for (const item of items) {
      const aff = preferences.itemAffinity[item.id] || 0;
      learnedBoost += aff * 0.1;
    }
    totalTasteScore += Math.max(-0.2, Math.min(0.2, learnedBoost / items.length));
  }

  const reason = reasons.length > 0
    ? reasons[0]
    : hasProfileTaste
      ? 'Aligns with your saved taste and style preferences.'
      : 'Add style taste tags to your Style Profile for personalized picks.';

  return {
    score: Math.min(1.0, Math.max(0.2, totalTasteScore)),
    hasInput: hasProfileTaste,
    reason,
  };
}

/**
 * Pure freshness and rotation engine.
 */
export function scoreFreshnessFit(
  items: ClothingItem[],
  wearLogs?: WearLog[]
): FactorBreakdown {
  if (items.length === 0 || !wearLogs || wearLogs.length === 0) {
    return {
      score: 0.85,
      hasInput: true,
      reason: 'Fresh pieces ready for rotation.',
    };
  }

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  // Find recent wears
  let penalty = 0;
  let hasOldRediscovered = false;

  for (const item of items) {
    const itemLogs = wearLogs.filter((wl) => wl.itemIds.includes(item.id));
    if (itemLogs.length > 0) {
      // Sort by date desc
      const latestLog = itemLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const daysSince = (now - new Date(latestLog.date).getTime()) / ONE_DAY_MS;

      if (daysSince < 2) {
        penalty += 0.35; // Worn yesterday or today
      } else if (daysSince < 4) {
        penalty += 0.15; // Worn 2-3 days ago
      } else if (daysSince > 60) {
        hasOldRediscovered = true;
      }
    } else {
      // Never worn yet: great for rotation!
      hasOldRediscovered = true;
    }
  }

  const finalScore = Math.max(0.3, Math.min(1.0, 0.9 - (penalty / items.length) + (hasOldRediscovered ? 0.1 : 0)));

  let reason = 'Rotates well with your recent wear history.';
  if (penalty > 0.4) {
    reason = 'Features an item worn earlier this week.';
  } else if (hasOldRediscovered) {
    reason = 'Brings unworn favorites back into rotation.';
  }

  return {
    score: finalScore,
    hasInput: true,
    reason,
  };
}
