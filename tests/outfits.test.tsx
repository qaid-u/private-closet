import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LookbookGallery } from '../src/features/outfits/LookbookGallery';
import { OutfitStudio } from '../src/features/outfits/OutfitStudio';
import { CapsuleCreator } from '../src/features/outfits/CapsuleCreator';
import { db } from '../src/data/db';
import { seedSampleData } from '../src/data/seedService';
import { outfitsRepo } from '../src/data/repositories/outfitsRepo';
import { itemsRepo } from '../src/data/repositories/itemsRepo';
import { Outfit } from '../src/data/types';

describe('Phase 6: Outfit Studio, Lookbook Gallery & Capsule Wardrobe', () => {
  beforeEach(async () => {
    await db.items.clear();
    await db.outfits.clear();
    await db.styleProfiles.clear();
    await db.preferences.clear();
    await db.wearLogs.clear();
    await seedSampleData();
  });

  describe('LookbookGallery', () => {
    it('renders empty state when no outfits exist and generates starter looks', async () => {
      render(<LookbookGallery profile={null} preferences={null} />);

      await waitFor(() => {
        expect(screen.getByText(/no outfits found in lookbook/i)).toBeInTheDocument();
      });

      // Click generate starter looks
      const generateBtn = await screen.findByRole('button', { name: /generate starter looks/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/starter lookbook outfits added/i)).toBeInTheDocument();
      });

      const outfitsInDb = await outfitsRepo.getAll();
      expect(outfitsInDb.length).toBeGreaterThan(0);
    });

    it('toggles favorites and updates rating on an outfit', async () => {
      const items = await itemsRepo.getAll();
      await outfitsRepo.create({
        name: 'Classic Casual Look',
        itemIds: [items[0].id, items[1].id],
        occasion: 'casual',
        season: 'all',
        rating: 4,
        favorite: false,
      });

      render(<LookbookGallery profile={null} preferences={null} />);

      await waitFor(() => {
        expect(screen.getByText('Classic Casual Look')).toBeInTheDocument();
      });

      // Favorite button
      const favBtn = screen.getByLabelText(/favorite outfit/i);
      fireEvent.click(favBtn);

      await waitFor(() => {
        expect(screen.getByText(/saved to favorites/i)).toBeInTheDocument();
      });

      const saved = await outfitsRepo.getAll();
      expect(saved[0].favorite).toBe(true);
    });
  });

  describe('OutfitStudio', () => {
    it('allows slotting clothes, testing undo/redo, running balance check, and saving outfit', async () => {
      const items = await itemsRepo.getAll();
      let savedOutfit: Outfit | null = null;

      render(
        <OutfitStudio
          closetItems={items}
          profile={null}
          preferences={null}
          onClose={() => {}}
          onSaved={(o) => {
            savedOutfit = o;
          }}
        />
      );

      // Verify canvas slots exist
      expect(screen.getByText(/outfit studio/i)).toBeInTheDocument();
      expect(screen.getByText(/add top/i)).toBeInTheDocument();
      expect(screen.getByText(/add bottom/i)).toBeInTheDocument();

      // Click to choose top piece
      const topSlot = screen.getByText(/add top/i);
      fireEvent.click(topSlot);

      // Closet drawer shows available items on the right
      const firstTop = await screen.findByText(/cream knit sweater/i);
      fireEvent.click(firstTop);

      // Switch category to bottom and pick a bottom piece
      const bottomCategoryTab = screen.getByRole('button', { name: /^bottom$/i });
      fireEvent.click(bottomCategoryTab);

      const firstBottom = await screen.findByText(/olive chinos/i);
      fireEvent.click(firstBottom);

      // Verify pieces placed on canvas and undo is enabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^undo$/i })).not.toBeDisabled();
      });

      // Test undo (reverts the bottom piece addition)
      const undoBtn = screen.getByRole('button', { name: /^undo$/i });
      fireEvent.click(undoBtn);

      // Wait for redo to become enabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^redo$/i })).not.toBeDisabled();
      });

      // Test redo (restores the bottom piece)
      const redoBtn = screen.getByRole('button', { name: /^redo$/i });
      fireEvent.click(redoBtn);

      // Wait for bottom piece to be restored and Save Outfit to be enabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save outfit/i })).not.toBeDisabled();
      });

      // Run Check Balance
      const checkBtn = screen.getByRole('button', { name: /check balance/i });
      fireEvent.click(checkBtn);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /outfit balance check/i })).toBeInTheDocument();
        expect(screen.getByText(/harmony score/i)).toBeInTheDocument();
      });

      // Close check balance modal
      const closeCheckBtn = screen.getByRole('button', { name: /looks great/i });
      fireEvent.click(closeCheckBtn);

      // Save Outfit
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save outfit/i })).not.toBeDisabled();
      });
      const saveBtn = screen.getByRole('button', { name: /save outfit/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /save outfit to lookbook/i })).toBeInTheDocument();
      });

      // Confirm Save dialog
      const confirmSaveBtn = screen.getByRole('button', { name: /save to lookbook/i });
      fireEvent.click(confirmSaveBtn);

      await waitFor(() => {
        expect(savedOutfit).not.toBeNull();
      });
    });
  });

  describe('CapsuleCreator', () => {
    it('calculates versatility index and batch saves capsule outfits', async () => {
      const items = await itemsRepo.getAll();
      let savedCount = 0;

      render(
        <CapsuleCreator
          closetItems={items}
          onClose={() => {}}
          onBatchSaved={(count) => {
            savedCount = count;
          }}
        />
      );

      // Check capsule header and versatility metric
      expect(screen.getByText(/capsule wardrobe studio/i)).toBeInTheDocument();
      expect(screen.getByText(/versatility index/i)).toBeInTheDocument();

      // Top-bottom pairing matrix section
      expect(screen.getByText(/pairing matrix/i)).toBeInTheDocument();

      // Save Capsule to Lookbook
      const saveCapsuleBtn = screen.getByRole('button', { name: /save all .* outfits/i });
      fireEvent.click(saveCapsuleBtn);

      await waitFor(() => {
        expect(savedCount).toBeGreaterThan(0);
      });

      const outfitsInDb = await outfitsRepo.getAll();
      expect(outfitsInDb.length).toBe(savedCount);
    });
  });
});
