import React from 'react';
import { Sparkles, Palette, User, SunMedium, Heart, RotateCcw } from 'lucide-react';
import { Sheet } from '../../ui/Sheet';
import { ScoredOutfit } from '../../engine/types';

interface StyleMatchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: ScoredOutfit | null;
}

export const StyleMatchSheet: React.FC<StyleMatchSheetProps> = ({
  isOpen,
  onClose,
  outfit,
}) => {
  if (!outfit) return null;

  const { factors, matchLabel, totalScore } = outfit;

  const factorItems = [
    {
      title: 'Color Harmony',
      icon: <Palette className="w-4 h-4 text-accent" />,
      breakdown: factors.color,
    },
    {
      title: 'Proportion & Silhouette',
      icon: <User className="w-4 h-4 text-primary" />,
      breakdown: factors.proportion,
    },
    {
      title: 'Face & Hair Details',
      icon: <Sparkles className="w-4 h-4 text-warning" />,
      breakdown: factors.faceHair,
    },
    {
      title: 'Weather & Occasion',
      icon: <SunMedium className="w-4 h-4 text-success" />,
      breakdown: factors.weatherOccasion,
    },
    {
      title: 'Your Taste & Aesthetic',
      icon: <Heart className="w-4 h-4 text-accent" />,
      breakdown: factors.taste,
    },
    {
      title: 'Rotation & Freshness',
      icon: <RotateCcw className="w-4 h-4 text-primary" />,
      breakdown: factors.freshness,
    },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Why this outfit works for you">
      <div className="space-y-6">
        {/* Overall Match Overview */}
        <div className="p-4 rounded-card bg-surface-alt border border-border flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-text-secondary">
              Overall Style Match
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
              <span className="text-sm font-semibold text-text-primary">
                {Math.round(totalScore * 100)}% Confidence
              </span>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>

        {/* 6 Dimension Breakdown */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-bold text-text-primary">
            Match Factors
          </h4>

          <div className="space-y-2.5">
            {factorItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-control bg-surface border border-border flex items-start gap-3"
              >
                <div className="p-2 rounded-control bg-surface-alt shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">
                      {item.title}
                    </span>
                    {item.breakdown.hasInput ? (
                      <span className="text-[11px] font-medium text-success">
                        Active Factor
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-text-secondary">
                        Needs Profile Input
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {item.breakdown.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spec Disclaimer Footer */}
        <div className="p-3.5 rounded-control bg-surface-alt/70 border border-border text-center">
          <p className="text-xs text-text-secondary">
            These are suggestions. Edit anything that doesn't feel accurate.
          </p>
        </div>
      </div>
    </Sheet>
  );
};
