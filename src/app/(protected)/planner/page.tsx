'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Luggage,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';

function PlannerContent() {
  const searchParams = useSearchParams();
  const preselectedOutfitId = searchParams.get('outfit');

  const plans = useWardrobeStore((state) => state.plans);
  const savedOutfits = useWardrobeStore((state) => state.savedOutfits);
  const items = useWardrobeStore((state) => state.items);
  const addPlan = useWardrobeStore((state) => state.addPlan);
  const removePlan = useWardrobeStore((state) => state.removePlan);

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>(
    preselectedOutfitId || savedOutfits[0]?.id || ''
  );
  const [occasion, setOccasion] = useState('Dinner');
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(Boolean(preselectedOutfitId));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const itemMap = new Map(items.map((i) => [i.id, i]));
  const outfitMap = new Map(savedOutfits.map((o) => [o.id, o]));

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutfitId || !selectedDate) return;

    addPlan({
      planned_date: selectedDate,
      outfit_id: selectedOutfitId,
      occasion,
      notes,
      status: 'Planned',
    });

    setIsModalOpen(false);
    setToastMessage(`Outfit scheduled for ${selectedDate}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check for conflicts on selected date/outfit
  const targetOutfit = outfitMap.get(selectedOutfitId);
  const unavailableItems = targetOutfit?.item_ids
    .map((id) => itemMap.get(id))
    .filter((i) => i && i.availability_status !== 'Available');

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#3B4D42] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#C9B79C]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              Outfit Planner
            </h1>
            <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
              Organise your weekly wardrobe and schedule outfits in advance.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold hover:bg-[#2E3D34] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Outfit</span>
          </button>
        </div>

        {/* Schedule Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1E1D1B] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E6E4DE] dark:border-[#35322F]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DE] dark:border-[#35322F]">
                <h3 className="font-serif text-lg font-bold">Schedule an Outfit</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-[#747570] hover:text-[#222321]"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] mb-1">
                    Select Outfit
                  </label>
                  <select
                    value={selectedOutfitId}
                    onChange={(e) => setSelectedOutfitId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs font-semibold"
                  >
                    {savedOutfits.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title} ({o.occasion})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conflict Alert if any item is not available */}
                {unavailableItems && unavailableItems.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#B84B4B]/10 border border-[#B84B4B]/20 text-xs text-[#B84B4B] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Notice: {unavailableItems.map((i) => i?.name).join(', ')} is currently marked as{' '}
                      {unavailableItems[0]?.availability_status}. You may need to do laundry before this date.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#747570] mb-1">
                    Occasion / Event
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g. Dinner with Friends, Board Meeting"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#3B4D42] text-white text-xs font-semibold hover:bg-[#2E3D34] shadow-sm"
                >
                  Confirm & Schedule
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Scheduled Timeline */}
        <div className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DE] dark:border-[#35322F]">
            <h2 className="font-serif text-xl font-bold text-[#222321] dark:text-[#F4F1EC]">
              Upcoming Planned Outfits
            </h2>
            <span className="text-xs text-[#747570]">{plans.length} scheduled</span>
          </div>

          {plans.length === 0 ? (
            <div className="py-12 text-center text-[#747570]">
              <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-[#747570]" />
              <p className="text-sm font-medium">No outfits scheduled yet.</p>
              <p className="text-xs mt-1">Tap &quot;Schedule Outfit&quot; to assign looks to your upcoming dates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans
                .sort((a, b) => new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime())
                .map((plan) => {
                  const outfit = outfitMap.get(plan.outfit_id);
                  const outfitItems = (
                    outfit?.item_ids.map((id) => itemMap.get(id)).filter(Boolean) || []
                  ) as typeof items;

                  return (
                    <div
                      key={plan.id}
                      className="p-4 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold uppercase text-[#3B4D42] dark:text-[#6FA898]">
                            {new Date(plan.planned_date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
                            {new Date(plan.planned_date).getDate()}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#222321] dark:text-[#F4F1EC]">
                              {plan.occasion}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5EEE9] dark:bg-[#253D36] text-[#3B4D42] dark:text-[#6FA898] font-semibold">
                              {outfit?.title || 'Custom Outfit'}
                            </span>
                          </div>
                          {outfitItems.length > 0 && (
                            <p className="text-xs text-[#747570] dark:text-[#A8A29A] mt-1">
                              Pieces: {outfitItems.map((i) => i.name).join(' • ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => removePlan(plan.id)}
                          className="p-2 rounded-lg border border-[#E6E4DE] dark:border-[#35322F] text-[#747570] hover:text-[#B84B4B] transition-colors"
                          title="Remove plan"
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

        {/* Travel Packing Assistant Preview */}
        <div className="bg-[#E5EEE9]/40 dark:bg-[#253D36]/20 p-6 rounded-2xl border border-[#3B4D42]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3B4D42] text-white flex items-center justify-center shrink-0">
              <Luggage className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#222321] dark:text-[#F4F1EC]">
                Travel Packing Capsule Assistant
              </h3>
              <p className="text-xs text-[#747570] dark:text-[#A8A29A] mt-0.5">
                Planning a trip? Assemble a 10-piece capsule wardrobe from your closet that yields 15+ compatible combinations.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setToastMessage('Travel packing capsule generator is ready for your destination!');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#3B4D42] text-white text-xs font-semibold hover:bg-[#2E3D34] shrink-0"
          >
            Create Packing Capsule
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] dark:bg-[#141413]">
          <div className="flex items-center gap-2 text-sm text-[#747570]">
            <CalendarIcon className="w-5 h-5 animate-pulse text-[#3B4D42]" />
            <span>Loading Outfit Planner...</span>
          </div>
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
