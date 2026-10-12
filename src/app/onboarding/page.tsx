'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ArrowLeft, Check, Shirt } from 'lucide-react';
import { useWardrobeStore } from '@/stores/wardrobeStore';

export default function OnboardingPage() {
  const router = useRouter();
  const updateStyleProfile = useWardrobeStore((state) => state.updateStyleProfile);
  const currentProfile = useWardrobeStore((state) => state.styleProfile);

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [selectedStyles, setSelectedStyles] = useState<string[]>(currentProfile.style_tags);
  const [favouriteColours, setFavouriteColours] = useState<string[]>(currentProfile.favourite_colours);
  const [avoidedColours, setAvoidedColours] = useState<string[]>(currentProfile.avoided_colours);
  const [preferredFits, setPreferredFits] = useState<string[]>(currentProfile.preferred_fits);
  const [lifestyleOccasions, setLifestyleOccasions] = useState<string[]>(currentProfile.preferred_occasions);
  const [climate, setClimate] = useState<string>(currentProfile.climate_preference);

  const stylesList = [
    'Minimalist', 'Smart Casual', 'Classic', 'Old Money', 'Casual',
    'Streetwear', 'Business Casual', 'Contemporary', 'Relaxed',
    'Sporty', 'Preppy', 'Monochromatic', 'Vintage'
  ];

  const coloursList = [
    { name: 'Black', hex: '#222321' },
    { name: 'White', hex: '#FFFFFF', border: true },
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'Grey', hex: '#9CA3AF' },
    { name: 'Beige', hex: '#D7C4B7' },
    { name: 'Cream', hex: '#FDFBF7', border: true },
    { name: 'Brown', hex: '#78350F' },
    { name: 'Olive', hex: '#4D5D43' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Burgundy', hex: '#831843' },
  ];

  const fitsList = ['Fitted fit', 'Regular fit', 'Relaxed fit', 'Oversized', 'Tailored', 'No preference'];
  const occasionsList = ['Office', 'Dinner', 'Everyday casual', 'Social outings', 'Date', 'Formal events', 'Weekend', 'Travel', 'Exercise'];
  const climatesList = ['Tropical / Hot', 'Warm', 'Temperate', 'Cold', 'Variable'];

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save and finish
      updateStyleProfile({
        style_tags: selectedStyles,
        favourite_colours: favouriteColours,
        avoided_colours: avoidedColours,
        preferred_fits: preferredFits,
        preferred_occasions: lifestyleOccasions,
        climate_preference: climate,
      });
      router.push('/dashboard');
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#222321] flex flex-col justify-between p-6 max-w-2xl mx-auto selection:bg-[#3B4D42] selection:text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3B4D42] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-serif text-lg font-bold">MyStyle AI</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-[#747570] hover:text-[#222321] transition-colors"
        >
          Skip to Closet
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E6E4DE] h-1.5 rounded-full overflow-hidden my-4">
        <div
          className="bg-[#3B4D42] h-full transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 py-6 flex flex-col justify-center">
        {step === 1 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3B4D42]">Step 1 of 6</span>
            <h2 className="font-serif text-3xl font-bold mt-1 text-[#222321]">
              What aesthetic best describes your style?
            </h2>
            <p className="text-sm text-[#747570] mt-2 mb-6">
              Select all that resonate with how you dress or how you aspire to dress.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {stylesList.map((st) => {
                const isSelected = selectedStyles.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() => toggleItem(selectedStyles, setSelectedStyles, st)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isSelected
                        ? 'bg-[#3B4D42] text-white shadow-xs'
                        : 'bg-white border border-[#E6E4DE] text-[#222321] hover:bg-[#F0EEE9]'
                      }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3B4D42]">Step 2 of 6</span>
            <h2 className="font-serif text-3xl font-bold mt-1 text-[#222321]">
              Which colours do you love wearing?
            </h2>
            <p className="text-sm text-[#747570] mt-2 mb-6">
              We will prioritize your favorites and harmonize complementary tones.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {coloursList.map((c) => {
                const isFav = favouriteColours.includes(c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => toggleItem(favouriteColours, setFavouriteColours, c.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all ${isFav
                        ? 'border-[#3B4D42] bg-[#E5EEE9]'
                        : 'border-[#E6E4DE] bg-white hover:bg-[#F0EEE9]'
                      }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full shrink-0 shadow-2xs ${c.border ? 'border border-[#E6E4DE]' : ''}`}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3B4D42]">Step 3 of 6</span>
            <h2 className="font-serif text-3xl font-bold mt-1 text-[#222321]">
              What silhouettes and fits do you prefer?
            </h2>
            <p className="text-sm text-[#747570] mt-2 mb-6">
              Select one or more cuts that feel most comfortable to you.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fitsList.map((fit) => {
                const isSelected = preferredFits.includes(fit);
                return (
                  <button
                    key={fit}
                    onClick={() => toggleItem(preferredFits, setPreferredFits, fit)}
                    className={`p-4 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition-all ${isSelected
                        ? 'border-[#3B4D42] bg-[#E5EEE9] text-[#3B4D42]'
                        : 'border-[#E6E4DE] bg-white hover:bg-[#F0EEE9]'
                      }`}
                  >
                    <span>{fit}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#3B4D42]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3B4D42]">Step 4 of 6</span>
            <h2 className="font-serif text-3xl font-bold mt-1 text-[#222321]">
              What are your common dressing occasions?
            </h2>
            <p className="text-sm text-[#747570] mt-2 mb-6">
              Helps our stylist craft looks suited for your real daily calendar.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {occasionsList.map((occ) => {
                const isSelected = lifestyleOccasions.includes(occ);
                return (
                  <button
                    key={occ}
                    onClick={() => toggleItem(lifestyleOccasions, setLifestyleOccasions, occ)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isSelected
                        ? 'bg-[#3B4D42] text-white shadow-xs'
                        : 'bg-white border border-[#E6E4DE] text-[#222321] hover:bg-[#F0EEE9]'
                      }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3B4D42]">Step 5 of 6</span>
            <h2 className="font-serif text-3xl font-bold mt-1 text-[#222321]">
              What climate do you primarily dress for?
            </h2>
            <p className="text-sm text-[#747570] mt-2 mb-6">
              Ensures breathability, layering, and thermal practicality.
            </p>
            <div className="space-y-3">
              {climatesList.map((cl) => {
                const isSelected = climate === cl;
                return (
                  <button
                    key={cl}
                    onClick={() => setClimate(cl)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition-all ${isSelected
                        ? 'border-[#3B4D42] bg-[#E5EEE9] text-[#3B4D42]'
                        : 'border-[#E6E4DE] bg-white hover:bg-[#F0EEE9]'
                      }`}
                  >
                    <span>{cl}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#3B4D42]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E5EEE9] text-[#3B4D42] flex items-center justify-center mx-auto mb-6">
              <Shirt className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#222321]">
              Let’s build your digital closet.
            </h2>
            <p className="text-sm text-[#747570] mt-3 max-w-md mx-auto leading-relaxed">
              Your closet starts empty. Add your first clothing item now, or set up optional Style DNA details later.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E6E4DE]">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E6E4DE] text-sm font-semibold text-[#747570] hover:bg-[#F0EEE9] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-md transition-all"
        >
          <span>{step === totalSteps ? 'Enter Closet' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
