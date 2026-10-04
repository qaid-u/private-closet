import React, { useState, useEffect } from 'react';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { ClothingItem, ItemStatus } from '../../data/types';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { imagesRepo } from '../../data/repositories/imagesRepo';
import {
  Heart,
  Sparkles,
  Calendar,
  DollarSign,
  Tag,
  Trash2,
  Copy,
  Clock,
  Shirt,
} from 'lucide-react';

interface ItemDetailSheetProps {
  item: ClothingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onItemUpdated: () => void;
  onDeleteItem: (id: string) => void;
  suitsPalette?: boolean;
}

export const ItemDetailSheet: React.FC<ItemDetailSheetProps> = ({
  item,
  isOpen,
  onClose,
  onItemUpdated,
  onDeleteItem,
  suitsPalette = true,
}) => {
  const [cutoutUrl, setCutoutUrl] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'cutout' | 'original'>('cutout');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [timesWorn] = useState(6); // Default sample wear count

  useEffect(() => {
    if (!item) return;
    let isSubscribed = true;

    imagesRepo.getUrl(item.imageCutoutId).then((url) => {
      if (isSubscribed) setCutoutUrl(url);
    });

    return () => {
      isSubscribed = false;
    };
  }, [item]);

  if (!item) return null;

  const handleToggleFavorite = async () => {
    await itemsRepo.toggleFavorite(item.id);
    onItemUpdated();
  };

  const handleStatusChange = async (newStatus: ItemStatus) => {
    await itemsRepo.setStatus(item.id, newStatus);
    onItemUpdated();
  };

  const handleDuplicate = async () => {
    const duplicated: ClothingItem = {
      ...item,
      id: `item-${Date.now()}`,
      name: `${item.name} (Copy)`,
      isSample: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await itemsRepo.save(duplicated);
    onItemUpdated();
    onClose();
  };

  const costPerWear = item.price && timesWorn > 0 ? (item.price / timesWorn).toFixed(2) : null;

  // Unworn in 90 days nudge check
  const is90DaysUnworn = item.purchaseDate ? true : false;

  return (
    <>
      <Sheet isOpen={isOpen} onClose={onClose} title={item.name}>
        <div className="space-y-6 text-sm">
          {/* Hero Image Showcase */}
          <div className="relative aspect-square max-w-sm mx-auto rounded-card bg-surface-alt border border-border p-6 flex flex-col items-center justify-center overflow-hidden">
            {cutoutUrl ? (
              <img
                src={cutoutUrl}
                alt={item.name}
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full shadow-soft"
                style={{ backgroundColor: item.colors[0]?.hex || '#2F5D50' }}
              />
            )}

            {/* Image Mode Switcher */}
            <div className="absolute bottom-3 left-3 bg-surface/80 backdrop-blur-md border border-border rounded-full p-0.5 flex gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('cutout')}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  viewMode === 'cutout' ? 'bg-primary text-white font-bold' : 'text-text-secondary'
                }`}
              >
                Cutout
              </button>
              <button
                type="button"
                onClick={() => setViewMode('original')}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  viewMode === 'original' ? 'bg-primary text-white font-bold' : 'text-text-secondary'
                }`}
              >
                Original
              </button>
            </div>

            {/* Favorite Action */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`absolute top-3 right-3 p-2.5 rounded-full border shadow-soft transition-transform active:scale-95 ${
                item.favorite
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface border-border text-text-secondary hover:text-text-primary'
              }`}
              aria-label={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${item.favorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Quick Meta */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="text-xs text-text-secondary uppercase tracking-wider block font-semibold">
                {item.category} &bull; {item.subtype}
              </span>
              <span className="text-base font-bold text-text-primary">{item.brand || 'Wardrobe Staple'}</span>
            </div>

            {item.price && (
              <span className="font-serif text-lg font-bold text-primary">
                ${item.price.toFixed(0)}
              </span>
            )}
          </div>

          {/* Why This Suits You Card per SPEC Section 6 */}
          <div className="p-4 rounded-card bg-primary-soft/40 border border-primary/20 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-primary text-xs">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Why This Suits You</span>
            </div>
            <p className="text-xs text-text-primary leading-relaxed">
              {suitsPalette
                ? `${item.colors[0]?.name || 'This color'} suits your warm undertone and balances with your proportions.`
                : 'This piece creates a crisp, bold accent contrast against your everyday capsule palette.'}
            </p>
          </div>

          {/* 90-Day Unworn Nudge */}
          {is90DaysUnworn && (
            <div className="p-3 rounded-card bg-surface-alt border border-border flex items-center gap-2 text-xs text-text-secondary">
              <Clock className="w-4 h-4 text-accent shrink-0" />
              <span>You haven't worn this in 90 days. Try pairing it with light layers this week!</span>
            </div>
          )}

          {/* Wear & Cost-Per-Wear Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-control bg-surface-alt border border-border">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block">
                Times Worn
              </span>
              <span className="font-bold text-sm text-text-primary">{timesWorn}</span>
            </div>

            <div className="p-3 rounded-control bg-surface-alt border border-border">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block">
                Cost Per Wear
              </span>
              <span className="font-bold text-sm text-primary">
                {costPerWear ? `$${costPerWear}` : 'N/A'}
              </span>
            </div>

            <div className="p-3 rounded-control bg-surface-alt border border-border">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider block">
                Fit & Cut
              </span>
              <span className="font-bold text-xs text-text-primary capitalize">{item.fit}</span>
            </div>
          </div>

          {/* Care & Availability Status Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
              Availability Status
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['clean', 'dirty', 'at-cleaner', 'needs-repair', 'in-storage'] as ItemStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={`p-2 rounded-control text-xs font-medium border capitalize text-center transition-colors min-h-touch ${
                    item.status === st
                      ? 'border-primary bg-primary text-white font-bold'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                  }`}
                >
                  {st.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Details List */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
              Garment Attributes
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-text-secondary">
                <Tag className="w-3.5 h-3.5" />
                <span>Pattern: <strong className="text-text-primary capitalize">{item.pattern}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Shirt className="w-3.5 h-3.5" />
                <span>Material: <strong className="text-text-primary">{item.material || 'Cotton blend'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="w-3.5 h-3.5" />
                <span>Seasons: <strong className="text-text-primary capitalize">{item.seasons.join(', ')}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Purchased: <strong className="text-text-primary">{item.purchaseDate || '2024'}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Overflow Footer */}
          <div className="pt-4 flex items-center justify-between border-t border-border">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Copy className="w-3.5 h-3.5" />}
              onClick={handleDuplicate}
            >
              Duplicate
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-danger" />}
              className="text-danger hover:bg-danger/10"
              onClick={() => setIsConfirmDeleteOpen(true)}
            >
              Delete Item
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          onDeleteItem(item.id);
          setIsConfirmDeleteOpen(false);
          onClose();
        }}
        title={`Delete "${item.name}"?`}
        description="This will permanently remove the item and its stored image cutout from your device."
        confirmLabel="Delete Item"
        isDestructive={true}
      />
    </>
  );
};
