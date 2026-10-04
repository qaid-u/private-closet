import React, { useState } from 'react';
import { Smartphone, HardDrive, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useStorageStatus } from '../../hooks/useStorageStatus';

export const PwaInstallSection: React.FC = () => {
  const { usageBytes, quotaBytes, percentUsed, isPersistent, requestPersistence, checkStorage } = useStorageStatus();
  const [persisting, setPersisting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const usageMB = (usageBytes / (1024 * 1024)).toFixed(1);
  const quotaMB = quotaBytes > 0 ? (quotaBytes / (1024 * 1024)).toFixed(0) : '0';

  const handleRequestPersistence = async () => {
    setPersisting(true);
    const granted = await requestPersistence();
    setPersisting(false);
    await checkStorage();
    if (granted) {
      setToastMsg('Persistent storage granted. Your wardrobe is protected from browser eviction.');
    } else {
      setToastMsg('Persistent storage request completed.');
    }
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 space-y-5 shadow-soft">
      {toastMsg && (
        <div className="p-3 rounded-control bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-card bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-text-primary">
            Offline App & Device Storage
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Progressive Web App status, local cache, and eviction protection.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-border">
        {/* Device Storage Status */}
        <div className="p-4 rounded-control bg-surface-alt border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-text-primary">Local Storage Allocation</span>
            </div>
            <span className="text-xs font-mono font-semibold text-text-secondary">
              {usageMB} MB / {quotaMB} MB ({percentUsed}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${percentUsed > 85 ? 'bg-danger' : percentUsed > 60 ? 'bg-warning' : 'bg-primary'}`}
              style={{ width: `${Math.max(2, Math.min(100, percentUsed))}%` }}
            />
          </div>

          <p className="text-[11px] text-text-secondary">
            All images, outfit records, and simulated AI weights live on this local drive. No data is stored in any remote cloud.
          </p>
        </div>

        {/* Persistent Storage Protection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-control bg-surface-alt border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span className="text-xs font-bold text-text-primary">
                Persistent Storage Protection
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isPersistent ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                }`}
              >
                {isPersistent ? 'Protected' : 'Best-Effort'}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Prevents the mobile browser from clearing your saved photos and wardrobe when device space gets low.
            </p>
          </div>

          {!isPersistent ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestPersistence}
              disabled={persisting}
              className="text-xs shrink-0 gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{persisting ? 'Requesting...' : 'Protect Storage'}</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-success font-medium shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>Storage Persisted</span>
            </div>
          )}
        </div>

        {/* PWA Offline Guarantee */}
        <div className="p-3 rounded-control bg-primary-soft/40 border border-primary/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-text-primary">100% Offline Capable: </strong>
            Private Closet caches its full user interface and local models via service worker precache. You can turn off Wi-Fi and Cellular data, and every outfit recommendation, search, and planner feature will work flawlessly.
          </p>
        </div>
      </div>
    </div>
  );
};
