import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../../ui/Button';

export const StyleScreen: React.FC = () => {
  const [segment, setSegment] = useState<'profile' | 'outfits' | 'log' | 'insights' | 'plan'>('profile');
  const segments = [
    { id: 'profile', label: 'Profile' },
    { id: 'outfits', label: 'Outfits' },
    { id: 'log', label: 'Log' },
    { id: 'insights', label: 'Insights' },
    { id: 'plan', label: 'Plan' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header per SPEC Section 8 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
            Style Studio
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Personalized proportions & color harmony &bull; Stored only on this device
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center p-1 rounded-control bg-surface-alt border border-border">
          {segments.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setSegment(seg.id as typeof segment)}
              className={`px-3 py-1 rounded-control text-xs font-medium transition-all ${
                segment === seg.id
                  ? 'bg-surface text-text-primary font-semibold shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-lg">
              80%
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Your Style Profile
              </h2>
              <p className="text-xs text-text-secondary">
                Used only to choose outfits for you. Stored only on this device.
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" rightIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
            Edit Profile
          </Button>
        </div>

        {/* Profile Pill Summary (Sample data from SPEC Section 13) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-control bg-surface-alt border border-border">
            <span className="font-bold text-text-primary block">Color Palette:</span>
            <span className="text-text-secondary">Warm undertone &bull; Earthy neutrals & olive</span>
          </div>
          <div className="p-3 rounded-control bg-surface-alt border border-border">
            <span className="font-bold text-text-primary block">Proportions:</span>
            <span className="text-text-secondary">Balanced torso &bull; Relaxed fit &bull; 175 cm</span>
          </div>
          <div className="p-3 rounded-control bg-surface-alt border border-border">
            <span className="font-bold text-text-primary block">Aesthetic Taste:</span>
            <span className="text-text-secondary">Minimal &bull; Classic &bull; Sporty</span>
          </div>
          <div className="p-3 rounded-control bg-surface-alt border border-border">
            <span className="font-bold text-text-primary block">Comfort Rules:</span>
            <span className="text-text-secondary">No skinny fits &bull; Avoid wool &bull; Prefer flats</span>
          </div>
        </div>
      </div>
    </div>
  );
};
