import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { OnDeviceBadge } from '../../ui/OnDeviceBadge';
import { ProgressBar } from '../../ui/ProgressBar';
import { Toggle } from '../../ui/Toggle';
import { StyleProfileWizard } from '../style-profile/StyleProfileWizard';
import { StyleProfile } from '../../data/types';
import { seedService } from '../../data/seedService';
import { storageService } from '../../data/repositories/storageService';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HardDrive,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  EyeOff,
  CloudOff,
  RefreshCw,
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkipToApp: () => void;
}

type OnboardingStep =
  | 'welcome'
  | 'privacy'
  | 'profile_choice'
  | 'profile_wizard'
  | 'storage_install'
  | 'ai_setup'
  | 'add_items'
  | 'celebration';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkipToApp,
}) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedModelTier, setSelectedModelTier] = useState<'full' | 'lite'>('full');
  const [wifiOnly, setWifiOnly] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [storagePersisted, setStoragePersisted] = useState(false);
  const [itemsAddedCount, setItemsAddedCount] = useState(0);
  const [isAddingItems, setIsAddingItems] = useState(false);

  // Storage permission request
  const handleRequestStorage = async () => {
    try {
      const persisted = await storageService.requestPersistentStorage();
      setStoragePersisted(persisted);
    } catch {
      // Non-blocking
    }
    setStep('ai_setup');
  };

  // AI model download simulation
  const handleStartModelDownload = () => {
    setIsDownloading(true);
    setDownloadError(false);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Sample closet loader
  const handleLoadSampleWardrobe = async () => {
    setIsAddingItems(true);
    try {
      const count = await seedService.loadSampleWardrobe();
      setItemsAddedCount(count);
      setStep('celebration');
    } catch {
      // fallback
      setStep('celebration');
    } finally {
      setIsAddingItems(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-xl space-y-6 my-8">
        {/* Step 1: Welcome Screen */}
        {step === 'welcome' && (
          <Card className="p-8 sm:p-10 space-y-6 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center shadow-soft">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-primary font-bold">
                Private Closet
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
                What should I wear today?
              </h1>
              <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                Complete daily outfits assembled from clothes you already own. Personalized for your morning routine, running 100% on your device.
              </p>
            </div>

            <div className="p-4 rounded-card bg-surface-alt border border-border flex items-center justify-center gap-3 text-xs text-text-primary">
              <OnDeviceBadge label="Zero Cloud" size="sm" />
              <span className="text-text-secondary">&bull;</span>
              <span>No account required</span>
              <span className="text-text-secondary">&bull;</span>
              <span>Works offline</span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep('privacy')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Begin Guided Setup
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={onSkipToApp}
                className="w-full sm:w-auto text-text-secondary"
              >
                Explore App Directly
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Privacy Promise */}
        {step === 'privacy' && (
          <Card className="p-8 space-y-6 shadow-soft">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-text-primary">
                Our Privacy Promise
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CloudOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">No Data Leaves This Device</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                    Your photos, measurements, tags, and wear logs remain strictly stored in your browser's private database (IndexedDB).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Zero Tracking & Zero Ads</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                    We include no third-party scripts, telemetry, or remote analytics. Even all fonts are bundled locally.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Full Data Portability</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                    Export your encrypted vault anytime, or perform an instant nuclear reset to wipe all local data in one tap.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-border">
              <Button variant="ghost" onClick={() => setStep('welcome')}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep('profile_choice')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                I Understand & Agree
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Style Profile Choice */}
        {step === 'profile_choice' && (
          <Card className="p-8 space-y-6 text-center shadow-soft">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-text-primary">
                Personalize Your Recommendations
              </h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                An optional Style Profile helps match undertones and proportion balance. Every single field is optional.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
              <button
                type="button"
                onClick={() => setStep('profile_wizard')}
                className="p-5 rounded-card border-2 border-primary bg-primary-soft/30 hover:bg-primary-soft transition-all space-y-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-surface">
                    Recommended
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-text-primary">
                  Set Up Style Profile (3 mins)
                </h3>
                <p className="text-xs text-text-secondary">
                  Undertone swatches, proportions, and taste quiz for sharper daily recommendations.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStep('storage_install')}
                className="p-5 rounded-card border border-border bg-surface hover:bg-surface-alt transition-all space-y-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <Layers className="w-5 h-5 text-text-secondary" />
                  <span className="text-[10px] font-medium text-text-secondary">Skip for now</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-text-primary">
                  Do This Later
                </h3>
                <p className="text-xs text-text-secondary">
                  Recommendations still work immediately using universal color and silhouette rules.
                </p>
              </button>
            </div>

            <div className="flex justify-start">
              <Button variant="ghost" size="sm" onClick={() => setStep('privacy')}>
                Back
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Embedded Profile Wizard */}
        {step === 'profile_wizard' && (
          <StyleProfileWizard
            onComplete={(_p: StyleProfile) => setStep('storage_install')}
            onCancel={() => setStep('storage_install')}
          />
        )}

        {/* Step 5: Persistent Storage Request */}
        {step === 'storage_install' && (
          <Card className="p-8 space-y-6 shadow-soft">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <HardDrive className="w-6 h-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-text-primary">
                Offline Storage Protection
              </h2>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Browsers occasionally clear cache data when low on disk space. Requesting persistent storage ensures your wardrobe cutouts and outfits are never evicted automatically.
            </p>

            <div className="p-4 rounded-card bg-surface-alt border border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block text-text-primary">Persistent IndexedDB</span>
                <span className="text-xs text-text-secondary">
                  {storagePersisted ? 'Storage protected against automatic eviction' : 'Standard local storage'}
                </span>
              </div>
              {storagePersisted ? (
                <span className="text-xs text-success flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Persisted
                </span>
              ) : (
                <Button variant="outline" size="sm" onClick={handleRequestStorage}>
                  Protect Storage
                </Button>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-border">
              <Button variant="ghost" onClick={() => setStep('profile_choice')}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep('ai_setup')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to AI Setup
              </Button>
            </div>
          </Card>
        )}

        {/* Step 6: AI Model Setup */}
        {step === 'ai_setup' && (
          <Card className="p-8 space-y-6 shadow-soft">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-text-primary">
                  On-Device AI Engine
                </h2>
              </div>
              <OnDeviceBadge label="Zero Cloud Inference" size="sm" />
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Select your preferred on-device model tier. Both options process photos and recommendations locally on your device hardware.
            </p>

            {/* Model Tier Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedModelTier('full')}
                className={`p-4 rounded-card border text-left space-y-1 transition-all ${
                  selectedModelTier === 'full'
                    ? 'border-primary bg-primary-soft text-primary font-bold shadow-soft'
                    : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">Full Model</span>
                  <span>~45 MB</span>
                </div>
                <p className="text-[11px] text-text-secondary font-normal">
                  High-precision background removal, color extraction, and embedding search.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedModelTier('lite')}
                className={`p-4 rounded-card border text-left space-y-1 transition-all ${
                  selectedModelTier === 'lite'
                    ? 'border-primary bg-primary-soft text-primary font-bold shadow-soft'
                    : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">Lite Model</span>
                  <span>~12 MB</span>
                </div>
                <p className="text-[11px] text-text-secondary font-normal">
                  Lightweight rule engine and fast k-means color matching for older devices.
                </p>
              </button>
            </div>

            {/* Wi-Fi Only Toggle */}
            <div className="flex items-center justify-between p-3 rounded-control bg-surface-alt border border-border">
              <span className="text-xs font-medium text-text-primary">Download on Wi-Fi only</span>
              <Toggle
                checked={wifiOnly}
                onChange={() => setWifiOnly(!wifiOnly)}
                label="Download on Wi-Fi only"
              />
            </div>

            {/* Simulated Progress or Download Trigger */}
            {isDownloading || downloadProgress > 0 ? (
              <div className="space-y-2 pt-2">
                <ProgressBar
                  value={downloadProgress}
                  label={downloadProgress === 100 ? 'Model installed on device' : 'Downloading model weights'}
                  showPercent={true}
                />
                {downloadError && (
                  <div className="flex items-center justify-between text-xs text-danger pt-1">
                    <span>Download interrupted.</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                      onClick={handleStartModelDownload}
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleStartModelDownload}
              >
                Download & Initialize Model (Simulated)
              </Button>
            )}

            <div className="pt-2 flex justify-between items-center border-t border-border">
              <Button variant="ghost" onClick={() => setStep('storage_install')}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep('add_items')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 7: Add First Items */}
        {step === 'add_items' && (
          <Card className="p-8 space-y-6 text-center shadow-soft">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-text-primary">
                Add Your First Clothing Items
              </h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Add a few pieces you love wearing, or explore right away with our pre-built capsule sample wardrobe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
              <button
                type="button"
                onClick={handleLoadSampleWardrobe}
                disabled={isAddingItems}
                className="p-5 rounded-card border-2 border-primary bg-primary-soft/40 hover:bg-primary-soft transition-all space-y-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-surface">
                    Fastest Start
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-text-primary">
                  Try with Sample Wardrobe
                </h3>
                <p className="text-xs text-text-secondary">
                  Loads 10 versatile everyday pieces (chinos, knit sweater, denim jacket, sneakers) with clean SVG cutouts.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStep('celebration')}
                className="p-5 rounded-card border border-border bg-surface hover:bg-surface-alt transition-all space-y-2 text-left"
              >
                <div className="flex items-center justify-between">
                  <Layers className="w-5 h-5 text-text-secondary" />
                  <span className="text-[10px] font-medium text-text-secondary">Empty Closet</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-text-primary">
                  Start Fresh
                </h3>
                <p className="text-xs text-text-secondary">
                  I will photograph and add my own wardrobe items from the Closet screen.
                </p>
              </button>
            </div>

            <div className="flex justify-start">
              <Button variant="ghost" size="sm" onClick={() => setStep('ai_setup')}>
                Back
              </Button>
            </div>
          </Card>
        )}

        {/* Step 8: Celebration Screen */}
        {step === 'celebration' && (
          <Card className="p-8 sm:p-10 space-y-6 text-center shadow-soft">
            <div className="w-16 h-16 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center shadow-soft">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-success font-bold">
                Setup Complete
              </span>
              <h2 className="font-serif text-3xl font-bold text-text-primary">
                Your Closet is Ready!
              </h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                {itemsAddedCount > 0
                  ? `Loaded ${itemsAddedCount} sample items into your offline database. Complete outfits are assembled and ready for you.`
                  : "Your private closet is initialized. Let's explore your daily outfit recommendations."}
              </p>
            </div>

            <div className="p-4 rounded-card bg-surface-alt border border-border text-xs text-text-secondary">
              Everything is saved on this device. You can update your Style Profile or add new items whenever you like.
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={onComplete}
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Meet Your First Today Outfits
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
