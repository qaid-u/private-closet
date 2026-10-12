'use client';

import React, { useState } from 'react';
import {
  User,
  Sparkles,
  CheckCircle2,
  Save,
  Palette,
  Shirt,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';

export default function ProfilePage() {
  const currentProfile = useWardrobeStore((state) => state.styleProfile);
  const updateStyleProfile = useWardrobeStore((state) => state.updateStyleProfile);

  const [selectedStyles, setSelectedStyles] = useState<string[]>(currentProfile.style_tags);
  const [favouriteColours, setFavouriteColours] = useState<string[]>(currentProfile.favourite_colours);
  const [preferredFits, setPreferredFits] = useState<string[]>(currentProfile.preferred_fits);
  const [preferredOccasions, setPreferredOccasions] = useState<string[]>(currentProfile.preferred_occasions);
  const [climate, setClimate] = useState<string>(currentProfile.climate_preference);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stylesList = [
    'Minimalist', 'Smart Casual', 'Classic', 'Old Money', 'Casual',
    'Streetwear', 'Business Casual', 'Contemporary', 'Relaxed',
    'Sporty', 'Preppy', 'Monochromatic', 'Vintage'
  ];

  const coloursList = ['Black', 'White', 'Navy', 'Grey', 'Beige', 'Cream', 'Brown', 'Olive', 'Blue', 'Burgundy'];
  const fitsList = ['Fitted fit', 'Regular fit', 'Relaxed fit', 'Oversized', 'Tailored', 'No preference'];
  const occasionsList = ['Office', 'Dinner', 'Everyday casual', 'Social outings', 'Date', 'Formal events', 'Weekend', 'Travel', 'Exercise'];

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = () => {
    updateStyleProfile({
      style_tags: selectedStyles,
      favourite_colours: favouriteColours,
      preferred_fits: preferredFits,
      preferred_occasions: preferredOccasions,
      climate_preference: climate,
    });
    setToastMessage('Style Profile saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#3B4D42] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#C9B79C]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              Style Profile
            </h1>
            <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
              Fine-tune your fashion aesthetics, fits, and color preferences.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-sm transition-all"
          >
            <Save className="w-4 h-4 text-[#C9B79C]" />
            <span>Save Preferences</span>
          </button>
        </div>

        <Link href="/profile/style-dna" className="block rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] bg-white dark:bg-[#1E1D1B] p-5 hover:border-[#3B4D42] transition-colors">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3B4D42] dark:text-[#6FA898]">My Style DNA</span>
          <h2 className="font-serif text-xl font-bold mt-1 text-[#222321] dark:text-[#F4F1EC]">Measurements, colour profile and AI personalisation</h2>
          <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">Optional body, fit and colour preferences. You control what is stored and what can be sent to AI.</p>
        </Link>

        {/* Sections */}
        <div className="bg-white dark:bg-[#1E1D1B] p-6 sm:p-8 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] space-y-8 shadow-xs">
          {/* Aesthetic Styles */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] block mb-3">
              Preferred Aesthetics
            </span>
            <div className="flex flex-wrap gap-2">
              {stylesList.map((st) => {
                const isSelected = selectedStyles.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() => toggleItem(selectedStyles, setSelectedStyles, st)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isSelected
                        ? 'bg-[#3B4D42] text-white shadow-xs'
                        : 'bg-[#F8F7F4] dark:bg-[#282623] text-[#747570] hover:text-[#222321]'
                      }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favourite Colours */}
          <div className="pt-6 border-t border-[#E6E4DE] dark:border-[#35322F]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] block mb-3">
              Favourite Colours
            </span>
            <div className="flex flex-wrap gap-2">
              {coloursList.map((c) => {
                const isFav = favouriteColours.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleItem(favouriteColours, setFavouriteColours, c)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isFav
                        ? 'bg-[#3B4D42] text-white shadow-xs'
                        : 'bg-[#F8F7F4] dark:bg-[#282623] text-[#747570] hover:text-[#222321]'
                      }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Fits */}
          <div className="pt-6 border-t border-[#E6E4DE] dark:border-[#35322F]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] block mb-3">
              Preferred Silhouettes & Fits
            </span>
            <div className="flex flex-wrap gap-2">
              {fitsList.map((fit) => {
                const isSelected = preferredFits.includes(fit);
                return (
                  <button
                    key={fit}
                    onClick={() => toggleItem(preferredFits, setPreferredFits, fit)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isSelected
                        ? 'bg-[#3B4D42] text-white shadow-xs'
                        : 'bg-[#F8F7F4] dark:bg-[#282623] text-[#747570] hover:text-[#222321]'
                      }`}
                  >
                    {fit}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Occasions */}
          <div className="pt-6 border-t border-[#E6E4DE] dark:border-[#35322F]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A] block mb-3">
              Primary Occasions
            </span>
            <div className="flex flex-wrap gap-2">
              {occasionsList.map((occ) => {
                const isSelected = preferredOccasions.includes(occ);
                return (
                  <button
                    key={occ}
                    onClick={() => toggleItem(preferredOccasions, setPreferredOccasions, occ)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${isSelected
                        ? 'bg-[#3B4D42] text-white shadow-xs'
                        : 'bg-[#F8F7F4] dark:bg-[#282623] text-[#747570] hover:text-[#222321]'
                      }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
