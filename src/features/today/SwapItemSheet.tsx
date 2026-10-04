import React, { useState, useMemo } from 'react';
import { RefreshCw, Check, Sparkles } from 'lucide-react';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { ScoredOutfit, SwapAlternative, RecommendationContext } from '../../engine/types';
import { rankAlternatives } from '../../engine/outfitGenerator';
import { ClothingItem, StyleProfile, Preferences, WearLog } from '../../data/types';
import { SAMPLE_CUTOUT_SVGS } from '../../data/sampleCutouts';

interface SwapItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: ScoredOutfit | null;
  allItems: ClothingItem[];
  context: RecommendationContext;
  profile?: StyleProfile | null;
  preferences?: Preferences | null;
  wearLogs?: WearLog[];
  onSwap: (slot: keyof ScoredOutfit['slots'], newItem: ClothingItem) => void;
}

export const SwapItemSheet: React.FC<SwapItemSheetProps> = ({
  isOpen,
  onClose,
  outfit,
  allItems,
  context,
  profile,
  preferences,
  wearLogs,
  onSwap,
}) => {
  const [activeSlot, setActiveSlot] = useState<keyof ScoredOutfit['slots']>('top');

  // Compute available slots in this outfit
  const availableSlots = useMemo(() => {
    if (!outfit) return [];
    const list: { slot: keyof ScoredOutfit['slots']; label: string; currentItem?: ClothingItem }[] = [];
    if (outfit.slots.top) list.push({ slot: 'top', label: 'Top', currentItem: outfit.slots.top });
    if (outfit.slots.bottom) list.push({ slot: 'bottom', label: 'Bottom', currentItem: outfit.slots.bottom });
    if (outfit.slots.outerwear) list.push({ slot: 'outerwear', label: 'Layer', currentItem: outfit.slots.outerwear });
    if (outfit.slots.shoes) list.push({ slot: 'shoes', label: 'Shoes', currentItem: outfit.slots.shoes });
    if (outfit.slots.dress) list.push({ slot: 'dress', label: 'Dress', currentItem: outfit.slots.dress });
    if (outfit.slots.accessory) list.push({ slot: 'accessory', label: 'Accessory', currentItem: outfit.slots.accessory });
    return list;
  }, [outfit]);

  // Sync active slot if current active is not in available slots
  React.useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.some((s) => s.slot === activeSlot)) {
      setActiveSlot(availableSlots[0].slot);
    }
  }, [availableSlots, activeSlot]);

  // Compute ranked alternatives for active slot
  const alternatives: SwapAlternative[] = useMemo(() => {
    if (!outfit) return [];
    return rankAlternatives(
      outfit,
      activeSlot,
      allItems,
      context,
      profile,
      preferences,
      wearLogs
    );
  }, [outfit, activeSlot, allItems, context, profile, preferences, wearLogs]);

  if (!outfit) return null;

  const currentItem = outfit.slots[activeSlot];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Swap an item">
      <div className="space-y-6">
        {/* Slot selector tabs */}
        <div>
          <span className="text-xs font-semibold text-text-secondary mb-2 block">
            Choose piece to swap:
          </span>
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((s) => (
              <button
                key={s.slot}
                type="button"
                onClick={() => setActiveSlot(s.slot)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeSlot === s.slot
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-surface-alt border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{s.label}</span>
                {activeSlot === s.slot && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* Current piece indicator */}
        {currentItem && (
          <div className="p-3 rounded-control bg-surface-alt border border-border flex items-center gap-3">
            <div className="w-12 h-12 rounded-control bg-surface flex items-center justify-center overflow-hidden shrink-0 border border-border">
              {SAMPLE_CUTOUT_SVGS[currentItem.id] ? (
                <div
                  className="w-full h-full p-1.5 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                  dangerouslySetInnerHTML={{ __html: SAMPLE_CUTOUT_SVGS[currentItem.id] }}
                />
              ) : (
                <Sparkles className="w-5 h-5 text-text-secondary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                Currently In Outfit
              </span>
              <p className="text-xs font-bold text-text-primary truncate">
                {currentItem.name}
              </p>
            </div>
          </div>
        )}

        {/* Ranked Alternatives List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-bold text-text-primary">
              Ranked Alternatives from Closet ({alternatives.length})
            </h4>
            <span className="text-[11px] text-text-secondary">Best match first</span>
          </div>

          {alternatives.length === 0 ? (
            <div className="p-6 rounded-card bg-surface-alt text-center text-xs text-text-secondary">
              No other clean {activeSlot} items available in your closet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {alternatives.map((alt) => {
                const item = alt.item;
                const cutoutSvg = SAMPLE_CUTOUT_SVGS[item.id];

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-control bg-surface border border-border hover:border-primary transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-surface-alt flex items-center justify-center text-[11px] font-bold text-text-secondary shrink-0">
                        #{alt.rank}
                      </div>

                      <div className="w-12 h-12 rounded-control bg-surface-alt flex items-center justify-center overflow-hidden shrink-0 border border-border">
                        {cutoutSvg ? (
                          <div
                            className="w-full h-full p-1.5 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                            dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                          />
                        ) : (
                          <Sparkles className="w-5 h-5 text-primary" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-text-primary truncate">
                            {item.name}
                          </p>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              alt.matchLabel === 'High'
                                ? 'bg-success/15 text-success'
                                : alt.matchLabel === 'Medium'
                                ? 'bg-warning/15 text-warning'
                                : 'bg-text-secondary/15 text-text-secondary'
                            }`}
                          >
                            {alt.matchLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary truncate mt-0.5">
                          {alt.reason}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onSwap(activeSlot, item);
                        onClose();
                      }}
                      rightIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Swap
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
};
