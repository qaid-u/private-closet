import React from 'react';

export interface SliderProps {
  id?: string;
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  minLabel?: string;
  maxLabel?: string;
  valueFormatter?: (val: number) => string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  minLabel,
  maxLabel,
  valueFormatter,
  className = '',
}) => {
  const sliderId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-2 w-full ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={sliderId} className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {label}
          </label>
        )}
        <span className="text-xs font-mono font-bold text-primary">
          {valueFormatter ? valueFormatter(value) : value}
        </span>
      </div>

      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-surface-alt rounded-lg appearance-none cursor-pointer accent-primary min-h-touch"
      />

      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between text-[11px] text-text-secondary">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
