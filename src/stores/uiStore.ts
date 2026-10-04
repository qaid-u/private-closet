import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UiState {
  theme: ThemeMode;
  activeTab: string;
  prefersReducedMotion: boolean;
  setTheme: (theme: ThemeMode) => void;
  setActiveTab: (tab: string) => void;
  setPrefersReducedMotion: (override: boolean) => void;
  isDarkMode: () => boolean;
}

export const useUiStore = create<UiState>((set, get) => {
  // Read tiny preferences from localStorage
  const savedTheme = (localStorage.getItem('pc_theme') as ThemeMode) || 'system';
  const savedTab = localStorage.getItem('pc_tab') || 'daily';
  const savedReducedMotion = localStorage.getItem('pc_reduced_motion') === 'true';

  const computeIsDark = (theme: ThemeMode): boolean => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  return {
    theme: savedTheme,
    activeTab: savedTab,
    prefersReducedMotion: savedReducedMotion,
    setTheme: (theme) => {
      localStorage.setItem('pc_theme', theme);
      const isDark = computeIsDark(theme);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme });
    },
    setActiveTab: (tab) => {
      localStorage.setItem('pc_tab', tab);
      set({ activeTab: tab });
    },
    setPrefersReducedMotion: (override) => {
      localStorage.setItem('pc_reduced_motion', String(override));
      set({ prefersReducedMotion: override });
    },
    isDarkMode: () => computeIsDark(get().theme),
  };
});
