import React from 'react';
import { Check } from 'lucide-react';

export interface SwatchOption {
  id: string;
  name: string;
  hex: string;
}

export interface SwatchPickerProps {
  label?: string;
  options: SwatchOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const SwatchPicker: React.FC<SwatchPickerProps> = ({
  label,
  options,
  selectedId,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
      )}

      <div
        role="radiogroup"
        aria-label={label || 'Color swatch picker'}
        className="flex flex-wrap gap-2.5"
      >
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${opt.name} (${opt.hex})`}
              onClick={() => onSelect(opt.id)}
              className={`w-11 h-11 rounded-full border border-border flex items-center justify-center transition-all min-h-touch min-w-touch relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isSelected
                  ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-card'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: opt.hex }}
            >
              {isSelected && (
                <span className="w-5 h-5 rounded-full bg-surface/85 backdrop-blur-xs flex items-center justify-center shadow-soft">
                  <Check className="w-3.5 h-3.5 text-text-primary" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
