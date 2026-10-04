import React from 'react';
import { CloudRain, Sparkles, Shield, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/Button';

export const TodayScreen: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header per SPEC Section 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
              Good morning
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-soft text-primary">
              <Shield className="w-3 h-3" />
              On device
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Weather Chip (default manual preset per SPEC section 5) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-surface border border-border self-start sm:self-auto text-xs text-text-secondary">
          <CloudRain className="w-4 h-4 text-primary" />
          <span>18°C, light rain</span>
          <span className="text-[10px] text-text-secondary">(Manual)</span>
        </div>
      </div>

      {/* Hero Recommendation Showcase Card */}
      <div className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-accent">
                Recommendation 1 of 3
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success/15 text-success">
                High Match
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary mt-1">
              Easy Smart Casual
            </h2>
          </div>

          <div className="flex items-center gap-1 text-text-secondary">
            <button
              type="button"
              aria-label="Thumbs up"
              className="p-2 rounded-control hover:bg-surface-alt hover:text-text-primary transition-colors min-h-touch min-w-touch flex items-center justify-center"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Thumbs down"
              className="p-2 rounded-control hover:bg-surface-alt hover:text-text-primary transition-colors min-h-touch min-w-touch flex items-center justify-center"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clothing Items Grid / Tile Cutout Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { slot: 'Top', name: 'Navy Linen Shirt', color: 'Navy' },
            { slot: 'Bottom', name: 'Olive Chinos', color: 'Olive' },
            { slot: 'Layer', name: 'Denim Jacket', color: 'Mid Blue' },
            { slot: 'Shoes', name: 'White Leather Sneakers', color: 'White' },
          ].map((item) => (
            <div
              key={item.slot}
              className="p-4 rounded-control bg-surface-alt border border-border flex flex-col items-center text-center justify-center min-h-[140px]"
            >
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-primary shadow-soft mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                {item.slot}
              </span>
              <p className="text-xs font-semibold text-text-primary mt-0.5 line-clamp-1">
                {item.name}
              </p>
            </div>
          ))}
        </div>

        {/* Why it suits you chips per SPEC section 5 */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-text-secondary">Why it works for you:</span>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs bg-primary-soft text-primary font-medium">
              Olive suits your warm undertone
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-surface-alt text-text-secondary font-medium">
              Short jacket balances a longer torso
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-surface-alt text-text-secondary font-medium">
              Light layers for 18°C and rain
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="md">
            Wear this today
          </Button>
          <Button variant="secondary" size="md" rightIcon={<RefreshCw className="w-4 h-4" />}>
            Swap an item
          </Button>
          <Button variant="ghost" size="md">
            Not me
          </Button>
        </div>
      </div>
    </div>
  );
};
