import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClosetScreen } from '../src/features/closet/ClosetScreen';
import { AddItemFlow } from '../src/features/closet/AddItemFlow';
import { CareLaundryView } from '../src/features/closet/CareLaundryView';
import { itemsRepo } from '../src/data/repositories/itemsRepo';
import { seedService } from '../src/data/seedService';
import { db } from '../src/data/db';
import { ClothingItem } from '../src/data/types';

describe('Phase 4: Closet & Inventory Unit Tests', () => {
  beforeEach(async () => {
    await db.items.clear();
    await db.images.clear();
    await db.styleProfiles.clear();
  });

  it('renders ClosetScreen empty state and loads sample closet', async () => {
    render(<ClosetScreen />);

    // Empty state should be visible initially
    await waitFor(() => {
      expect(screen.getByText(/Your first outfit is waiting in your closet/i)).toBeInTheDocument();
    });

    // Click "Try with a sample closet"
    const sampleBtn = screen.getByRole('button', { name: /try with a sample closet/i });
    fireEvent.click(sampleBtn);

    // Items should be loaded into Dexie and displayed
    await waitFor(() => {
      expect(screen.getByText(/Cream knit sweater/i)).toBeInTheDocument();
      expect(screen.getByText(/Navy linen shirt/i)).toBeInTheDocument();
    });
  });

  it('filters items by search query and category chips', async () => {
    await seedService.loadSampleWardrobe();

    render(<ClosetScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Cream knit sweater/i)).toBeInTheDocument();
    });

    // Search for "linen"
    const searchInput = screen.getByPlaceholderText(/search by color, pattern, style/i);
    fireEvent.change(searchInput, { target: { value: 'linen' } });

    await waitFor(() => {
      expect(screen.getByText(/Navy linen shirt/i)).toBeInTheDocument();
      expect(screen.queryByText(/Olive chinos/i)).not.toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    // Click "Shoes" filter chip
    const shoesChip = screen.getByRole('button', { name: /^shoes$/i });
    fireEvent.click(shoesChip);

    await waitFor(() => {
      expect(screen.getByText(/White leather sneakers/i)).toBeInTheDocument();
      expect(screen.queryByText(/Cream knit sweater/i)).not.toBeInTheDocument();
    });
  });

  it('AddItemFlow captures simulated photo, processes tags, and saves item to Dexie', async () => {
    const handleClose = vi.fn();
    const handleItemAdded = vi.fn();

    render(
      <AddItemFlow
        isOpen={true}
        onClose={handleClose}
        onItemAdded={handleItemAdded}
      />
    );

    // Initial capture screen
    expect(screen.getByText(/Frame garment inside outline/i)).toBeInTheDocument();

    // Click capture photo (simulated)
    const captureBtn = screen.getByRole('button', { name: /capture photo/i });
    fireEvent.click(captureBtn);

    // Review tags step
    await waitFor(() => {
      expect(screen.getByText(/AI Tag Suggestions/i)).toBeInTheDocument();
    }, { timeout: 4000 });

    // Continue to details
    const continueBtn = screen.getByRole('button', { name: /continue to details/i });
    fireEvent.click(continueBtn);

    // Details form
    await waitFor(() => {
      expect(screen.getByText(/Item Name/i)).toBeInTheDocument();
    });

    // Save to closet
    const saveBtn = screen.getByRole('button', { name: /save to closet/i });
    fireEvent.click(saveBtn);

    // Saved confirmation
    await waitFor(() => {
      expect(screen.getByText(/Saved to Your Closet!/i)).toBeInTheDocument();
    });

    expect(handleItemAdded).toHaveBeenCalled();

    // Verify saved item exists in Dexie
    const count = await itemsRepo.count();
    expect(count).toBeGreaterThan(0);
  });

  it('CareLaundryView allows marking items dirty and clean', async () => {
    const testItem: ClothingItem = {
      id: 'test-care-1',
      name: 'Test Shirt',
      category: 'top',
      subtype: 'shirt',
      colors: [{ hex: '#2F5D50', lab: [30, 0, 0], name: 'Green', share: 1 }],
      pattern: 'solid',
      styleTags: ['classic'],
      formality: 1,
      warmth: 1,
      fit: 'regular',
      seasons: ['spring'],
      status: 'dirty',
      favorite: false,
      imageCutoutId: 'cutout-test',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await itemsRepo.save(testItem);
    const handleRefresh = vi.fn();

    render(<CareLaundryView items={[testItem]} onRefresh={handleRefresh} />);

    expect(screen.getByText(/Laundry Basket \(1\)/i)).toBeInTheDocument();

    const markCleanBtn = screen.getByRole('button', { name: /mark clean/i });
    fireEvent.click(markCleanBtn);

    await waitFor(() => {
      expect(handleRefresh).toHaveBeenCalled();
    });
  });
});
