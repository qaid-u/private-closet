import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Heart,
  Star,
  Layers,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { ClothingItem, Outfit, StyleProfile, Preferences } from '../../data/types';
import { outfitsRepo } from '../../data/repositories/outfitsRepo';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { wearLogsRepo } from '../../data/repositories/wearLogsRepo';
import { SAMPLE_CUTOUT_SVGS } from '../../data/sampleCutouts';
import { OutfitStudio } from './OutfitStudio';
import { CapsuleCreator } from './CapsuleCreator';

interface LookbookGalleryProps {
  profile: StyleProfile | null;
  preferences: Preferences | null;
  initialMode?: 'gallery' | 'studio' | 'capsule';
}

export const LookbookGallery: React.FC<LookbookGalleryProps> = ({
  profile,
  preferences,
  initialMode = 'gallery',
}) => {
  const [mode, setMode] = useState<'gallery' | 'studio' | 'capsule'>(initialMode);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  // Filters & sorting
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [selectedSeason, _setSelectedSeason] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'worn' | 'rating' | 'name'>('recent');

  // Dialogs & Feedback
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allOutfits = await outfitsRepo.getAll();
      setOutfits(allOutfits);
      const allItems = await itemsRepo.getAll();
      setClosetItems(allItems);
    } catch (e) {
      console.error('Failed to load lookbook data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lookup map for fast garment details
  const itemMap = useMemo(() => {
    const map = new Map<string, ClothingItem>();
    for (const item of closetItems) {
      map.set(item.id, item);
    }
    return map;
  }, [closetItems]);

  // Filtered & sorted outfits
  const filteredOutfits = useMemo(() => {
    return outfits
      .filter((o) => {
        if (onlyFavorites && !o.favorite) return false;
        if (selectedOccasion !== 'all' && o.occasion !== selectedOccasion) return false;
        if (selectedSeason !== 'all' && o.season !== selectedSeason && o.season !== 'all') return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return b.createdAt - a.createdAt;
        if (sortBy === 'worn') return b.wornCount - a.wornCount;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [outfits, onlyFavorites, selectedOccasion, selectedSeason, sortBy]);

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFav = await outfitsRepo.toggleFavorite(id);
    setOutfits((prev) =>
      prev.map((o) => (o.id === id ? { ...o, favorite: newFav } : o))
    );
    showToast(newFav ? 'Saved to Favorites' : 'Removed from Favorites');
  };

  const handleSetRating = async (id: string, rating: 1 | 2 | 3 | 4 | 5, e: React.MouseEvent) => {
    e.stopPropagation();
    await outfitsRepo.setRating(id, rating);
    setOutfits((prev) =>
      prev.map((o) => (o.id === id ? { ...o, rating } : o))
    );
  };

  const handleWearOutfit = async (outfit: Outfit, e: React.MouseEvent) => {
    e.stopPropagation();
    // 1. Log wear
    await wearLogsRepo.create({
      date: new Date().toISOString().split('T')[0],
      outfitId: outfit.id,
      itemIds: outfit.itemIds,
      context: { occasion: outfit.occasion },
    });

    // 2. Increment outfit wear
    await outfitsRepo.recordWear(outfit.id);

    // 3. Increment items wear
    for (const itemId of outfit.itemIds) {
      await itemsRepo.incrementWornCount(itemId);
    }

    await loadData();
    showToast(`Logged "${outfit.name}" for today!`);
  };

  const handleDeleteOutfit = async () => {
    if (!deleteTargetId) return;
    await outfitsRepo.delete(deleteTargetId);
    setOutfits((prev) => prev.filter((o) => o.id !== deleteTargetId));
    setDeleteTargetId(null);
    showToast('Outfit removed from Lookbook');
  };

  // Seed sample starter looks if empty
  const handleSeedStarterLooks = async () => {
    if (closetItems.length < 2) return;
    const tops = closetItems.filter((i) => i.category === 'top');
    const bottoms = closetItems.filter((i) => i.category === 'bottom');
    const shoes = closetItems.filter((i) => i.category === 'shoes');

    const starterOutfits: Outfit[] = [];
    if (tops[0] && bottoms[0]) {
      starterOutfits.push({
        id: `starter-outfit-1`,
        name: `${tops[0].name} & ${bottoms[0].name}`,
        itemIds: [tops[0].id, bottoms[0].id, ...(shoes[0] ? [shoes[0].id] : [])],
        occasion: 'casual',
        season: 'all',
        rating: 5,
        favorite: true,
        wornCount: 2,
        createdAt: Date.now() - 86400000 * 2,
      });
    }

    if (tops[1] && bottoms[1]) {
      starterOutfits.push({
        id: `starter-outfit-2`,
        name: 'Smart Weekend Look',
        itemIds: [tops[1].id, bottoms[1].id, ...(shoes[1] || shoes[0] ? [(shoes[1] || shoes[0]).id] : [])],
        occasion: 'casual',
        season: 'all',
        rating: 4,
        favorite: false,
        wornCount: 1,
        createdAt: Date.now() - 86400000,
      });
    }

    if (starterOutfits.length > 0) {
      await outfitsRepo.saveBatch(starterOutfits);
      await loadData();
      showToast('Starter lookbook outfits added!');
    }
  };

  // Studio Mode View
  if (mode === 'studio') {
    return (
      <OutfitStudio
        closetItems={closetItems}
        profile={profile}
        preferences={preferences}
        onClose={() => setMode('gallery')}
        onSaved={async (saved) => {
          await loadData();
          setMode('gallery');
          showToast(`Saved "${saved.name}" to Lookbook`);
        }}
      />
    );
  }

  // Capsule Creator Mode View
  if (mode === 'capsule') {
    return (
      <CapsuleCreator
        closetItems={closetItems}
        onClose={() => setMode('gallery')}
        onBatchSaved={async (count) => {
          await loadData();
          showToast(`Saved ${count} capsule outfits to Lookbook!`);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-text-primary text-surface text-xs font-semibold shadow-soft flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Lookbook Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              Saved Outfits Lookbook
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary-soft text-primary">
              {filteredOutfits.length} Looks
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Your personal catalog of complete outfits assembled on-device.
          </p>
        </div>

        {/* Primary Creation Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMode('capsule')}
            leftIcon={<Layers className="w-3.5 h-3.5 text-accent" />}
          >
            Capsule Studio
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setMode('studio')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Build Outfit
          </Button>
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Occasion Chips */}
          <div className="flex flex-wrap gap-1.5">
            {['all', 'casual', 'work', 'class', 'date', 'party', 'travel'].map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => setSelectedOccasion(occ)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors capitalize ${
                  selectedOccasion === occ
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-surface-alt border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                onlyFavorites
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-surface border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-accent text-accent' : ''}`} />
              <span>Favorites</span>
            </button>

            <select
              value={sortBy}
              aria-label="Sort lookbook outfits"
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'worn' | 'rating' | 'name')}
              className="px-3 py-1 rounded-control bg-surface border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="recent">Recently Created</option>
              <option value="worn">Most Worn</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Outfits Grid */}
      {filteredOutfits.length === 0 ? (
        <div className="p-12 text-center rounded-card bg-surface border border-border space-y-4 shadow-soft">
          <Sparkles className="w-10 h-10 text-primary mx-auto" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-text-primary">
              No Outfits Found in Lookbook
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              You haven't saved any outfits matching these filters yet. Create your first look in the Outfit Studio or load starter styles.
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Button variant="primary" size="md" onClick={() => setMode('studio')} leftIcon={<Plus className="w-4 h-4" />}>
              Build First Outfit
            </Button>
            {closetItems.length >= 2 && (
              <Button variant="secondary" size="md" onClick={handleSeedStarterLooks}>
                Generate Starter Looks
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOutfits.map((outfit) => {
            const itemsInOutfit = outfit.itemIds
              .map((id) => itemMap.get(id))
              .filter((i): i is ClothingItem => Boolean(i));

            return (
              <div
                key={outfit.id}
                className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                {/* Outfit Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-alt text-text-secondary capitalize">
                        {outfit.occasion || 'Casual'}
                      </span>
                      {outfit.wornCount > 0 && (
                        <span className="text-[10px] font-semibold text-text-secondary">
                          · Worn {outfit.wornCount}x
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-base font-bold text-text-primary mt-1 line-clamp-1">
                      {outfit.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    aria-label={outfit.favorite ? 'Unfavorite outfit' : 'Favorite outfit'}
                    onClick={(e) => handleToggleFavorite(outfit.id, e)}
                    className="p-1 text-text-secondary hover:text-accent transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        outfit.favorite ? 'fill-accent text-accent' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Garment Cutouts Collage Grid */}
                <div className="grid grid-cols-3 gap-2 bg-surface-alt/40 p-2 rounded-control border border-border/50">
                  {itemsInOutfit.slice(0, 3).map((item) => {
                    const cutoutSvg = SAMPLE_CUTOUT_SVGS[item.id];
                    return (
                      <div
                        key={item.id}
                        className="h-20 bg-surface rounded-control border border-border/50 flex flex-col items-center justify-center p-1 overflow-hidden"
                      >
                        {cutoutSvg ? (
                          <div
                            className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                            dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                          />
                        ) : (
                          <Sparkles className="w-4 h-4 text-primary" />
                        )}
                        <span className="text-[9px] text-text-secondary truncate w-full text-center mt-0.5">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Star Rating & Card Actions */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={(e) => handleSetRating(outfit.id, star as 1 | 2 | 3 | 4 | 5, e)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            star <= (outfit.rating || 0)
                              ? 'fill-warning text-warning'
                              : 'text-border'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Delete outfit"
                      onClick={() => setDeleteTargetId(outfit.id)}
                      className="p-1.5 rounded-control text-text-secondary hover:text-danger hover:bg-surface-alt transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => handleWearOutfit(outfit, e)}
                    >
                      Wear Today
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteOutfit}
        title="Remove Outfit from Lookbook?"
        description="Your clothing items will remain safely in your closet. Only this saved outfit combination will be deleted."
        confirmLabel="Remove Outfit"
        isDestructive={true}
      />
    </div>
  );
};
