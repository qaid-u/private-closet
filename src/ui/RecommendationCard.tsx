import React from 'react';
import { ThumbsUp, ThumbsDown, RefreshCw, Check } from 'lucide-react';
import { Button } from './Button';
import { StyleMatchIndicator, MatchLevel } from './StyleMatchIndicator';
import { WhyChip } from './WhyChip';

export interface RecommendationItem {
  slot: string;
  name: string;
  colorHex?: string;
  cutoutUrl?: string;
}

export interface RecommendationCardProps {
  index: number;
  total: number;
  title: string;
  matchLevel: MatchLevel;
  items: RecommendationItem[];
  reasons: { label: string; category?: 'color' | 'proportion' | 'weather' | 'taste' | 'comfort' }[];
  onWearThis: () => void;
  onSwapItem: () => void;
  onNotMe: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onOpenMatchDetails?: () => void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  index,
  total,
  title,
  matchLevel,
  items,
  reasons,
  onWearThis,
  onSwapItem,
  onNotMe,
  onThumbsUp,
  onThumbsDown,
  onOpenMatchDetails,
  className = '',
}) => {
  return (
    <article
      aria-label={`Recommendation ${index} of ${total}: ${title}`}
      className={`bg-surface border border-border rounded-card p-5 sm:p-7 space-y-6 shadow-card transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-accent font-sans">
              Recommendation {index} of {total}
            </span>
            <StyleMatchIndicator level={matchLevel} onClick={onOpenMatchDetails} />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary leading-tight">
            {title}
          </h2>
        </div>

        {/* Feedback actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onThumbsUp}
            aria-label="Give thumbs up to this outfit"
            className="p-2 rounded-control text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors min-h-touch min-w-touch flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ThumbsUp className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onThumbsDown}
            aria-label="Give thumbs down to this outfit"
            className="p-2 rounded-control text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors min-h-touch min-w-touch flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ThumbsDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Outfit Cutouts Canvas / Tile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-4 rounded-control bg-surface-alt border border-border flex flex-col items-center text-center justify-between min-h-[140px]"
          >
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              {item.slot}
            </span>

            <div className="my-2 w-14 h-14 rounded-full shadow-soft flex items-center justify-center">
              {item.cutoutUrl ? (
                <img
                  src={item.cutoutUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full shadow-soft"
                  style={{ backgroundColor: item.colorHex || '#2F5D50' }}
                />
              )}
            </div>

            <p className="text-xs font-semibold text-text-primary line-clamp-1 truncate w-full">
              {item.name}
            </p>
          </div>
        ))}
      </div>

      {/* Why it suits you chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-text-secondary block font-sans">
          Why it works for you:
        </span>
        <div className="flex flex-wrap gap-2">
          {reasons.map((r, i) => (
            <WhyChip key={i} label={r.label} category={r.category} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        <Button variant="primary" size="md" onClick={onWearThis} leftIcon={<Check className="w-4 h-4" />}>
          Wear this
        </Button>
        <Button variant="secondary" size="md" onClick={onSwapItem} rightIcon={<RefreshCw className="w-4 h-4" />}>
          Swap an item
        </Button>
        <Button variant="ghost" size="md" onClick={onNotMe}>
          Not me
        </Button>
      </div>
    </article>
  );
};
