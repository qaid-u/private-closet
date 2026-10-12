'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  PlusCircle,
  Calendar,
  Shirt,
  CheckCircle2,
  Heart,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';

export default function DashboardPage() {
  const items = useWardrobeStore((state) => state.items);
  const savedOutfits = useWardrobeStore((state) => state.savedOutfits);
  const recordOutfitWorn = useWardrobeStore((state) => state.recordOutfitWorn);
  const [wornToast, setWornToast] = useState(false);

  // Today's spotlight outfit (top scored saved outfit or first)
  const todayOutfit = savedOutfits[0];
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const todayItems = todayOutfit
    ? (todayOutfit.item_ids.map((id) => itemMap.get(id)).filter(Boolean) as typeof items)
    : [];

  const handleWearToday = () => {
    if (todayOutfit) {
      recordOutfitWorn(todayOutfit.id);
      setWornToast(true);
      setTimeout(() => setWornToast(false), 3000);
    }
  };

  const totalItems = items.length;
  const favItemsCount = items.filter((i) => i.is_favourite).length;
  const recentlyWornCount = items.filter((i) => i.wear_count > 0).length;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {/* Toast Notification */}
        {wornToast && (
          <div className="fixed top-4 right-4 z-50 bg-[#3B4D42] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 transition-all animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-[#C9B79C]" />
            <span className="text-sm font-medium">Logged as worn today! Wear count updated.</span>
          </div>
        )}

        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC] mt-0.5">
              Good morning.
            </h1>
            <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
              Let’s find something great to wear from your {totalItems} closet items.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/stylist"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Stylist</span>
            </Link>
            <Link
              href="/closet/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-sm font-semibold hover:bg-[#F0EEE9] dark:hover:bg-[#282623] transition-all"
            >
              <PlusCircle className="w-4 h-4 text-[#3B4D42] dark:text-[#6FA898]" />
              <span>Add Clothes</span>
            </Link>
          </div>
        </div>

        {/* Today's Outfit Hero Card */}
        {todayOutfit && (
          <div className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] overflow-hidden shadow-xs">
            <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center">
              {/* Flat-Lay Image Composition */}
              <div className="w-full lg:w-1/2 bg-[#F8F7F4] dark:bg-[#282623] rounded-xl p-4 sm:p-6 border border-[#E6E4DE] dark:border-[#35322F]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {todayItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-[#1E1D1B] rounded-xl p-3 border border-[#E6E4DE] dark:border-[#35322F] flex flex-col items-center text-center shadow-2xs hover:scale-102 transition-transform"
                    >
                      <img
                        src={item.image_url || '/placeholder.svg'}
                        alt={item.name}
                        className="w-20 h-20 object-contain rounded-lg mb-2"
                      />
                      <span className="text-xs font-semibold text-[#222321] dark:text-[#F4F1EC] line-clamp-1">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#747570] dark:text-[#A8A29A]">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outfit Metadata & Actions */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E5EEE9] dark:bg-[#253D36] text-[#3B4D42] dark:text-[#6FA898]">
                      Today’s Match: {todayOutfit.overall_score}%
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0EEE9] dark:bg-[#282623] text-[#747570] dark:text-[#A8A29A]">
                      {todayOutfit.occasion}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#222321] dark:text-[#F4F1EC]">
                    {todayOutfit.title}
                  </h2>

                  <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-2 leading-relaxed">
                    {todayOutfit.styling_reason}
                  </p>

                  {/* Styling Tips */}
                  {todayOutfit.styling_tips?.length > 0 && (
                    <div className="mt-4 p-3.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F]">
                      <span className="text-xs font-semibold text-[#3B4D42] dark:text-[#6FA898] uppercase tracking-wider block mb-1">
                        Styling Tip
                      </span>
                      <p className="text-xs text-[#747570] dark:text-[#A8A29A]">
                        {todayOutfit.styling_tips[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Primary Wear Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleWearToday}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#C9B79C]" />
                    <span>Wear This Today</span>
                  </button>
                  <Link
                    href={`/outfits/${todayOutfit.id}`}
                    className="py-3 px-5 rounded-xl border border-[#E6E4DE] dark:border-[#35322F] text-sm font-semibold hover:bg-[#F0EEE9] dark:hover:bg-[#282623] transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/closet"
            className="p-5 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-2xs hover:border-[#3B4D42] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#747570] dark:text-[#A8A29A]">Closet Items</span>
              <Shirt className="w-4 h-4 text-[#3B4D42] dark:text-[#6FA898]" />
            </div>
            <p className="font-serif text-3xl font-bold mt-2 text-[#222321] dark:text-[#F4F1EC]">
              {totalItems}
            </p>
            <span className="text-[11px] text-[#747570] mt-1 block">Active pieces</span>
          </Link>

          <Link
            href="/outfits"
            className="p-5 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-2xs hover:border-[#3B4D42] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#747570] dark:text-[#A8A29A]">Saved Outfits</span>
              <Layers className="w-4 h-4 text-[#3B4D42] dark:text-[#6FA898]" />
            </div>
            <p className="font-serif text-3xl font-bold mt-2 text-[#222321] dark:text-[#F4F1EC]">
              {savedOutfits.length}
            </p>
            <span className="text-[11px] text-[#747570] mt-1 block">Ready looks</span>
          </Link>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#747570] dark:text-[#A8A29A]">Favourites</span>
              <Heart className="w-4 h-4 text-[#B84B4B]" />
            </div>
            <p className="font-serif text-3xl font-bold mt-2 text-[#222321] dark:text-[#F4F1EC]">
              {favItemsCount}
            </p>
            <span className="text-[11px] text-[#747570] mt-1 block">Key wardrobe staples</span>
          </div>

          <Link
            href="/insights"
            className="p-5 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-2xs hover:border-[#3B4D42] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#747570] dark:text-[#A8A29A]">Wear Rotation</span>
              <TrendingUp className="w-4 h-4 text-[#4B8067]" />
            </div>
            <p className="font-serif text-3xl font-bold mt-2 text-[#222321] dark:text-[#F4F1EC]">
              {recentlyWornCount}
            </p>
            <span className="text-[11px] text-[#747570] mt-1 block">Items worn at least once</span>
          </Link>
        </div>

        {/* Recently Added Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              Recently Added to Closet
            </h3>
            <Link
              href="/closet"
              className="text-xs font-semibold text-[#3B4D42] dark:text-[#6FA898] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {items.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={`/closet/${item.id}`}
                className="bg-white dark:bg-[#1E1D1B] rounded-xl p-3 border border-[#E6E4DE] dark:border-[#35322F] flex flex-col items-center text-center shadow-2xs hover:border-[#3B4D42] transition-all group"
              >
                <div className="w-full h-24 bg-[#F8F7F4] dark:bg-[#282623] rounded-lg flex items-center justify-center p-2 mb-2">
                  <img
                    src={item.image_url || '/placeholder.svg'}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-xs font-medium text-[#222321] dark:text-[#F4F1EC] line-clamp-1">
                  {item.name}
                </span>
                <span className="text-[10px] text-[#747570] dark:text-[#A8A29A]">
                  {item.primary_color} • {item.category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
