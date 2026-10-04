import React from 'react';
import { Sparkles, Sun, Scissors, Heart, Shield } from 'lucide-react';

export type WhyChipCategory = 'color' | 'proportion' | 'weather' | 'taste' | 'comfort' | 'default';

export interface WhyChipProps {
  label: string;
  category?: WhyChipCategory;
  onClick?: () => void;
  className?: string;
}

export const WhyChip: React.FC<WhyChipProps> = ({
  label,
  category = 'default',
  onClick,
  className = '',
}) => {
  const categoryIcons: Record<WhyChipCategory, React.ReactNode> = {
    color: <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />,
    proportion: <Scissors className="w-3.5 h-3.5 text-accent" aria-hidden="true" />,
    weather: <Sun className="w-3.5 h-3.5 text-warning" aria-hidden="true" />,
    taste: <Heart className="w-3.5 h-3.5 text-accent" aria-hidden="true" />,
    comfort: <Shield className="w-3.5 h-3.5 text-primary" aria-hidden="true" />,
    default: <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />,
  };

  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-surface border border-border text-text-primary shadow-soft select-none transition-colors';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseStyles} hover:bg-surface-alt min-h-touch cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      >
        <span className="shrink-0">{categoryIcons[category]}</span>
        <span className="truncate">{label}</span>
      </button>
    );
  }

  return (
    <span className={`${baseStyles} ${className}`}>
      <span className="shrink-0">{categoryIcons[category]}</span>
      <span>{label}</span>
    </span>
  );
};
