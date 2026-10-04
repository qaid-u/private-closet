import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface TopAppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  onBack,
  actions,
  badge,
  className = '',
}) => {
  return (
    <header
      className={`sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 min-h-[56px] flex items-center justify-between transition-colors ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-control text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors min-h-touch min-w-touch flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg sm:text-xl font-bold text-text-primary truncate">
              {title}
            </h1>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {subtitle && (
            <p className="text-xs text-text-secondary truncate mt-0.5 font-sans">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
};
