import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { OnDeviceBadge } from '../../ui/OnDeviceBadge';
import { ProgressBar } from '../../ui/ProgressBar';
import { MockSelfieAnalyzer } from '../../ai/mockAdapters';
import { SelfieAnalysisResult } from '../../ai/types';
import {
  Camera,
  Sun,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface SelfieCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResults: (results: {
    depth: 'light' | 'medium' | 'deep';
    swatchHex: string;
    undertone: 'warm' | 'cool' | 'neutral' | 'unsure';
    hairColor: string;
    hairColorName: string;
    faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond' | 'unsure';
  }) => void;
}

type Step = 'intro' | 'capture' | 'analyzing' | 'results' | 'confirmed';

export const SelfieCheckModal: React.FC<SelfieCheckModalProps> = ({
  isOpen,
  onClose,
  onApplyResults,
}) => {
  const [step, setStep] = useState<Step>('intro');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepText, setAnalysisStepText] = useState('Checking lighting...');
  const [analysisResult, setAnalysisResult] = useState<SelfieAnalysisResult | null>(null);
  const [lowLightWarning, setLowLightWarning] = useState(false);
  const [selectedDepth, setSelectedDepth] = useState<'light' | 'medium' | 'deep'>('medium');
  const [selectedUndertone, setSelectedUndertone] = useState<'warm' | 'cool' | 'neutral' | 'unsure'>('warm');
  const [selectedFaceShape, setSelectedFaceShape] = useState<'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond' | 'unsure'>('oval');

  const startAnalysis = async (fileBlob: Blob) => {
    setStep('analyzing');
    setAnalysisProgress(20);
    setAnalysisStepText('Checking lighting conditions...');

    const analyzer = new MockSelfieAnalyzer();

    const t1 = setTimeout(() => {
      setAnalysisProgress(55);
      setAnalysisStepText('Reading skin and hair color...');
    }, 400);

    const t2 = setTimeout(() => {
      setAnalysisProgress(85);
      setAnalysisStepText('Estimating face shape...');
    }, 700);

    try {
      const result = await analyzer.analyze(fileBlob);
      clearTimeout(t1);
      clearTimeout(t2);

      setAnalysisProgress(100);
      setAnalysisResult(result);
      if (result.skin) {
        setSelectedDepth(result.skin.depth);
        setSelectedUndertone(result.skin.undertone);
      }
      if (result.faceShape) setSelectedFaceShape(result.faceShape.shape);

      // Memory sanitization: discard the image blob reference immediately
      fileBlob = null as unknown as Blob;

      setTimeout(() => {
        setStep('results');
      }, 300);
    } catch {
      clearTimeout(t1);
      clearTimeout(t2);
      setStep('capture');
    }
  };

  const handleSimulateCapture = () => {
    // Generate empty dummy blob for mock analysis
    const dummyBlob = new Blob(['simulated-photo-bytes'], { type: 'image/jpeg' });
    startAnalysis(dummyBlob);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startAnalysis(file);
    }
  };

  const handleConfirmApply = () => {
    onApplyResults({
      depth: selectedDepth,
      swatchHex: analysisResult?.skin?.swatchHex || '#D49B72',
      undertone: selectedUndertone,
      hairColor: analysisResult?.hair?.colorHex || '#332018',
      hairColorName: analysisResult?.hair?.colorName || 'Dark Brown',
      faceShape: selectedFaceShape,
    });
    setStep('confirmed');
  };

  const resetAndClose = () => {
    setStep('intro');
    setAnalysisResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Optional Selfie Color Check"
      description="100% on-device analysis. Your photo is never saved or transmitted."
    >
      <div className="space-y-4">
        {/* Step 1: Privacy & Lighting Guidance */}
        {step === 'intro' && (
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-card bg-primary-soft text-text-primary space-y-1.5 border border-primary/20">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Photo Storage Promise</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                We analyze your photo on this device, keep only a few style values, and delete the photo immediately from memory.
              </p>
            </div>

            <div className="p-3 rounded-card bg-surface-alt border border-border space-y-2">
              <div className="flex items-center gap-2 font-medium text-text-primary text-xs uppercase tracking-wider">
                <Sun className="w-4 h-4 text-warning" />
                <span>Lighting Guidance</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Use daylight and face a window for accurate color. Overhead fluorescent lights or tinted backlighting may distort undertones.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={resetAndClose}>
                Skip Selfie
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep('capture')}
                rightIcon={<Camera className="w-4 h-4" />}
              >
                Continue to Camera
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Camera Guide & Capture */}
        {step === 'capture' && (
          <div className="space-y-4 text-center">
            {/* Camera Viewfinder Mock */}
            <div className="relative w-full h-64 bg-surface-alt rounded-card border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden">
              {/* Oval Face Guide */}
              <div className="w-36 h-48 rounded-[50%] border-2 border-primary/60 flex items-center justify-center bg-primary/5">
                <span className="text-[11px] text-primary/80 font-medium px-2 text-center">
                  Align face inside oval
                </span>
              </div>

              {/* Lighting check badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-success border border-border">
                  <Sun className="w-3 h-3 text-success" /> Good Lighting
                </span>
              </div>

              {lowLightWarning && (
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded bg-danger/10 text-danger border border-danger/20 text-xs flex items-center gap-1.5 justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Low light detected. Move closer to daylight.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-xs font-medium hover:bg-surface-alt transition-colors min-h-touch min-w-touch">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </span>
              </label>

              <Button
                variant="primary"
                onClick={handleSimulateCapture}
                leftIcon={<Camera className="w-4 h-4" />}
              >
                Take Photo (Simulated)
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setLowLightWarning(!lowLightWarning)}
              className="text-[11px] text-text-secondary hover:underline block mx-auto"
            >
              Toggle low-light simulation
            </button>
          </div>
        )}

        {/* Step 3: Analyzing State */}
        {step === 'analyzing' && (
          <div className="space-y-4 py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <OnDeviceBadge label="On Device" size="sm" />
              <span className="text-xs font-semibold text-text-primary">Simulated Neural Check</span>
            </div>

            <ProgressBar value={analysisProgress} label={analysisStepText} showPercent={true} />

            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              Running local feature estimation. The photo is kept strictly in volatile memory and is never written to disk.
            </p>
          </div>
        )}

        {/* Step 4: Results & Manual Overrides */}
        {step === 'results' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Suggested Style Values
              </span>
              <span className="text-xs text-success flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Photo Purged from RAM
              </span>
            </div>

            <div className="space-y-3">
              {/* Skin Tone & Undertone */}
              <div className="p-3 rounded-card bg-surface-alt border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block text-text-primary">Skin Depth & Undertone</span>
                  <span className="text-xs text-text-secondary capitalize">
                    {selectedDepth} depth &bull; {selectedUndertone} undertone
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: analysisResult?.skin?.swatchHex || '#D49B72' }}
                    title="Suggested skin tone"
                  />
                  <select
                    value={selectedUndertone}
                    onChange={(e) => setSelectedUndertone(e.target.value as typeof selectedUndertone)}
                    className="text-xs p-1 rounded border border-border bg-surface text-text-primary"
                    aria-label="Edit undertone"
                  >
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                    <option value="neutral">Neutral</option>
                    <option value="unsure">Unsure</option>
                  </select>
                </div>
              </div>

              {/* Hair Color */}
              <div className="p-3 rounded-card bg-surface-alt border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block text-text-primary">Hair Color</span>
                  <span className="text-xs text-text-secondary">
                    {analysisResult?.hair?.colorName || 'Dark Brown'} (High confidence)
                  </span>
                </div>
                <div
                  className="w-6 h-6 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: analysisResult?.hair?.colorHex || '#332018' }}
                  title="Suggested hair color"
                />
              </div>

              {/* Face Shape */}
              <div className="p-3 rounded-card bg-surface-alt border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block text-text-primary">Estimated Face Shape</span>
                  <span className="text-xs text-text-secondary capitalize">{selectedFaceShape}</span>
                </div>
                <select
                  value={selectedFaceShape}
                  onChange={(e) => setSelectedFaceShape(e.target.value as typeof selectedFaceShape)}
                  className="text-xs p-1 rounded border border-border bg-surface text-text-primary"
                  aria-label="Edit face shape"
                >
                  <option value="oval">Oval</option>
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                  <option value="heart">Heart</option>
                  <option value="oblong">Oblong</option>
                  <option value="diamond">Diamond</option>
                  <option value="unsure">Unsure</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => setStep('capture')}
              >
                Retake
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetAndClose}>
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  onClick={handleConfirmApply}
                >
                  Save Style Values
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirmed Photo Discarded Banner */}
        {step === 'confirmed' && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-base font-bold text-text-primary">
                Photo Deleted. Values Saved.
              </h4>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                Only your skin depth, undertone, hair color, and face shape preferences were stored in your local Style Profile.
              </p>
            </div>
            <Button variant="primary" className="w-full" onClick={resetAndClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
