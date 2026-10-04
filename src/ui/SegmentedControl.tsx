import React from 'react';

export interface SegmentOption {
  id: string;
  label: string;
  badge?: string | number;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedId,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="radiogroup"
      className={`inline-flex p-1 rounded-control bg-surface-alt border border-border ${className}`}
    >
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.id)}
            className={`px-3.5 py-1.5 rounded-control text-xs font-medium transition-all select-none min-h-[36px] flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? 'bg-surface text-text-primary font-semibold shadow-soft'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-alt border border-border text-text-secondary">
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
