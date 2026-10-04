import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  onDismiss: (id: string) => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'info',
  onDismiss,
  actionLabel,
  onAction,
  className = '',
}) => {
  const variantIcons: Record<ToastVariant, React.ReactNode> = {
    info: <Info className="w-4 h-4 text-primary" aria-hidden="true" />,
    success: <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />,
    warning: <AlertCircle className="w-4 h-4 text-warning" aria-hidden="true" />,
    danger: <AlertCircle className="w-4 h-4 text-danger" aria-hidden="true" />,
  };

  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-control bg-surface border border-border text-text-primary shadow-floating min-h-touch select-none transition-all animate-slide-up ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="shrink-0">{variantIcons[variant]}</span>
        <span className="text-xs sm:text-sm font-medium">{message}</span>
      </div>

      <div className="flex items-center gap-2">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-bold text-primary hover:underline px-2 py-1 rounded min-h-touch flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {actionLabel}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="Dismiss notification"
          className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors min-h-touch min-w-touch flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
