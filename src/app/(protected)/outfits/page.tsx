'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  Heart,
  Calendar,
  CheckCircle2,
  Trash2,
  FolderPlus,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';

export default function OutfitsLibraryPage() {
  const savedOutfits = useWardrobeStore((state) => state.savedOutfits);
  const items = useWardrobeStore((state) => state.items);
  const collections = useWardrobeStore((state) => state.collections);
  const toggleFavouriteOutfit = useWardrobeStore((state) => state.toggleFavouriteOutfit);
  const deleteOutfit = useWardrobeStore((state) => state.deleteOutfit);
  const recordOutfitWorn = useWardrobeStore((state) => state.recordOutfitWorn);

  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const itemMap = new Map(items.map((i) => [i.id, i]));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredOutfits = savedOutfits.filter((outfit) => {
    if (selectedCollection === 'All') return true;
    const col = collections.find((c) => c.id === selectedCollection);
    return col?.outfit_ids.includes(outfit.id);
  });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#3B4D42] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#C9B79C]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              Outfit Library
            </h1>
            <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
              Your curated catalog of looks, assembled from pieces you own.
            </p>
          </div>

          <Link
            href="/stylist"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#C9B79C]" />
            <span>Generate New Outfits</span>
          </Link>
        </div>

        {/* Collection Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCollection('All')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCollection === 'All'
                ? 'bg-[#3B4D42] text-white shadow-xs'
                : 'bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-[#747570] hover:text-[#222321]'
            }`}
          >
            All Looks ({savedOutfits.length})
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedCollection(col.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCollection === col.id
                  ? 'bg-[#3B4D42] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-[#747570] hover:text-[#222321]'
              }`}
            >
              {col.name} ({col.outfit_ids.length})
            </button>
          ))}
        </div>

        {/* Outfits Grid */}
        {filteredOutfits.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-[#747570] mx-auto" />
            <h3 className="font-serif text-lg font-bold">No saved outfits in this collection</h3>
            <p className="text-sm text-[#747570]">
              Use the AI Stylist to generate looks from your closet and save them here.
            </p>
            <Link
              href="/stylist"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B4D42] text-white text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Stylist</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutfits.map((outfit) => {
              const outfitItems = outfit.item_ids
                .map((id) => itemMap.get(id))
                .filter(Boolean) as typeof items;

              return (
                <div
                  key={outfit.id}
                  className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] overflow-hidden shadow-xs hover:border-[#3B4D42] transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Flat-Lay Image Mosaic */}
                    <div className="p-4 bg-[#F8F7F4] dark:bg-[#282623] border-b border-[#E6E4DE] dark:border-[#35322F] relative">
                      <button
                        onClick={() => toggleFavouriteOutfit(outfit.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm text-[#747570] hover:text-[#B84B4B] transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            outfit.is_favourite ? 'fill-[#B84B4B] text-[#B84B4B]' : ''
                          }`}
                        />
                      </button>

                      <div className="grid grid-cols-3 gap-2">
                        {outfitItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white dark:bg-[#1E1D1B] rounded-xl p-2 flex flex-col items-center text-center shadow-2xs"
                          >
                            <img
                              src={item.image_url || '/placeholder.svg'}
                              alt={item.name}
                              className="w-14 h-14 object-contain mb-1"
                            />
                            <span className="text-[10px] font-semibold text-[#222321] dark:text-[#F4F1EC] line-clamp-1">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B4D42] dark:text-[#6FA898]">
                          {outfit.occasion}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5EEE9] text-[#3B4D42] dark:bg-[#253D36] dark:text-[#6FA898] font-bold">
                          {outfit.overall_score}% Match
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC] line-clamp-1">
                        {outfit.title}
                      </h3>

                      <p className="text-xs text-[#747570] dark:text-[#A8A29A] line-clamp-2 leading-relaxed">
                        {outfit.styling_reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="p-4 border-t border-[#E6E4DE] dark:border-[#35322F] flex items-center justify-between gap-2 bg-[#FAF9F6] dark:bg-[#1E1D1B]">
                    <button
                      onClick={() => {
                        recordOutfitWorn(outfit.id);
                        showToast(`Logged "${outfit.title}" as worn today!`);
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#3B4D42] text-white text-xs font-semibold hover:bg-[#2E3D34] transition-all"
                    >
                      Wear Today
                    </button>
                    <Link
                      href={`/planner?outfit=${outfit.id}`}
                      className="p-2 rounded-xl border border-[#E6E4DE] dark:border-[#35322F] text-[#747570] hover:text-[#222321]"
                      title="Schedule on Planner"
                    >
                      <Calendar className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteOutfit(outfit.id)}
                      className="p-2 rounded-xl border border-[#E6E4DE] dark:border-[#35322F] text-[#747570] hover:text-[#B84B4B]"
                      title="Remove Outfit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
