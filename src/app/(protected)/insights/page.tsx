'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  AlertCircle,
  Shirt,
  DollarSign,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';

export default function InsightsPage() {
  const items = useWardrobeStore((state) => state.items);
  const savedOutfits = useWardrobeStore((state) => state.savedOutfits);

  const totalItems = items.length;
  const wornItems = items.filter((i) => i.wear_count > 0);
  const utilizationRate =
    totalItems > 0 ? Math.round((wornItems.length / totalItems) * 100) : 0;

  // Categories breakdown
  const categoryCounts: Record<string, number> = {};
  items.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  // Colours breakdown
  const colorCounts: Record<string, number> = {};
  items.forEach((i) => {
    colorCounts[i.primary_color] = (colorCounts[i.primary_color] || 0) + 1;
  });

  // Top worn & underused
  const sortedByWearDesc = [...items].sort((a, b) => b.wear_count - a.wear_count);
  const mostWorn = sortedByWearDesc.slice(0, 3);
  const leastWorn = [...items]
    .filter((i) => i.availability_status === 'Available')
    .sort((a, b) => a.wear_count - b.wear_count)
    .slice(0, 3);

  // Total wardrobe investment & average cost per wear
  const totalValue = items.reduce((acc, i) => acc + (i.price || 0), 0);
  const itemsWithPriceAndWear = items.filter((i) => i.price && i.wear_count > 0);
  const avgCostPerWear =
    itemsWithPriceAndWear.length > 0
      ? (
          itemsWithPriceAndWear.reduce(
            (acc, i) => acc + (i.price! / i.wear_count),
            0
          ) / itemsWithPriceAndWear.length
        ).toFixed(2)
      : null;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
            Wardrobe Insights
          </h1>
          <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
            Data-driven observations on your closet utilization, rotation, and color habits.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A]">
              Wardrobe Utilisation
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-serif text-4xl font-bold text-[#3B4D42] dark:text-[#6FA898]">
                {utilizationRate}%
              </span>
              <span className="text-xs text-[#747570]">
                ({wornItems.length} of {totalItems} pieces worn)
              </span>
            </div>
            <div className="w-full bg-[#E6E4DE] dark:bg-[#35322F] h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-[#3B4D42] dark:bg-[#6FA898] h-full"
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A]">
              Wardrobe Valuation
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-serif text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
                ${totalValue.toLocaleString()}
              </span>
              <span className="text-xs text-[#747570]">recorded total</span>
            </div>
            <p className="text-xs text-[#747570] mt-3">
              Based on purchase prices entered across {items.filter((i) => i.price).length} items.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A]">
              Avg. Cost Per Wear
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-serif text-4xl font-bold text-[#4B8067]">
                {avgCostPerWear ? `$${avgCostPerWear}` : 'N/A'}
              </span>
              <span className="text-xs text-[#747570]">per outing</span>
            </div>
            <p className="text-xs text-[#747570] mt-3">
              High rotation items pay for themselves over repeated wear.
            </p>
          </div>
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Breakdown Bar Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
              Category Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = Math.round((count / totalItems) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{cat}</span>
                      <span className="text-[#747570]">{count} items ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#F0EEE9] dark:bg-[#282623] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#3B4D42] dark:bg-[#6FA898] h-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colour Distribution */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
              Colour Distribution
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.entries(colorCounts).map(([color, count]) => {
                const pct = Math.round((count / totalItems) * 100);
                return (
                  <div
                    key={color}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold"
                  >
                    <span>{color}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#E6E4DE] dark:bg-[#35322F] text-[10px] text-[#747570] dark:text-[#A8A29A]">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Most Worn vs Underused Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Frequently Worn */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
              Most Frequently Worn
            </h3>
            <div className="space-y-3">
              {mostWorn.map((item) => (
                <Link
                  key={item.id}
                  href={`/closet/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] hover:border-[#3B4D42] border border-transparent transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || '/placeholder.svg'}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#222321] dark:text-[#F4F1EC] block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#747570]">
                        {item.category} • {item.primary_color}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#3B4D42] dark:text-[#6FA898]">
                    {item.wear_count} wears
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Underused Gems */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
                Underused Gems
              </h3>
              <span className="text-[11px] text-[#747570]">Rediscover</span>
            </div>
            <div className="space-y-3">
              {leastWorn.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || '/placeholder.svg'}
                      alt={item.name}
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#222321] dark:text-[#F4F1EC] block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#747570]">
                        {item.wear_count === 0 ? 'Never worn' : `Worn only ${item.wear_count}×`}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/stylist?pinned=${item.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B4D42] text-white text-[11px] font-semibold hover:bg-[#2E3D34] transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-[#C9B79C]" />
                    <span>Style It</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
