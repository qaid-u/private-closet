import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { OnDeviceBadge } from '../../ui/OnDeviceBadge';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Toast } from '../../ui/Toast';
import { StyleProfileWizard } from './StyleProfileWizard';
import {
  OvalFaceIcon,
  RoundFaceIcon,
  SquareFaceIcon,
  HeartFaceIcon,
  OblongFaceIcon,
  DiamondFaceIcon,
} from './FaceShapeIllustrations';
import { Preferences, StyleProfile } from '../../data/types';
import { styleProfileRepo } from '../../data/repositories/styleProfileRepo';
import { preferencesRepo } from '../../data/repositories/preferencesRepo';
import { LookbookGallery } from '../outfits/LookbookGallery';
import { WearCalendarLog } from './WearCalendarLog';
import { WardrobeInsights } from './WardrobeInsights';
import { WardrobePlanner } from './WardrobePlanner';
import {
  SlidersHorizontal,
  Sparkles,
  Palette,
  Scissors,
  Ruler,
  Heart,
  Shield,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StyleScreenProps {
  initialSegment?: 'profile' | 'outfits' | 'log' | 'insights' | 'plan';
}

export const StyleScreen: React.FC<StyleScreenProps> = ({ initialSegment = 'profile' }) => {
  const [segment, setSegment] = useState<'profile' | 'outfits' | 'log' | 'insights' | 'plan'>(initialSegment);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSegment) {
      setSegment(initialSegment);
    }
  }, [initialSegment]);

  const segments = [
    { id: 'profile', label: 'Profile' },
    { id: 'outfits', label: 'Outfits' },
    { id: 'log', label: 'Log' },
    { id: 'insights', label: 'Insights' },
    { id: 'plan', label: 'Plan' },
  ];

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, pref] = await Promise.all([
        styleProfileRepo.getProfile(),
        preferencesRepo.get(),
      ]);
      setProfile(p || null);
      setPreferences(pref || null);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileSaved = (updated: StyleProfile) => {
    setProfile(updated);
    setIsEditing(false);
    setToastMessage('Style Profile updated on device');
  };

  const handleDeleteStyleData = async () => {
    await styleProfileRepo.deleteStyleData();
    setProfile(null);
    setIsConfirmDeleteOpen(false);
    setToastMessage('Style Profile data deleted. Recommendations will return to general rules.');
  };

  const getFaceIcon = (shape?: string) => {
    switch (shape) {
      case 'round':
        return <RoundFaceIcon className="w-5 h-5" />;
      case 'square':
        return <SquareFaceIcon className="w-5 h-5" />;
      case 'heart':
        return <HeartFaceIcon className="w-5 h-5" />;
      case 'oblong':
        return <OblongFaceIcon className="w-5 h-5" />;
      case 'diamond':
        return <DiamondFaceIcon className="w-5 h-5" />;
      default:
        return <OvalFaceIcon className="w-5 h-5" />;
    }
  };

  if (isEditing) {
    return (
      <div className="py-2">
        <StyleProfileWizard
          initialProfile={profile}
          onComplete={handleProfileSaved}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          id="style-toast"
          message={toastMessage}
          variant="success"
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
              Style Studio
            </h1>
            <OnDeviceBadge label="On Device" size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Personalized proportions & color harmony &bull; Stored only on this device
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center p-1 rounded-control bg-surface-alt border border-border overflow-x-auto">
          {segments.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setSegment(seg.id as typeof segment)}
              className={`px-3 py-1 rounded-control text-xs font-medium transition-all shrink-0 ${
                segment === seg.id
                  ? 'bg-surface text-text-primary font-semibold shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Segment 1: Profile */}
      {segment === 'profile' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="p-8 text-center text-text-secondary">Loading profile...</div>
          ) : profile ? (
            <>
              {/* Profile Overview Card */}
              <Card className="p-6 space-y-4 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-lg font-serif border border-primary/20">
                      {profile.completeness}%
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-bold text-text-primary">
                        Your Style Profile
                      </h2>
                      <p className="text-xs text-text-secondary max-w-sm">
                        Used only to choose outfits for you. Stored only on this device.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsConfirmDeleteOpen(true)}
                      className="text-danger hover:bg-danger/10"
                      aria-label="Delete style profile data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Skin & Undertone */}
                  <div className="p-3.5 rounded-card bg-surface-alt border border-border flex items-start gap-3">
                    <div className="p-2 rounded-full bg-surface text-primary shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                        Color Palette & Tone
                      </span>
                      <div className="flex items-center gap-2">
                        {profile.skin?.swatchHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-border inline-block"
                            style={{ backgroundColor: profile.skin.swatchHex }}
                          />
                        )}
                        <span className="text-xs font-semibold text-text-primary capitalize">
                          {profile.skin?.depth || 'Medium'} &bull; {profile.skin?.undertone || 'Warm'} undertone
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        Earthy neutrals, warm olive, and rich contrast pairings.
                      </p>
                    </div>
                  </div>

                  {/* Hair */}
                  <div className="p-3.5 rounded-card bg-surface-alt border border-border flex items-start gap-3">
                    <div className="p-2 rounded-full bg-surface text-primary shrink-0">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                        Hair Framing
                      </span>
                      <div className="flex items-center gap-2">
                        {profile.hair?.colorHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-border inline-block"
                            style={{ backgroundColor: profile.hair.colorHex }}
                          />
                        )}
                        <span className="text-xs font-semibold text-text-primary capitalize">
                          {profile.hair?.colorName || 'Dark Brown'} &bull; {profile.hair?.length || 'Medium'}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary capitalize">
                        {profile.hair?.texture || 'Wavy'} texture &bull; Near-collar contrast
                      </p>
                    </div>
                  </div>

                  {/* Face Shape */}
                  <div className="p-3.5 rounded-card bg-surface-alt border border-border flex items-start gap-3">
                    <div className="p-2 rounded-full bg-surface text-primary shrink-0">
                      {getFaceIcon(profile.faceShape)}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                        Face Silhouette
                      </span>
                      <span className="text-xs font-semibold text-text-primary capitalize block">
                        {profile.faceShape || 'Oval'}
                      </span>
                      <p className="text-[11px] text-text-secondary">
                        Open collar, crew, and soft lapel recommendations.
                      </p>
                    </div>
                  </div>

                  {/* Height & Proportions */}
                  <div className="p-3.5 rounded-card bg-surface-alt border border-border flex items-start gap-3">
                    <div className="p-2 rounded-full bg-surface text-primary shrink-0">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                        Proportion Balance
                      </span>
                      <span className="text-xs font-semibold text-text-primary block">
                        {profile.heightCm ? `${profile.heightCm} ${profile.heightUnit}` : 'Height not set'}
                      </span>
                      <p className="text-[11px] text-text-secondary">
                        {profile.proportions && profile.proportions.length > 0
                          ? profile.proportions.map((p) => p.replace('-', ' ')).join(', ')
                          : 'Works with your proportions'}
                      </p>
                    </div>
                  </div>

                  {/* Taste */}
                  <div className="p-3.5 rounded-card bg-surface-alt border border-border flex items-start gap-3">
                    <div className="p-2 rounded-full bg-surface text-primary shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                        Aesthetic Taste
                      </span>
                      <span className="text-xs font-semibold text-text-primary capitalize block">
                        {profile.taste?.tags?.join(' &bull; ') || 'Minimal &bull; Classic'}
                      </span>
                      <p className="text-[11px] text-text-secondary">
                        {profile.taste?.quizAnswers?.length || 0} quiz preferences recorded
                      </p>
                    </div>
                  </div>

                  {/* Comfort Rules */}
                  <div className="p-3.5 rounded-card bg-surface-alt border border-border flex items-start gap-3">
                    <div className="p-2 rounded-full bg-surface text-primary shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary block">
                        Comfort Rules
                      </span>
                      <span className="text-xs font-semibold text-text-primary block">
                        {profile.comfortRules?.length || 0} rules active
                      </span>
                      <p className="text-[11px] text-text-secondary truncate max-w-xs">
                        {profile.comfortRules?.map((r) => r.label).join(', ') || 'No restrictions'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collapsed Advanced Tailoring Section */}
                <div className="pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen(!advancedOpen)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-text-secondary hover:text-text-primary py-1"
                  >
                    <span>Advanced Tailoring Measurements</span>
                    {advancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {advancedOpen && (
                    <div className="p-3 mt-2 rounded-control bg-surface-alt border border-border text-xs text-text-secondary space-y-1">
                      <p className="font-medium text-text-primary">
                        Weight: {profile.advanced?.weightKg ? `${profile.advanced.weightKg} kg` : 'Not provided'}
                      </p>
                      <p className="text-[11px]">
                        Saved only as a local tailoring note. Never displayed in summaries.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center space-y-4 shadow-soft">
              <div className="w-12 h-12 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-xl font-bold text-text-primary">
                  No Style Profile Set Up Yet
                </h2>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  Your Today recommendations work immediately using general color science and proportion rules. Adding a profile provides sharper personalization.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              >
                Set Up Style Profile (3 mins)
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Segment 2: Outfits (Lookbook, Studio & Capsule) */}
      {segment === 'outfits' && (
        <LookbookGallery profile={profile} preferences={preferences} />
      )}

      {/* Segment 3: Log (Wear Calendar & History) */}
      {segment === 'log' && <WearCalendarLog />}

      {/* Segment 4: Insights (Cost-Per-Wear & Gap Analysis) */}
      {segment === 'insights' && <WardrobeInsights profile={profile} />}

      {/* Segment 5: Plan (Weekly & Packing Planners) */}
      {segment === 'plan' && <WardrobePlanner />}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteStyleData}
        title="Delete Style Profile Data?"
        description="Closet items, saved outfits, and wear history will remain completely intact. Today recommendations will return to general rules."
        confirmLabel="Delete Style Data"
        isDestructive={true}
      />
    </div>
  );
};
