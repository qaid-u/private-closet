import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, FileArchive, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { backupService, BackupData, BackupPreview } from '../../data/backupService';

export const BackupRestoreSection: React.FC = () => {
  const [excludeProfile, setExcludeProfile] = useState(true);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => localStorage.getItem('pc_last_backup_time'));
  const [estimatedSize, setEstimatedSize] = useState('~40 KB');

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPassphrase, setExportPassphrase] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Import Modal & preview state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileContent, setImportFileContent] = useState<string | null>(null);
  const [importPassphrase, setImportPassphrase] = useState('');
  const [importPreview, setImportPreview] = useState<BackupPreview | null>(null);
  const [stagedData, setStagedData] = useState<BackupData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    backupService.estimateBackupSize().then(setEstimatedSize);
  }, []);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportPassphrase || exportPassphrase.length < 6) {
      alert('Please enter a passphrase of at least 6 characters to encrypt your backup.');
      return;
    }

    setIsExporting(true);
    try {
      const { blob, filename } = await backupService.exportEncrypted(exportPassphrase, excludeProfile);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const nowStr = new Date().toLocaleString();
      localStorage.setItem('pc_last_backup_time', nowStr);
      setLastBackupTime(nowStr);
      setIsExportModalOpen(false);
      setExportPassphrase('');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportFileContent(content);
      setImportError(null);
      setImportPreview(null);
      setStagedData(null);
      setIsImportModalOpen(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDecryptAndPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFileContent) return;

    setImportError(null);
    try {
      const { data, preview } = await backupService.previewEncrypted(importFileContent, importPassphrase);
      setImportPreview(preview);
      setStagedData(data);
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Decryption failed: Invalid passphrase or file corrupted.');
    }
  };

  const handleConfirmRestore = async () => {
    if (!stagedData) return;
    setIsRestoring(true);
    try {
      await backupService.restore(stagedData);
      setIsImportModalOpen(false);
      alert('Wardrobe backup successfully restored into your local closet!');
      window.location.reload();
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Failed to restore database.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-card p-6 space-y-5 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-card bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <FileArchive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-text-primary">
              Encrypted Backup & Restore
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Export encrypted snapshots with Web Crypto AES-GCM &bull; Never unencrypted
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
            Last Backup
          </span>
          <span className="text-xs font-semibold text-text-primary">
            {lastBackupTime || 'Never backed up'}
          </span>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="space-y-3 pt-2 border-t border-border">
        {/* Exclude Style Profile Toggle per SPEC Section 9 */}
        <div className="flex items-center justify-between p-3.5 rounded-control bg-surface-alt border border-border">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-text-primary block">
              Exclude Style Profile Data from Backups
            </span>
            <span className="text-[11px] text-text-secondary block">
              Recommended on: Backs up only clothing items, outfits, and wear logs
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={excludeProfile}
            onClick={() => setExcludeProfile(!excludeProfile)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              excludeProfile ? 'bg-primary' : 'bg-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                excludeProfile ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsExportModalOpen(true)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Encrypted Backup ({estimatedSize})
          </Button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept=".qcloset,.json"
              className="hidden"
            />
            <Button
              variant="outline"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Restore from Backup File
            </Button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Encrypted Backup"
      >
        <form onSubmit={handleExport} className="space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Your wardrobe items, outfits, and wear history will be encrypted using <strong>AES-256-GCM</strong> directly on your device before downloading.
          </p>

          <Input
            type="password"
            label="Set Backup Passphrase"
            value={exportPassphrase}
            onChange={(e) => setExportPassphrase(e.target.value)}
            placeholder="Choose a passphrase (min 6 characters)..."
            required
          />

          <div className="p-3 rounded-control bg-surface-alt border border-border text-[11px] text-text-secondary">
            <strong>Security Note:</strong> Keep this passphrase safe. You will need it to restore this backup on another device or browser.
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isExporting}>
              Encrypt & Download
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportPreview(null);
          setStagedData(null);
        }}
        title="Restore Encrypted Backup"
      >
        <div className="space-y-4">
          {!importPreview ? (
            <form onSubmit={handleDecryptAndPreview} className="space-y-4">
              <p className="text-xs text-text-secondary">
                Enter the passphrase used when this backup file was created to decrypt and preview its contents.
              </p>

              <Input
                type="password"
                label="Backup Passphrase"
                value={importPassphrase}
                onChange={(e) => setImportPassphrase(e.target.value)}
                placeholder="Enter decryption passphrase..."
                required
              />

              {importError && (
                <div className="p-3 rounded-control bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsImportModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Decrypt & Preview
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-control bg-success/10 border border-success/30 space-y-2">
                <div className="flex items-center gap-2 text-success font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Backup Decrypted Successfully</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded bg-surface border border-border">
                    <span className="font-bold text-sm text-text-primary block">{importPreview.itemsCount}</span>
                    <span className="text-[10px] text-text-secondary uppercase font-semibold">Items</span>
                  </div>
                  <div className="p-2 rounded bg-surface border border-border">
                    <span className="font-bold text-sm text-text-primary block">{importPreview.outfitsCount}</span>
                    <span className="text-[10px] text-text-secondary uppercase font-semibold">Outfits</span>
                  </div>
                  <div className="p-2 rounded bg-surface border border-border">
                    <span className="font-bold text-sm text-text-primary block">{importPreview.wearLogsCount}</span>
                    <span className="text-[10px] text-text-secondary uppercase font-semibold">Wear Logs</span>
                  </div>
                </div>

                <p className="text-[11px] text-text-secondary text-center pt-1">
                  Exported on {new Date(importPreview.exportedAt).toLocaleDateString()} &bull;{' '}
                  {importPreview.hasStyleProfile ? 'Includes Style Profile' : 'Excluded Style Profile'}
                </p>
              </div>

              <div className="p-3 rounded-control bg-warning/10 border border-warning/20 text-[11px] text-text-primary">
                <strong>Warning:</strong> Restoring this backup will replace current closet items and wear history with the contents of this backup.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setImportPreview(null)}>
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirmRestore} isLoading={isRestoring}>
                  Confirm Restore
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
