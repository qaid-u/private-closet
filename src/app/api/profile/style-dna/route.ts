import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { PersonalisationSettings, StyleDnaProfile } from '@/types/styleDna';

const DEFAULT_SETTINGS: PersonalisationSettings = {
  store_profile_information: true,
  enable_body_personalisation: false,
  enable_skin_tone_personalisation: false,
  allow_profile_data_in_ai_requests: false,
  enable_feedback_learning: true,
};

function toNumberOrNull(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeProfile(input: Partial<StyleDnaProfile>) {
  return {
    display_name: input.display_name ?? null,
    age_range: input.age_range ?? null,
    preferred_presentation: input.preferred_presentation ?? null,
    measurement_unit: input.measurement_unit ?? 'metric',
    preferred_climate: input.preferred_climate ?? null,
    height_cm: toNumberOrNull(input.height_cm),
    weight_kg: toNumberOrNull(input.weight_kg),
    shoulder_cm: toNumberOrNull(input.shoulder_cm),
    chest_cm: toNumberOrNull(input.chest_cm),
    waist_cm: toNumberOrNull(input.waist_cm),
    hips_cm: toNumberOrNull(input.hips_cm),
    inseam_cm: toNumberOrNull(input.inseam_cm),
    preferred_top_size: input.preferred_top_size ?? null,
    preferred_bottom_size: input.preferred_bottom_size ?? null,
    preferred_shoe_size: input.preferred_shoe_size ?? null,
    body_proportions: input.body_proportions ?? { descriptors: [] },
    preferred_silhouettes: input.preferred_silhouettes ?? [],
    garment_fit_preferences: input.garment_fit_preferences ?? {},
    skin_tone_selection: input.skin_tone_selection ?? null,
    skin_tone_custom_description: input.skin_tone_custom_description ?? null,
    undertone_selection: input.undertone_selection ?? null,
    preferred_contrast: input.preferred_contrast ?? null,
    colourfulness_preference: input.colourfulness_preference ?? null,
    preferred_colour_combinations: input.preferred_colour_combinations ?? [],
    favourite_colours: input.favourite_colours ?? [],
    avoided_colours: input.avoided_colours ?? [],
    preferred_styles: input.preferred_styles ?? [],
    preferred_occasions: input.preferred_occasions ?? [],
    comfort_preference: input.comfort_preference ?? null,
    custom_fit_notes: input.custom_fit_notes ?? null,
  };
}

function validateProfile(profile: ReturnType<typeof normalizeProfile>): string | null {
  const bounds: Array<[string, number | null, number, number]> = [
    ['Height', profile.height_cm, 90, 250],
    ['Weight', profile.weight_kg, 25, 350],
    ['Shoulder width', profile.shoulder_cm, 20, 90],
    ['Chest', profile.chest_cm, 40, 200],
    ['Waist', profile.waist_cm, 35, 220],
    ['Hips', profile.hips_cm, 40, 220],
    ['Inseam', profile.inseam_cm, 35, 130],
  ];

  for (const [label, value, min, max] of bounds) {
    if (value !== null && (value < min || value > max)) {
      return `${label} must be between ${min} and ${max} cm.`;
    }
  }

  return null;
}

export async function GET() {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ profile: null, settings: DEFAULT_SETTINGS, source: 'demo' });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const [{ data: profile, error: profileError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from('body_style_profiles').select('*').eq('user_id', authData.user.id).maybeSingle(),
    supabase.from('personalisation_settings').select('*').eq('user_id', authData.user.id).maybeSingle(),
  ]);

  if (profileError || settingsError) {
    return NextResponse.json({ error: profileError?.message ?? settingsError?.message }, { status: 400 });
  }

  return NextResponse.json({ profile, settings: settings ?? DEFAULT_SETTINGS });
}

export async function PUT(req: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    const body = await req.json();
    return NextResponse.json({ profile: body.profile ?? null, settings: body.settings ?? DEFAULT_SETTINGS, source: 'demo' });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const profile = normalizeProfile(body.profile ?? {});
  const validationError = validateProfile(profile);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const settings = {
    ...DEFAULT_SETTINGS,
    ...(body.settings ?? {}),
    user_id: authData.user.id,
  };

  const { data: savedProfile, error: profileError } = await supabase
    .from('body_style_profiles')
    .upsert({ ...profile, user_id: authData.user.id }, { onConflict: 'user_id' })
    .select()
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { data: savedSettings, error: settingsError } = await supabase
    .from('personalisation_settings')
    .upsert(settings, { onConflict: 'user_id' })
    .select()
    .single();

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 400 });
  }

  return NextResponse.json({ profile: savedProfile, settings: savedSettings });
}

export async function DELETE() {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, source: 'demo' });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { error } = await supabase
    .from('body_style_profiles')
    .delete()
    .eq('user_id', authData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
