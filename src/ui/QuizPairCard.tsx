import React from 'react';
import { Check } from 'lucide-react';

export type QuizChoice = 'a' | 'b' | 'both' | 'neither';

export interface QuizPairCardProps {
  id: string;
  pairNumber: number;
  totalPairs: number;
  optionA: { label: string; description?: string; colorHex?: string };
  optionB: { label: string; description?: string; colorHex?: string };
  selectedChoice?: QuizChoice;
  onSelectChoice: (choice: QuizChoice) => void;
  className?: string;
}

export const QuizPairCard: React.FC<QuizPairCardProps> = ({
  pairNumber,
  totalPairs,
  optionA,
  optionB,
  selectedChoice,
  onSelectChoice,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface border border-border rounded-card p-5 sm:p-6 space-y-5 shadow-soft ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-bold tracking-wider text-accent font-sans">
          Taste Quiz: {pairNumber} of {totalPairs}
        </span>
        <span className="text-xs text-text-secondary">Pick what feels like you</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option A */}
        <button
          type="button"
          onClick={() => onSelectChoice('a')}
          aria-pressed={selectedChoice === 'a'}
          className={`p-4 rounded-card border text-left flex flex-col justify-between min-h-[120px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            selectedChoice === 'a'
              ? 'border-primary bg-primary-soft/40 shadow-soft ring-1 ring-primary'
              : 'border-border bg-surface-alt hover:bg-surface'
          }`}
        >
          <div className="flex items-start justify-between w-full">
            <span className="font-serif text-base font-bold text-text-primary">
              {optionA.label}
            </span>
            {selectedChoice === 'a' && (
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            )}
          </div>
          {optionA.description && (
            <p className="text-xs text-text-secondary mt-2">{optionA.description}</p>
          )}
        </button>

        {/* Option B */}
        <button
          type="button"
          onClick={() => onSelectChoice('b')}
          aria-pressed={selectedChoice === 'b'}
          className={`p-4 rounded-card border text-left flex flex-col justify-between min-h-[120px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            selectedChoice === 'b'
              ? 'border-primary bg-primary-soft/40 shadow-soft ring-1 ring-primary'
              : 'border-border bg-surface-alt hover:bg-surface'
          }`}
        >
          <div className="flex items-start justify-between w-full">
            <span className="font-serif text-base font-bold text-text-primary">
              {optionB.label}
            </span>
            {selectedChoice === 'b' && (
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            )}
          </div>
          {optionB.description && (
            <p className="text-xs text-text-secondary mt-2">{optionB.description}</p>
          )}
        </button>
      </div>

      {/* Both / Neither options */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => onSelectChoice('both')}
          aria-pressed={selectedChoice === 'both'}
          className={`px-4 py-2 rounded-control text-xs font-semibold min-h-touch border transition-all ${
            selectedChoice === 'both'
              ? 'bg-primary text-white border-primary shadow-soft'
              : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt'
          }`}
        >
          I like both
        </button>
        <button
          type="button"
          onClick={() => onSelectChoice('neither')}
          aria-pressed={selectedChoice === 'neither'}
          className={`px-4 py-2 rounded-control text-xs font-semibold min-h-touch border transition-all ${
            selectedChoice === 'neither'
              ? 'bg-primary text-white border-primary shadow-soft'
              : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-alt'
          }`}
        >
          Neither is me
        </button>
      </div>
    </div>
  );
};
