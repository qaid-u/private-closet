import React from 'react';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';

export interface ItemCardProps {
  id: string;
  name: string;
  category: string;
  colorHex?: string;
  cutoutUrl?: string;
  isFavorite?: boolean;
  suitsPalette?: boolean;
  status?: 'clean' | 'dirty' | 'at-cleaner' | 'needs-repair' | 'in-storage';
  isSelected?: boolean;
  onSelect?: () => void;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  className?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  name,
  category,
  colorHex = '#C8745A',
  cutoutUrl,
  isFavorite = false,
  suitsPalette = false,
  status = 'clean',
  isSelected = false,
  onSelect,
  onToggleFavorite,
  onClick,
  className = '',
}) => {
  const isDirty = status !== 'clean';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative bg-surface border rounded-card p-3 sm:p-4 flex flex-col justify-between transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSelected
          ? 'border-primary ring-2 ring-primary/30 shadow-card'
          : 'border-border hover:shadow-card'
      } ${className}`}
    >
      {/* Top Badges / Actions */}
      <div className="flex items-center justify-between w-full mb-2">
        {suitsPalette ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary">
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Suits you
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${name}`}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer mr-1"
            />
          )}

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(e);
              }}
              aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
              className="p-1.5 rounded-control hover:bg-surface-alt transition-colors min-h-touch min-w-touch flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-text-secondary hover:text-accent"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorite ? 'fill-accent text-accent' : 'text-text-secondary'
                }`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      {/* Image / Cutout Display */}
      <div className="aspect-square w-full rounded-control bg-surface-alt border border-border/50 flex items-center justify-center relative overflow-hidden mb-3">
        {cutoutUrl ? (
          <img
            src={cutoutUrl}
            alt={name}
            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full shadow-soft transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundColor: colorHex }}
          />
        )}

        {isDirty && (
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/20 text-warning border border-warning/30 backdrop-blur-xs">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            {status}
          </span>
        )}
      </div>

      {/* Item Metadata */}
      <div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
          {category}
        </span>
        <h3 className="font-semibold text-xs sm:text-sm text-text-primary truncate mt-0.5">
          {name}
        </h3>
      </div>
    </div>
  );
};
