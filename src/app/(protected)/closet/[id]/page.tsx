'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Sparkles,
  Trash2,
  Edit,
  Tag,
  CheckCircle2,
  Clock,
  Shirt,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import { AvailabilityStatus } from '@/types/wardrobe';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const items = useWardrobeStore((state) => state.items);
  const toggleFavouriteItem = useWardrobeStore((state) => state.toggleFavouriteItem);
  const setItemAvailability = useWardrobeStore((state) => state.setItemAvailability);
  const deleteItem = useWardrobeStore((state) => state.deleteItem);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <Shirt className="w-12 h-12 text-[#747570] mx-auto" />
          <h2 className="font-serif text-2xl font-bold">Item not found</h2>
          <p className="text-sm text-[#747570]">This wardrobe item may have been deleted or archived.</p>
          <Link
            href="/closet"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold"
          >
            Return to Closet
          </Link>
        </div>
      </AppShell>
    );
  }

  const costPerWear =
    item.price && item.wear_count > 0 ? (item.price / item.wear_count).toFixed(2) : null;

  const handleDelete = () => {
    deleteItem(item.id);
    router.push('/closet');
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Navigation & Actions Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-[#747570] hover:text-[#222321] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Closet</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavouriteItem(item.id)}
              className="p-2.5 rounded-xl border border-[#E6E4DE] dark:border-[#35322F] text-[#747570] hover:text-[#B84B4B] transition-colors"
              title="Toggle Favourite"
            >
              <Heart
                className={`w-4 h-4 ${
                  item.is_favourite ? 'fill-[#B84B4B] text-[#B84B4B]' : ''
                }`}
              />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2.5 rounded-xl border border-[#E6E4DE] dark:border-[#35322F] text-[#747570] hover:text-[#B84B4B] transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1E1D1B] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#E6E4DE] dark:border-[#35322F]">
              <div className="w-10 h-10 rounded-full bg-[#B84B4B]/10 text-[#B84B4B] flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-center">Delete Garment?</h3>
              <p className="text-xs text-[#747570] text-center leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-[#222321] dark:text-[#F4F1EC]">{item.name}</span>? This will also remove it from any saved outfits referencing it.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-[#B84B4B] text-white text-xs font-semibold hover:bg-[#993A3A]"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-[#1E1D1B] p-6 sm:p-8 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] shadow-xs">
          {/* Garment Image Box */}
          <div className="bg-[#FAF9F6] dark:bg-[#282623] rounded-2xl p-8 flex items-center justify-center border border-[#E6E4DE] dark:border-[#35322F] relative min-h-[300px]">
            <img
              src={item.image_url || '/placeholder.svg'}
              alt={item.name}
              className="max-h-72 max-w-full object-contain"
            />
          </div>

          {/* Details & Metadata */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#3B4D42] dark:text-[#6FA898]">
                  {item.category} • {item.subcategory || 'General'}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#222321] dark:text-[#F4F1EC] mt-1">
                  {item.name}
                </h1>
                {item.brand && (
                  <p className="text-xs text-[#747570] dark:text-[#A8A29A] mt-0.5 font-medium">
                    {item.brand}
                  </p>
                )}
              </div>

              {/* Availability Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#747570] dark:text-[#A8A29A]">
                  Availability Status
                </label>
                <select
                  value={item.availability_status}
                  onChange={(e) => setItemAvailability(item.id, e.target.value as AvailabilityStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold text-[#222321] dark:text-[#F4F1EC] focus:outline-hidden"
                >
                  <option value="Available">Available for Outfits</option>
                  <option value="In Laundry">In Laundry</option>
                  <option value="Being Repaired">Being Repaired</option>
                  <option value="In Storage">In Storage</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F]">
                  <span className="text-[10px] text-[#747570] uppercase font-bold block">Primary Colour</span>
                  <span className="text-xs font-semibold text-[#222321] dark:text-[#F4F1EC] mt-0.5 block">{item.primary_color}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F]">
                  <span className="text-[10px] text-[#747570] uppercase font-bold block">Formality</span>
                  <span className="text-xs font-semibold text-[#222321] dark:text-[#F4F1EC] mt-0.5 block">{item.formality || 'Smart Casual'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F]">
                  <span className="text-[10px] text-[#747570] uppercase font-bold block">Fit</span>
                  <span className="text-xs font-semibold text-[#222321] dark:text-[#F4F1EC] mt-0.5 block">{item.fit || 'Regular'}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F]">
                  <span className="text-[10px] text-[#747570] uppercase font-bold block">Material</span>
                  <span className="text-xs font-semibold text-[#222321] dark:text-[#F4F1EC] mt-0.5 block">{item.material || 'Natural Blend'}</span>
                </div>
              </div>

              {/* Wear History Card */}
              <div className="p-4 rounded-xl bg-[#E5EEE9]/50 dark:bg-[#253D36]/30 border border-[#E6E4DE] dark:border-[#35322F] flex items-center justify-around text-center">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#747570] dark:text-[#A8A29A]">Wear Count</span>
                  <p className="font-serif text-lg font-bold text-[#3B4D42] dark:text-[#6FA898]">{item.wear_count} times</p>
                </div>
                {costPerWear && (
                  <div className="border-l border-[#E6E4DE] dark:border-[#35322F] pl-6">
                    <span className="text-[10px] uppercase font-semibold text-[#747570] dark:text-[#A8A29A]">Cost Per Wear</span>
                    <p className="font-serif text-lg font-bold text-[#3B4D42] dark:text-[#6FA898]">${costPerWear}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Action: Style This Item */}
            <div className="pt-4 border-t border-[#E6E4DE] dark:border-[#35322F]">
              <Link
                href={`/stylist?pinned=${item.id}`}
                className="w-full py-3.5 px-6 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C9B79C]" />
                <span>Style This Item With AI</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
