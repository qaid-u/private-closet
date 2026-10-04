import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  FileArchive,
  Lock,
  Sparkles,
  Sliders,
  Code2,
} from 'lucide-react';
import { PrivacyCenterSection } from './PrivacyCenterSection';
import { AiModelsSection } from './AiModelsSection';
import { BackupRestoreSection } from './BackupRestoreSection';
import { SecuritySection } from './SecuritySection';
import { StyleDataSection } from './StyleDataSection';
import { SettingsSection } from './SettingsSection';
import { AboutSection } from './AboutSection';
import { PwaInstallSection } from './PwaInstallSection';
import { OnDeviceBadge } from '../../ui/OnDeviceBadge';
import { Smartphone } from 'lucide-react';

type MeTabSection = 'privacy' | 'models' | 'backup' | 'security' | 'styledata' | 'settings' | 'storage' | 'about';

export const MeScreen: React.FC = () => {
  const [activeSection, setActiveSection] = useState<MeTabSection>('privacy');

  const navigationItems: { id: MeTabSection; label: string; icon: React.ReactNode }[] = [
    { id: 'privacy', label: 'Privacy Center', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'models', label: 'AI Models', icon: <Cpu className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup & Restore', icon: <FileArchive className="w-4 h-4" /> },
    { id: 'security', label: 'Lock & Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'styledata', label: 'Style Data', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'settings', label: 'Units & Theme', icon: <Sliders className="w-4 h-4" /> },
    { id: 'storage', label: 'App & Storage', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Code2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
              Control & Privacy
            </h1>
            <OnDeviceBadge label="On Device" size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Full data sovereignty &bull; Encrypted backups &bull; Zero telemetry
          </p>
        </div>

        {/* Section Navigation Tabs (Horizontal on small, wrapped) */}
        <div className="flex items-center p-1 rounded-control bg-surface-alt border border-border overflow-x-auto max-w-full">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeSection === item.id
                  ? 'bg-surface text-text-primary shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Section Content Area */}
      <div className="space-y-6">
        {activeSection === 'privacy' && <PrivacyCenterSection />}
        {activeSection === 'models' && <AiModelsSection />}
        {activeSection === 'backup' && <BackupRestoreSection />}
        {activeSection === 'security' && <SecuritySection />}
        {activeSection === 'styledata' && <StyleDataSection />}
        {activeSection === 'settings' && <SettingsSection />}
        {activeSection === 'storage' && <PwaInstallSection />}
        {activeSection === 'about' && <AboutSection />}
      </div>
    </div>
  );
};

export default MeScreen;
