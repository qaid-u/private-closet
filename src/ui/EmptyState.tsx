import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Sparkles className="w-8 h-8 text-primary" />,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`text-center p-8 sm:p-12 rounded-card bg-surface border border-border flex flex-col items-center justify-center max-w-lg mx-auto space-y-4 shadow-soft ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-primary-soft text-primary flex items-center justify-center shadow-soft">
        {icon}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {primaryActionLabel && onPrimaryAction && (
            <Button variant="primary" size="md" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
