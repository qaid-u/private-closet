import React, { useState } from 'react';
import { Sliders, CheckCircle2 } from 'lucide-react';
import { Select } from '../../ui/Select';
import { useUiStore } from '../../stores/uiStore';

export const SettingsSection: React.FC = () => {
  const { theme, setTheme } = useUiStore();
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>(() => {
    return (localStorage.getItem('pc_height_unit') as 'cm' | 'in') || 'cm';
  });
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => {
    return (localStorage.getItem('pc_temp_unit') as 'C' | 'F') || 'C';
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleUpdateHeight = (val: 'cm' | 'in') => {
    setHeightUnit(val);
    localStorage.setItem('pc_height_unit', val);
    setToastMsg('Height unit updated');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleUpdateTemp = (val: 'C' | 'F') => {
    setTempUnit(val);
    localStorage.setItem('pc_temp_unit', val);
    setToastMsg('Temperature unit updated');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 space-y-5 shadow-soft">
      {toastMsg && (
        <div className="p-3 rounded-control bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-card bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-text-primary">
            Units & Appearance
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure system theme and preferred measurement formats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
        {/* Theme Switcher */}
        <Select
          label="App Theme"
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          options={[
            { value: 'light', label: 'Light Mode' },
            { value: 'dark', label: 'Dark Mode' },
            { value: 'system', label: 'System Default' },
          ]}
        />

        {/* Height Unit */}
        <Select
          label="Height Measurement"
          value={heightUnit}
          onChange={(e) => handleUpdateHeight(e.target.value as 'cm' | 'in')}
          options={[
            { value: 'cm', label: 'Centimeters (cm)' },
            { value: 'in', label: 'Feet / Inches (ft/in)' },
          ]}
        />

        {/* Temperature Unit */}
        <Select
          label="Weather Temperature"
          value={tempUnit}
          onChange={(e) => handleUpdateTemp(e.target.value as 'C' | 'F')}
          options={[
            { value: 'C', label: 'Celsius (°C)' },
            { value: 'F', label: 'Fahrenheit (°F)' },
          ]}
        />
      </div>
    </div>
  );
};
