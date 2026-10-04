import React from 'react';
import { Star, Heart, Calendar } from 'lucide-react';

export interface OutfitCardProps {
  id: string;
  name: string;
  items: { name: string; category: string; colorHex?: string }[];
  occasion?: string;
  season?: string;
  rating?: number;
  isFavorite?: boolean;
  wornCount?: number;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  className?: string;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  name,
  items,
  occasion,
  season,
  rating = 4,
  isFavorite = false,
  wornCount = 0,
  onToggleFavorite,
  onClick,
  className = '',
}) => {
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
      className={`group bg-surface border border-border rounded-card p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-card cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-text-primary leading-tight">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
              {occasion && <span className="capitalize">{occasion}</span>}
              {occasion && season && <span>&bull;</span>}
              {season && <span className="capitalize">{season}</span>}
            </div>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              aria-label={isFavorite ? 'Remove outfit from favorites' : 'Add outfit to favorites'}
              className="p-2 rounded-control hover:bg-surface-alt transition-colors min-h-touch min-w-touch flex items-center justify-center text-text-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-accent text-accent' : 'text-text-secondary'}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {/* Clothing Items Preview Tiles */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {items.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-control bg-surface-alt border border-border flex items-center justify-center p-1 relative"
              title={`${item.category}: ${item.name}`}
            >
              <div
                className="w-7 h-7 rounded-full shadow-soft"
                style={{ backgroundColor: item.colorHex || '#A8A29A' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= rating ? 'fill-warning text-warning' : 'text-border'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
          <span>{wornCount} {wornCount === 1 ? 'wear' : 'wears'}</span>
        </div>
      </div>
    </div>
  );
};
