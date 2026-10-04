import React, { useState } from 'react';
import { Sheet } from '../../ui/Sheet';
import { Button } from '../../ui/Button';
import { Check } from 'lucide-react';
import { ScoredOutfit } from '../../engine/types';

interface NotMeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: ScoredOutfit | null;
  onSubmit: (reasons: string[], note: string) => void;
}

const NOT_ME_REASONS = [
  'Wrong colors',
  'Wrong fit',
  'Not my style',
  'Too formal',
  'Too casual',
  'Other',
];

export const NotMeSheet: React.FC<NotMeSheetProps> = ({
  isOpen,
  onClose,
  outfit,
  onSubmit,
}) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedReasons, note);
    setSelectedReasons([]);
    setNote('');
    onClose();
  };

  if (!outfit) return null;

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Not quite you today?">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-xs text-text-secondary leading-relaxed mb-4">
            Private Closet learns completely on your device. Tell us why this combination doesn't feel right and we'll tune your daily recommendations.
          </p>

          <span className="text-xs font-semibold text-text-primary block mb-2">
            What didn't work? (Select all that apply)
          </span>

          <div className="grid grid-cols-2 gap-2">
            {NOT_ME_REASONS.map((reason) => {
              const isSelected = selectedReasons.includes(reason);
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={`p-3 rounded-control text-xs font-medium text-left border transition-all flex items-center justify-between min-h-touch ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-surface border-border text-text-primary hover:bg-surface-alt'
                  }`}
                >
                  <span>{reason}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional note */}
        <div>
          <label className="text-xs font-semibold text-text-primary block mb-1.5">
            Add a personal note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Felt too bright for rainy weather, or need something simpler..."
            rows={3}
            className="w-full px-3 py-2 rounded-control bg-surface border border-border text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit">
            Save & Refresh Outfit
          </Button>
        </div>
      </form>
    </Sheet>
  );
};
