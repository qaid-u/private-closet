'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  RefreshCw,
  Bookmark,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Pin,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import { RecommendedOutfit, StylistRequest } from '@/types/stylist';
import { WardrobeItem } from '@/types/wardrobe';
import { internalFetch } from '@/net/guardedFetch';

function StylistContent() {
  const searchParams = useSearchParams();
  const pinnedQueryId = searchParams.get('pinned');

  const items = useWardrobeStore((state) => state.items);
  const saveOutfit = useWardrobeStore((state) => state.saveOutfit);
  const savedOutfits = useWardrobeStore((state) => state.savedOutfits);
  const recordOutfitWorn = useWardrobeStore((state) => state.recordOutfitWorn);

  // Preference Form States
  const [occasion, setOccasion] = useState('Dinner');
  const [weather, setWeather] = useState('Warm');
  const [colourDirection, setColourDirection] = useState('Match My Preferences');
  const [formality, setFormality] = useState<'Relaxed' | 'Balanced' | 'Polished'>('Balanced');
  const [pinnedItemId, setPinnedItemId] = useState<string>(pinnedQueryId || '');
  const [quantity, setQuantity] = useState(3);
  const [customPrompt, setCustomPrompt] = useState('');

  // Results & Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<RecommendedOutfit[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'like' | 'dislike'>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (pinnedQueryId) {
      setPinnedItemId(pinnedQueryId);
    }
  }, [pinnedQueryId]);

  const occasionsList = [
    'Everyday', 'Work', 'Smart Casual', 'Dinner', 'Date',
    'Formal Event', 'Weekend', 'Travel', 'Outdoor Activity',
  ];

  const weatherOptions = ['Hot', 'Warm', 'Sunny', 'Rainy', 'Cool', 'Cold'];
  const colourDirections = ['Match My Preferences', 'Neutral', 'Monochromatic', 'Earth Tones', 'High Contrast'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);

    try {
      const requestPayload: StylistRequest = {
        occasion,
        weather,
        colour_direction: colourDirection,
        formality_level: formality,
        pinned_item_ids: pinnedItemId ? [pinnedItemId] : [],
        quantity,
        additional_instructions: customPrompt || undefined,
      };

      const res = await internalFetch('/api/stylist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wardrobe: items,
          request: requestPayload,
        }),
      });

      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setResults(json.data);
      }
    } catch (err) {
      console.error('Failed to generate styling recommendations:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveOutfit = (outfit: RecommendedOutfit) => {
    saveOutfit(outfit);
    setSavedIds((prev) => new Set([...prev, outfit.id]));
    showToast(`Saved "${outfit.title}" to your Outfit Library!`);
  };

  const handleFeedback = (outfitId: string, rating: 'like' | 'dislike') => {
    setFeedbackGiven((prev) => ({ ...prev, [outfitId]: rating }));
    showToast(rating === 'like' ? 'Outfit liked! Ranking updated.' : 'Feedback recorded. Adjusting balance.');
  };

  const itemMap = new Map(items.map((i) => [i.id, i]));

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#3B4D42] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#C9B79C]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Heading */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5EEE9] dark:bg-[#253D36] text-[#3B4D42] dark:text-[#6FA898] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free AI · Rule Engine · Zero-Cost</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
            Your AI Stylist
          </h1>
          <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
            Fresh outfit ideas, generated exclusively from the clothes you own.
          </p>
        </div>

        {/* Stylist Configuration Form */}
        <form onSubmit={handleGenerate} className="bg-white dark:bg-[#1E1D1B] p-6 sm:p-8 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DE] dark:border-[#35322F]">
            <h2 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              Styling Request Settings
            </h2>
            <span className="text-xs text-[#747570] dark:text-[#A8A29A]">Personalized</span>
          </div>

          {/* Occasion Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-2.5">
              1. Where are you heading today?
            </label>
            <div className="flex flex-wrap gap-2">
              {occasionsList.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occ)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${occasion === occ
                      ? 'bg-[#3B4D42] text-white shadow-xs'
                      : 'bg-[#F8F7F4] dark:bg-[#282623] text-[#747570] hover:text-[#222321] dark:hover:text-[#F4F1EC]'
                    }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* Weather & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-2">
                2. Weather Conditions
              </label>
              <div className="grid grid-cols-3 gap-2">
                {weatherOptions.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeather(w)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${weather === w
                        ? 'bg-[#3B4D42] text-white shadow-xs'
                        : 'bg-[#F8F7F4] dark:bg-[#282623] text-[#747570] hover:bg-[#E6E4DE]'
                      }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Colour Direction */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-2">
                3. Colour Palette Direction
              </label>
              <select
                value={colourDirection}
                onChange={(e) => setColourDirection(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
              >
                {colourDirections.map((cd) => (
                  <option key={cd} value={cd}>
                    {cd}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pinned Item Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-2">
              4. Pin a Required Garment (Optional)
            </label>
            <select
              value={pinnedItemId}
              onChange={(e) => setPinnedItemId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
            >
              <option value="">No pinned items — let stylist choose full ensemble</option>
              {items
                .filter((i) => i.availability_status === 'Available')
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    Pin: {i.name} ({i.category} • {i.primary_color})
                  </option>
                ))}
            </select>
            {pinnedItemId && (
              <span className="text-[11px] text-[#3B4D42] dark:text-[#6FA898] font-medium mt-1 inline-flex items-center gap-1">
                <Pin className="w-3 h-3" />
                This garment will be strictly anchored into every generated combination.
              </span>
            )}
          </div>

          {/* Custom Instruction Box */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] mb-1.5">
              5. Specific Styling Instruction (Optional)
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Minimalist vibe with earth tones for an evening rooftop dinner..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden focus:border-[#3B4D42]"
            />
          </div>

          {/* Generate Action Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#C9B79C]" />
                <span>Evaluating Wardrobe Combinations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#C9B79C]" />
                <span>Generate {quantity} Outfits Now</span>
              </>
            )}
          </button>
        </form>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#222321] dark:text-[#F4F1EC]">
                Recommended Looks
              </h2>
              <span className="text-xs text-[#747570]">
                {results.length} combinations assembled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((outfit) => {
                const outfitItems = (
                  outfit.item_ids.map((id) => itemMap.get(id)).filter(Boolean) as WardrobeItem[]
                );
                const isSaved = savedIds.has(outfit.id) || savedOutfits.some((s) => s.id === outfit.id);
                const currentFeedback = feedbackGiven[outfit.id];

                return (
                  <div
                    key={outfit.id}
                    className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] overflow-hidden shadow-xs hover:border-[#3B4D42] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Flat-Lay Image Showcase */}
                      <div className="p-4 bg-[#F8F7F4] dark:bg-[#282623] border-b border-[#E6E4DE] dark:border-[#35322F]">
                        <div className="grid grid-cols-3 gap-2">
                          {outfitItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white dark:bg-[#1E1D1B] rounded-xl p-2.5 flex flex-col items-center text-center shadow-2xs"
                            >
                              <img
                                src={item.image_url || '/placeholder.svg'}
                                alt={item.name}
                                className="w-16 h-16 object-contain mb-1 rounded"
                              />
                              <span className="text-[11px] font-semibold text-[#222321] dark:text-[#F4F1EC] line-clamp-1">
                                {item.name}
                              </span>
                              <span className="text-[9px] text-[#747570] dark:text-[#A8A29A]">
                                {item.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Content & Scoring */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E5EEE9] dark:bg-[#253D36] text-[#3B4D42] dark:text-[#6FA898]">
                            Score: {outfit.overall_score}%
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0EEE9] dark:bg-[#282623] text-[#747570]">
                            {outfit.occasion}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC]">
                          {outfit.title}
                        </h3>

                        <p className="text-xs text-[#747570] dark:text-[#A8A29A] leading-relaxed">
                          {outfit.styling_reason}
                        </p>

                        {/* Styling Tips */}
                        {outfit.styling_tips?.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-[11px] text-[#747570] space-y-1">
                            <span className="font-semibold text-[#3B4D42] dark:text-[#6FA898] uppercase tracking-wider block text-[10px]">
                              Tip
                            </span>
                            <p>{outfit.styling_tips[0]}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="p-4 border-t border-[#E6E4DE] dark:border-[#35322F] flex items-center justify-between gap-3 bg-[#FAF9F6] dark:bg-[#1E1D1B]">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleFeedback(outfit.id, 'like')}
                          className={`p-2 rounded-lg border border-[#E6E4DE] dark:border-[#35322F] transition-colors ${currentFeedback === 'like' ? 'bg-[#3B4D42] text-white' : 'text-[#747570] hover:text-[#222321]'
                            }`}
                          title="Like outfit"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(outfit.id, 'dislike')}
                          className={`p-2 rounded-lg border border-[#E6E4DE] dark:border-[#35322F] transition-colors ${currentFeedback === 'dislike' ? 'bg-[#B84B4B] text-white' : 'text-[#747570] hover:text-[#222321]'
                            }`}
                          title="Dislike outfit"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleSaveOutfit(outfit)}
                        disabled={isSaved}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isSaved
                            ? 'bg-[#E5EEE9] dark:bg-[#253D36] text-[#3B4D42] dark:text-[#6FA898]'
                            : 'bg-[#3B4D42] text-white hover:bg-[#2E3D34]'
                          }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{isSaved ? 'Saved in Outfits' : 'Save Outfit'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function StylistPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] dark:bg-[#141413]">
          <div className="flex items-center gap-2 text-sm text-[#747570]">
            <Sparkles className="w-5 h-5 animate-spin text-[#3B4D42]" />
            <span>Loading AI Stylist...</span>
          </div>
        </div>
      }
    >
      <StylistContent />
    </Suspense>
  );
}
