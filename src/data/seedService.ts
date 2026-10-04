import { itemsRepo } from './repositories/itemsRepo';
import { styleProfileRepo } from './repositories/styleProfileRepo';
import { imagesRepo } from './repositories/imagesRepo';
import { SAMPLE_CLOTHING_ITEMS, SAMPLE_STYLE_PROFILE } from './seedData';
import { SAMPLE_CUTOUT_SVGS } from './sampleCutouts';

export const seedService = {
  async loadSampleWardrobe(): Promise<number> {
    // 1. Store SVG cutouts into imagesRepo
    for (const item of SAMPLE_CLOTHING_ITEMS) {
      const svgKey = item.name.toLowerCase().replace(/\s+/g, '-');
      const svgContent = SAMPLE_CUTOUT_SVGS[svgKey];
      if (svgContent) {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        await imagesRepo.saveBlob(item.imageCutoutId, blob, 'image/svg+xml');
      }
    }

    // 2. Load items into items table
    await itemsRepo.loadSampleData(SAMPLE_CLOTHING_ITEMS);

    // 3. Load sample style profile if none exists
    const hasProfile = await styleProfileRepo.hasProfile();
    if (!hasProfile) {
      await styleProfileRepo.saveProfile(SAMPLE_STYLE_PROFILE);
    }

    return SAMPLE_CLOTHING_ITEMS.length;
  },

  async removeSampleWardrobe(): Promise<number> {
    // 1. Remove cutouts
    for (const item of SAMPLE_CLOTHING_ITEMS) {
      await imagesRepo.delete(item.imageCutoutId);
    }

    // 2. Remove sample items
    return itemsRepo.removeSampleData();
  },

  async hasSampleData(): Promise<boolean> {
    const items = await itemsRepo.getAll();
    return items.some((item) => item.isSample);
  },
};

export const seedSampleData = () => seedService.loadSampleWardrobe();
