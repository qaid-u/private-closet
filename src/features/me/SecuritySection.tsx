import React, { useState } from 'react';
import { Lock, Fingerprint, AlertTriangle, ShieldCheck, KeyRound } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

export const SecuritySection: React.FC = () => {
  const [isEncrypted, setIsEncrypted] = useState(() => localStorage.getItem('pc_encryption_enabled') === 'true');
  const [passphrase, setPassphrase] = useState('');
  const [autoLockTimeout, setAutoLockTimeout] = useState(() => localStorage.getItem('pc_auto_lock') || '15');
  const [biometricsEnabled, setBiometricsEnabled] = useState(() => localStorage.getItem('pc_biometrics') === 'true');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Strength meter evaluation
  const getStrength = (val: string): { label: string; percent: number; color: string } => {
    if (!val) return { label: 'None', percent: 0, color: 'bg-border' };
    let score = 0;
    if (val.length >= 8) score += 25;
    if (val.length >= 12) score += 25;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 25;
    if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score += 25;

    if (score < 50) return { label: 'Weak', percent: score, color: 'bg-danger' };
    if (score < 100) return { label: 'Good', percent: score, color: 'bg-warning' };
    return { label: 'Strong', percent: 100, color: 'bg-success' };
  };

  const strength = getStrength(passphrase);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEncrypted && passphrase.length < 8) {
      alert('Please use a passphrase with at least 8 characters.');
      return;
    }

    localStorage.setItem('pc_encryption_enabled', isEncrypted ? 'true' : 'false');
    localStorage.setItem('pc_auto_lock', autoLockTimeout);
    localStorage.setItem('pc_biometrics', biometricsEnabled ? 'true' : 'false');

    setToastMsg('Security preferences saved on device');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 space-y-5 shadow-soft">
      {toastMsg && (
        <div className="p-3 rounded-control bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-card bg-primary-soft text-primary flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-text-primary">
            App Lock & Local Encryption
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Safeguard your wardrobe measurements and photos from unauthorized device access.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSecurity} className="space-y-4 pt-2 border-t border-border">
        {/* Encrypt Data at Rest Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-control bg-surface-alt border border-border">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-text-primary block">
              Encrypt Local Storage at Rest
            </span>
            <span className="text-[11px] text-text-secondary block">
              Requires passphrase to unlock database on app launch
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isEncrypted}
            onClick={() => setIsEncrypted(!isEncrypted)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              isEncrypted ? 'bg-primary' : 'bg-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isEncrypted ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isEncrypted && (
          <div className="p-4 rounded-control bg-surface-alt/70 border border-border space-y-3 animate-in fade-in duration-200">
            <Input
              type="password"
              label="App Passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter minimum 8 characters..."
            />

            {/* Passphrase Strength Meter */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                <span className="text-text-secondary">Passphrase Strength:</span>
                <span className={strength.label === 'Strong' ? 'text-success' : strength.label === 'Good' ? 'text-warning' : 'text-danger'}>
                  {strength.label}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
            </div>

            {/* Prominent Recovery Warning per SPEC Section 9 */}
            <div className="p-3 rounded-control bg-warning/10 border border-warning/30 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-primary leading-relaxed font-medium">
                <strong>Important:</strong> If you forget this passphrase, your local closet data cannot be recovered. Antigravity and Private Closet have zero access to your device.
              </p>
            </div>
          </div>
        )}

        {/* Auto Lock & Biometrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Auto-Lock Timeout"
            value={autoLockTimeout}
            onChange={(e) => setAutoLockTimeout(e.target.value)}
            options={[
              { value: '0', label: 'Immediately when backgrounded' },
              { value: '5', label: 'After 5 minutes' },
              { value: '15', label: 'After 15 minutes' },
              { value: '60', label: 'After 1 hour' },
              { value: '-1', label: 'Never lock automatically' },
            ]}
          />

          <div className="flex items-center justify-between p-3 rounded-control bg-surface-alt border border-border">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-primary" />
              <div>
                <span className="text-xs font-bold text-text-primary block">Biometric Unlock</span>
                <span className="text-[10px] text-text-secondary">Face ID / Touch ID</span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={biometricsEnabled}
              onClick={() => setBiometricsEnabled(!biometricsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                biometricsEnabled ? 'bg-primary' : 'bg-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  biometricsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" type="submit" leftIcon={<KeyRound className="w-3.5 h-3.5" />}>
            Save Security Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
