import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { styleProfileRepo } from '../../data/repositories/styleProfileRepo';
import { StyleProfile } from '../../data/types';

export const StyleDataSection: React.FC = () => {
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    styleProfileRepo.getProfile().then((p) => {
      setProfile(p || null);
      setIsDeleted(!p);
      setIsLoading(false);
    });
  }, []);

  const handleExport = () => {
    if (!profile) return;
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `private-closet-style-profile-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMsg('Style Profile exported as JSON');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDelete = async () => {
    await styleProfileRepo.deleteStyleData();
    setProfile(null);
    setIsDeleted(true);
    setIsConfirmOpen(false);
    setToastMsg('Style Profile data permanently deleted. Today recommendations will use general rules.');
    setTimeout(() => setToastMsg(null), 4000);
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
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-text-primary">
            Style Profile Data
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Your body proportions, color harmony palette, and taste quiz answers.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-control bg-surface-alt border border-border space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-text-primary">Profile Completeness</span>
          <span className="font-semibold text-primary">
            {profile ? `${profile.completeness}% on device` : 'Not set up / Deleted'}
          </span>
        </div>
        <p className="text-text-secondary text-[11px] leading-relaxed">
          Deleting style data resets your personalization. Your clothes, saved outfits, and wear history remain 100% intact, and Today recommendations gracefully fall back to general color and proportion rules.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isDeleted || isLoading}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Export Style Data (JSON)
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isDeleted || isLoading}
          className="text-danger hover:bg-danger/10"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Only Style Data
        </Button>
      </div>

      {/* Confirmation Dialog per SPEC Section 9 & Flow 6 */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Style Profile Data?"
        description="Closet items, saved outfits, and wear history will remain completely intact. Today recommendations will return to general proportion and color harmony rules. Afterward, export and delete controls will be disabled."
        confirmLabel="Delete Style Data"
        isDestructive={true}
      />
    </div>
  );
};
