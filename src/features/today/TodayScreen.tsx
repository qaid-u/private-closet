import React, { useState, useMemo } from 'react';
import {
  CloudRain,
  Sun,
  Cloud,
  Wind,
  Snowflake,
  Flame,
  Sparkles,
  Shield,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle,
  Plus,
  User,
  Info,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { db } from '../../data/db';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { styleProfileRepo } from '../../data/repositories/styleProfileRepo';
import { preferencesRepo, feedbackRepo } from '../../data/repositories/preferencesRepo';
import { wearLogsRepo } from '../../data/repositories/wearLogsRepo';
import { seedSampleData } from '../../data/seedService';
import { ClothingItem, StyleProfile, Preferences, WearLog } from '../../data/types';
import {
  generateRecommendations,
  learnFromFeedback,
  RecommendationContext,
  ScoredOutfit,
} from '../../engine';
import { SAMPLE_CUTOUT_SVGS } from '../../data/sampleCutouts';
import { StyleMatchSheet } from './StyleMatchSheet';
import { SwapItemSheet } from './SwapItemSheet';
import { NotMeSheet } from './NotMeSheet';
import { TunePicksSheet } from './TunePicksSheet';

interface TodayScreenProps {
  onSelectTab?: (tab: 'today' | 'closet' | 'style' | 'me') => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ onSelectTab }) => {

  // State
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [styleProfile, setProfile] = useState<StyleProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [wearLogs, setWearLogs] = useState<WearLog[]>([]);

  const loadData = React.useCallback(async () => {
    try {
      const it = await itemsRepo.getAll();
      setItems(it);
      const p = await styleProfileRepo.getProfile();
      setProfile(p || null);
      const pref = await preferencesRepo.get();
      setPreferences(pref);
      const wl = await db.wearLogs.toArray();
      setWearLogs(wl);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Tuning Context State (defaults per SPEC Section 5)
  const [context, setContext] = useState<RecommendationContext>({
    tempC: 18,
    condition: 'rain',
    occasion: 'casual',
    mood: 'cozy',
    mustInclude: [],
    avoid: [],
  });

  // Active outfit index (for mobile 1-of-3 carousel)
  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);

  // Sheets state
  const [isMatchSheetOpen, setIsMatchSheetOpen] = useState(false);
  const [isSwapSheetOpen, setIsSwapSheetOpen] = useState(false);
  const [isNotMeSheetOpen, setIsNotMeSheetOpen] = useState(false);
  const [isTuneSheetOpen, setIsTuneSheetOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom swapped outfits overrides in-session
  const [swappedOutfits, setSwappedOutfits] = useState<Record<string, ScoredOutfit>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Generate recommendations
  const recommendationResult = useMemo(() => {
    if (items.length === 0) {
      return { outfits: [], lowConfidence: true, totalEligibleItems: 0, context };
    }
    return generateRecommendations(items, context, styleProfile, preferences, wearLogs);
  }, [items, context, styleProfile, preferences, wearLogs]);

  // Apply any in-session swapped overrides
  const effectiveOutfits = useMemo(() => {
    return recommendationResult.outfits.map((outfit) => {
      return swappedOutfits[outfit.id] || outfit;
    });
  }, [recommendationResult.outfits, swappedOutfits]);

  const currentOutfit = effectiveOutfits[activeOutfitIndex] || effectiveOutfits[0] || null;

  // Handlers
  const handleWearToday = async () => {
    if (!currentOutfit) return;
    const itemIds = currentOutfit.items.map((i) => i.id);

    // 1. Create wear log
    await wearLogsRepo.create({
      date: new Date().toISOString().split('T')[0],
      itemIds,
      context: {
        tempC: context.tempC,
        condition: context.condition,
        occasion: context.occasion,
      },
    });

    // 2. Increment wornCount for each item
    for (const item of currentOutfit.items) {
      await itemsRepo.incrementWornCount(item.id);
    }

    // 3. Learn wear affinity
    if (preferences) {
      const updated = learnFromFeedback(preferences, currentOutfit, 'wear');
      await preferencesRepo.update(updated);
    }

    showToast('Outfit logged for today! Wear counts updated.');
  };

  const handleSwapItem = (slot: keyof ScoredOutfit['slots'], newItem: ClothingItem) => {
    if (!currentOutfit) return;

    const newSlots = { ...currentOutfit.slots, [slot]: newItem };
    const newItems = Object.values(newSlots).filter((i): i is ClothingItem => Boolean(i));

    const updatedOutfit: ScoredOutfit = {
      ...currentOutfit,
      items: newItems,
      slots: newSlots,
      signature: newItems.map((i) => i.id).sort().join('+'),
    };

    setSwappedOutfits((prev) => ({
      ...prev,
      [currentOutfit.id]: updatedOutfit,
    }));

    showToast(`Swapped to ${newItem.name}`);
  };

  const handleNotMeFeedback = async (reasons: string[], note: string) => {
    if (!currentOutfit) return;

    // 1. Add feedback record
    await feedbackRepo.add({
      outfitSignature: currentOutfit.signature,
      kind: 'not-me',
      reasons,
      note,
    });

    // 2. Learn into preferences
    if (preferences) {
      const updated = learnFromFeedback(preferences, currentOutfit, 'not-me', reasons);
      await preferencesRepo.update(updated);
    }

    // 3. Advance to next recommendation
    if (effectiveOutfits.length > 1) {
      setActiveOutfitIndex((prev) => (prev + 1) % effectiveOutfits.length);
    }

    showToast('Recommendation updated');
  };

  const handleThumbsFeedback = async (kind: 'up' | 'down') => {
    if (!currentOutfit) return;

    await feedbackRepo.add({
      outfitSignature: currentOutfit.signature,
      kind,
      reasons: [],
    });

    if (preferences) {
      const updated = learnFromFeedback(preferences, currentOutfit, kind);
      await preferencesRepo.update(updated);
    }

    showToast(kind === 'up' ? 'Saved to your preferences' : 'Feedback recorded');
  };

  const handleSeedSample = async () => {
    await seedSampleData();
    await loadData();
    showToast('Sample wardrobe loaded!');
  };

  // Weather condition icon helper
  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case 'rain': return <CloudRain className="w-4 h-4 text-primary" />;
      case 'sunny': return <Sun className="w-4 h-4 text-warning" />;
      case 'cloudy': return <Cloud className="w-4 h-4 text-text-secondary" />;
      case 'cold': return <Snowflake className="w-4 h-4 text-primary" />;
      case 'hot': return <Flame className="w-4 h-4 text-accent" />;
      case 'windy': return <Wind className="w-4 h-4 text-text-secondary" />;
      default: return <CloudRain className="w-4 h-4 text-primary" />;
    }
  };

  // Empty closet state
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <EmptyState
          title="Your first outfit is waiting in your closet"
          description="Private Closet helps you assemble cohesive daily looks strictly from clothes you already own. Start by adding items or explore instantly with our pre-built sample wardrobe."
          primaryActionLabel="Try with a sample closet"
          onPrimaryAction={handleSeedSample}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
          <button
            type="button"
            onClick={() => onSelectTab?.('closet')}
            className="p-4 rounded-card bg-surface border border-border hover:border-primary text-left transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Plus className="w-4 h-4" />
              <span>Add Your First Items</span>
            </div>
            <p className="text-xs text-text-secondary">
              Snap clothes flat or upload photos. Backgrounds are removed completely on-device.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.('style')}
            className="p-4 rounded-card bg-surface border border-border hover:border-primary text-left transition-all space-y-1"
          >
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <User className="w-4 h-4" />
              <span>Set Up Style Profile First</span>
            </div>
            <p className="text-xs text-text-secondary">
              Optional colors, proportion notes, and comfort preferences for sharper picks.
            </p>
          </button>
        </div>
      </div>
    );
  }

  const itemsNeededForTen = Math.max(0, 10 - items.length);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-text-primary text-surface text-xs font-semibold shadow-soft flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header per SPEC Section 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
              Good morning{styleProfile?.displayName ? `, ${styleProfile.displayName}` : ''}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-soft text-primary">
              <Shield className="w-3 h-3" />
              On device
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Clickable Weather Chip */}
        <button
          type="button"
          onClick={() => setIsTuneSheetOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-control bg-surface border border-border hover:border-primary transition-all self-start sm:self-auto text-xs text-text-secondary group"
        >
          {getWeatherIcon(context.condition)}
          <span className="font-semibold text-text-primary">
            {context.tempC}°C, {context.condition}
          </span>
          <span className="text-[10px] text-text-secondary group-hover:text-primary">
            (Manual · Tune)
          </span>
          <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary" />
        </button>
      </div>

      {/* Guidance Banners */}
      {itemsNeededForTen > 0 && (
        <div className="p-3.5 rounded-card bg-surface border border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-text-secondary">
              Add <span className="font-bold text-text-primary">{itemsNeededForTen} more items</span> to your closet for richer combinations.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onSelectTab?.('closet')}>
            Add Item
          </Button>
        </div>
      )}

      {(!styleProfile || styleProfile.completeness < 40) && (
        <div className="p-3.5 rounded-card bg-primary-soft/40 border border-primary/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-text-primary">
              Complete your <span className="font-bold">Style Profile</span> for sharper proportion and color coordination.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onSelectTab?.('style')}>
            Review Profile
          </Button>
        </div>
      )}

      {/* Main Grid: Desktop 2-column layout (Feed in center, Style Profile summary on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Center Feed / Recommendation Area */}
        <div className="lg:col-span-8 space-y-6">
          {effectiveOutfits.length === 0 ? (
            <div className="p-8 rounded-card bg-surface border border-border text-center space-y-4">
              <Sparkles className="w-8 h-8 text-primary mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-text-primary">
                  Fewer matches than usual
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Your laundry basket or current filters leave few clean combinations. Try tuning today's criteria or adding pieces.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsTuneSheetOpen(true)}>
                  Tune Filters
                </Button>
                <Button variant="primary" size="sm" onClick={() => onSelectTab?.('closet')}>
                  Go to Closet
                </Button>
              </div>
            </div>
          ) : (
            currentOutfit && (
              <div className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-6 shadow-soft transition-all">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold tracking-wider text-accent">
                        Recommendation {activeOutfitIndex + 1} of {effectiveOutfits.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMatchSheetOpen(true)}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-transform hover:scale-105 flex items-center gap-1 ${
                          currentOutfit.matchLabel === 'High'
                            ? 'bg-success/15 text-success'
                            : currentOutfit.matchLabel === 'Medium'
                            ? 'bg-warning/15 text-warning'
                            : 'bg-text-secondary/15 text-text-secondary'
                        }`}
                      >
                        <span>{currentOutfit.matchLabel} Match</span>
                        <Sparkles className="w-3 h-3" />
                      </button>
                    </div>

                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary mt-1">
                      {currentOutfit.title}
                    </h2>
                  </div>

                  {/* Feedback thumbs */}
                  <div className="flex items-center gap-1 text-text-secondary">
                    <button
                      type="button"
                      aria-label="Thumbs up"
                      onClick={() => handleThumbsFeedback('up')}
                      className="p-2 rounded-control hover:bg-surface-alt hover:text-text-primary transition-colors min-h-touch min-w-touch flex items-center justify-center"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Thumbs down"
                      onClick={() => handleThumbsFeedback('down')}
                      className="p-2 rounded-control hover:bg-surface-alt hover:text-text-primary transition-colors min-h-touch min-w-touch flex items-center justify-center"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Clothing Items Grid / Soft Cutout Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { slot: 'Top', item: currentOutfit.slots.top || currentOutfit.slots.dress },
                    { slot: 'Bottom', item: currentOutfit.slots.bottom },
                    { slot: 'Layer', item: currentOutfit.slots.outerwear },
                    { slot: 'Shoes', item: currentOutfit.slots.shoes },
                  ]
                    .filter((s) => Boolean(s.item))
                    .map(({ slot, item }) => {
                      if (!item) return null;
                      const cutoutSvg = SAMPLE_CUTOUT_SVGS[item.id];

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-card bg-surface-alt border border-border flex flex-col items-center text-center justify-between min-h-[170px] relative group hover:border-primary/40 transition-colors"
                        >
                          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary mb-1">
                            {slot}
                          </span>

                          <div className="w-20 h-20 rounded-control bg-surface flex items-center justify-center overflow-hidden border border-border/60 shadow-soft p-1.5 my-auto">
                            {cutoutSvg ? (
                              <div
                                className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                                dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                              />
                            ) : (
                              <Sparkles className="w-6 h-6 text-primary" />
                            )}
                          </div>

                          <div className="w-full pt-1.5">
                            <p className="text-xs font-bold text-text-primary truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-text-secondary truncate">
                              {item.colors[0]?.name || 'Solid'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Why it suits you chips per SPEC Section 5 */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    Why it works for you:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentOutfit.chips.map((chip, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          idx === 0
                            ? 'bg-primary-soft text-primary'
                            : 'bg-surface-alt text-text-secondary'
                        }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary Card Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="md" onClick={handleWearToday}>
                      Wear this today
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setIsSwapSheetOpen(true)}
                      rightIcon={<RefreshCw className="w-4 h-4" />}
                    >
                      Swap an item
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setIsNotMeSheetOpen(true)}
                    >
                      Not me
                    </Button>
                  </div>

                  {/* Carousel Paging Controls */}
                  {effectiveOutfits.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous recommendation"
                        disabled={activeOutfitIndex === 0}
                        onClick={() => setActiveOutfitIndex((prev) => Math.max(0, prev - 1))}
                        className="p-2 rounded-control bg-surface-alt border border-border disabled:opacity-30 hover:border-primary transition-colors text-text-primary"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex gap-1 px-1">
                        {effectiveOutfits.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            aria-label={`Go to outfit ${idx + 1}`}
                            onClick={() => setActiveOutfitIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              activeOutfitIndex === idx
                                ? 'bg-primary w-4'
                                : 'bg-border hover:bg-text-secondary'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        aria-label="Next recommendation"
                        disabled={activeOutfitIndex === effectiveOutfits.length - 1}
                        onClick={() =>
                          setActiveOutfitIndex((prev) =>
                            Math.min(effectiveOutfits.length - 1, prev + 1)
                          )
                        }
                        className="p-2 rounded-control bg-surface-alt border border-border disabled:opacity-30 hover:border-primary transition-colors text-text-primary"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Right Rail: Style Profile Summary Panel (Desktop per SPEC Section 5) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-card bg-surface border border-border space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-serif text-sm font-bold text-text-primary">
                  Your Style Summary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab?.('style')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Edit
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-secondary">Skin Undertone</span>
                <span className="font-semibold text-text-primary capitalize">
                  {styleProfile?.skin?.undertone || 'Not set'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-secondary">Face Shape</span>
                <span className="font-semibold text-text-primary capitalize">
                  {styleProfile?.faceShape || 'Not set'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-secondary">Height</span>
                <span className="font-semibold text-text-primary">
                  {styleProfile?.heightCm ? `${styleProfile.heightCm} cm` : 'Not set'}
                </span>
              </div>

              <div className="py-1 border-b border-border/50 space-y-1">
                <span className="text-text-secondary block">Proportions</span>
                <div className="flex flex-wrap gap-1">
                  {styleProfile?.proportions && styleProfile.proportions.length > 0 ? (
                    styleProfile.proportions.map((p: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-surface-alt text-[10px] font-medium text-text-secondary"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-secondary italic">Not set</span>
                  )}
                </div>
              </div>

              <div className="py-1 space-y-1">
                <span className="text-text-secondary block">Comfort Rules</span>
                <div className="flex flex-wrap gap-1">
                  {styleProfile?.comfortRules && styleProfile.comfortRules.length > 0 ? (
                    styleProfile.comfortRules.map((cr: { id: string; label: string }) => (
                      <span
                        key={cr.id}
                        className="px-2 py-0.5 rounded-full bg-primary-soft text-[10px] font-medium text-primary"
                      >
                        {cr.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-secondary italic">No rules active</span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setIsTuneSheetOpen(true)}
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            >
              Tune Today's Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Sheets */}
      <StyleMatchSheet
        isOpen={isMatchSheetOpen}
        onClose={() => setIsMatchSheetOpen(false)}
        outfit={currentOutfit}
      />

      <SwapItemSheet
        isOpen={isSwapSheetOpen}
        onClose={() => setIsSwapSheetOpen(false)}
        outfit={currentOutfit}
        allItems={items}
        context={context}
        profile={styleProfile}
        preferences={preferences}
        wearLogs={wearLogs}
        onSwap={handleSwapItem}
      />

      <NotMeSheet
        isOpen={isNotMeSheetOpen}
        onClose={() => setIsNotMeSheetOpen(false)}
        outfit={currentOutfit}
        onSubmit={handleNotMeFeedback}
      />

      <TunePicksSheet
        isOpen={isTuneSheetOpen}
        onClose={() => setIsTuneSheetOpen(false)}
        context={context}
        closetItems={items}
        onApply={(updated) => setContext(updated)}
      />
    </div>
  );
};
