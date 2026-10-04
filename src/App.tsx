import React, { useState, useEffect } from 'react';
import { NavRail } from './app/navigation/NavRail';
import { BottomNav, DestinationTab } from './app/navigation/BottomNav';
import { TodayScreen } from './features/today/TodayScreen';
import { ClosetScreen } from './features/closet/ClosetScreen';
import { StyleScreen } from './features/style-profile/StyleScreen';
import { MeScreen } from './features/me/MeScreen';
import { DevComponentsPage } from './features/dev/DevComponentsPage';
import { useUiStore } from './stores/uiStore';
import { Sun, Moon, ShieldCheck, Code } from 'lucide-react';

import { OnboardingFlow } from './features/onboarding/OnboardingFlow';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DestinationTab>('today');
  const [styleSegment, setStyleSegment] = useState<'profile' | 'outfits' | 'log' | 'insights' | 'plan'>('profile');
  const [isDevMode, setIsDevMode] = useState(
    typeof window !== 'undefined' && window.location.pathname === '/dev/components'
  );
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('onboarding') === 'true') return true;
    return localStorage.getItem('pc_onboarding_done') !== 'true';
  });
  const { setTheme, isDarkMode } = useUiStore();
  const isDark = isDarkMode();

  useEffect(() => {
    const handlePopState = () => {
      setIsDevMode(window.location.pathname === '/dev/components');
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('onboarding') === 'true') {
        setShowOnboarding(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToDev = () => {
    window.history.pushState({}, '', '/dev/components');
    setIsDevMode(true);
  };

  const navigateToApp = () => {
    window.history.pushState({}, '', '/');
    setIsDevMode(false);
  };

  const handleToggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('pc_onboarding_done', 'true');
    setShowOnboarding(false);
    setActiveTab('today');
  };

  if (isDevMode) {
    return <DevComponentsPage onBackToApp={navigateToApp} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleCompleteOnboarding}
        onSkipToApp={handleCompleteOnboarding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col md:flex-row antialiased">
      {/* Tablet & Desktop Persistent Left Rail per SPEC Section 4 */}
      <NavRail
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onSelectOutfitBuilder={() => {
          setActiveTab('style');
          setStyleSegment('outfits');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top App Bar (Hidden on Tablet/Desktop where NavRail is visible) */}
        <header className="md:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-text-primary">Private Closet</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary">
              <ShieldCheck className="w-3 h-3" />
              Local
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={navigateToDev}
              aria-label="Open UI Component Library showcase"
              className="p-2 rounded-control border border-border bg-surface text-text-secondary hover:text-text-primary min-h-touch min-w-touch flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Code className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="p-2 rounded-control border border-border bg-surface text-text-secondary hover:text-text-primary min-h-touch min-w-touch flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Viewport Screen Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 pb-24 md:pb-8 overflow-y-auto">
          {activeTab === 'today' && <TodayScreen onSelectTab={setActiveTab} />}
          {activeTab === 'closet' && <ClosetScreen />}
          {activeTab === 'style' && <StyleScreen initialSegment={styleSegment} />}
          {activeTab === 'me' && <MeScreen />}
        </main>
      </div>

      {/* Mobile Four-Tab Bottom Navigation per SPEC Section 4 */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
};

export default App;
