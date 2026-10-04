import { db } from '../db';
import { Preferences, Feedback } from '../types';

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

export const preferencesRepo = {
  async get(): Promise<Preferences> {
    const prefs = await db.preferences.get('current');
    return prefs || DEFAULT_PREFERENCES;
  },

  async update(patch: Partial<Preferences>): Promise<Preferences> {
    const current = await this.get();
    const updated: Preferences = {
      ...current,
      ...patch,
      weights: { ...current.weights, ...(patch.weights || {}) },
      hueAffinity: { ...current.hueAffinity, ...(patch.hueAffinity || {}) },
      itemAffinity: { ...current.itemAffinity, ...(patch.itemAffinity || {}) },
      pairAffinity: { ...current.pairAffinity, ...(patch.pairAffinity || {}) },
    };
    await db.preferences.put(updated);
    return updated;
  },

  async reset(): Promise<Preferences> {
    await db.preferences.put(DEFAULT_PREFERENCES);
    return DEFAULT_PREFERENCES;
  },
};

export const feedbackRepo = {
  async add(item: Omit<Feedback, 'id' | 'at'>): Promise<Feedback> {
    const id = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: Feedback = {
      ...item,
      id,
      at: Date.now(),
    };
    await db.feedback.add(record);
    return record;
  },

  async listRecent(limit = 50): Promise<Feedback[]> {
    return db.feedback.orderBy('at').reverse().limit(limit).toArray();
  },

  async count(): Promise<number> {
    return db.feedback.count();
  },
};
