import React from 'react';
import { Sparkles } from 'lucide-react';

export interface FilterChipOption {
  id: string;
  label: string;
  count?: number;
  hasSparkle?: boolean;
}

export interface FilterChipsProps {
  options: FilterChipOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selectedId,
  onSelect,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      aria-label="Filter closet categories"
      className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full ${className}`}
    >
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(opt.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-touch transition-all flex items-center gap-1.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? 'bg-primary text-white font-semibold shadow-soft'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt'
            }`}
          >
            {opt.hasSparkle && <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />}
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-surface-alt text-text-secondary'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
