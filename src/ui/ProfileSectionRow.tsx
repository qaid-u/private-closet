import React from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

export interface ProfileSectionRowProps {
  title: string;
  description?: string;
  value?: string;
  isComplete?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const ProfileSectionRow: React.FC<ProfileSectionRowProps> = ({
  title,
  description,
  value,
  isComplete = false,
  onClick,
  icon,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-control bg-surface border border-border hover:bg-surface-alt transition-all text-left min-h-touch select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-control bg-surface-alt border border-border text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-text-primary truncate">{title}</span>
            {isComplete && (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-label="Completed" />
            )}
          </div>
          {description && (
            <p className="text-xs text-text-secondary truncate mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3 text-text-secondary">
        {value && <span className="text-xs font-medium text-text-primary">{value}</span>}
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </div>
    </button>
  );
};
