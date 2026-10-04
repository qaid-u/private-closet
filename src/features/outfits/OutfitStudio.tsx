import React, { useState, useMemo } from 'react';
import {
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Plus,
  Save,
  Search,
  Check,
  X,
  Heart,
  Star,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { ClothingItem, StyleProfile, Preferences, Outfit } from '../../data/types';
import { outfitsRepo } from '../../data/repositories/outfitsRepo';
import { SAMPLE_CUTOUT_SVGS } from '../../data/sampleCutouts';
import { CheckOutfitModal } from './CheckOutfitModal';

interface OutfitStudioProps {
  closetItems: ClothingItem[];
  profile: StyleProfile | null;
  preferences: Preferences | null;
  onClose: () => void;
  onSaved: (outfit: Outfit) => void;
}

type SlotKey = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';

interface CanvasState {
  top?: ClothingItem;
  bottom?: ClothingItem;
  dress?: ClothingItem;
  outerwear?: ClothingItem;
  shoes?: ClothingItem;
  accessory?: ClothingItem;
}

export const OutfitStudio: React.FC<OutfitStudioProps> = ({
  closetItems,
  profile,
  preferences,
  onClose,
  onSaved,
}) => {
  // History state for Undo / Redo
  const [history, setHistory] = useState<CanvasState[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentCanvas = useMemo(() => history[historyIndex] || {}, [history, historyIndex]);

  // Active drawer category filter & search
  const [drawerCategory, setDrawerCategory] = useState<ClothingItem['category']>('top');
  const [drawerSearch, setDrawerSearch] = useState('');

  // Check outfit modal state
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);

  // Save outfit dialog state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('casual');
  const [outfitSeason, setOutfitSeason] = useState('all');
  const [outfitRating, setOutfitRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeItemsList = useMemo(() => {
    return Object.values(currentCanvas).filter((i): i is ClothingItem => Boolean(i));
  }, [currentCanvas]);

  const updateCanvas = (next: CanvasState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(next);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSelectSlotItem = (item: ClothingItem) => {
    const next: CanvasState = { ...currentCanvas };

    if (item.category === 'dress') {
      next.dress = item;
      delete next.top;
      delete next.bottom;
    } else if (item.category === 'top') {
      next.top = item;
      delete next.dress;
    } else if (item.category === 'bottom') {
      next.bottom = item;
      delete next.dress;
    } else if (item.category === 'outerwear') {
      next.outerwear = item;
    } else if (item.category === 'shoes') {
      next.shoes = item;
    } else if (item.category === 'accessory') {
      next.accessory = item;
    }

    updateCanvas(next);
  };

  const handleRemoveSlot = (slot: SlotKey) => {
    const next = { ...currentCanvas };
    delete next[slot];
    updateCanvas(next);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleClear = () => {
    updateCanvas({});
  };

  const handleSaveOutfit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeItemsList.length < 2) return;
    setIsSaving(true);
    try {
      const saved = await outfitsRepo.create({
        name: outfitName.trim() || 'My Custom Outfit',
        itemIds: activeItemsList.map((i) => i.id),
        occasion: outfitOccasion,
        season: outfitSeason,
        rating: outfitRating,
        favorite: isFavorite,
      });

      onSaved(saved);
      setIsSaveModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter closet items for drawer
  const filteredDrawerItems = useMemo(() => {
    return closetItems.filter((item) => {
      const matchCat = item.category === drawerCategory;
      const matchSearch =
        !drawerSearch.trim() ||
        item.name.toLowerCase().includes(drawerSearch.toLowerCase()) ||
        item.colors.some((c) => c.name.toLowerCase().includes(drawerSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [closetItems, drawerCategory, drawerSearch]);

  const slotsToRender: { key: SlotKey; label: string; item?: ClothingItem }[] = currentCanvas.dress
    ? [
        { key: 'dress', label: 'Dress', item: currentCanvas.dress },
        { key: 'outerwear', label: 'Layer / Jacket', item: currentCanvas.outerwear },
        { key: 'shoes', label: 'Footwear', item: currentCanvas.shoes },
        { key: 'accessory', label: 'Accessory', item: currentCanvas.accessory },
      ]
    : [
        { key: 'top', label: 'Top', item: currentCanvas.top },
        { key: 'bottom', label: 'Bottom', item: currentCanvas.bottom },
        { key: 'outerwear', label: 'Layer / Jacket', item: currentCanvas.outerwear },
        { key: 'shoes', label: 'Footwear', item: currentCanvas.shoes },
        { key: 'accessory', label: 'Accessory', item: currentCanvas.accessory },
      ];

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              Outfit Studio
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary-soft text-primary">
              Manual Canvas
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Assemble complete outfits from your closet with instant color and proportion feedback.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            aria-label="Undo"
            disabled={historyIndex === 0}
            onClick={handleUndo}
            className="p-2 rounded-control bg-surface border border-border disabled:opacity-30 hover:border-primary text-text-secondary hover:text-text-primary transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            disabled={historyIndex === history.length - 1}
            onClick={handleRedo}
            className="p-2 rounded-control bg-surface border border-border disabled:opacity-30 hover:border-primary text-text-secondary hover:text-text-primary transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Clear canvas"
            onClick={handleClear}
            disabled={activeItemsList.length === 0}
            className="p-2 rounded-control bg-surface border border-border disabled:opacity-30 hover:border-danger hover:text-danger text-text-secondary transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCheckModalOpen(true)}
            disabled={activeItemsList.length < 2}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-primary" />}
          >
            Check Balance
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setOutfitName(`Look ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`);
              setIsSaveModalOpen(true);
            }}
            disabled={activeItemsList.length < 2}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Outfit
          </Button>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Back to Lookbook
          </Button>
        </div>
      </div>

      {/* Main Studio Viewport: Canvas on Left, Closet Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Assembly Canvas (8 cols on desktop) */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-card p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Outfit Composition ({activeItemsList.length} items)
            </span>
            {activeItemsList.length < 2 && (
              <span className="text-[11px] text-text-secondary italic">
                Pick at least 2 pieces from the drawer
              </span>
            )}
          </div>

          {/* Slot Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slotsToRender.map(({ key, label, item }) => {
              const cutoutSvg = item ? SAMPLE_CUTOUT_SVGS[item.id] : null;

              return (
                <div
                  key={key}
                  className={`p-4 rounded-card border transition-all flex flex-col items-center text-center justify-between min-h-[190px] relative group ${
                    item
                      ? 'bg-surface-alt/60 border-border hover:border-primary/50'
                      : 'bg-surface border-dashed border-border/80 hover:border-primary hover:bg-surface-alt/30 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!item) {
                      setDrawerCategory(key === 'dress' ? 'dress' : key === 'outerwear' ? 'outerwear' : key === 'shoes' ? 'shoes' : key === 'accessory' ? 'accessory' : key === 'bottom' ? 'bottom' : 'top');
                    }
                  }}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                      {label}
                    </span>
                    {item && (
                      <button
                        type="button"
                        aria-label={`Remove ${label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSlot(key);
                        }}
                        className="text-text-secondary hover:text-danger p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {item ? (
                    <>
                      <div className="w-24 h-24 rounded-control bg-surface flex items-center justify-center overflow-hidden border border-border/50 shadow-soft p-1 my-auto">
                        {cutoutSvg ? (
                          <div
                            className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                            dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                          />
                        ) : (
                          <Sparkles className="w-6 h-6 text-primary" />
                        )}
                      </div>

                      <div className="w-full">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-text-secondary truncate">
                          {item.colors[0]?.name || 'Solid'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="my-auto flex flex-col items-center justify-center gap-1.5 text-text-secondary group-hover:text-primary transition-colors">
                      <div className="w-10 h-10 rounded-full border border-dashed border-border flex items-center justify-center group-hover:border-primary">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium">Add {label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Closet Items Drawer (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-card p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-text-primary">
              Wardrobe Items
            </h3>
            <span className="text-[11px] text-text-secondary">
              {filteredDrawerItems.length} available
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={drawerSearch}
              onChange={(e) => setDrawerSearch(e.target.value)}
              placeholder="Search by name or color..."
              className="w-full pl-8 pr-3 py-1.5 rounded-control bg-surface-alt border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-border pb-2">
            {(['top', 'bottom', 'outerwear', 'shoes', 'dress', 'accessory'] as ClothingItem['category'][]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDrawerCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors capitalize ${
                    drawerCategory === cat
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-surface-alt text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {cat === 'outerwear' ? 'Layer' : cat}
                </button>
              )
            )}
          </div>

          {/* Drawer Items Grid */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredDrawerItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-secondary rounded-control bg-surface-alt">
                No items found for {drawerCategory}.
              </div>
            ) : (
              filteredDrawerItems.map((item) => {
                const isSelected = activeItemsList.some((i) => i.id === item.id);
                const cutoutSvg = SAMPLE_CUTOUT_SVGS[item.id];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSlotItem(item)}
                    className={`w-full p-2.5 rounded-control border text-left flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-soft'
                        : 'bg-surface border-border hover:bg-surface-alt hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-control bg-surface-alt flex items-center justify-center overflow-hidden border border-border shrink-0">
                        {cutoutSvg ? (
                          <div
                            className="w-full h-full p-1 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                            dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                          />
                        ) : (
                          <Sparkles className="w-4 h-4 text-primary" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-text-secondary truncate">
                          {item.colors[0]?.name || 'Solid'} · {item.fit}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-primary">
                          Use
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Check Outfit Modal */}
      <CheckOutfitModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        items={activeItemsList}
        profile={profile}
        preferences={preferences}
      />

      {/* Save Outfit Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Outfit to Lookbook"
      >
        <form onSubmit={handleSaveOutfit} className="space-y-4">
          <Input
            label="Outfit Name"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            placeholder="e.g. Smart Office Linen Set"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Occasion"
              value={outfitOccasion}
              onChange={(e) => setOutfitOccasion(e.target.value)}
              options={[
                { value: 'casual', label: 'Casual' },
                { value: 'work', label: 'Work' },
                { value: 'class', label: 'Class' },
                { value: 'date', label: 'Date' },
                { value: 'party', label: 'Party' },
                { value: 'travel', label: 'Travel' },
              ]}
            />

            <Select
              label="Season"
              value={outfitSeason}
              onChange={(e) => setOutfitSeason(e.target.value)}
              options={[
                { value: 'all', label: 'All Year' },
                { value: 'spring', label: 'Spring' },
                { value: 'summer', label: 'Summer' },
                { value: 'autumn', label: 'Autumn' },
                { value: 'winter', label: 'Winter' },
              ]}
            />
          </div>

          {/* Star Rating Selection */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-text-primary block">
              Rating
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOutfitRating(star as 1 | 2 | 3 | 4 | 5)}
                  className="p-1 text-text-secondary hover:text-warning transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= outfitRating
                        ? 'fill-warning text-warning'
                        : 'text-border'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex items-center gap-2 text-xs font-semibold text-text-primary py-1"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-accent text-accent' : 'text-text-secondary'
              }`}
            />
            <span>Mark as Favorite</span>
          </button>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button
              variant="ghost"
              size="md"
              type="button"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSaving}
            >
              Save to Lookbook
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
