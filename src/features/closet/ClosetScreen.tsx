import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { ItemCard } from '../../ui/ItemCard';
import { Toast } from '../../ui/Toast';
import { ItemDetailSheet } from './ItemDetailSheet';
import { AddItemFlow } from './AddItemFlow';
import { SortFilterSheet, FilterState } from './SortFilterSheet';
import { CareLaundryView } from './CareLaundryView';
import { ClothingItem, StyleProfile } from '../../data/types';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { styleProfileRepo } from '../../data/repositories/styleProfileRepo';
import { imagesRepo } from '../../data/repositories/imagesRepo';
import { seedService } from '../../data/seedService';
import {
  Plus,
  Search,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  Trash2,
  RotateCw,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ClosetScreen: React.FC = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [cutoutUrls, setCutoutUrls] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('All');
  const [sheetFilters, setSheetFilters] = useState<FilterState>({ sort: 'recent' });
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Modals & Sheets
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Multi-select Mode
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const chips = [
    'All',
    'Suits my palette',
    'Tops',
    'Bottoms',
    'Outerwear',
    'Shoes',
    'Dresses',
    'Accessories',
    'Care',
  ];

  // Refresh items from Dexie
  const loadCloset = useCallback(async () => {
    setIsLoading(true);
    try {
      const allItems = await itemsRepo.getAll();
      setItems(allItems);

      // Preload image URLs for cutouts
      const urls: Record<string, string> = {};
      await Promise.all(
        allItems.map(async (item) => {
          if (item.imageCutoutId) {
            const url = await imagesRepo.getUrl(item.imageCutoutId);
            if (url) urls[item.id] = url;
          }
        })
      );
      setCutoutUrls(urls);

      const p = await styleProfileRepo.getProfile();
      setProfile(p || null);
    } catch (e) {
      console.error('Error loading closet:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCloset();
  }, [loadCloset]);

  // Color harmony / palette fit heuristic based on StyleProfile undertone
  const isPaletteMatch = useCallback(
    (item: ClothingItem): boolean => {
      const undertone = profile?.skin?.undertone || 'warm';
      const colorName = item.colors[0]?.name?.toLowerCase() || '';
      const hex = item.colors[0]?.hex?.toLowerCase() || '';

      if (undertone === 'warm') {
        return (
          colorName.includes('olive') ||
          colorName.includes('cream') ||
          colorName.includes('terracotta') ||
          colorName.includes('tan') ||
          colorName.includes('brown') ||
          colorName.includes('navy') ||
          colorName.includes('forest') ||
          hex.includes('#2f5d50') ||
          hex.includes('#c8745a') ||
          hex.includes('#586445')
        );
      } else if (undertone === 'cool') {
        return (
          colorName.includes('navy') ||
          colorName.includes('charcoal') ||
          colorName.includes('grey') ||
          colorName.includes('black') ||
          colorName.includes('white') ||
          colorName.includes('berry')
        );
      }
      return true; // neutral / unsure
    },
    [profile]
  );

  // Palette match count
  const paletteMatchCount = useMemo(() => {
    return items.filter((item) => isPaletteMatch(item)).length;
  }, [items, isPaletteMatch]);

  // Filter & Search pipeline
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Chip filters
        if (activeChip === 'Suits my palette') {
          if (!isPaletteMatch(item)) return false;
        } else if (activeChip === 'Tops') {
          if (item.category !== 'top') return false;
        } else if (activeChip === 'Bottoms') {
          if (item.category !== 'bottom') return false;
        } else if (activeChip === 'Outerwear') {
          if (item.category !== 'outerwear') return false;
        } else if (activeChip === 'Shoes') {
          if (item.category !== 'shoes') return false;
        } else if (activeChip === 'Dresses') {
          if (item.category !== 'dress') return false;
        } else if (activeChip === 'Accessories') {
          if (item.category !== 'accessory') return false;
        }

        // Sheet status filter
        if (sheetFilters.status && sheetFilters.status !== 'all') {
          if (item.status !== sheetFilters.status) return false;
        }

        // Sheet season filter
        if (sheetFilters.season && sheetFilters.season !== 'all') {
          if (!item.seasons.includes(sheetFilters.season)) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          const matchSubtype = item.subtype.toLowerCase().includes(q);
          const matchColor = item.colors.some((c) => c.name.toLowerCase().includes(q));
          const matchBrand = item.brand?.toLowerCase().includes(q);
          const matchTags = item.styleTags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchCategory && !matchSubtype && !matchColor && !matchBrand && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sheetFilters.sort === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sheetFilters.sort === 'price') {
          return (b.price || 0) - (a.price || 0);
        }
        return b.createdAt - a.createdAt;
      });
  }, [items, activeChip, sheetFilters, searchQuery, isPaletteMatch]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleBatchMarkStatus = async (status: ClothingItem['status']) => {
    await itemsRepo.setBatchStatus(selectedIds, status);
    setSelectedIds([]);
    setIsMultiSelect(false);
    loadCloset();
    setToastMessage(`Updated ${selectedIds.length} items to ${status}`);
  };

  const handleBatchDelete = async () => {
    await itemsRepo.deleteBatch(selectedIds);
    setSelectedIds([]);
    setIsMultiSelect(false);
    loadCloset();
    setToastMessage(`Deleted ${selectedIds.length} items`);
  };

  const handleLoadSampleWardrobe = async () => {
    await seedService.loadSampleWardrobe();
    await loadCloset();
    setToastMessage('Sample wardrobe loaded (10 items)');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          id="closet-toast"
          message={toastMessage}
          variant="success"
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Header per SPEC Section 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
            Wardrobe Closet
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            {items.length} items &bull; {paletteMatchCount} suit your {profile?.skin?.undertone || 'warm'} palette
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setIsMultiSelect(!isMultiSelect);
                setSelectedIds([]);
              }}
              leftIcon={isMultiSelect ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
            >
              {isMultiSelect ? 'Done Selecting' : 'Select'}
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add item
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by color, pattern, style, or season..."
              className="w-full min-h-touch pl-10 pr-8 py-2 rounded-control bg-surface border border-border text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="secondary"
            size="md"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={() => setIsFilterSheetOpen(true)}
          >
            Sort & Filter
          </Button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {chips.map((chip) => {
            const isActive = activeChip === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveChip(chip)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-touch transition-all flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'bg-primary text-white font-semibold shadow-soft'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                }`}
              >
                {chip === 'Suits my palette' && <Sparkles className="w-3.5 h-3.5" />}
                <span>{chip}</span>
                {chip === 'All' && <span className="opacity-75">({items.length})</span>}
                {chip === 'Suits my palette' && <span className="opacity-75">({paletteMatchCount})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View: Grid vs Care View */}
      {activeChip === 'Care' ? (
        <CareLaundryView items={items} onRefresh={loadCloset} />
      ) : isLoading ? (
        <div className="py-12 text-center text-text-secondary">Loading closet items...</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Your first outfit is waiting in your closet."
          description="Add a few pieces you love wearing, and we'll create complete outfits for your morning routine."
          primaryActionLabel="Add first items"
          onPrimaryAction={() => setIsAddOpen(true)}
          secondaryActionLabel="Try with a sample closet"
          onSecondaryAction={handleLoadSampleWardrobe}
        />
      ) : (
        <>
          {/* Multi-select Floating Bar */}
          {isMultiSelect && (
            <div className="sticky top-16 z-20 p-3 rounded-card bg-surface/95 backdrop-blur-md border border-primary/30 shadow-card flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedIds.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-text-primary">{selectedIds.length} items selected</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.length === 0}
                  onClick={() => handleBatchMarkStatus('dirty')}
                  leftIcon={<RotateCw className="w-3.5 h-3.5 text-accent" />}
                >
                  Mark Laundry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.length === 0}
                  onClick={() => handleBatchMarkStatus('clean')}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                >
                  Mark Clean
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.length === 0}
                  onClick={handleBatchDelete}
                  className="text-danger hover:bg-danger/10"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Item Grid (2 cols mobile, 4 cols tablet, 5 cols desktop per SPEC Section 12) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const isMatch = isPaletteMatch(item);
              const isSelected = selectedIds.includes(item.id);
              const cutout = cutoutUrls[item.id];

              return (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  category={item.category}
                  colorHex={item.colors[0]?.hex || '#2F5D50'}
                  cutoutUrl={cutout}
                  isFavorite={item.favorite}
                  suitsPalette={isMatch}
                  status={item.status}
                  isSelected={isSelected}
                  onSelect={() => handleToggleSelect(item.id)}
                  onToggleFavorite={async (e) => {
                    e.stopPropagation();
                    await itemsRepo.toggleFavorite(item.id);
                    loadCloset();
                  }}
                  onClick={() => {
                    if (isMultiSelect) {
                      handleToggleSelect(item.id);
                    } else {
                      setSelectedItem(item);
                      setIsDetailOpen(true);
                    }
                  }}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Item Detail Sheet */}
      <ItemDetailSheet
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }}
        onItemUpdated={loadCloset}
        onDeleteItem={async (id) => {
          await itemsRepo.delete(id);
          loadCloset();
          setToastMessage('Item deleted');
        }}
        suitsPalette={selectedItem ? isPaletteMatch(selectedItem) : false}
      />

      {/* Add Item Modal Flow */}
      <AddItemFlow
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onItemAdded={(_item) => {
          loadCloset();
          setToastMessage('Item saved to closet');
        }}
      />

      {/* Sort & Filter Sheet */}
      <SortFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={sheetFilters}
        onApplyFilters={(f) => setSheetFilters(f)}
        onResetFilters={() => setSheetFilters({ sort: 'recent' })}
      />
    </div>
  );
};
