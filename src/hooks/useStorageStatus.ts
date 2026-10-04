import { useState, useEffect, useCallback } from 'react';

export interface StorageStatus {
  usageBytes: number;
  quotaBytes: number;
  percentUsed: number;
  isLowStorage: boolean;
  isPersistent: boolean;
  checkStorage: () => Promise<void>;
  requestPersistence: () => Promise<boolean>;
}

export function useStorageStatus(): StorageStatus {
  const [usageBytes, setUsageBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState(0);
  const [isPersistent, setIsPersistent] = useState(false);

  const checkStorage = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.storage) return;

    try {
      if (navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        setUsageBytes(estimate.usage || 0);
        setQuotaBytes(estimate.quota || 0);
      }

      if (navigator.storage.persisted) {
        const persisted = await navigator.storage.persisted();
        setIsPersistent(persisted);
      }
    } catch {
      // Storage estimation failure handled gracefully
    }
  }, []);

  const requestPersistence = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
      return false;
    }
    try {
      const granted = await navigator.storage.persist();
      setIsPersistent(granted);
      return granted;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    checkStorage();
  }, [checkStorage]);

  const percentUsed = quotaBytes > 0 ? Math.round((usageBytes / quotaBytes) * 100) : 0;
  const remainingBytes = quotaBytes - usageBytes;
  // Trigger warning if quota > 85% full or remaining space is under 50 MB
  const isLowStorage = (quotaBytes > 0 && percentUsed >= 85) || (quotaBytes > 0 && remainingBytes < 50 * 1024 * 1024);

  return {
    usageBytes,
    quotaBytes,
    percentUsed,
    isLowStorage,
    isPersistent,
    checkStorage,
    requestPersistence,
  };
}
