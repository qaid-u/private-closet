import { db } from '../db';
import { Outfit } from '../types';
import { OutfitSchema } from '../schemas';

export const outfitsRepo = {
  async getAll(): Promise<Outfit[]> {
    return db.outfits.orderBy('createdAt').reverse().toArray();
  },

  async getById(id: string): Promise<Outfit | undefined> {
    return db.outfits.get(id);
  },

  async save(outfit: Outfit): Promise<string> {
    const validated = OutfitSchema.parse(outfit);
    await db.outfits.put(validated);
    return validated.id;
  },

  async delete(id: string): Promise<void> {
    await db.outfits.delete(id);
  },

  async recordWear(id: string): Promise<void> {
    const outfit = await db.outfits.get(id);
    if (outfit) {
      await db.outfits.update(id, {
        wornCount: outfit.wornCount + 1,
      });
    }
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const outfit = await db.outfits.get(id);
    if (!outfit) return false;
    const newFav = !outfit.favorite;
    await db.outfits.update(id, { favorite: newFav });
    return newFav;
  },
};
