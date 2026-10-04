import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { ProgressBar } from '../../ui/ProgressBar';
import { OnDeviceBadge } from '../../ui/OnDeviceBadge';
import { SwatchPicker } from '../../ui/SwatchPicker';
import { QuizPairCard } from '../../ui/QuizPairCard';
import { Slider } from '../../ui/Slider';
import { Toggle } from '../../ui/Toggle';
import { SelfieCheckModal } from './SelfieCheckModal';
import {
  OvalFaceIcon,
  RoundFaceIcon,
  SquareFaceIcon,
  HeartFaceIcon,
  OblongFaceIcon,
  DiamondFaceIcon,
} from './FaceShapeIllustrations';
import { StyleProfile } from '../../data/types';
import { styleProfileRepo } from '../../data/repositories/styleProfileRepo';
import {
  ArrowRight,
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Plus,
  X,
  Check,
} from 'lucide-react';

interface StyleProfileWizardProps {
  initialProfile?: StyleProfile | null;
  onComplete: (profile: StyleProfile) => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 8;

const INCLUSIVE_SKIN_SWATCHES = [
  { id: 'light-warm', name: 'Fair Warm', hex: '#FAD8C0' },
  { id: 'light-cool', name: 'Fair Cool', hex: '#F5CEBE' },
  { id: 'light-neutral', name: 'Fair Neutral', hex: '#F0D5C3' },
  { id: 'med-warm', name: 'Medium Warm', hex: '#D8A07A' },
  { id: 'med-neutral', name: 'Medium Neutral', hex: '#C6936F' },
  { id: 'med-cool', name: 'Medium Cool', hex: '#C2886E' },
  { id: 'deep-warm', name: 'Deep Warm', hex: '#8C5338' },
  { id: 'deep-neutral', name: 'Deep Neutral', hex: '#633B26' },
  { id: 'deep-cool', name: 'Rich Espresso', hex: '#3B2317' },
];

const HAIR_COLORS = [
  { id: 'black', name: 'Jet Black', hex: '#1A1817' },
  { id: 'dark-brown', name: 'Dark Brown', hex: '#3B2F2F' },
  { id: 'medium-brown', name: 'Chestnut Brown', hex: '#5E4334' },
  { id: 'blonde', name: 'Honey Blonde', hex: '#C8A66D' },
  { id: 'red', name: 'Auburn / Copper', hex: '#8B4513' },
  { id: 'grey', name: 'Silver / Grey', hex: '#A8A29E' },
  { id: 'creative', name: 'Creative / Pastel', hex: '#9333EA' },
];

const PROPORTION_OPTIONS = [
  { id: 'broad-shoulders', label: 'Broad shoulders' },
  { id: 'narrow-shoulders', label: 'Narrow shoulders' },
  { id: 'longer-torso', label: 'Longer torso' },
  { id: 'shorter-torso', label: 'Shorter torso' },
  { id: 'longer-legs', label: 'Longer legs' },
  { id: 'shorter-legs', label: 'Shorter legs' },
  { id: 'athletic-build', label: 'Athletic build' },
  { id: 'soft-build', label: 'Soft build' },
  { id: 'balanced', label: 'Balanced proportions' },
];

const TASTE_PAIRS = [
  {
    id: 'blazer-vs-cardigan',
    optionA: { label: 'Tailored Blazer', description: 'Structured lapels, clean architecture' },
    optionB: { label: 'Soft Knit Cardigan', description: 'Relaxed drape, tactile comfort' },
  },
  {
    id: 'shirt-vs-tee',
    optionA: { label: 'Crisp Button-Down', description: 'Clean poplin, polished collar' },
    optionB: { label: 'Relaxed Boxy Tee', description: 'Heavyweight jersey, effortless fit' },
  },
  {
    id: 'trousers-vs-denim',
    optionA: { label: 'Pleated Trousers', description: 'Fluid wool blend, high rise' },
    optionB: { label: 'Straight Denim', description: 'Washed selvedge, lived-in feel' },
  },
  {
    id: 'sneakers-vs-loafers',
    optionA: { label: 'Minimal Leather Sneakers', description: 'Monochrome, modern silhouette' },
    optionB: { label: 'Classic Penny Loafers', description: 'Rich leather, timeless grounding' },
  },
  {
    id: 'tonal-vs-earthy',
    optionA: { label: 'Tonal Monochrome', description: 'Navy, charcoal, crisp black & white' },
    optionB: { label: 'Earthy Warmth', description: 'Olive, terracotta, warm camel & cream' },
  },
  {
    id: 'trench-vs-field',
    optionA: { label: 'Belted Trench', description: 'Classic proportion, rain ready' },
    optionB: { label: 'Utility Field Jacket', description: 'Functional pockets, durable canvas' },
  },
];

const BUILTIN_COMFORT_RULES = [
  { id: 'no-sleeveless', label: 'Never suggest sleeveless' },
  { id: 'no-skinny', label: 'No skinny fits' },
  { id: 'avoid-wool', label: 'Avoid wool' },
  { id: 'no-high-necklines', label: 'No high necklines' },
  { id: 'prefer-flats', label: 'Prefer flat shoes' },
];

export const StyleProfileWizard: React.FC<StyleProfileWizardProps> = ({
  initialProfile,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSelfieOpen, setIsSelfieOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customRuleText, setCustomRuleText] = useState('');

  // Profile Form State
  const [skinDepth, setSkinDepth] = useState<'light' | 'medium' | 'deep'>(
    initialProfile?.skin?.depth || 'medium'
  );
  const [swatchHex, setSwatchHex] = useState(initialProfile?.skin?.swatchHex || '#D8A07A');
  const [undertone, setUndertone] = useState<'warm' | 'cool' | 'neutral' | 'unsure'>(
    initialProfile?.skin?.undertone || 'warm'
  );

  const [hairColorHex, setHairColorHex] = useState(initialProfile?.hair?.colorHex || '#3B2F2F');
  const [hairColorName, setHairColorName] = useState(initialProfile?.hair?.colorName || 'Dark Brown');
  const [hairLength, setHairLength] = useState<'short' | 'medium' | 'long'>(
    initialProfile?.hair?.length || 'medium'
  );
  const [hairTexture, setHairTexture] = useState<'straight' | 'wavy' | 'curly' | 'coily'>(
    initialProfile?.hair?.texture || 'wavy'
  );

  const [faceShape, setFaceShape] = useState<
    'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond' | 'unsure'
  >(initialProfile?.faceShape || 'oval');

  const [heightCm, setHeightCm] = useState<number | undefined>(initialProfile?.heightCm || 175);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ftin'>(initialProfile?.heightUnit || 'cm');

  const [selectedProportions, setSelectedProportions] = useState<string[]>(
    initialProfile?.proportions || ['broad-shoulders', 'longer-torso']
  );
  const [fitPreference, setFitPreference] = useState<number>(initialProfile?.fitPreference ?? 0.6);
  const [weightKg, setWeightKg] = useState<number | undefined>(initialProfile?.advanced?.weightKg);

  const [quizAnswers, setQuizAnswers] = useState<{ pairId: string; choice: 'a' | 'b' | 'both' | 'neither' }[]>(
    initialProfile?.taste?.quizAnswers || [
      { pairId: 'blazer-vs-cardigan', choice: 'a' },
      { pairId: 'shirt-vs-tee', choice: 'b' },
      { pairId: 'trousers-vs-denim', choice: 'a' },
    ]
  );
  const [styleTags, setStyleTags] = useState<string[]>(
    initialProfile?.taste?.tags || ['minimal', 'classic', 'sporty']
  );

  const [comfortRules, setComfortRules] = useState<{ id: string; label: string; kind: 'builtin' | 'custom' }[]>(
    initialProfile?.comfortRules || [
      { id: 'no-skinny', label: 'No skinny fits', kind: 'builtin' },
      { id: 'avoid-wool', label: 'Avoid wool', kind: 'builtin' },
      { id: 'prefer-flats', label: 'Prefer flat shoes', kind: 'builtin' },
    ]
  );

  // Compute profile completeness score (0 to 100%)
  const computeCompleteness = (): number => {
    let score = 0;
    if (skinDepth && undertone) score += 20;
    if (hairColorHex && hairLength) score += 15;
    if (faceShape && faceShape !== 'unsure') score += 15;
    if (heightCm) score += 10;
    if (selectedProportions.length > 0) score += 15;
    if (quizAnswers.length >= 3) score += 15;
    if (comfortRules.length > 0) score += 10;
    return Math.min(100, score);
  };

  const toggleProportion = (id: string) => {
    setSelectedProportions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleStyleTag = (tag: string) => {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleBuiltinComfortRule = (id: string, label: string) => {
    setComfortRules((prev) => {
      const exists = prev.some((r) => r.id === id);
      if (exists) {
        return prev.filter((r) => r.id !== id);
      }
      return [...prev, { id, label, kind: 'builtin' }];
    });
  };

  const addCustomComfortRule = () => {
    if (!customRuleText.trim()) return;
    const newRule = {
      id: `custom-${Date.now()}`,
      label: customRuleText.trim(),
      kind: 'custom' as const,
    };
    setComfortRules((prev) => [...prev, newRule]);
    setCustomRuleText('');
  };

  const removeComfortRule = (id: string) => {
    setComfortRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSelfieResults = (res: {
    depth: 'light' | 'medium' | 'deep';
    swatchHex: string;
    undertone: 'warm' | 'cool' | 'neutral' | 'unsure';
    hairColor: string;
    hairColorName: string;
    faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond' | 'unsure';
  }) => {
    setSkinDepth(res.depth);
    setSwatchHex(res.swatchHex);
    setUndertone(res.undertone);
    setHairColorHex(res.hairColor);
    setHairColorName(res.hairColorName);
    setFaceShape(res.faceShape);
  };

  const handleSaveAndComplete = async () => {
    const profile: StyleProfile = {
      id: 'current',
      skin: {
        depth: skinDepth,
        swatchHex,
        undertone,
        source: 'manual',
      },
      hair: {
        colorHex: hairColorHex,
        colorName: hairColorName,
        length: hairLength,
        texture: hairTexture,
      },
      faceShape,
      heightCm,
      heightUnit,
      proportions: selectedProportions,
      fitPreference,
      taste: {
        quizAnswers,
        tags: styleTags,
      },
      comfortRules,
      advanced: weightKg ? { weightKg } : undefined,
      completeness: computeCompleteness(),
      updatedAt: Date.now(),
    };

    await styleProfileRepo.saveProfile(profile);
    onComplete(profile);
  };

  const progressPercent = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header & Progress */}
      <div className="space-y-3 pb-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-text-primary">
              Style Profile Setup
            </span>
            <span className="text-xs text-text-secondary">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <OnDeviceBadge label="Stored on device" size="sm" />
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-text-secondary">
              Do this later
            </Button>
          </div>
        </div>

        <ProgressBar value={progressPercent} showPercent={false} className="h-1.5" />
      </div>

      {/* Step 1: Skin Tone and Undertone */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-text-primary">Skin Depth & Undertone</h2>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Camera className="w-4 h-4 text-primary" />}
                onClick={() => setIsSelfieOpen(true)}
              >
                Selfie Check
              </Button>
            </div>
            <p className="text-xs text-text-secondary">
              Helps select color harmonies and contrast levels. Everything works with your proportions.
            </p>
          </div>

          {/* Skin Depth Segment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Skin Depth
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'medium', 'deep'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSkinDepth(d)}
                  className={`p-3 rounded-control text-xs font-medium border capitalize transition-all min-h-touch ${
                    skinDepth === d
                      ? 'bg-primary-soft border-primary text-primary font-bold shadow-soft'
                      : 'border-border bg-surface hover:bg-surface-alt text-text-secondary'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Swatch Palette Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Nearest Tone Swatch
            </label>
            <SwatchPicker
              options={INCLUSIVE_SKIN_SWATCHES}
              selectedId={INCLUSIVE_SKIN_SWATCHES.find((s) => s.hex === swatchHex)?.id || 'med-warm'}
              onSelect={(id) => {
                const found = INCLUSIVE_SKIN_SWATCHES.find((s) => s.id === id);
                if (found) setSwatchHex(found.hex);
              }}
            />
          </div>

          {/* Undertone Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Undertone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'warm', label: 'Warm', desc: 'Golden / Olive' },
                { id: 'cool', label: 'Cool', desc: 'Rosy / Blue' },
                { id: 'neutral', label: 'Neutral', desc: 'Balanced' },
                { id: 'unsure', label: 'Not Sure', desc: 'Versatile' },
              ].map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUndertone(u.id as typeof undertone)}
                  className={`p-3 rounded-control text-left border transition-all min-h-touch ${
                    undertone === u.id
                      ? 'bg-primary-soft border-primary text-primary font-bold shadow-soft'
                      : 'border-border bg-surface hover:bg-surface-alt text-text-secondary'
                  }`}
                >
                  <span className="block text-xs font-semibold">{u.label}</span>
                  <span className="block text-[10px] text-text-secondary">{u.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Hair Details */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-text-primary">Hair Color & Texture</h2>
            <p className="text-xs text-text-secondary">
              Guides framing and contrast pairings near the neckline and collar.
            </p>
          </div>

          {/* Hair Color */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Hair Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HAIR_COLORS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setHairColorHex(h.hex);
                    setHairColorName(h.name);
                  }}
                  className={`p-2.5 rounded-control border flex items-center gap-2 transition-all min-h-touch ${
                    hairColorHex === h.hex
                      ? 'border-primary bg-primary-soft text-primary font-bold'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: h.hex }}
                  />
                  <span className="text-xs truncate">{h.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Hair Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['short', 'medium', 'long'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setHairLength(l)}
                  className={`p-3 rounded-control text-xs font-medium border capitalize min-h-touch ${
                    hairLength === l
                      ? 'bg-primary-soft border-primary text-primary font-bold shadow-soft'
                      : 'border-border bg-surface hover:bg-surface-alt text-text-secondary'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Texture */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Hair Texture
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['straight', 'wavy', 'curly', 'coily'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setHairTexture(t)}
                  className={`p-3 rounded-control text-xs font-medium border capitalize min-h-touch ${
                    hairTexture === t
                      ? 'bg-primary-soft border-primary text-primary font-bold shadow-soft'
                      : 'border-border bg-surface hover:bg-surface-alt text-text-secondary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Face Shape with Illustrations */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-text-primary">Face Shape</h2>
            <p className="text-xs text-text-secondary">
              Informs neckline and collar recommendations that harmonize with your natural features.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'oval', label: 'Oval', icon: <OvalFaceIcon /> },
              { id: 'round', label: 'Round', icon: <RoundFaceIcon /> },
              { id: 'square', label: 'Square', icon: <SquareFaceIcon /> },
              { id: 'heart', label: 'Heart', icon: <HeartFaceIcon /> },
              { id: 'oblong', label: 'Oblong', icon: <OblongFaceIcon /> },
              { id: 'diamond', label: 'Diamond', icon: <DiamondFaceIcon /> },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFaceShape(f.id as typeof faceShape)}
                className={`p-4 rounded-card border flex flex-col items-center text-center gap-2 transition-all min-h-touch ${
                  faceShape === f.id
                    ? 'border-primary bg-primary-soft text-primary font-bold shadow-soft ring-1 ring-primary'
                    : 'border-border bg-surface text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                }`}
              >
                <div className="text-current">{f.icon}</div>
                <span className="text-xs font-semibold">{f.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFaceShape('unsure')}
            className={`text-xs text-center block w-full py-2 hover:underline ${
              faceShape === 'unsure' ? 'text-primary font-bold' : 'text-text-secondary'
            }`}
          >
            I'm not sure (use general neckline rules)
          </button>
        </Card>
      )}

      {/* Step 4: Height */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-text-primary">Height</h2>
            <p className="text-xs text-text-secondary">
              Calibrates garment hem lengths and layering proportions to work with your proportions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label htmlFor="height-input" className="text-xs font-semibold uppercase tracking-wider text-text-secondary block mb-1">
                Your Height ({heightUnit})
              </label>
              <input
                id="height-input"
                type="number"
                min={100}
                max={250}
                value={heightCm || ''}
                onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 175"
                className="w-full px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-touch"
              />
            </div>

            <div className="pt-5">
              <div className="inline-flex rounded-control border border-border p-0.5 bg-surface-alt">
                <button
                  type="button"
                  onClick={() => setHeightUnit('cm')}
                  className={`px-3 py-1.5 rounded-control text-xs font-medium transition-colors ${
                    heightUnit === 'cm'
                      ? 'bg-surface text-text-primary shadow-soft font-bold'
                      : 'text-text-secondary'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setHeightUnit('ftin')}
                  className={`px-3 py-1.5 rounded-control text-xs font-medium transition-colors ${
                    heightUnit === 'ftin'
                      ? 'bg-surface text-text-primary shadow-soft font-bold'
                      : 'text-text-secondary'
                  }`}
                >
                  ft / in
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 5: Build & Proportions */}
      {currentStep === 5 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-text-primary">Build & Proportions</h2>
            <p className="text-xs text-text-secondary">
              Select proportion tendencies. Advice is always proportion-based and positive: works with your proportions.
            </p>
          </div>

          {/* Proportion Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Proportion Tendencies
            </label>
            <div className="flex flex-wrap gap-2">
              {PROPORTION_OPTIONS.map((opt) => {
                const isSelected = selectedProportions.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleProportion(opt.id)}
                    className={`px-3 py-2 rounded-full text-xs font-medium border transition-all min-h-touch ${
                      isSelected
                        ? 'bg-primary-soft border-primary text-primary font-bold shadow-soft'
                        : 'border-border bg-surface hover:bg-surface-alt text-text-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fit Preference Slider */}
          <div className="space-y-2 pt-2">
            <Slider
              value={Math.round(fitPreference * 100)}
              onChange={(val) => setFitPreference(val / 100)}
              min={0}
              max={100}
              label="General Fit Preference"
            />
            <div className="flex justify-between text-[11px] text-text-secondary">
              <span>Fitted & Tailored</span>
              <span>Regular</span>
              <span>Relaxed & Oversized</span>
            </div>
          </div>

          {/* Collapsed Advanced Section for Tailoring Notes only */}
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center justify-between w-full text-xs font-semibold text-text-secondary hover:text-text-primary py-2"
            >
              <span>Advanced Tailoring Measurements (Optional)</span>
              {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {advancedOpen && (
              <div className="p-3 mt-2 rounded-control bg-surface-alt border border-border space-y-2">
                <p className="text-[11px] text-text-secondary">
                  Optional tailoring reference. Never displayed in summaries.
                </p>
                <div className="max-w-xs">
                  <label htmlFor="weight-input" className="text-xs font-medium text-text-primary block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    id="weight-input"
                    type="number"
                    value={weightKg || ''}
                    onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 65"
                    className="w-full px-3 py-1.5 rounded-control border border-border bg-surface text-text-primary text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 6: Taste Quiz & Tags */}
      {currentStep === 6 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-text-primary">Aesthetic Taste Quiz</h2>
            <p className="text-xs text-text-secondary">
              Quickly indicate your instinct for garment textures and silhouettes. Both and Neither are always welcome.
            </p>
          </div>

          {/* Taste Quiz Cards */}
          <div className="space-y-4">
            {TASTE_PAIRS.slice(0, 3).map((pair, idx) => {
              const currentChoice = quizAnswers.find((a) => a.pairId === pair.id)?.choice || 'both';
              return (
                <QuizPairCard
                  key={pair.id}
                  id={pair.id}
                  pairNumber={idx + 1}
                  totalPairs={3}
                  optionA={pair.optionA}
                  optionB={pair.optionB}
                  selectedChoice={currentChoice}
                  onSelectChoice={(choice) => {
                    setQuizAnswers((prev) => [
                      ...prev.filter((a) => a.pairId !== pair.id),
                      { pairId: pair.id, choice },
                    ]);
                  }}
                />
              );
            })}
          </div>

          {/* Style Tags */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Style Descriptors
            </label>
            <div className="flex flex-wrap gap-2">
              {['minimal', 'classic', 'street', 'sporty', 'creative'].map((tag) => {
                const isSelected = styleTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleStyleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all min-h-touch ${
                      isSelected
                        ? 'bg-primary-soft border-primary text-primary font-bold shadow-soft'
                        : 'border-border bg-surface hover:bg-surface-alt text-text-secondary'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Step 7: Comfort Rules */}
      {currentStep === 7 && (
        <Card className="p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-text-primary">Comfort Rules</h2>
            <p className="text-xs text-text-secondary">
              Hard constraints the recommendation engine will never violate.
            </p>
          </div>

          {/* Built-in Toggles */}
          <div className="space-y-2">
            {BUILTIN_COMFORT_RULES.map((rule) => {
              const isEnabled = comfortRules.some((r) => r.id === rule.id);
              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 rounded-control bg-surface-alt border border-border"
                >
                  <span className="text-xs font-medium text-text-primary">{rule.label}</span>
                  <Toggle
                    checked={isEnabled}
                    onChange={() => toggleBuiltinComfortRule(rule.id, rule.label)}
                    label={`Enable ${rule.label}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Custom Rules List & Input */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Custom Rules
            </label>
            {comfortRules
              .filter((r) => r.kind === 'custom')
              .map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between px-3 py-2 rounded-control bg-surface border border-border text-xs"
                >
                  <span>{rule.label}</span>
                  <button
                    type="button"
                    onClick={() => removeComfortRule(rule.id)}
                    className="text-text-secondary hover:text-danger p-1"
                    aria-label={`Remove rule ${rule.label}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={customRuleText}
                onChange={(e) => setCustomRuleText(e.target.value)}
                placeholder="e.g. Avoid synthetic polyester"
                className="flex-1 px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-touch"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomComfortRule();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomComfortRule}
                disabled={!customRuleText.trim()}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Rule
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 8: Summary & Confirmation */}
      {currentStep === 8 && (
        <Card className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-text-primary">Style Profile Summary</h2>
              <p className="text-xs text-text-secondary">
                Used only to choose outfits for you. Stored only on this device.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary-soft text-primary font-serif font-bold text-base flex items-center justify-center border border-primary/20">
                {computeCompleteness()}%
              </div>
              <span className="text-[10px] text-text-secondary mt-1">Completeness</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-control bg-surface-alt border border-border space-y-1">
              <span className="text-text-secondary uppercase tracking-wider text-[10px] font-bold block">
                Color Palette & Tone
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-border inline-block"
                  style={{ backgroundColor: swatchHex }}
                />
                <span className="font-medium text-text-primary capitalize">
                  {skinDepth} &bull; {undertone} undertone
                </span>
              </div>
            </div>

            <div className="p-3 rounded-control bg-surface-alt border border-border space-y-1">
              <span className="text-text-secondary uppercase tracking-wider text-[10px] font-bold block">
                Face & Hair
              </span>
              <span className="font-medium text-text-primary capitalize">
                {faceShape} face &bull; {hairColorName} ({hairLength})
              </span>
            </div>

            <div className="p-3 rounded-control bg-surface-alt border border-border space-y-1">
              <span className="text-text-secondary uppercase tracking-wider text-[10px] font-bold block">
                Proportion Rules
              </span>
              <span className="font-medium text-text-primary">
                {selectedProportions.length > 0
                  ? selectedProportions.map((p) => p.replace('-', ' ')).join(', ')
                  : 'Balanced guidelines'}
              </span>
            </div>

            <div className="p-3 rounded-control bg-surface-alt border border-border space-y-1">
              <span className="text-text-secondary uppercase tracking-wider text-[10px] font-bold block">
                Active Comfort Rules
              </span>
              <span className="font-medium text-text-primary">
                {comfortRules.length} rule{comfortRules.length === 1 ? '' : 's'} enforced
              </span>
            </div>
          </div>

          <div className="p-3 rounded-card bg-primary-soft text-text-primary text-xs flex items-center gap-2 border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>
              Your profile is stored 100% locally in IndexedDB. You can edit or delete this data anytime from the Me tab.
            </span>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <div className="flex gap-2">
          {currentStep < TOTAL_STEPS ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1))}
                className="text-xs text-text-secondary"
              >
                Skip Step
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1))}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={handleSaveAndComplete}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Style Profile
            </Button>
          )}
        </div>
      </div>

      {/* Selfie Check Modal */}
      <SelfieCheckModal
        isOpen={isSelfieOpen}
        onClose={() => setIsSelfieOpen(false)}
        onApplyResults={handleSelfieResults}
      />
    </div>
  );
};
