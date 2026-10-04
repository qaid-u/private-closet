import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { ClothingItem, Outfit } from '../../data/types';
import { outfitsRepo } from '../../data/repositories/outfitsRepo';
import { SAMPLE_CUTOUT_SVGS } from '../../data/sampleCutouts';

interface CapsuleCreatorProps {
  closetItems: ClothingItem[];
  onClose: () => void;
  onBatchSaved: (count: number) => void;
}

export const CapsuleCreator: React.FC<CapsuleCreatorProps> = ({
  closetItems,
  onClose,
  onBatchSaved,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    // Default pick first 7 active items if available
    return closetItems.slice(0, 7).map((i) => i.id);
  });

  const [isSaving, setIsSaving] = useState(false);

  const selectedItems = useMemo(() => {
    return closetItems.filter((i) => selectedIds.includes(i.id));
  }, [closetItems, selectedIds]);

  const tops = useMemo(() => selectedItems.filter((i) => i.category === 'top'), [selectedItems]);
  const bottoms = useMemo(() => selectedItems.filter((i) => i.category === 'bottom'), [selectedItems]);
  const layers = useMemo(() => selectedItems.filter((i) => i.category === 'outerwear'), [selectedItems]);
  const shoes = useMemo(() => selectedItems.filter((i) => i.category === 'shoes'), [selectedItems]);

  // Compute all valid combinations
  const validOutfits = useMemo(() => {
    const list: { name: string; items: ClothingItem[] }[] = [];

    for (const top of tops) {
      for (const bottom of bottoms) {
        const shoe = shoes[0]; // best or first available shoe
        const items = [top, bottom];
        if (shoe) items.push(shoe);

        list.push({
          name: `${top.name} with ${bottom.name}`,
          items,
        });

        // Layered option if layer exists
        for (const layer of layers) {
          const layeredItems = [top, bottom, layer];
          if (shoe) layeredItems.push(shoe);
          list.push({
            name: `${layer.name} over ${top.name}`,
            items: layeredItems,
          });
        }
      }
    }

    return list;
  }, [tops, bottoms, layers, shoes]);

  const versatilityScore = Math.min(100, Math.round((validOutfits.length / Math.max(1, selectedItems.length * 1.5)) * 100));

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApplyPreset = (preset: 'work' | 'weekend' | 'minimal') => {
    if (preset === 'work') {
      const workTops = closetItems.filter((i) => i.category === 'top' && i.formality >= 1).slice(0, 3);
      const workBottoms = closetItems.filter((i) => i.category === 'bottom' && i.formality >= 1).slice(0, 2);
      const workLayers = closetItems.filter((i) => i.category === 'outerwear').slice(0, 1);
      const workShoes = closetItems.filter((i) => i.category === 'shoes').slice(0, 2);
      setSelectedIds([...workTops, ...workBottoms, ...workLayers, ...workShoes].map((i) => i.id));
    } else if (preset === 'weekend') {
      const casualTops = closetItems.filter((i) => i.category === 'top' && i.formality <= 1).slice(0, 2);
      const casualBottoms = closetItems.filter((i) => i.category === 'bottom').slice(0, 2);
      const casualLayers = closetItems.filter((i) => i.category === 'outerwear').slice(0, 1);
      const casualShoes = closetItems.filter((i) => i.category === 'shoes').slice(0, 1);
      setSelectedIds([...casualTops, ...casualBottoms, ...casualLayers, ...casualShoes].map((i) => i.id));
    } else if (preset === 'minimal') {
      const solids = closetItems.filter((i) => i.pattern === 'solid').slice(0, 6);
      setSelectedIds(solids.map((i) => i.id));
    }
  };

  const handleSaveAllOutfits = async () => {
    if (validOutfits.length === 0) return;
    setIsSaving(true);
    try {
      const outfitsToSave: Outfit[] = validOutfits.slice(0, 12).map((vo, idx) => ({
        id: `capsule-outfit-${Date.now()}-${idx}`,
        name: vo.name,
        itemIds: vo.items.map((i) => i.id),
        occasion: 'casual',
        season: 'all',
        rating: 4,
        favorite: false,
        wornCount: 0,
        createdAt: Date.now() - idx * 1000,
      }));

      await outfitsRepo.saveBatch(outfitsToSave);
      onBatchSaved(outfitsToSave.length);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Capsule Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              Capsule Wardrobe Studio
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-accent-soft text-accent">
              Capsule Creator
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Select a focused core of garments to unlock maximum outfit versatility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAllOutfits}
            disabled={validOutfits.length === 0}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save All {validOutfits.length} Outfits
          </Button>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Back
          </Button>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="p-4 rounded-card bg-surface border border-border flex flex-wrap items-center justify-between gap-4 shadow-soft">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-text-primary">
            Quick Capsule Presets:
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('work')}
            className="px-3 py-1.5 rounded-full bg-surface-alt border border-border text-xs font-medium text-text-primary hover:border-primary transition-colors"
          >
            Workweek Core (3+2+1)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('weekend')}
            className="px-3 py-1.5 rounded-full bg-surface-alt border border-border text-xs font-medium text-text-primary hover:border-primary transition-colors"
          >
            Weekend Escape
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('minimal')}
            className="px-3 py-1.5 rounded-full bg-surface-alt border border-border text-xs font-medium text-text-primary hover:border-primary transition-colors"
          >
            Minimalist Uniform
          </button>
        </div>
      </div>

      {/* Versatility & Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-card bg-surface border border-border space-y-1 shadow-soft">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Selected Core Pieces
          </span>
          <p className="font-serif text-2xl font-bold text-text-primary">
            {selectedItems.length} Garments
          </p>
          <p className="text-[11px] text-text-secondary">
            {tops.length} tops · {bottoms.length} bottoms · {layers.length} layers · {shoes.length} shoes
          </p>
        </div>

        <div className="p-4 rounded-card bg-surface border border-border space-y-1 shadow-soft">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Complete Outfits Formed
          </span>
          <p className="font-serif text-2xl font-bold text-primary">
            {validOutfits.length} Outfits
          </p>
          <p className="text-[11px] text-text-secondary">
            Every day covered with zero clutter
          </p>
        </div>

        <div className="p-4 rounded-card bg-surface border border-border space-y-1 shadow-soft">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Versatility Index
          </span>
          <p className="font-serif text-2xl font-bold text-accent">
            {versatilityScore}%
          </p>
          <p className="text-[11px] text-text-secondary">
            High cross-pairing efficiency
          </p>
        </div>
      </div>

      {/* Garment Selection Checklist */}
      <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-text-primary">
            Select Capsule Wardrobe Pieces
          </h3>
          <span className="text-xs text-text-secondary">
            Click to add or remove pieces
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {closetItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const cutoutSvg = SAMPLE_CUTOUT_SVGS[item.id];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`p-3 rounded-card border text-center flex flex-col items-center justify-between min-h-[160px] transition-all relative ${
                  isSelected
                    ? 'bg-primary-soft/40 border-primary ring-2 ring-primary/20 shadow-soft'
                    : 'bg-surface-alt/50 border-border hover:border-primary/50'
                }`}
              >
                <div className="w-full flex justify-between items-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-secondary capitalize">
                    {item.category}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="w-16 h-16 rounded-control bg-surface flex items-center justify-center overflow-hidden border border-border/50 shadow-soft p-1 my-auto">
                  {cutoutSvg ? (
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                      dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                    />
                  ) : (
                    <Sparkles className="w-5 h-5 text-primary" />
                  )}
                </div>

                <p className="text-[11px] font-bold text-text-primary truncate w-full mt-1">
                  {item.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pairing Matrix Visualization */}
      {tops.length > 0 && bottoms.length > 0 && (
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-sm font-bold text-text-primary">
                Capsule Pairing Matrix
              </h3>
              <p className="text-xs text-text-secondary">
                Cross-compatibility between your selected tops and bottoms.
              </p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-success/15 text-success">
              {tops.length} x {bottoms.length} Combinations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="p-2.5 font-bold">Tops \ Bottoms</th>
                  {bottoms.map((b) => (
                    <th key={b.id} className="p-2.5 font-bold truncate max-w-[120px]">
                      {b.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tops.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 hover:bg-surface-alt/40">
                    <td className="p-2.5 font-semibold text-text-primary truncate max-w-[140px]">
                      {t.name}
                    </td>
                    {bottoms.map((b) => (
                      <td key={b.id} className="p-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Works</span>
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
