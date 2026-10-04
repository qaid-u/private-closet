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

  async setRating(id: string, rating: 1 | 2 | 3 | 4 | 5): Promise<void> {
    await db.outfits.update(id, { rating });
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const outfit = await db.outfits.get(id);
    if (!outfit) return false;
    const newFav = !outfit.favorite;
    await db.outfits.update(id, { favorite: newFav });
    return newFav;
  },

  async saveBatch(outfits: Outfit[]): Promise<void> {
    const validated = outfits.map((o) => OutfitSchema.parse(o));
    await db.outfits.bulkPut(validated);
  },

  async create(data: Omit<Outfit, 'id' | 'createdAt' | 'wornCount'> & { id?: string }): Promise<Outfit> {
    const id = data.id || `outfit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const full: Outfit = {
      ...data,
      id,
      wornCount: 0,
      createdAt: Date.now(),
    };
    const validated = OutfitSchema.parse(full);
    await db.outfits.put(validated);
    return validated;
  },
};

