import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = false,
  size = 'md',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-text-secondary">
          {label && <span className="font-medium">{label}</span>}
          {showPercent && <span className="font-mono font-semibold">{Math.round(clampedValue)}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={`w-full bg-surface-alt border border-border rounded-full overflow-hidden ${heightStyles[size]}`}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
