import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { wearLogsRepo } from '../../data/repositories/wearLogsRepo';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { outfitsRepo } from '../../data/repositories/outfitsRepo';
import { ClothingItem, Outfit, WearLog } from '../../data/types';
import { SAMPLE_CUTOUT_SVGS } from '../../data/sampleCutouts';

export const WearCalendarLog: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [wearLogs, setWearLogs] = useState<WearLog[]>([]);
  const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  // Selected Day & Logging Modal
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [logs, items, allOutfits] = await Promise.all([
      wearLogsRepo.getAll(),
      itemsRepo.getAll(),
      outfitsRepo.getAll(),
    ]);
    setWearLogs(logs);
    setClosetItems(items);
    setOutfits(allOutfits);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const itemMap = useMemo(() => {
    const map = new Map<string, ClothingItem>();
    closetItems.forEach((i) => map.set(i.id, i));
    return map;
  }, [closetItems]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [year, month]);

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  // Map of date string -> WearLog[]
  const logsByDate = useMemo(() => {
    const map = new Map<string, WearLog[]>();
    wearLogs.forEach((log) => {
      const arr = map.get(log.date) || [];
      arr.push(log);
      map.set(log.date, arr);
    });
    return map;
  }, [wearLogs]);

  // Summary Metrics per SPEC Section 8
  const stats = useMemo(() => {
    const daysLogged = logsByDate.size;
    const allLoggedItems = new Set<string>();
    let totalItemsWorn = 0;

    wearLogs.forEach((log) => {
      log.itemIds.forEach((id) => {
        allLoggedItems.add(id);
        totalItemsWorn++;
      });
    });

    const repeats = Math.max(0, totalItemsWorn - allLoggedItems.size);

    return {
      daysLogged,
      uniqueCount: allLoggedItems.size,
      repeats,
    };
  }, [logsByDate, wearLogs]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleOpenDayDetail = (dateStr: string) => {
    setSelectedDayStr(dateStr);
    setIsLogModalOpen(true);
    setSelectedOutfitId('');
    setSelectedItemIds([]);
  };

  const handleSaveLog = async () => {
    if (!selectedDayStr) return;

    let itemsToLog = [...selectedItemIds];
    if (selectedOutfitId) {
      const outfit = outfits.find((o) => o.id === selectedOutfitId);
      if (outfit) {
        itemsToLog = Array.from(new Set([...itemsToLog, ...outfit.itemIds]));
        await outfitsRepo.recordWear(outfit.id);
      }
    }

    if (itemsToLog.length === 0) return;

    await wearLogsRepo.create({
      date: selectedDayStr,
      outfitId: selectedOutfitId || undefined,
      itemIds: itemsToLog,
      context: { occasion: 'casual' },
    });

    for (const id of itemsToLog) {
      await itemsRepo.incrementWornCount(id);
    }

    await loadData();
    setIsLogModalOpen(false);
    setToastMsg(`Wear logged for ${selectedDayStr}!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-text-primary text-surface text-xs font-semibold shadow-soft flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Calendar Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              Wear Calendar & History
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary-soft text-primary">
              {stats.daysLogged} Days Tracked
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Track real cost-per-wear and rotation frequency entirely on your device.
          </p>
        </div>

        {/* Quick Log Today Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenDayDetail(new Date().toISOString().split('T')[0])}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Log Today's Outfit
          </Button>
        </div>
      </div>

      {/* Summary Stats Row per SPEC Section 8 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-card bg-surface border border-border space-y-1 shadow-soft text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Days Logged
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-primary">
            {stats.daysLogged}
          </p>
          <span className="text-[10px] text-text-secondary">Total days recorded</span>
        </div>

        <div className="p-3.5 rounded-card bg-surface border border-border space-y-1 shadow-soft text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Unique Pieces
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-accent">
            {stats.uniqueCount}
          </p>
          <span className="text-[10px] text-text-secondary">Active in rotation</span>
        </div>

        <div className="p-3.5 rounded-card bg-surface border border-border space-y-1 shadow-soft text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Repeats
          </span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-success">
            {stats.repeats}
          </p>
          <span className="text-[10px] text-text-secondary">Loved garment repeats</span>
        </div>
      </div>

      {/* Monthly Calendar View */}
      <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-text-primary">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-control text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-control text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-[10px] font-bold uppercase tracking-wider text-text-secondary py-1">
              {d}
            </div>
          ))}

          {/* Empty slot offsets for first day of week */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] rounded-control bg-surface-alt/20" />
          ))}

          {/* Days of month */}
          {daysInMonth.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const logs = logsByDate.get(dateStr) || [];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const hasWear = logs.length > 0;

            const loggedItemIds = logs.flatMap((l) => l.itemIds);
            const firstItem = loggedItemIds[0] ? itemMap.get(loggedItemIds[0]) : null;
            const cutoutSvg = firstItem ? SAMPLE_CUTOUT_SVGS[firstItem.id] : null;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleOpenDayDetail(dateStr)}
                className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-control border text-left flex flex-col justify-between transition-all hover:border-primary/60 hover:shadow-soft ${
                  isToday
                    ? 'border-primary bg-primary-soft/30'
                    : hasWear
                    ? 'bg-surface-alt border-border'
                    : 'bg-surface border-border/60 text-text-secondary'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? 'w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center' : 'text-text-primary'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {hasWear && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>

                {/* Day thumbnail or piece badges */}
                <div className="my-auto flex items-center justify-center">
                  {cutoutSvg ? (
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto opacity-90"
                      dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                    />
                  ) : hasWear ? (
                    <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[10px] font-bold">
                      {loggedItemIds.length}
                    </div>
                  ) : null}
                </div>

                <div className="text-[9px] text-text-secondary truncate w-full">
                  {hasWear ? `${loggedItemIds.length} items` : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Log & Detail Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={selectedDayStr ? `Log for ${selectedDayStr}` : 'Log Wear'}
      >
        <div className="space-y-4">
          {/* Outfits selection */}
          {outfits.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary block">
                Choose a Saved Look (Optional)
              </label>
              <select
                value={selectedOutfitId}
                onChange={(e) => setSelectedOutfitId(e.target.value)}
                className="w-full px-3 py-2 rounded-control bg-surface-alt border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- No Look Selected --</option>
                {outfits.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.itemIds.length} items)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Individual items checklist */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-primary block">
              Or Select Individual Clothes Worn:
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-border p-2 rounded-control bg-surface-alt/40">
              {closetItems.map((item) => {
                const isChecked = selectedItemIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 p-1.5 rounded-control hover:bg-surface text-xs text-text-primary cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedItemIds((prev) =>
                          isChecked ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                        );
                      }}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="truncate">{item.name}</span>
                    <span className="text-[10px] text-text-secondary capitalize ml-auto shrink-0">
                      {item.category}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => setIsLogModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveLog}
              disabled={!selectedOutfitId && selectedItemIds.length === 0}
            >
              Save Wear Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
