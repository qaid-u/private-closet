import React from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ClothingItem } from '../../data/types';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { CheckCircle2, RotateCw, Archive, Shirt } from 'lucide-react';

interface CareLaundryViewProps {
  items: ClothingItem[];
  onRefresh: () => void;
}

export const CareLaundryView: React.FC<CareLaundryViewProps> = ({ items, onRefresh }) => {
  const dirtyItems = items.filter((i) => i.status === 'dirty');
  const cleanerItems = items.filter((i) => i.status === 'at-cleaner');
  const repairItems = items.filter((i) => i.status === 'needs-repair');
  const storageItems = items.filter((i) => i.status === 'in-storage');

  const handleMarkClean = async (id: string) => {
    await itemsRepo.setStatus(id, 'clean');
    onRefresh();
  };

  const handleMarkDirty = async (id: string) => {
    await itemsRepo.setStatus(id, 'dirty');
    onRefresh();
  };

  const handleMarkCleanAllDirty = async () => {
    const ids = dirtyItems.map((i) => i.id);
    await itemsRepo.setBatchStatus(ids, 'clean');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Seasonal Rotation Suggestion Card per SPEC Section 6 */}
      <Card className="p-4 bg-primary-soft/40 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
            <Archive className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-serif text-sm font-bold text-text-primary">
              Seasonal Rotation Suggestion
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Transitioning into milder weather? Consider moving heavy winter wool coats into seasonal storage to streamline your morning Today feed.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const coats = items.filter((i) => i.warmth === 3 && i.status === 'clean');
            await itemsRepo.setBatchStatus(coats.map((c) => c.id), 'in-storage');
            onRefresh();
          }}
          className="shrink-0 text-xs"
        >
          Store Winter Layers
        </Button>
      </Card>

      {/* Laundry & Care Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-card bg-surface border border-border">
          <span className="text-[10px] uppercase font-bold text-text-secondary block">
            Needs Wash
          </span>
          <span className="text-xl font-bold font-serif text-accent">{dirtyItems.length}</span>
        </div>
        <div className="p-3 rounded-card bg-surface border border-border">
          <span className="text-[10px] uppercase font-bold text-text-secondary block">
            At Cleaner
          </span>
          <span className="text-xl font-bold font-serif text-text-primary">{cleanerItems.length}</span>
        </div>
        <div className="p-3 rounded-card bg-surface border border-border">
          <span className="text-[10px] uppercase font-bold text-text-secondary block">
            Needs Repair
          </span>
          <span className="text-xl font-bold font-serif text-danger">{repairItems.length}</span>
        </div>
        <div className="p-3 rounded-card bg-surface border border-border">
          <span className="text-[10px] uppercase font-bold text-text-secondary block">
            In Storage
          </span>
          <span className="text-xl font-bold font-serif text-text-secondary">{storageItems.length}</span>
        </div>
      </div>

      {/* In Laundry List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-accent" />
            <h3 className="font-serif text-base font-bold text-text-primary">
              Laundry Basket ({dirtyItems.length})
            </h3>
          </div>
          {dirtyItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-success" />}
              onClick={handleMarkCleanAllDirty}
              className="text-xs"
            >
              Wash & Mark All Clean
            </Button>
          )}
        </div>

        {dirtyItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dirtyItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-control bg-surface border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: item.colors[0]?.hex }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">{item.name}</span>
                    <span className="text-[10px] text-text-secondary capitalize">{item.category}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkClean(item.id)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                  className="text-xs"
                >
                  Mark Clean
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-card bg-surface border border-border text-center text-xs text-text-secondary">
            Your laundry basket is empty. All active items are clean and ready for recommendations!
          </div>
        )}
      </div>

      {/* Clean Items Quick Laundry Action */}
      <div className="space-y-3 pt-2">
        <h3 className="font-serif text-base font-bold text-text-primary">
          Quick Laundry Toggle (Clean Items)
        </h3>
        <p className="text-xs text-text-secondary">
          Wore an item? Send it to laundry so the engine avoids recommending it until it's washed.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {items
            .filter((i) => i.status === 'clean')
            .slice(0, 8)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMarkDirty(item.id)}
                className="p-2.5 rounded-control bg-surface border border-border hover:border-accent flex items-center justify-between gap-1.5 transition-colors text-left min-h-touch"
                title={`Mark ${item.name} dirty`}
              >
                <div className="truncate">
                  <span className="text-xs font-medium text-text-primary truncate block">{item.name}</span>
                  <span className="text-[10px] text-text-secondary capitalize">{item.category}</span>
                </div>
                <Shirt className="w-3.5 h-3.5 text-text-secondary shrink-0" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};
