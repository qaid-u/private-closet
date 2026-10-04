import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { OnDeviceBadge } from '../../ui/OnDeviceBadge';
import { ProgressBar } from '../../ui/ProgressBar';
import { Toggle } from '../../ui/Toggle';
import { ClothingItem, Category, Pattern, Fit, Season } from '../../data/types';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { imagesRepo } from '../../data/repositories/imagesRepo';
import { MockBackgroundRemover, MockItemTagger } from '../../ai/mockAdapters';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface AddItemFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: ClothingItem) => void;
}

type AddStep = 'capture' | 'processing' | 'review' | 'details' | 'duplicate_check' | 'saved';

export const AddItemFlow: React.FC<AddItemFlowProps> = ({
  isOpen,
  onClose,
  onItemAdded,
}) => {
  const [step, setStep] = useState<AddStep>('capture');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStepText, setProcessingStepText] = useState('Removing background...');
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('top');
  const [subtype, setSubtype] = useState('shirt');
  const [pattern, setPattern] = useState<Pattern>('solid');
  const [fit, setFit] = useState<Fit>('regular');
  const [seasons] = useState<Season[]>(['spring', 'autumn']);
  const [colors, setColors] = useState<{ hex: string; lab: [number, number, number]; name: string; share: number }[]>([
    { hex: '#2F5D50', lab: [36, -20, 5], name: 'Forest Green', share: 0.9 },
  ]);
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState<number | undefined>();
  const [purchaseDate] = useState('2024-05-10');
  const [notes, setNotes] = useState('');
  const [optionalFieldsOpen, setOptionalFieldsOpen] = useState(false);
  const [duplicateFound, setDuplicateFound] = useState<ClothingItem | null>(null);

  const startProcessing = async (file: Blob, fileName: string) => {
    setStep('processing');
    setProcessingProgress(15);
    setProcessingStepText('Removing background...');

    const remover = new MockBackgroundRemover();
    const tagger = new MockItemTagger();

    try {
      // 1. Remove background
      const removalResult = await remover.remove(file);
      setProcessingProgress(50);
      setProcessingStepText('Detecting type and colors...');

      // 2. Tag item
      const taggingResult = await tagger.tag(removalResult.cutout, { fileName });
      setProcessingProgress(85);
      setProcessingStepText('Suggesting tags...');

      setCutoutBlob(removalResult.cutout);
      const url = URL.createObjectURL(removalResult.cutout);
      setCutoutUrl(url);

      // Populate predicted tags
      setCategory(taggingResult.category);
      setSubtype(taggingResult.subtype);
      setPattern(taggingResult.pattern);
      setColors(taggingResult.colors);
      setName(fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'New Wardrobe Item');

      setProcessingProgress(100);
      setTimeout(() => {
        setStep('review');
      }, 300);
    } catch {
      setProcessingStepText('Failed to process image. Keeping original.');
      setCutoutBlob(file);
      setCutoutUrl(URL.createObjectURL(file));
      setStep('review');
    }
  };

  const handleCaptureSimulated = () => {
    const dummySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect x="40" y="40" width="120" height="120" rx="16" fill="#2F5D50"/></svg>`;
    const blob = new Blob([dummySvg], { type: 'image/svg+xml' });
    startProcessing(blob, 'Olive Linen Overshirt.svg');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      startProcessing(file, file.name);
    }
  };

  const handleReviewContinue = async () => {
    // Check for similar duplicate item in closet
    const existing = await itemsRepo.getAll();
    const duplicate = existing.find(
      (item) => item.category === category && item.colors[0]?.name === colors[0]?.name
    );

    if (duplicate) {
      setDuplicateFound(duplicate);
      setStep('duplicate_check');
    } else {
      setStep('details');
    }
  };

  const handleSaveItem = async () => {
    const itemId = `item-${Date.now()}`;
    const cutoutId = `cutout-${itemId}`;

    if (cutoutBlob) {
      await imagesRepo.saveBlob(cutoutId, cutoutBlob, 'image/svg+xml');
    }

    const newItem: ClothingItem = {
      id: itemId,
      name: name || 'Wardrobe Item',
      category,
      subtype,
      colors,
      pattern,
      styleTags: ['classic', 'minimal'],
      formality: 1,
      warmth: 1,
      fit,
      seasons,
      brand: brand || undefined,
      price: price || undefined,
      purchaseDate,
      notes: notes || undefined,
      status: 'clean',
      favorite: false,
      imageCutoutId: cutoutId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await itemsRepo.save(newItem);
    onItemAdded(newItem);
    setStep('saved');
  };

  const resetFlow = () => {
    setStep('capture');
    setName('');
    setCutoutBlob(null);
    if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    setCutoutUrl(null);
    setDuplicateFound(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetFlow();
        onClose();
      }}
      title="Add Item to Closet"
      description="100% on-device image processing and tagging"
    >
      <div className="space-y-5 text-sm">
        {/* Step 1: Capture */}
        {step === 'capture' && (
          <div className="space-y-4 text-center">
            {/* Camera Viewfinder frame */}
            <div className="relative w-full h-64 bg-surface-alt rounded-card border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden p-4">
              {/* Garment framing guide box */}
              <div className="w-48 h-48 rounded-card border-2 border-primary/50 flex flex-col items-center justify-center bg-primary/5 space-y-1">
                <Camera className="w-8 h-8 text-primary/60" />
                <span className="text-[11px] text-text-secondary font-medium text-center px-4">
                  Frame garment inside outline
                </span>
              </div>

              {/* Tip badge */}
              <div className="absolute bottom-3 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-text-secondary border border-border shadow-soft">
                Tip: Lay the item flat on a plain, contrasting surface.
              </div>
            </div>

            {/* Batch toggle */}
            <div className="flex items-center justify-between p-3 rounded-control bg-surface-alt border border-border">
              <span className="text-xs font-medium text-text-primary">Batch capture mode</span>
              <Toggle
                checked={isBatchMode}
                onChange={() => setIsBatchMode(!isBatchMode)}
                label="Toggle batch capture"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-control border border-border bg-surface text-text-primary text-xs font-semibold hover:bg-surface-alt transition-colors min-h-touch">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo</span>
                </span>
              </label>

              <Button
                variant="primary"
                onClick={handleCaptureSimulated}
                leftIcon={<Camera className="w-4 h-4" />}
              >
                Capture Photo (Simulated)
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="space-y-5 py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <OnDeviceBadge label="On Device" size="sm" />
              <span className="text-xs font-semibold text-text-primary">Neural Background Extraction</span>
            </div>

            <ProgressBar value={processingProgress} label={processingStepText} showPercent={true} />

            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              Running client-side background removal and k-means color extraction. Nothing leaves your device.
            </p>

            <Button variant="ghost" size="sm" onClick={() => setStep('capture')}>
              Cancel
            </Button>
          </div>
        )}

        {/* Step 3: Review Tags */}
        {step === 'review' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-card bg-surface-alt border border-border">
              <div className="w-20 h-20 rounded-control bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
                {cutoutUrl ? (
                  <img src={cutoutUrl} alt="Preview" className="w-full h-full object-contain filter drop-shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-full" style={{ backgroundColor: colors[0]?.hex }} />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary">AI Tag Suggestions</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Review and adjust suggested attributes before saving to your closet.
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Category
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['top', 'bottom', 'outerwear', 'shoes', 'dress', 'accessory'] as Category[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`p-2 rounded-control text-xs font-medium border capitalize text-center min-h-touch ${
                      category === c
                        ? 'border-primary bg-primary text-white font-bold'
                        : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors & Pattern */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Dominant Color
                </label>
                <div className="flex items-center gap-2 p-2 rounded-control bg-surface border border-border">
                  <span
                    className="w-4 h-4 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: colors[0]?.hex }}
                  />
                  <span className="text-xs font-medium truncate">{colors[0]?.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Pattern
                </label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value as Pattern)}
                  className="w-full p-2 rounded-control bg-surface border border-border text-xs text-text-primary capitalize min-h-touch"
                  aria-label="Garment pattern"
                >
                  <option value="solid">Solid</option>
                  <option value="striped">Striped</option>
                  <option value="check">Check / Plaid</option>
                  <option value="floral">Floral</option>
                  <option value="graphic">Graphic</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setStep('capture')}>
                Retake
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleReviewContinue}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Details
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Duplicate Warning Check */}
        {step === 'duplicate_check' && duplicateFound && (
          <div className="space-y-4">
            <div className="p-3 rounded-card bg-warning/10 border border-warning/20 text-xs text-warning space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>You may already own something similar</span>
              </div>
              <p className="text-text-primary">
                A similar {category} in {colors[0]?.name} ({duplicateFound.name}) is already in your closet.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-card bg-surface-alt border border-border space-y-2">
                <span className="text-[10px] text-text-secondary uppercase font-bold block">
                  Existing Item
                </span>
                <span className="text-xs font-bold block">{duplicateFound.name}</span>
                <span className="text-[11px] text-text-secondary capitalize">{duplicateFound.category}</span>
              </div>

              <div className="p-3 rounded-card bg-primary-soft/40 border border-primary/20 space-y-2">
                <span className="text-[10px] text-primary uppercase font-bold block">
                  New Item
                </span>
                <span className="text-xs font-bold block">{name}</span>
                <span className="text-[11px] text-text-secondary capitalize">{category}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStep('capture')}>
                Skip This One
              </Button>
              <Button variant="primary" size="sm" onClick={() => setStep('details')}>
                Keep Both Items
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Details Form */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="item-name" className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
                Item Name
              </label>
              <input
                id="item-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Olive Linen Overshirt"
                className="w-full px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-touch"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="item-brand" className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
                  Brand / Label
                </label>
                <input
                  id="item-brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Uniqlo"
                  className="w-full px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-xs min-h-touch"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="item-price" className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
                  Price ($)
                </label>
                <input
                  id="item-price"
                  type="number"
                  value={price || ''}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 60"
                  className="w-full px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-xs min-h-touch"
                />
              </div>
            </div>

            {/* Collapsed Optional Fields */}
            <div className="border-t border-border pt-2">
              <button
                type="button"
                onClick={() => setOptionalFieldsOpen(!optionalFieldsOpen)}
                className="flex items-center justify-between w-full text-xs font-semibold text-text-secondary hover:text-text-primary py-1"
              >
                <span>Optional Details (Seasons, Notes, Fit)</span>
                {optionalFieldsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {optionalFieldsOpen && (
                <div className="p-3 mt-2 rounded-control bg-surface-alt border border-border space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                      Fit
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['fitted', 'regular', 'relaxed', 'oversized'] as Fit[]).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFit(f)}
                          className={`p-1.5 rounded-control text-[11px] border capitalize text-center ${
                            fit === f
                              ? 'border-primary bg-primary text-white font-bold'
                              : 'border-border bg-surface text-text-secondary'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="item-notes" className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                      Care & Styling Notes
                    </label>
                    <textarea
                      id="item-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Cold wash, hang dry"
                      rows={2}
                      className="w-full px-2.5 py-1.5 rounded-control border border-border bg-surface text-text-primary text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveItem}>
                Save to Closet
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Saved Confirmation */}
        {step === 'saved' && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Saved to Your Closet!
              </h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                "{name}" is stored locally in IndexedDB and ready to be matched into complete daily outfits.
              </p>
            </div>

            <div className="flex gap-2 pt-2 justify-center">
              <Button variant="outline" size="sm" onClick={resetFlow} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Another
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  resetFlow();
                  onClose();
                }}
              >
                View Closet
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
