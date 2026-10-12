-- MyStyle AI Style DNA, privacy settings, feedback learning and zero-inventory support.

CREATE TABLE IF NOT EXISTS public.body_style_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  age_range TEXT CHECK (age_range IS NULL OR age_range IN ('Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Prefer not to specify')),
  preferred_presentation TEXT,
  measurement_unit TEXT DEFAULT 'metric' CHECK (measurement_unit IN ('metric', 'imperial')),
  preferred_climate TEXT,
  height_cm NUMERIC CHECK (height_cm IS NULL OR (height_cm >= 90 AND height_cm <= 250)),
  weight_kg NUMERIC CHECK (weight_kg IS NULL OR (weight_kg >= 25 AND weight_kg <= 350)),
  shoulder_cm NUMERIC CHECK (shoulder_cm IS NULL OR (shoulder_cm >= 20 AND shoulder_cm <= 90)),
  chest_cm NUMERIC CHECK (chest_cm IS NULL OR (chest_cm >= 40 AND chest_cm <= 200)),
  waist_cm NUMERIC CHECK (waist_cm IS NULL OR (waist_cm >= 35 AND waist_cm <= 220)),
  hips_cm NUMERIC CHECK (hips_cm IS NULL OR (hips_cm >= 40 AND hips_cm <= 220)),
  inseam_cm NUMERIC CHECK (inseam_cm IS NULL OR (inseam_cm >= 35 AND inseam_cm <= 130)),
  preferred_top_size TEXT,
  preferred_bottom_size TEXT,
  preferred_shoe_size TEXT,
  body_proportions JSONB DEFAULT '{}'::JSONB,
  preferred_silhouettes TEXT[] DEFAULT ARRAY[]::TEXT[],
  garment_fit_preferences JSONB DEFAULT '{}'::JSONB,
  skin_tone_selection TEXT,
  skin_tone_custom_description TEXT,
  undertone_selection TEXT CHECK (undertone_selection IS NULL OR undertone_selection IN ('Warm', 'Cool', 'Neutral', 'Olive', 'Unsure', 'Prefer not to specify')),
  preferred_contrast TEXT CHECK (preferred_contrast IS NULL OR preferred_contrast IN ('Low', 'Medium', 'High', 'No preference')),
  colourfulness_preference TEXT CHECK (colourfulness_preference IS NULL OR colourfulness_preference IN ('Mostly neutral', 'Balanced', 'Colourful', 'No preference')),
  preferred_colour_combinations TEXT[] DEFAULT ARRAY[]::TEXT[],
  favourite_colours TEXT[] DEFAULT ARRAY[]::TEXT[],
  avoided_colours TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_styles TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_occasions TEXT[] DEFAULT ARRAY[]::TEXT[],
  comfort_preference TEXT,
  custom_fit_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.personalisation_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_profile_information BOOLEAN NOT NULL DEFAULT TRUE,
  enable_body_personalisation BOOLEAN NOT NULL DEFAULT FALSE,
  enable_skin_tone_personalisation BOOLEAN NOT NULL DEFAULT FALSE,
  allow_profile_data_in_ai_requests BOOLEAN NOT NULL DEFAULT FALSE,
  enable_feedback_learning BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.style_feedback_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  local_outfit_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('like', 'dislike', 'save', 'wear_today', 'not_my_style', 'too_casual', 'too_formal', 'change_colours', 'change_fit', 'show_similar')),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learned_style_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  signal_value TEXT NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0.1 CHECK (confidence >= 0 AND confidence <= 1),
  event_count INTEGER NOT NULL DEFAULT 1 CHECK (event_count >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, signal_type, signal_value)
);

CREATE INDEX IF NOT EXISTS idx_style_feedback_events_user_created ON public.style_feedback_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learned_style_preferences_user ON public.learned_style_preferences(user_id);

DROP TRIGGER IF EXISTS set_body_style_profiles_updated_at ON public.body_style_profiles;
CREATE TRIGGER set_body_style_profiles_updated_at
  BEFORE UPDATE ON public.body_style_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_personalisation_settings_updated_at ON public.personalisation_settings;
CREATE TRIGGER set_personalisation_settings_updated_at
  BEFORE UPDATE ON public.personalisation_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_learned_style_preferences_updated_at ON public.learned_style_preferences;
CREATE TRIGGER set_learned_style_preferences_updated_at
  BEFORE UPDATE ON public.learned_style_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.body_style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalisation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_feedback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learned_style_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_isolation_body_style_profiles ON public.body_style_profiles;
DROP POLICY IF EXISTS user_isolation_personalisation_settings ON public.personalisation_settings;
DROP POLICY IF EXISTS user_isolation_style_feedback_events ON public.style_feedback_events;
DROP POLICY IF EXISTS user_isolation_learned_style_preferences ON public.learned_style_preferences;

CREATE POLICY user_isolation_body_style_profiles ON public.body_style_profiles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_isolation_personalisation_settings ON public.personalisation_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_isolation_style_feedback_events ON public.style_feedback_events
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_isolation_learned_style_preferences ON public.learned_style_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user_personalisation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.personalisation_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_personalisation ON auth.users;
CREATE TRIGGER on_auth_user_created_personalisation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_personalisation();
