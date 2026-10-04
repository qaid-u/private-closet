import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, Share, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PwaBannerProps {
  onInstalled?: () => void;
  className?: string;
}

export const PwaBanner: React.FC<PwaBannerProps> = ({ onInstalled, className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    const isStandalone =
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as unknown as { standalone?: boolean })?.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleIos = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
    setIsIos(isAppleIos);

    // Listen for beforeinstallprompt event on Chromium / Android / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (onInstalled) onInstalled();
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check service worker for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstalled]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      setShowIosGuide(true);
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleUpdateClick = () => {
    window.location.reload();
  };

  // If update is available, show high-priority update banner
  if (updateAvailable) {
    return (
      <div
        role="alert"
        className={`w-full bg-accent/15 border-b border-accent/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-text-primary ${className}`}
      >
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-accent animate-spin" />
          <span className="font-semibold">Update available: A new version of Private Closet is ready.</span>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={handleUpdateClick}
          className="text-xs h-7 px-3 gap-1.5"
        >
          <span>Reload</span>
        </Button>
      </div>
    );
  }

  // If already installed or dismissed, do not render banner
  if (isInstalled || dismissed) return null;

  return (
    <>
      <div
        role="complementary"
        aria-label="Install Private Closet application"
        className={`w-full bg-primary-soft/60 border-b border-border px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-text-primary ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <Download className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="font-bold">Install Private Closet: </span>
            <span className="text-text-secondary">Works 100% offline with zero cloud storage.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={handleInstallClick}
            className="text-xs h-7 px-3 gap-1.5"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </Button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss install banner"
            className="p-1 rounded text-text-secondary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS / Manual Add to Home Screen Modal */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-surface border border-border rounded-card p-6 max-w-sm w-full space-y-4 shadow-elevated">
            <div className="flex items-center justify-between">
              <h3 id="install-guide-title" className="font-serif text-lg font-bold text-text-primary">
                Install to Home Screen
              </h3>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 text-text-secondary hover:text-text-primary rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Private Closet operates entirely on your device with no remote accounts or tracking.
            </p>

            <ol className="space-y-3 text-xs text-text-primary">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Tap the <strong className="inline-flex items-center gap-1 font-semibold text-primary"><Share className="w-3.5 h-3.5 inline" /> Share</strong> button in Safari or your browser toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> to launch with full offline capabilities!
                </span>
              </li>
            </ol>

            <Button
              variant="primary"
              className="w-full gap-2 mt-2"
              onClick={() => setShowIosGuide(false)}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Got it</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
