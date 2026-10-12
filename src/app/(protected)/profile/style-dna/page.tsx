'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Ruler, Palette, Sparkles, Shield, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { internalFetch } from '@/net/guardedFetch';
import { PersonalisationSettings, StyleDnaProfile } from '@/types/styleDna';

const emptyProfile: StyleDnaProfile = {
  measurement_unit: 'metric',
  body_proportions: { descriptors: [] },
  preferred_silhouettes: [],
  garment_fit_preferences: {},
  preferred_colour_combinations: [],
  favourite_colours: [],
  avoided_colours: [],
  preferred_styles: [],
  preferred_occasions: [],
};

const defaultSettings: PersonalisationSettings = {
  store_profile_information: true,
  enable_body_personalisation: false,
  enable_skin_tone_personalisation: false,
  allow_profile_data_in_ai_requests: false,
  enable_feedback_learning: true,
};

const proportionOptions = ['Longer torso', 'Shorter torso', 'Longer legs', 'Shorter legs', 'Balanced proportions', 'Broad shoulders', 'Narrow shoulders', 'Prefer not to specify'];
const silhouetteOptions = ['Close-fitting', 'Straight', 'Regular', 'Relaxed', 'Oversized', 'Tailored', 'Structured', 'Flowy', 'Layered'];
const styleOptions = ['Minimalist', 'Smart Casual', 'Classic', 'Streetwear', 'Business Casual', 'Contemporary', 'Relaxed', 'Sporty', 'Preppy'];
const colourOptions = ['Black', 'White', 'Navy', 'Grey', 'Beige', 'Cream', 'Brown', 'Olive', 'Blue', 'Burgundy', 'Green', 'Tan'];
const skinToneSwatches = ['Prefer not to specify', '#F4D7C4', '#E8B894', '#C98F68', '#A96D4E', '#7B4A35', '#4A2A1E'];

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function cmToDisplay(value: number | null | undefined, unit: 'metric' | 'imperial') {
  if (!value) return '';
  return unit === 'imperial' ? String(Math.round((value / 2.54) * 10) / 10) : String(value);
}

function weightToDisplay(value: number | null | undefined, unit: 'metric' | 'imperial') {
  if (!value) return '';
  return unit === 'imperial' ? String(Math.round((value * 2.20462) * 10) / 10) : String(value);
}

function lengthToCm(value: string, unit: 'metric' | 'imperial') {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return unit === 'imperial' ? Math.round(parsed * 2.54 * 10) / 10 : parsed;
}

function weightToKg(value: string, unit: 'metric' | 'imperial') {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return unit === 'imperial' ? Math.round((parsed / 2.20462) * 10) / 10 : parsed;
}

