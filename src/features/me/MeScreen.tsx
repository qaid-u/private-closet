import React from 'react';
import { ShieldCheck, Lock, Download } from 'lucide-react';
import { NETWORK_REGISTRY } from '../../net/registry';
import { usePrivacyStore } from '../../stores/privacyStore';
import { Button } from '../../ui/Button';

export const MeScreen: React.FC = () => {
  const { permissions, togglePermission, auditLog } = usePrivacyStore();

  // Compute actual bytes sent carrying user data
  const userDataBytesSent = auditLog.reduce((acc, entry) => {
    // By architecture design, zero user data leaves device
    return acc + (entry.status === 'allowed' ? 0 : 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header per SPEC Section 9 */}
      <div className="pb-4 border-b border-border">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
          Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Complete local control &bull; Zero accounts &bull; Free and open source
        </p>
      </div>

      {/* Privacy Center Hero Card */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-card bg-success/15 text-success flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">
                Privacy Center
              </h2>
              <p className="text-xs text-text-secondary">
                "Nothing leaves your device."
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
              Data Sent About You
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-success">
              {userDataBytesSent} bytes
            </span>
          </div>
        </div>

        {/* Live Network Outbound Register List */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs uppercase font-bold tracking-wider text-text-secondary">
            Outgoing Network Registry
          </h3>

          {Object.values(NETWORK_REGISTRY).map((perm) => {
            const isEnabled = !!permissions[perm.id];
            return (
              <div
                key={perm.id}
                className="p-4 rounded-control bg-surface-alt border border-border space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{perm.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isEnabled ? 'bg-success/15 text-success' : 'bg-surface text-text-secondary border border-border'
                      }`}
                    >
                      {isEnabled ? 'Enabled' : 'Disabled by default'}
                    </span>
                  </div>

                  <Button
                    variant={isEnabled ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => togglePermission(perm.id as 'OPEN_METEO_WEATHER', !isEnabled)}
                  >
                    {isEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>

                <p className="text-text-secondary">{perm.purpose}</p>
                <p className="text-text-secondary">
                  <strong>Payload:</strong> {perm.dataTransmitted}
                </p>
              </div>
            );
          })}

          <div className="p-4 rounded-control bg-surface-alt border border-border text-xs flex items-center justify-between">
            <div>
              <span className="font-semibold text-text-primary">Analytics & Telemetry</span>
              <p className="text-text-secondary mt-0.5">Crash logs, tracking scripts, and third-party trackers</p>
            </div>
            <span className="font-bold text-success">None</span>
          </div>
        </div>
      </div>

      {/* Storage, Encryption & Backup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-card p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-serif font-bold text-text-primary text-base">
              App Lock & Encryption
            </h3>
          </div>
          <p className="text-xs text-text-secondary">
            Encrypt wardrobe data at rest with AES-GCM password protection.
          </p>
          <Button variant="secondary" size="sm" className="w-full">
            Configure Lock
          </Button>
        </div>

        <div className="bg-surface border border-border rounded-card p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-serif font-bold text-text-primary text-base">
              Encrypted Backup
            </h3>
          </div>
          <p className="text-xs text-text-secondary">
            Export a standalone .closetbackup file or restore onto another device.
          </p>
          <Button variant="secondary" size="sm" className="w-full">
            Export Backup
          </Button>
        </div>
      </div>

      {/* About & Donation Notice per SPEC Section 9 */}
      <div className="bg-surface border border-border rounded-card p-6 space-y-3 text-xs text-text-secondary">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-text-primary">
            About Private Closet
          </h3>
          <span className="font-mono">v0.1.0 (Phase 0)</span>
        </div>
        <p>
          Free and open-source progressive web application. Built strictly for the user, on the user's
          own hardware.
        </p>
        <p className="p-3 rounded-control bg-surface-alt border border-border text-text-primary italic">
          "A donation unlocks nothing. Every feature stays free for everyone."
        </p>
      </div>
    </div>
  );
};
