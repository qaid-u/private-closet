import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/data/db';
import {
  itemsRepo,
  styleProfileRepo,
  outfitsRepo,
  wearLogsRepo,
  imagesRepo,
  storageService,
} from '../src/data/repositories';
import { seedService } from '../src/data/seedService';
import { SAMPLE_STYLE_PROFILE } from '../src/data/seedData';

describe('Data Layer & Repositories', () => {
  beforeEach(async () => {
    await db.items.clear();
    await db.styleProfiles.clear();
    await db.outfits.clear();
    await db.wearLogs.clear();
    await db.images.clear();
  });

  it('saves and retrieves clothing items with Zod validation', async () => {
    const itemId = await itemsRepo.save({
      id: 'test-item-1',
      name: 'Test Oxford Shirt',
      category: 'top',
      subtype: 'shirt',
      colors: [{ hex: '#FFFFFF', lab: [100, 0, 0], name: 'White', share: 1.0 }],
      pattern: 'solid',
      styleTags: ['classic'],
      formality: 2,
      warmth: 1,
      fit: 'regular',
      seasons: ['spring', 'summer'],
      status: 'clean',
      favorite: false,
      imageCutoutId: 'cutout-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    expect(itemId).toBe('test-item-1');

    const retrieved = await itemsRepo.getById('test-item-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Oxford Shirt');
    expect(retrieved?.status).toBe('clean');
  });

  it('filters clean items and updates garment status', async () => {
    await itemsRepo.save({
      id: 'clean-1',
      name: 'Clean Shirt',
      category: 'top',
      subtype: 'shirt',
      colors: [{ hex: '#FFFFFF', lab: [100, 0, 0], name: 'White', share: 1.0 }],
      pattern: 'solid',
      styleTags: [],
      formality: 1,
      warmth: 1,
      fit: 'regular',
      seasons: ['summer'],
      status: 'clean',
      favorite: false,
      imageCutoutId: 'c1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await itemsRepo.save({
      id: 'dirty-1',
      name: 'Dirty Chinos',
      category: 'bottom',
      subtype: 'chinos',
      colors: [{ hex: '#525F45', lab: [39, -10, 15], name: 'Olive', share: 1.0 }],
      pattern: 'solid',
      styleTags: [],
      formality: 1,
      warmth: 1,
      fit: 'regular',
      seasons: ['summer'],
      status: 'dirty',
      favorite: false,
      imageCutoutId: 'c2',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const cleanItems = await itemsRepo.getClean();
    expect(cleanItems).toHaveLength(1);
    expect(cleanItems[0].id).toBe('clean-1');

    // Mark clean item as dirty
    await itemsRepo.setStatus('clean-1', 'dirty');
    const updatedClean = await itemsRepo.getClean();
    expect(updatedClean).toHaveLength(0);
  });

  it('loads sample wardrobe and removes sample data cleanly', async () => {
    const loadedCount = await seedService.loadSampleWardrobe();
    expect(loadedCount).toBe(10);

    const items = await itemsRepo.getAll();
    expect(items).toHaveLength(10);
    expect(items.every((i) => i.isSample)).toBe(true);

    const profile = await styleProfileRepo.getProfile();
    expect(profile).toBeDefined();
    expect(profile?.displayName).toBe('Maya');

    // Remove sample data
    const removedCount = await seedService.removeSampleWardrobe();
    expect(removedCount).toBe(10);

    const remainingItems = await itemsRepo.getAll();
    expect(remainingItems).toHaveLength(0);
  });

  it('deleteStyleData clears style profile and preferences but leaves items intact', async () => {
    // 1. Load sample items
    await seedService.loadSampleWardrobe();
    expect(await itemsRepo.count()).toBe(10);

    // 2. Save style profile
    await styleProfileRepo.saveProfile(SAMPLE_STYLE_PROFILE);
    expect(await styleProfileRepo.hasProfile()).toBe(true);

    // 3. Delete style data
    await styleProfileRepo.deleteStyleData();

    // Verify style data cleared
    expect(await styleProfileRepo.hasProfile()).toBe(false);

    // Verify closet items remain 100% intact per TECH_DESIGN Section 3
    const items = await itemsRepo.getAll();
    expect(items).toHaveLength(10);
  });

  it('saves and logs outfits and wear history', async () => {
    const outfitId = await outfitsRepo.save({
      id: 'outfit-1',
      name: 'Weekend Casual',
      itemIds: ['item-1', 'item-2'],
      occasion: 'casual',
      rating: 5,
      favorite: true,
      wornCount: 0,
      createdAt: Date.now(),
    });

    expect(outfitId).toBe('outfit-1');

    await outfitsRepo.recordWear('outfit-1');
    const outfit = await outfitsRepo.getById('outfit-1');
    expect(outfit?.wornCount).toBe(1);

    await wearLogsRepo.logWear({
      id: 'log-1',
      date: '2026-10-04',
      outfitId: 'outfit-1',
      itemIds: ['item-1', 'item-2'],
    });

    const logs = await wearLogsRepo.getByDate('2026-10-04');
    expect(logs).toHaveLength(1);
  });

  it('stores and retrieves binary Blobs via imagesRepo', async () => {
    const dummySvg = '<svg><circle cx="10" cy="10" r="5" fill="red"/></svg>';
    const blob = new Blob([dummySvg], { type: 'image/svg+xml' });

    await imagesRepo.saveBlob('cutout-test', blob);
    const retrievedBlob = await imagesRepo.getBlob('cutout-test');
    expect(retrievedBlob).toBeDefined();
    expect(retrievedBlob?.size).toBe(blob.size);

    const url = await imagesRepo.getUrl('cutout-test');
    expect(url).toBeDefined();
  });

  it('checks storage estimation', async () => {
    const est = await storageService.getStorageEstimate();
    expect(est).toBeDefined();
    expect(est.quotaBytes).toBeGreaterThan(0);
  });
});
