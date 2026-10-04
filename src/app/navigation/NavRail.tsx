import React from 'react';
import {
  Sparkles,
  Shirt,
  Palette,
  User,
  Sun,
  Moon,
  ShieldCheck,
  Layers,
  Calendar,
  Luggage,
  Sparkle,
} from 'lucide-react';
import { DestinationTab } from './BottomNav';

interface NavRailProps {
  activeTab: DestinationTab;
  onSelectTab: (tab: DestinationTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onSelectOutfitBuilder?: () => void;
  onSelectSecondaryTool?: (tool: 'outfits' | 'weekly' | 'packing' | 'care') => void;
}

export const NavRail: React.FC<NavRailProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onSelectOutfitBuilder,
  onSelectSecondaryTool,
}) => {
  const primaryTabs: { id: DestinationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'closet', label: 'Closet', icon: <Shirt className="w-5 h-5" /> },
    { id: 'style', label: 'Style', icon: <Palette className="w-5 h-5" /> },
    { id: 'me', label: 'Me', icon: <User className="w-5 h-5" /> },
  ];

  const secondaryLinks = [
    { label: 'Outfit Builder', icon: <Layers className="w-4 h-4" /> },
    { label: 'Weekly Planner', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Packing Planner', icon: <Luggage className="w-4 h-4" /> },
    { label: 'Care & Laundry', icon: <Sparkle className="w-4 h-4" /> },
  ];

  return (
    <aside
      aria-label="Desktop and tablet navigation rail"
      className="hidden md:flex flex-col justify-between h-screen sticky top-0 bg-surface border-r border-border p-4 lg:p-6 w-20 lg:w-64 shrink-0 transition-all select-none"
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-card bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Shirt className="w-5 h-5" />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <h1 className="font-serif text-lg font-bold tracking-tight text-text-primary leading-tight truncate">
              Private Closet
            </h1>
            <p className="text-[11px] text-text-secondary truncate">100% on device</p>
          </div>
        </div>

        {/* Primary Destinations */}
        <nav aria-label="Main navigation" className="space-y-1.5">
          {primaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`rail-nav-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-control min-h-touch font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'bg-primary-soft text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-alt'
                }`}
              >
                <div className="shrink-0">{tab.icon}</div>
                <span className="hidden lg:inline-block font-sans">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Secondary Navigation (Visible on wider desktop) */}
        <div className="hidden lg:block pt-4 border-t border-border space-y-1">
          <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Secondary Tools
          </span>
          <div className="space-y-1 pt-1">
            {secondaryLinks.map((link) => {
              const toolType =
                link.label === 'Outfit Builder'
                  ? 'outfits'
                  : link.label === 'Weekly Planner'
                  ? 'weekly'
                  : link.label === 'Packing Planner'
                  ? 'packing'
                  : 'care';

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => {
                    if (onSelectSecondaryTool) {
                      onSelectSecondaryTool(toolType);
                    } else if (link.label === 'Outfit Builder' && onSelectOutfitBuilder) {
                      onSelectOutfitBuilder();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-control text-xs text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <span className="text-text-secondary">{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Utilities */}
      <div className="pt-4 border-t border-border space-y-3">
        {/* On Device Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-control bg-surface-alt text-text-secondary text-xs">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span className="truncate">Zero Cloud Telemetry</span>
        </div>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-control min-h-touch text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="hidden lg:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Dev Component Showcase Link */}
        <a
          href="/dev/components"
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-control text-[11px] text-text-secondary hover:text-primary hover:bg-surface-alt transition-colors"
        >
          <span className="font-mono text-xs">/dev</span>
          <span className="hidden lg:inline">Component Catalog</span>
        </a>
      </div>
    </aside>
  );
};
