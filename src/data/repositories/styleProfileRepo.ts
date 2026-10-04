import { db } from '../db';
import { StyleProfile } from '../types';
import { StyleProfileSchema } from '../schemas';

export const styleProfileRepo = {
  async getProfile(): Promise<StyleProfile | undefined> {
    return db.styleProfiles.get('current');
  },

  async saveProfile(profile: StyleProfile): Promise<void> {
    const validated = StyleProfileSchema.parse(profile);
    await db.styleProfiles.put(validated);
  },

  /**
   * Clears StyleProfile and learned Preferences,
   * leaves wardrobe items, outfits, and wear logs completely intact.
   */
  async deleteStyleData(): Promise<void> {
    await db.transaction('rw', db.styleProfiles, db.preferences, async () => {
      await db.styleProfiles.delete('current');
      await db.preferences.delete('current');
    });
  },

  async hasProfile(): Promise<boolean> {
    const count = await db.styleProfiles.count();
    return count > 0;
  },
};
