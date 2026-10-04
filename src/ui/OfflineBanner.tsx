import React from 'react';
import { WifiOff } from 'lucide-react';

export interface OfflineBannerProps {
  message?: string;
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = "You're offline. Everything still works.",
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full bg-surface-alt border-b border-border px-4 py-2 flex items-center justify-center gap-2 text-xs text-text-secondary select-none ${className}`}
    >
      <WifiOff className="w-3.5 h-3.5 text-text-secondary shrink-0" aria-hidden="true" />
      <span className="font-medium">{message}</span>
    </div>
  );
};
