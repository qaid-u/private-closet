import React, { useState } from 'react';
import { HardDrive, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export interface StorageAlertBannerProps {
  percentUsed: number;
  usageBytes: number;
  quotaBytes: number;
  onManageStorage?: () => void;
  className?: string;
}

export const StorageAlertBanner: React.FC<StorageAlertBannerProps> = ({
  percentUsed,
  usageBytes,
  quotaBytes,
  onManageStorage,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const usageMB = Math.round(usageBytes / (1024 * 1024));
  const quotaMB = Math.round(quotaBytes / (1024 * 1024));

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`w-full bg-warning/15 border-b border-warning/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-primary ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-warning/20 text-warning flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold">Storage almost full ({percentUsed}% used): </span>
          <span>{usageMB} MB of {quotaMB} MB used on this device. Consider exporting a backup or deleting cached models.</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onManageStorage && (
          <Button
            size="sm"
            variant="outline"
            onClick={onManageStorage}
            className="text-xs h-7 px-2.5 gap-1.5"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Manage Storage</span>
          </Button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss storage warning"
          className="p-1 rounded text-text-secondary hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
