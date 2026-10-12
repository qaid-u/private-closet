'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Heart,
  Shirt,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import { WardrobeCategory, AvailabilityStatus } from '@/types/wardrobe';

export default function ClosetPage() {
  const items = useWardrobeStore((state) => state.items);
  const toggleFavouriteItem = useWardrobeStore((state) => state.toggleFavouriteItem);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WardrobeCategory | 'All'>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'created_desc' | 'wear_desc' | 'wear_asc' | 'name_asc'>('created_desc');

  // Categories list
  const categories: (WardrobeCategory | 'All')[] = [
    'All',
    'Tops',
    'Bottoms',
    'Outerwear',
    'Footwear',
    'Accessories',
  ];

  // Filtering & Sorting
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
        if (selectedAvailability !== 'All' && item.availability_status !== selectedAvailability) return false;
        if (search) {
          const q = search.toLowerCase();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesColor = item.primary_color.toLowerCase().includes(q);
          const matchesBrand = (item.brand || '').toLowerCase().includes(q);
          const matchesTags = item.style_tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesName && !matchesColor && !matchesBrand && !matchesTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'created_desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'wear_desc') return b.wear_count - a.wear_count;
        if (sortBy === 'wear_asc') return a.wear_count - b.wear_count;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [items, selectedCategory, selectedAvailability, search, sortBy]);

  // Counts by category
  const topsCount = items.filter((i) => i.category === 'Tops').length;
  const bottomsCount = items.filter((i) => i.category === 'Bottoms').length;
  const shoesCount = items.filter((i) => i.category === 'Footwear').length;
  const outerCount = items.filter((i) => i.category === 'Outerwear').length;
  const accessoriesCount = items.filter((i) => i.category === 'Accessories').length;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              My Closet
            </h1>
            <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
              Everything you own, beautifully organised.
            </p>
          </div>

          <Link
            href="/closet/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Link>
        </div>

        {/* Category Count Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold shrink-0">
            Total: <span className="text-[#3B4D42] dark:text-[#6FA898]">{items.length}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold shrink-0">
            Tops: {topsCount}
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold shrink-0">
            Bottoms: {bottomsCount}
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold shrink-0">
            Shoes: {shoesCount}
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold shrink-0">
            Outerwear: {outerCount}
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold shrink-0">
            Accessories: {accessoriesCount}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white dark:bg-[#1E1D1B] p-4 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#747570] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, color, style, or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-sm text-[#222321] dark:text-[#F4F1EC] placeholder-[#747570] focus:outline-hidden focus:border-[#3B4D42]"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-medium text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
            >
              <option value="created_desc">Recently Added</option>
              <option value="wear_desc">Most Worn</option>
              <option value="wear_asc">Least Worn</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#3B4D42] text-white shadow-xs'
                    : 'bg-[#F8F7F4] dark:bg-[#282623] text-[#747570] hover:text-[#222321] dark:hover:text-[#F4F1EC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] p-12 text-center">
            <Shirt className="w-12 h-12 text-[#747570] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
              No clothes matched your filters
            </h3>
            <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
              Try adjusting your search query or reset category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#3B4D42] transition-all flex flex-col justify-between group"
              >
                {/* Image & Heart Header */}
                <div className="relative p-4 bg-[#FAF9F6] dark:bg-[#282623] flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavouriteItem(item.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm text-[#747570] hover:text-[#B84B4B] transition-colors"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.is_favourite ? 'fill-[#B84B4B] text-[#B84B4B]' : ''
                      }`}
                    />
                  </button>

                  <Link href={`/closet/${item.id}`} className="w-full flex justify-center">
                    <img
                      src={item.image_url || '/placeholder.svg'}
                      alt={item.name}
                      className="w-32 h-36 object-contain group-hover:scale-105 transition-transform"
                    />
                  </Link>
                </div>

                {/* Details Footer */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B4D42] dark:text-[#6FA898]">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.availability_status === 'Available'
                          ? 'bg-[#E5EEE9] text-[#3B4D42] dark:bg-[#253D36] dark:text-[#6FA898]'
                          : 'bg-[#F0EEE9] text-[#747570]'
                      }`}
                    >
                      {item.availability_status}
                    </span>
                  </div>

                  <Link href={`/closet/${item.id}`} className="block">
                    <h3 className="font-serif text-sm font-bold text-[#222321] dark:text-[#F4F1EC] line-clamp-1 group-hover:text-[#3B4D42] transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between text-[11px] text-[#747570] dark:text-[#A8A29A] pt-1 border-t border-[#E6E4DE] dark:border-[#35322F]">
                    <span>{item.primary_color}</span>
                    <span>Worn {item.wear_count}×</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
