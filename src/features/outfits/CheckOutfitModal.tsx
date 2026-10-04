import React, { useMemo } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Sparkles, Palette, User, SunMedium, Heart, CheckCircle2 } from 'lucide-react';
import { ClothingItem, StyleProfile, Preferences } from '../../data/types';
import { scoreCandidate } from '../../engine/outfitGenerator';
import { RecommendationContext } from '../../engine/types';

interface CheckOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ClothingItem[];
  profile: StyleProfile | null;
  preferences: Preferences | null;
}

const DEFAULT_CHECK_CONTEXT: RecommendationContext = {
  tempC: 18,
  condition: 'cloudy',
  occasion: 'casual',
  mood: 'cozy',
};

export const CheckOutfitModal: React.FC<CheckOutfitModalProps> = ({
  isOpen,
  onClose,
  items,
  profile,
  preferences,
}) => {
  const scored = useMemo(() => {
    if (items.length === 0) return null;
    const top = items.find((i) => i.category === 'top');
    const bottom = items.find((i) => i.category === 'bottom');
    const dress = items.find((i) => i.category === 'dress');
    const outerwear = items.find((i) => i.category === 'outerwear');
    const shoes = items.find((i) => i.category === 'shoes');
    const accessory = items.find((i) => i.category === 'accessory');

    return scoreCandidate(
      items,
      { top, bottom, dress, outerwear, shoes, accessory },
      DEFAULT_CHECK_CONTEXT,
      profile,
      preferences
    );
  }, [items, profile, preferences]);

  if (!isOpen || !scored) return null;

  const { factors, matchLabel, totalScore, chips } = scored;

  const factorList = [
    {
      label: 'Color Harmony',
      icon: <Palette className="w-4 h-4 text-accent" />,
      breakdown: factors.color,
    },
    {
      label: 'Proportion & Silhouette',
      icon: <User className="w-4 h-4 text-primary" />,
      breakdown: factors.proportion,
    },
    {
      label: 'Weather & Occasion',
      icon: <SunMedium className="w-4 h-4 text-success" />,
      breakdown: factors.weatherOccasion,
    },
    {
      label: 'Personal Taste Alignment',
      icon: <Heart className="w-4 h-4 text-accent" />,
      breakdown: factors.taste,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Outfit Balance Check">
      <div className="space-y-6">
        {/* Match badge & summary */}
        <div className="p-4 rounded-card bg-surface-alt border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
              Engine Assessment
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  matchLabel === 'High'
                    ? 'bg-success/15 text-success'
                    : matchLabel === 'Medium'
                    ? 'bg-warning/15 text-warning'
                    : 'bg-text-secondary/15 text-text-secondary'
                }`}
              >
                {matchLabel} Match
              </span>
              <span className="text-xs font-semibold text-text-primary">
                {Math.round(totalScore * 100)}% Harmony Score
              </span>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>

        {/* Why this works chips */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-text-secondary">
            Why this combination works:
          </span>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs bg-primary-soft text-primary font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{chip}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-text-secondary block">
            Factor Details:
          </span>
          <div className="space-y-2">
            {factorList.map((f, i) => (
              <div
                key={i}
                className="p-3 rounded-control bg-surface border border-border flex items-start gap-2.5"
              >
                <div className="p-1.5 rounded-control bg-surface-alt mt-0.5 shrink-0">
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-primary">
                      {f.label}
                    </span>
                    <span className="text-[11px] font-semibold text-text-secondary">
                      {Math.round(f.breakdown.score * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {f.breakdown.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="md" onClick={onClose}>
            Looks Great
          </Button>
        </div>
      </div>
    </Modal>
  );
};
