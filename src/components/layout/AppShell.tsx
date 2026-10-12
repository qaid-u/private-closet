'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  Shirt,
  Layers,
  Calendar,
  BarChart3,
  User,
  Settings,
  Menu,
  X,
  PlusCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { useWardrobeStore } from '@/stores/wardrobeStore';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const items = useWardrobeStore((state) => state.items);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/closet', label: 'My Closet', icon: Shirt, badge: items.length },
    { href: '/stylist', label: 'AI Stylist', icon: Sparkles, highlight: true },
    { href: '/outfits', label: 'Outfit Library', icon: Layers },
    { href: '/planner', label: 'Outfit Planner', icon: Calendar },
    { href: '/insights', label: 'Wardrobe Insights', icon: BarChart3 },
    { href: '/profile', label: 'Style Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const mobileBottomLinks = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/closet', label: 'Closet', icon: Shirt },
    { href: '/stylist', label: 'Stylist', icon: Sparkles, central: true },
    { href: '/outfits', label: 'Outfits', icon: Layers },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#141413] text-[#222321] dark:text-[#F4F1EC] flex flex-col md:flex-row transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-[#1E1D1B] border-r border-[#E6E4DE] dark:border-[#35322F] p-6 shrink-0 h-screen sticky top-0 justify-between">
        <div>
          {/* Brand Heading */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#3B4D42] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-[#222321] dark:text-[#F4F1EC]">
                  MyStyle AI
                </span>
                <p className="text-[10px] uppercase tracking-wider text-[#747570] dark:text-[#A8A29A]">
                  Personal Stylist
                </p>
              </div>
            </Link>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-[#747570] hover:bg-[#F0EEE9] dark:hover:bg-[#282623] transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Desktop Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#3B4D42] text-white shadow-sm'
                      : link.highlight
                      ? 'text-[#3B4D42] dark:text-[#6FA898] bg-[#E5EEE9] dark:bg-[#253D36] hover:bg-[#3B4D42] hover:text-white'
                      : 'text-[#747570] dark:text-[#A8A29A] hover:bg-[#F0EEE9] dark:hover:bg-[#282623] hover:text-[#222321] dark:hover:text-[#F4F1EC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F0EEE9] dark:bg-[#282623] text-[#747570] dark:text-[#A8A29A]'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Closet CTA */}
        <div className="pt-6 border-t border-[#E6E4DE] dark:border-[#35322F]">
          <Link
            href="/closet/new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F0EEE9] dark:bg-[#282623] text-[#222321] dark:text-[#F4F1EC] text-sm font-semibold hover:bg-[#E6E4DE] dark:hover:bg-[#35322F] transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#3B4D42] dark:text-[#6FA898]" />
            <span>Add Item to Closet</span>
          </Link>
          <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-[#747570]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4B8067]"></span>
              Private Wardrobe
            </span>
            <span className="text-[10px] bg-[#F0EEE9] dark:bg-[#282623] px-1.5 py-0.5 rounded">
              v1.0 Ready
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1E1D1B] border-b border-[#E6E4DE] dark:border-[#35322F] sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3B4D42] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
            MyStyle AI
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-[#747570] hover:bg-[#F0EEE9] dark:hover:bg-[#282623]"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-[#222321] dark:text-[#F4F1EC] hover:bg-[#F0EEE9] dark:hover:bg-[#282623]"
            aria-label="Open navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white dark:bg-[#1E1D1B] rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="font-serif text-lg font-bold">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-[#747570]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-base font-medium ${
                      isActive
                        ? 'bg-[#3B4D42] text-white'
                        : 'text-[#747570] hover:bg-[#F0EEE9] dark:hover:bg-[#282623]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#1E1D1B]/95 backdrop-blur-md border-t border-[#E6E4DE] dark:border-[#35322F] px-4 py-2 z-30 flex items-center justify-around shadow-lg"
        aria-label="Mobile Navigation"
      >
        {mobileBottomLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));

          if (link.central) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center -mt-6 group"
              >
                <div className="w-13 h-13 p-3.5 rounded-full bg-[#3B4D42] text-white shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[11px] font-semibold text-[#3B4D42] dark:text-[#6FA898] mt-1">
                  Stylist
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[#3B4D42] dark:text-[#6FA898]'
                  : 'text-[#747570] dark:text-[#A8A29A]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
