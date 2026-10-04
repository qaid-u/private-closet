import React from 'react';
import { Sparkles, Shirt, Palette, User } from 'lucide-react';

export type DestinationTab = 'today' | 'closet' | 'style' | 'me';

interface BottomNavProps {
  activeTab: DestinationTab;
  onSelectTab: (tab: DestinationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: DestinationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'closet', label: 'Closet', icon: <Shirt className="w-5 h-5" /> },
    { id: 'style', label: 'Style', icon: <Palette className="w-5 h-5" /> },
    { id: 'me', label: 'Me', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-3 py-1.5 shadow-floating"
    >
      <div className="grid grid-cols-4 max-w-sm mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-control min-h-touch transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className="shrink-0">{tab.icon}</div>
              <span className="text-[11px] mt-1 tracking-tight font-sans">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
