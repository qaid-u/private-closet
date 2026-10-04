import { db } from '../db';
import { ClothingItem, Category } from '../types';
import { ClothingItemSchema } from '../schemas';

export const itemsRepo = {
  async getAll(): Promise<ClothingItem[]> {
    return db.items.orderBy('createdAt').reverse().toArray();
  },

  async getById(id: string): Promise<ClothingItem | undefined> {
    return db.items.get(id);
  },

  async getClean(): Promise<ClothingItem[]> {
    return db.items.where('status').equals('clean').toArray();
  },

  async getByCategory(category: Category): Promise<ClothingItem[]> {
    return db.items.where('category').equals(category).toArray();
  },

  async save(item: ClothingItem): Promise<string> {
    const validated = ClothingItemSchema.parse(item);
    await db.items.put(validated);
    return validated.id;
  },

  async saveBatch(items: ClothingItem[]): Promise<void> {
    const validated = items.map((item) => ClothingItemSchema.parse(item));
    await db.items.bulkPut(validated);
  },

  async delete(id: string): Promise<void> {
    const item = await db.items.get(id);
    if (item) {
      if (item.imageCutoutId) {
        await db.images.delete(item.imageCutoutId);
      }
      if (item.imageOriginalId) {
        await db.images.delete(item.imageOriginalId);
      }
      await db.items.delete(id);
    }
  },

  async setStatus(id: string, status: ClothingItem['status']): Promise<void> {
    await db.items.update(id, { status, updatedAt: Date.now() });
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const item = await db.items.get(id);
    if (!item) return false;
    const newFavorite = !item.favorite;
    await db.items.update(id, { favorite: newFavorite, updatedAt: Date.now() });
    return newFavorite;
  },

  async loadSampleData(sampleItems: ClothingItem[]): Promise<void> {
    const tagged = sampleItems.map((item) => ({
      ...item,
      isSample: true,
      updatedAt: Date.now(),
    }));
    await this.saveBatch(tagged);
  },

  async removeSampleData(): Promise<number> {
    const allSamples = (await db.items.toArray()).filter((i) => i.isSample);
    const ids = allSamples.map((i) => i.id);
    await db.items.bulkDelete(ids);
    return ids.length;
  },

  async count(): Promise<number> {
    return db.items.count();
  },
};
