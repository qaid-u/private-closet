import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Luggage,
  Sparkles,
  Sun,
  CloudRain,
  Cloud,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { outfitsRepo } from '../../data/repositories/outfitsRepo';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { ClothingItem, Outfit } from '../../data/types';
import { SAMPLE_CUTOUT_SVGS } from '../../data/sampleCutouts';

export const WardrobePlanner: React.FC = () => {
  const [plannerTab, setPlannerTab] = useState<'weekly' | 'packing'>('weekly');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);

  // Weekly Planner State (7 days)
  const [weeklyPlan, setWeeklyPlan] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('pc_weekly_plan');
    return saved ? JSON.parse(saved) : {};
  });

  // Packing Planner State
  const [destination, setDestination] = useState('Kyoto, Japan');
  const [tripDays, setTripDays] = useState('5');
  const [tripClimate, setTripClimate] = useState<'mild' | 'warm' | 'cold'>('mild');
  const [packedItemIds, setPackedItemIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([outfitsRepo.getAll(), itemsRepo.getAll()]).then(([allOutfits, allItems]) => {
      setOutfits(allOutfits);
      setClosetItems(allItems);
      if (allOutfits.length > 0) {
        setPackedItemIds((prev) => {
          if (prev.length === 0) {
            return Array.from(new Set(allOutfits.slice(0, 2).flatMap((o) => o.itemIds)));
          }
          return prev;
        });
      }
    });
  }, []);

  const weekDays = [
    { id: 'mon', name: 'Monday', weather: '18°C Sunny', icon: <Sun className="w-4 h-4 text-warning" /> },
    { id: 'tue', name: 'Tuesday', weather: '16°C Cloudy', icon: <Cloud className="w-4 h-4 text-text-secondary" /> },
    { id: 'wed', name: 'Wednesday', weather: '14°C Rain', icon: <CloudRain className="w-4 h-4 text-primary" /> },
    { id: 'thu', name: 'Thursday', weather: '17°C Mild', icon: <Sun className="w-4 h-4 text-warning" /> },
    { id: 'fri', name: 'Friday', weather: '19°C Clear', icon: <Sun className="w-4 h-4 text-warning" /> },
    { id: 'sat', name: 'Saturday', weather: '21°C Warm', icon: <Sun className="w-4 h-4 text-warning" /> },
    { id: 'sun', name: 'Sunday', weather: '20°C Cozy', icon: <Cloud className="w-4 h-4 text-text-secondary" /> },
  ];

  const handleFillWeek = () => {
    if (outfits.length === 0) return;
    const plan: Record<string, string> = {};
    weekDays.forEach((day, index) => {
      const outfit = outfits[index % outfits.length];
      if (outfit) plan[day.id] = outfit.id;
    });
    setWeeklyPlan(plan);
    localStorage.setItem('pc_weekly_plan', JSON.stringify(plan));
    setToastMsg('Filled week with your favorite saved outfits!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSelectDayOutfit = (dayId: string, outfitId: string) => {
    const updated = { ...weeklyPlan, [dayId]: outfitId };
    setWeeklyPlan(updated);
    localStorage.setItem('pc_weekly_plan', JSON.stringify(updated));
  };

  const togglePackedItem = (id: string) => {
    setPackedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-text-primary text-surface text-xs font-semibold shadow-soft flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header with Planner Segment Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              Wardrobe Planners
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary-soft text-primary">
              Forward Planning
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Organize your upcoming 7-day workweek or pack the perfect modular travel capsule.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 rounded-control bg-surface-alt border border-border">
          <button
            type="button"
            onClick={() => setPlannerTab('weekly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              plannerTab === 'weekly'
                ? 'bg-surface text-text-primary shadow-soft'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Planner</span>
          </button>
          <button
            type="button"
            onClick={() => setPlannerTab('packing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              plannerTab === 'packing'
                ? 'bg-surface text-text-primary shadow-soft'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>Packing Assistant</span>
          </button>
        </div>
      </div>

      {/* 1. Weekly Planner View per SPEC Section 8 */}
      {plannerTab === 'weekly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              7-Day Outfit Schedule
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFillWeek}
              disabled={outfits.length === 0}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-primary" />}
            >
              Fill My Week Automatically
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const assignedOutfitId = weeklyPlan[day.id];
              const outfit = outfits.find((o) => o.id === assignedOutfitId);

              return (
                <div
                  key={day.id}
                  className="bg-surface border border-border rounded-card p-3.5 flex flex-col justify-between min-h-[170px] space-y-3 shadow-soft"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-xs font-bold text-text-primary">{day.name}</span>
                    <div className="flex items-center gap-1 text-[11px] text-text-secondary" title={day.weather}>
                      {day.icon}
                    </div>
                  </div>

                  <div className="my-auto">
                    {outfit ? (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
                          Assigned Look
                        </span>
                        <p className="text-xs font-bold text-text-primary line-clamp-2">
                          {outfit.name}
                        </p>
                        <span className="text-[10px] text-text-secondary block">
                          {outfit.itemIds.length} pieces
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-text-secondary text-[11px]">
                        No look scheduled
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <select
                      value={assignedOutfitId || ''}
                      onChange={(e) => handleSelectDayOutfit(day.id, e.target.value)}
                      className="w-full text-[10px] p-1.5 rounded-control bg-surface-alt border border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-primary truncate"
                    >
                      <option value="">Choose look...</option>
                      {outfits.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Packing Planner Assistant per SPEC Section 8 */}
      {plannerTab === 'packing' && (
        <div className="space-y-5">
          {/* Trip Details Form */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
            <h3 className="font-serif text-base font-bold text-text-primary">
              Trip Details & Climate
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. London, UK"
              />

              <Input
                type="number"
                label="Trip Duration (Days)"
                value={tripDays}
                onChange={(e) => setTripDays(e.target.value)}
                min={1}
                max={30}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">Expected Climate</label>
                <select
                  value={tripClimate}
                  onChange={(e) => setTripClimate(e.target.value as 'warm' | 'mild' | 'cold')}
                  className="w-full px-3 py-2 rounded-control bg-surface-alt border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="warm">Warm & Sunny (20°C - 30°C)</option>
                  <option value="mild">Mild & Transitional (12°C - 20°C)</option>
                  <option value="cold">Cool / Cold (0°C - 12°C)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Packing Checklist & Luggage Summary */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-base font-bold text-text-primary">
                  Luggage Capsule Checklist ({packedItemIds.length} packed)
                </h3>
                <p className="text-xs text-text-secondary">
                  Forms at least {Math.max(1, Math.round(packedItemIds.length * 1.4))} outfits for {tripDays} days in {destination}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/15 text-success">
                  Carry-On Friendly
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
              {closetItems.map((item) => {
                const isPacked = packedItemIds.includes(item.id);
                const cutoutSvg = SAMPLE_CUTOUT_SVGS[item.id];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePackedItem(item.id)}
                    className={`p-2.5 rounded-control border text-left flex items-center justify-between gap-3 transition-all ${
                      isPacked
                        ? 'bg-primary-soft/40 border-primary shadow-soft'
                        : 'bg-surface-alt/40 border-border text-text-secondary hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {cutoutSvg ? (
                          <div
                            className="w-full h-full p-0.5 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                            dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                          />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-text-primary truncate">{item.name}</span>
                    </div>

                    <div className="shrink-0">
                      {isPacked ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <span className="text-[10px] uppercase font-semibold text-text-secondary">Add</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