export default function StyleDnaPage() {
  const [profile, setProfile] = useState<StyleDnaProfile>(emptyProfile);
  const [settings, setSettings] = useState<PersonalisationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const unit = profile.measurement_unit;
  const unitLabel = unit === 'imperial' ? 'in / lb' : 'cm / kg';

  const completeness = useMemo(() => {
    const checks = [
      profile.preferred_styles.length > 0,
      profile.favourite_colours.length > 0,
      profile.preferred_silhouettes.length > 0,
      Boolean(profile.preferred_climate),
      Boolean(profile.height_cm || profile.weight_kg || profile.custom_fit_notes),
      Boolean(profile.skin_tone_selection || profile.undertone_selection),
      settings.enable_feedback_learning,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile, settings]);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const res = await internalFetch('/api/profile/style-dna');
        if (!res.ok) return;
        const payload = await res.json();
        if (!mounted) return;
        setProfile({ ...emptyProfile, ...(payload.profile ?? {}) });
        setSettings({ ...defaultSettings, ...(payload.settings ?? {}) });
      } catch (err) {
        console.warn('Style DNA load failed; demo profile remains active:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadProfile();
    return () => { mounted = false; };
  }, []);

  const updateProfile = (updates: Partial<StyleDnaProfile>) => setProfile((prev) => ({ ...prev, ...updates }));
  const updateSetting = (key: keyof PersonalisationSettings, value: boolean) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setErrorMsg(null);
    try {
      const res = await internalFetch('/api/profile/style-dna', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, settings }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? 'Failed to save Style DNA');
      setProfile({ ...emptyProfile, ...(payload.profile ?? profile) });
      setSettings({ ...defaultSettings, ...(payload.settings ?? settings) });
      setMessage('Style DNA saved.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save Style DNA');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBodyProfile = async () => {
    setSaving(true);
    setMessage(null);
    setErrorMsg(null);
    try {
      const res = await internalFetch('/api/profile/style-dna', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete optional body profile');
      setProfile(emptyProfile);
      setMessage('Optional Style DNA details deleted.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete optional body profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AppShell><div className="p-8 text-sm text-[#747570]">Loading Style DNA...</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-[#747570] hover:text-[#222321]">
          <ArrowLeft className="w-4 h-4" /> Back to Style Profile
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#222321] dark:text-[#F4F1EC]">My Style DNA</h1>
            <p className="text-sm text-[#747570] dark:text-[#A8A29A] mt-2 max-w-2xl">
              Optional preferences for proportions, colours and AI personalisation. Skip anything you do not want to share.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1E1D1B] border border-[#E6E4DE] dark:border-[#35322F] rounded-2xl p-4 min-w-48">
            <span className="text-xs font-semibold text-[#747570] uppercase tracking-wider">Voluntary completeness</span>
            <div className="mt-2 h-2 bg-[#F0EEE9] dark:bg-[#282623] rounded-full overflow-hidden">
              <div className="h-full bg-[#3B4D42]" style={{ width: `${completeness}%` }} />
            </div>
            <p className="font-serif text-2xl font-bold mt-2">{completeness}%</p>
          </div>
        </div>

        {message && <div className="p-3 rounded-xl bg-[#4B8067]/10 text-[#3B4D42] text-sm flex gap-2"><CheckCircle2 className="w-4 h-4" />{message}</div>}
        {errorMsg && <div className="p-3 rounded-xl bg-[#B84B4B]/10 text-[#B84B4B] text-sm">{errorMsg}</div>}

        <section className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2"><Ruler className="w-5 h-5 text-[#3B4D42]" /><h2 className="font-serif text-xl font-bold">My Measurements</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1 text-xs font-semibold text-[#747570]">Display name<input value={profile.display_name ?? ''} onChange={(e) => updateProfile({ display_name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm text-[#222321]" /></label>
            <label className="space-y-1 text-xs font-semibold text-[#747570]">Measurement unit<select value={unit} onChange={(e) => updateProfile({ measurement_unit: e.target.value as StyleDnaProfile['measurement_unit'] })} className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm"><option value="metric">Metric ({unitLabel})</option><option value="imperial">Imperial ({unitLabel})</option></select></label>
            <label className="space-y-1 text-xs font-semibold text-[#747570]">Height ({unit === 'imperial' ? 'in' : 'cm'})<input type="number" value={cmToDisplay(profile.height_cm, unit)} onChange={(e) => updateProfile({ height_cm: lengthToCm(e.target.value, unit) })} className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm" /></label>
            <label className="space-y-1 text-xs font-semibold text-[#747570]">Weight ({unit === 'imperial' ? 'lb' : 'kg'})<input type="number" value={weightToDisplay(profile.weight_kg, unit)} onChange={(e) => updateProfile({ weight_kg: weightToKg(e.target.value, unit) })} className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm" /></label>
            <label className="space-y-1 text-xs font-semibold text-[#747570]">Preferred shirt size<input value={profile.preferred_top_size ?? ''} onChange={(e) => updateProfile({ preferred_top_size: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm" /></label>
            <label className="space-y-1 text-xs font-semibold text-[#747570]">Preferred trousers size<input value={profile.preferred_bottom_size ?? ''} onChange={(e) => updateProfile({ preferred_bottom_size: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm" /></label>
            <label className="space-y-1 text-xs font-semibold text-[#747570]">Preferred shoe size<input value={profile.preferred_shoe_size ?? ''} onChange={(e) => updateProfile({ preferred_shoe_size: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm" /></label>
            <label className="space-y-1 text-xs font-semibold text-[#747570]">Preferred climate<input value={profile.preferred_climate ?? ''} onChange={(e) => updateProfile({ preferred_climate: e.target.value })} placeholder="Hot and humid" className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm" /></label>
          </div>
          <p className="text-xs text-[#747570]">Measurements are optional styling inputs. MyStyle AI does not calculate attractiveness scores or use body metrics as fashion-quality scores.</p>
        </section>

        <section className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] p-5 sm:p-6 space-y-5">
          <h2 className="font-serif text-xl font-bold">My Proportions & Silhouette</h2>
          <div><span className="text-xs font-semibold text-[#747570] uppercase tracking-wider">Self-described proportions</span><div className="flex flex-wrap gap-2 mt-2">{proportionOptions.map((option) => <button key={option} type="button" onClick={() => updateProfile({ body_proportions: { ...profile.body_proportions, descriptors: toggle(profile.body_proportions.descriptors, option) } })} className={`px-3 py-2 rounded-xl text-xs font-semibold ${profile.body_proportions.descriptors.includes(option) ? 'bg-[#3B4D42] text-white' : 'bg-[#F8F7F4] text-[#747570]'}`}>{option}</button>)}</div></div>
          <div><span className="text-xs font-semibold text-[#747570] uppercase tracking-wider">Preferred silhouettes</span><div className="flex flex-wrap gap-2 mt-2">{silhouetteOptions.map((option) => <button key={option} type="button" onClick={() => updateProfile({ preferred_silhouettes: toggle(profile.preferred_silhouettes, option) })} className={`px-3 py-2 rounded-xl text-xs font-semibold ${profile.preferred_silhouettes.includes(option) ? 'bg-[#3B4D42] text-white' : 'bg-[#F8F7F4] text-[#747570]'}`}>{option}</button>)}</div></div>
          <textarea value={profile.custom_fit_notes ?? ''} onChange={(e) => updateProfile({ custom_fit_notes: e.target.value })} placeholder="Optional fit notes, e.g. relaxed-fit trousers, regular shirts, tailored blazers." className="w-full min-h-24 px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm" />
        </section>

        <section className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2"><Palette className="w-5 h-5 text-[#3B4D42]" /><h2 className="font-serif text-xl font-bold">My Colour Profile</h2></div>
          <div><span className="text-xs font-semibold text-[#747570] uppercase tracking-wider">Optional skin-tone swatch</span><div className="flex flex-wrap gap-3 mt-2">{skinToneSwatches.map((swatch) => <button key={swatch} type="button" onClick={() => updateProfile({ skin_tone_selection: swatch })} className={`h-11 min-w-11 rounded-full border-2 text-[10px] px-2 ${profile.skin_tone_selection === swatch ? 'border-[#3B4D42]' : 'border-[#E6E4DE]'}`} style={swatch.startsWith('#') ? { backgroundColor: swatch } : undefined}>{swatch.startsWith('#') ? '' : 'Skip'}</button>)}</div></div>
          <label className="space-y-1 text-xs font-semibold text-[#747570]">Undertone<select value={profile.undertone_selection ?? ''} onChange={(e) => updateProfile({ undertone_selection: e.target.value as StyleDnaProfile['undertone_selection'] || null })} className="w-full px-3 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E6E4DE] text-sm"><option value="">Skip</option><option>Warm</option><option>Cool</option><option>Neutral</option><option>Olive</option><option>Unsure</option><option>Prefer not to specify</option></select></label>
          <div><span className="text-xs font-semibold text-[#747570] uppercase tracking-wider">Favourite colours</span><div className="flex flex-wrap gap-2 mt-2">{colourOptions.map((option) => <button key={option} type="button" onClick={() => updateProfile({ favourite_colours: toggle(profile.favourite_colours, option) })} className={`px-3 py-2 rounded-xl text-xs font-semibold ${profile.favourite_colours.includes(option) ? 'bg-[#3B4D42] text-white' : 'bg-[#F8F7F4] text-[#747570]'}`}>{option}</button>)}</div></div>
          <div><span className="text-xs font-semibold text-[#747570] uppercase tracking-wider">Colours you dislike</span><div className="flex flex-wrap gap-2 mt-2">{colourOptions.map((option) => <button key={option} type="button" onClick={() => updateProfile({ avoided_colours: toggle(profile.avoided_colours, option) })} className={`px-3 py-2 rounded-xl text-xs font-semibold ${profile.avoided_colours.includes(option) ? 'bg-[#B84B4B] text-white' : 'bg-[#F8F7F4] text-[#747570]'}`}>{option}</button>)}</div></div>
          <p className="text-xs text-[#747570]">Colour guidance prioritises your preferences. Skin-tone and undertone are optional secondary hints, never rules about what you must avoid.</p>
        </section>

        <section className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] p-5 sm:p-6 space-y-5">
          <h2 className="font-serif text-xl font-bold">My Fashion Preferences</h2>
          <div className="flex flex-wrap gap-2">{styleOptions.map((option) => <button key={option} type="button" onClick={() => updateProfile({ preferred_styles: toggle(profile.preferred_styles, option) })} className={`px-3 py-2 rounded-xl text-xs font-semibold ${profile.preferred_styles.includes(option) ? 'bg-[#3B4D42] text-white' : 'bg-[#F8F7F4] text-[#747570]'}`}>{option}</button>)}</div>
        </section>

        <section className="bg-white dark:bg-[#1E1D1B] rounded-2xl border border-[#E6E4DE] dark:border-[#35322F] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-[#3B4D42]" /><h2 className="font-serif text-xl font-bold">My AI Personalisation</h2></div>
          {[
            ['store_profile_information', 'Store profile information'],
            ['enable_body_personalisation', 'Use body/profile details for local styling'],
            ['enable_skin_tone_personalisation', 'Use optional colour profile for suggestions'],
            ['allow_profile_data_in_ai_requests', 'Allow selected Style DNA fields in Gemini prompts'],
            ['enable_feedback_learning', 'Learn from likes, dislikes, saves and wears'],
          ].map(([key, label]) => <label key={key} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#F8F7F4] text-sm font-semibold"><span>{label}</span><input type="checkbox" checked={Boolean(settings[key as keyof PersonalisationSettings])} onChange={(e) => updateSetting(key as keyof PersonalisationSettings, e.target.checked)} className="h-5 w-5" /></label>)}
          <p className="text-xs text-[#747570]">Gemini only receives selected Style DNA fields when you explicitly enable AI sharing. Raw private profile data is not logged for training.</p>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 justify-between pb-6">
          <button onClick={handleDeleteBodyProfile} disabled={saving} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#B84B4B]/30 text-[#B84B4B] text-sm font-semibold"><Trash2 className="w-4 h-4" />Delete My Body Profile</button>
          <div className="flex gap-3"><Link href="/profile" className="px-5 py-3 rounded-xl border border-[#E6E4DE] text-sm font-semibold">Cancel</Link><button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3B4D42] text-white text-sm font-semibold"><Sparkles className="w-4 h-4 text-[#C9B79C]" />{saving ? 'Saving...' : 'Save Changes'}</button></div>
        </div>
      </div>
    </AppShell>
  );
}
