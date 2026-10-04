import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  PieChart,
  Tag,
  AlertTriangle,
  Lightbulb,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { ClothingItem, StyleProfile, WearLog } from '../../data/types';
import { itemsRepo } from '../../data/repositories/itemsRepo';
import { wearLogsRepo } from '../../data/repositories/wearLogsRepo';
import { SAMPLE_CUTOUT_SVGS } from '../../data/sampleCutouts';

interface WardrobeInsightsProps {
  profile: StyleProfile | null;
}

export const WardrobeInsights: React.FC<WardrobeInsightsProps> = ({ profile }) => {
  const [timeframe, setTimeframe] = useState<'month' | 'year' | 'all'>('month');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [wearLogs, setWearLogs] = useState<WearLog[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('pc_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([itemsRepo.getAll(), wearLogsRepo.getAll()]).then(([all, logs]) => {
      setItems(all);
      setWearLogs(logs);
    });
  }, []);

  // Filter logs by timeframe
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const thresholdDays = timeframe === 'month' ? 30 : timeframe === 'year' ? 365 : Infinity;
    const thresholdMs = thresholdDays * 86400000;

    return wearLogs.filter((l) => now - new Date(l.date).getTime() <= thresholdMs);
  }, [wearLogs, timeframe]);

  // Cost-per-wear analytics
  const { topCPW, neverWorn } = useMemo(() => {
    const wearCountMap: Record<string, number> = {};
    wearLogs.forEach((log) => {
      log.itemIds.forEach((id) => {
        wearCountMap[id] = (wearCountMap[id] || 0) + 1;
      });
    });

    const withWears = items
      .filter((i) => i.price && i.price > 0)
      .map((i) => {
        const count = wearCountMap[i.id] || 0;
        return {
          ...i,
          itemWornCount: count,
          cpw: i.price! / Math.max(1, count),
        };
      });

    // Best CPW (lowest cost per wear)
    const top = [...withWears]
      .filter((i) => i.itemWornCount >= 2)
      .sort((a, b) => a.cpw - b.cpw)
      .slice(0, 3);

    // 0 wears
    const zero = items.filter((i) => (wearCountMap[i.id] || 0) === 0);

    return { topCPW: top, neverWorn: zero };
  }, [items, wearLogs]);

  // Color distribution
  const colorBreakdown = useMemo(() => {
    let neutrals = 0;
    let earthy = 0;
    let vibrant = 0;

    items.forEach((item) => {
      const primaryColor = item.colors[0]?.name.toLowerCase() || '';
      if (['cream', 'white', 'black', 'grey', 'navy', 'beige'].some((c) => primaryColor.includes(c))) {
        neutrals++;
      } else if (['olive', 'brown', 'tan', 'rust', 'sage', 'taupe'].some((c) => primaryColor.includes(c))) {
        earthy++;
      } else {
        vibrant++;
      }
    });

    const total = Math.max(1, items.length);
    return {
      neutrals: Math.round((neutrals / total) * 100),
      earthy: Math.round((earthy / total) * 100),
      vibrant: Math.round((vibrant / total) * 100),
      counts: { neutrals, earthy, vibrant },
    };
  }, [items]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { top: 0, bottom: 0, outerwear: 0, shoes: 0, dress: 0, accessory: 0 };
    items.forEach((i) => {
      map[i.category] = (map[i.category] || 0) + 1;
    });
    return map;
  }, [items]);

  // Palette & Wardrobe Aware Gap Analysis per SPEC Section 8
  const gapAnalysis = useMemo(() => {
    const topsCount = categoryCounts.top || 0;
    const darkTops = items.filter((i) => i.category === 'top' && (i.colors[0]?.lab?.[0] || 50) < 45).length;
    const lightBottoms = items.filter((i) => i.category === 'bottom' && (i.colors[0]?.lab?.[0] || 50) > 55).length;

    const undertone = profile?.skin?.undertone || 'warm';
    const suggestedItem = undertone === 'warm' ? 'Stone Tailored Trouser' : 'Heather Slate Wool Trouser';
    const suggestedColor = undertone === 'warm' ? '#C2B8A3' : '#708090';

    return {
      title: `Add a ${undertone === 'warm' ? 'stone' : 'slate'} tailored trouser`,
      suggestedName: suggestedItem,
      suggestedHex: suggestedColor,
      reasons: [
        `Suits your ${undertone} undertone palette`,
        `Balances your ${darkTops || topsCount} darker tops against only ${lightBottoms} light bottoms`,
        `Creates up to ${Math.max(6, darkTops * 2)} new combinations with existing clothes`,
        'Works with your proportions for relaxed silhouette styling',
      ],
      isAlreadyInWishlist: wishlist.includes(suggestedItem),
    };
  }, [items, categoryCounts, profile, wishlist]);

  const handleToggleWishlist = (name: string) => {
    let updated: string[];
    if (wishlist.includes(name)) {
      updated = wishlist.filter((w) => w !== name);
    } else {
      updated = [...wishlist, name];
    }
    setWishlist(updated);
    localStorage.setItem('pc_wishlist', JSON.stringify(updated));
    setToastMsg(wishlist.includes(name) ? 'Removed from Wishlist' : 'Added to Wishlist!');
    setTimeout(() => setToastMsg(null), 2500);
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

      {/* Header & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-text-primary">
              Wardrobe Insights & Analytics
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-accent-soft text-accent">
              Cost-Per-Wear
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Transparent investment metrics and palette-aware gap recommendations ({filteredLogs.length} wears in selected window).
          </p>
        </div>

        {/* Timeframe Chips */}
        <div className="flex items-center p-1 rounded-control bg-surface-alt border border-border">
          {(['month', 'year', 'all'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-control text-xs font-semibold transition-all capitalize ${
                timeframe === t
                  ? 'bg-surface text-text-primary shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t === 'all' ? 'All Time' : `This ${t}`}
            </button>
          ))}
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cost Per Wear Champions */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <h3 className="font-serif text-base font-bold text-text-primary">
                Cost-Per-Wear Heroes
              </h3>
            </div>
            <span className="text-[11px] text-text-secondary">Lowest $/wear</span>
          </div>

          {topCPW.length === 0 ? (
            <p className="text-xs text-text-secondary p-4 text-center rounded bg-surface-alt">
              Log wears over time to see your best investment pieces.
            </p>
          ) : (
            <div className="space-y-2.5">
              {topCPW.map((item) => {
                const cutoutSvg = SAMPLE_CUTOUT_SVGS[item.id];
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-control bg-surface-alt border border-border flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
                        {cutoutSvg ? (
                          <div
                            className="w-full h-full p-1 flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                            dangerouslySetInnerHTML={{ __html: cutoutSvg }}
                          />
                        ) : (
                          <Sparkles className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-primary truncate">{item.name}</p>
                        <p className="text-[10px] text-text-secondary">
                          Worn {item.itemWornCount} times &bull; ${item.price} retail
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-success block">
                        ${item.cpw.toFixed(2)}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-text-secondary">per wear</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Never Worn / Dormant Items */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h3 className="font-serif text-base font-bold text-text-primary">
                Unworn & Dormant Pieces
              </h3>
            </div>
            <span className="text-[11px] text-text-secondary">{neverWorn.length} items</span>
          </div>

          {neverWorn.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-secondary rounded bg-surface-alt">
              Great job! All items in your closet have been worn at least once.
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-text-secondary">
                You haven't worn these pieces recently. Consider styling them today or donating.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {neverWorn.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded bg-surface-alt border border-border flex items-center gap-2 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                    <span className="truncate text-text-primary text-[11px] font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wardrobe Color & Category Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Color Balance */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            <h3 className="font-serif text-base font-bold text-text-primary">
              Wardrobe Color Palette Balance
            </h3>
          </div>

          <div className="space-y-3">
            {/* Pattern/Text accessible multi-segment bar per AGENTS.md accessibility rules */}
            <div className="w-full h-4 rounded-full bg-surface-alt border border-border overflow-hidden flex">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${colorBreakdown.neutrals}%` }}
                title={`Neutrals: ${colorBreakdown.neutrals}%`}
              />
              <div
                className="bg-accent h-full transition-all"
                style={{ width: `${colorBreakdown.earthy}%` }}
                title={`Earthy & Warm: ${colorBreakdown.earthy}%`}
              />
              <div
                className="bg-warning h-full transition-all"
                style={{ width: `${colorBreakdown.vibrant}%` }}
                title={`Accents & Colors: ${colorBreakdown.vibrant}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-surface-alt border border-border">
                <span className="font-bold text-text-primary block">{colorBreakdown.neutrals}%</span>
                <span className="text-[10px] text-text-secondary">Neutrals ({colorBreakdown.counts.neutrals})</span>
              </div>
              <div className="p-2 rounded bg-surface-alt border border-border">
                <span className="font-bold text-text-primary block">{colorBreakdown.earthy}%</span>
                <span className="text-[10px] text-text-secondary">Earthy Tone ({colorBreakdown.counts.earthy})</span>
              </div>
              <div className="p-2 rounded bg-surface-alt border border-border">
                <span className="font-bold text-text-primary block">{colorBreakdown.vibrant}%</span>
                <span className="text-[10px] text-text-secondary">Accents ({colorBreakdown.counts.vibrant})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Ratio */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-soft">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="font-serif text-base font-bold text-text-primary">
              Category Distribution
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-surface-alt border border-border">
              <span className="font-bold text-sm text-text-primary block">{categoryCounts.top || 0}</span>
              <span className="text-[10px] uppercase font-semibold text-text-secondary">Tops</span>
            </div>
            <div className="p-2 rounded bg-surface-alt border border-border">
              <span className="font-bold text-sm text-text-primary block">{categoryCounts.bottom || 0}</span>
              <span className="text-[10px] uppercase font-semibold text-text-secondary">Bottoms</span>
            </div>
            <div className="p-2 rounded bg-surface-alt border border-border">
              <span className="font-bold text-sm text-text-primary block">{categoryCounts.shoes || 0}</span>
              <span className="text-[10px] uppercase font-semibold text-text-secondary">Shoes</span>
            </div>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Your top-to-bottom ratio is{' '}
            <strong>
              {((categoryCounts.top || 1) / Math.max(1, categoryCounts.bottom || 1)).toFixed(1)}:1
            </strong>
            . A 3:1 ratio provides comfortable outfit variety without over-purchasing bottoms.
          </p>
        </div>
      </div>

      {/* Palette-Aware & Wardrobe-Aware Gap Analysis per SPEC Section 8 */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-4 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Smart Wardrobe Gap Analysis
              </h3>
              <p className="text-xs text-text-secondary">
                Calculated from your current clothes, style undertone, and proportion needs.
              </p>
            </div>
          </div>

          <Button
            variant={gapAnalysis.isAlreadyInWishlist ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => handleToggleWishlist(gapAnalysis.suggestedName)}
            leftIcon={gapAnalysis.isAlreadyInWishlist ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {gapAnalysis.isAlreadyInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
          </Button>
        </div>

        <div className="p-4 rounded-control bg-surface-alt border border-border space-y-3">
          <div className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-full border border-border shrink-0"
              style={{ backgroundColor: gapAnalysis.suggestedHex }}
            />
            <span className="font-bold text-sm text-text-primary">
              {gapAnalysis.title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {gapAnalysis.reasons.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
