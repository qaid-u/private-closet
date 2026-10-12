'use client';

import React, { useState } from 'react';
import {
  Settings,
  Download,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Database,
  Moon,
  Sun,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useWardrobeStore } from '@/stores/wardrobeStore';

export default function SettingsPage() {
  const items = useWardrobeStore((state) => state.items);
  const savedOutfits = useWardrobeStore((state) => state.savedOutfits);
  const styleProfile = useWardrobeStore((state) => state.styleProfile);
  const resetToDemo = useWardrobeStore((state) => state.resetToDemo);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportData = () => {
    const exportData = {
      app: 'MyStyle AI',
      exported_at: new Date().toISOString(),
      wardrobe_items: items,
      saved_outfits: savedOutfits,
      style_profile: styleProfile,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mystyle-ai-wardrobe-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Wardrobe backup downloaded successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Reset closet back to standard demo sample wardrobe? This will restore standard sample items.')) {
      resetToDemo();
      showToast('Closet reset to sample demo wardrobe.');
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#3B4D42] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#C9B79C]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">
            Settings & Account
          </h1>
          <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-1">
            Manage your local data, cloud sync status, backups, and styling engine preferences.
          </p>
        </div>

        {/* Integrations & Model Health Card */}
        <div className="bg-white dark:bg-[#1E1D1B] p-6 sm:p-8 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
            AI & Cloud Services Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#3B4D42] text-white flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#222321] dark:text-[#F4F1EC] block">AI Stylist Engine</span>
                  <span className="text-[10px] text-[#747570]">Active • Live/Deterministic Fallback</span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#4B8067]"></span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#3B4D42] text-white flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#222321] dark:text-[#F4F1EC] block">Persistence Layer</span>
                  <span className="text-[10px] text-[#747570]">Supabase Cloud + Local Storage</span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#4B8067]"></span>
            </div>
          </div>
        </div>

        {/* Data Management & Backup */}
        <div className="bg-white dark:bg-[#1E1D1B] p-6 sm:p-8 rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] shadow-xs space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#222321] dark:text-[#F4F1EC]">
            Data Management & Backups
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F7F4] dark:bg-[#282623] border border-[#E6E4DE] dark:border-[#35322F]">
            <div>
              <span className="text-xs font-bold text-[#222321] dark:text-[#F4F1EC] block">
                Export Wardrobe & Outfits JSON
              </span>
              <p className="text-xs text-[#747570] mt-0.5">
                Download a complete, offline-readable backup of your clothing items, outfits, and styling profile.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B4D42] text-white text-xs font-semibold hover:bg-[#2E3D34] shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#B84B4B]/5 border border-[#B84B4B]/20">
            <div>
              <span className="text-xs font-bold text-[#B84B4B] block">
                Reset to Sample Demo Closet
              </span>
              <p className="text-xs text-[#747570] mt-0.5">
                Restore the initial curated sample inventory (20 designer items across all categories).
              </p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#B84B4B] text-[#B84B4B] hover:bg-[#B84B4B] hover:text-white text-xs font-semibold shrink-0 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Closet</span>
            </button>
          </div>
        </div>

        {/* Security & Privacy Commitment */}
        <div className="p-6 rounded-2xl bg-[#E5EEE9]/40 dark:bg-[#253D36]/20 border border-[#3B4D42]/20 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-[#3B4D42] dark:text-[#6FA898] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif text-sm font-bold text-[#222321] dark:text-[#F4F1EC]">
              Privacy-First Fashion Principles
            </h4>
            <p className="text-xs text-[#747570] dark:text-[#A8A29A] leading-relaxed">
              MyStyle AI strictly respects your privacy. Photos uploaded are solely used for digital wardrobe representation and feature extraction. Recommendations are always based on body proportions and positive styling harmony, with no fabricated items.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
