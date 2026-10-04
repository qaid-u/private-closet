import React from 'react';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { Category, Season, ItemStatus } from '../../data/types';
import { Check } from 'lucide-react';

export type SortOption = 'recent' | 'name' | 'worn-count' | 'price' | 'last-worn';

export interface FilterState {
  sort: SortOption;
  category?: Category | 'all';
  status?: ItemStatus | 'all';
  season?: Season | 'all';
  suitsPaletteOnly?: boolean;
}

interface SortFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export const SortFilterSheet: React.FC<SortFilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'recent', label: 'Recently Added' },
    { id: 'name', label: 'Name (A to Z)' },
    { id: 'worn-count', label: 'Most Worn' },
    { id: 'price', label: 'Price' },
    { id: 'last-worn', label: 'Last Worn Date' },
  ];

  const statusOptions: { id: ItemStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All Statuses' },
    { id: 'clean', label: 'Clean' },
    { id: 'dirty', label: 'In Laundry' },
    { id: 'at-cleaner', label: 'At Cleaner' },
    { id: 'needs-repair', label: 'Needs Repair' },
    { id: 'in-storage', label: 'In Storage' },
  ];

  const seasonOptions: { id: Season | 'all'; label: string }[] = [
    { id: 'all', label: 'All Seasons' },
    { id: 'spring', label: 'Spring' },
    { id: 'summer', label: 'Summer' },
    { id: 'autumn', label: 'Autumn' },
    { id: 'winter', label: 'Winter' },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Sort & Filter Closet">
      <div className="space-y-6 text-sm">
        {/* Sort Order */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Sort Order
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, sort: opt.id })}
                className={`p-2.5 rounded-control text-xs font-medium border text-left flex items-center justify-between transition-colors min-h-touch ${
                  localFilters.sort === opt.id
                    ? 'border-primary bg-primary-soft text-primary font-bold shadow-soft'
                    : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                }`}
              >
                <span>{opt.label}</span>
                {localFilters.sort === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Care & Availability
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {statusOptions.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, status: st.id })}
                className={`p-2 rounded-control text-xs font-medium border text-center transition-colors min-h-touch ${
                  localFilters.status === st.id
                    ? 'border-primary bg-primary-soft text-primary font-bold'
                    : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Season Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Season
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {seasonOptions.map((sn) => (
              <button
                key={sn.id}
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, season: sn.id })}
                className={`p-2 rounded-control text-xs font-medium border capitalize text-center transition-colors min-h-touch ${
                  localFilters.season === sn.id
                    ? 'border-primary bg-primary-soft text-primary font-bold'
                    : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                }`}
              >
                {sn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 flex items-center justify-between border-t border-border">
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            Reset Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onApplyFilters(localFilters);
                onClose();
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};
