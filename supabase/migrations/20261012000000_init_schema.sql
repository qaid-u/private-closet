-- Migration: 20261012000000_init_schema.sql
-- Description: Complete schema for MyStyle AI including profiles, style_preferences,
-- wardrobe_items, wardrobe_images, ai_item_analyses, outfits, outfit_items,
-- outfit_collections, outfit_feedback, wear_logs, and outfit_plans.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_path TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferred_locale TEXT DEFAULT 'en',
  preferred_currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Style Preferences Table
CREATE TABLE IF NOT EXISTS public.style_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  style_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  favourite_colours TEXT[] DEFAULT ARRAY[]::TEXT[],
  avoided_colours TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_fits TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_occasions TEXT[] DEFAULT ARRAY[]::TEXT[],
  climate_preference TEXT DEFAULT 'Warm',
  comfort_preference TEXT DEFAULT 'Balanced',
  modesty_preferences JSONB DEFAULT '{}'::JSONB,
  other_restrictions JSONB DEFAULT '{}'::JSONB,
  free_text_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Wardrobe Items Table
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Tops', 'Bottoms', 'Outerwear', 'Footwear', 'One-Piece', 'Accessories')),
  subcategory TEXT,
  primary_color TEXT NOT NULL,
  secondary_colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  pattern TEXT DEFAULT 'Solid',
  brand TEXT,
  size TEXT,
  fit TEXT,
  material TEXT,
  formality TEXT DEFAULT 'Smart Casual',
  style_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  occasion_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  season_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  price NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  purchased_at DATE,
  notes TEXT,
  is_favourite BOOLEAN DEFAULT FALSE,
  availability_status TEXT DEFAULT 'Available' CHECK (availability_status IN ('Available', 'In Laundry', 'Being Repaired', 'In Storage', 'Unavailable', 'Archived')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived', 'Deleted')),
  wear_count INTEGER DEFAULT 0,
  last_worn_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON public.wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_status ON public.wardrobe_items(status);

-- 4. Wardrobe Images Table
CREATE TABLE IF NOT EXISTS public.wardrobe_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  is_primary BOOLEAN DEFAULT TRUE,
  mime_type TEXT,
  file_size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wardrobe_images_item_id ON public.wardrobe_images(item_id);

-- 5. AI Item Analyses Table
CREATE TABLE IF NOT EXISTS public.ai_item_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE SET NULL,
  provider TEXT DEFAULT 'openai',
  model TEXT,
  analysis_result JSONB NOT NULL,
  confidence_metadata JSONB,
  status TEXT DEFAULT 'completed',
  error_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Outfits Table
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  occasion TEXT DEFAULT 'Everyday',
  style_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_score NUMERIC(5, 2) DEFAULT 85.00,
  score_breakdown JSONB DEFAULT '{}'::JSONB,
  styling_notes TEXT,
  weather_notes TEXT,
  source TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'manual', 'starter')),
  is_favourite BOOLEAN DEFAULT FALSE,
  preview_image_path TEXT,
  wear_count INTEGER DEFAULT 0,
  last_worn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON public.outfits(user_id);

-- 7. Outfit Items Junction Table
CREATE TABLE IF NOT EXISTS public.outfit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  slot TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(outfit_id, wardrobe_item_id)
);

CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON public.outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_item_id ON public.outfit_items(wardrobe_item_id);

-- 8. Outfit Collections Table
CREATE TABLE IF NOT EXISTS public.outfit_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 9. Outfit Collection Memberships
CREATE TABLE IF NOT EXISTS public.outfit_collection_memberships (
  collection_id UUID NOT NULL REFERENCES public.outfit_collections(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, outfit_id)
);

-- 10. Outfit Feedback Table
CREATE TABLE IF NOT EXISTS public.outfit_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('like', 'dislike')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Wear Logs Table
CREATE TABLE IF NOT EXISTS public.wear_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  worn_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Wear Log Items Table
CREATE TABLE IF NOT EXISTS public.wear_log_items (
  wear_log_id UUID NOT NULL REFERENCES public.wear_logs(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES public.wardrobe_items(id) ON DELETE CASCADE,
  PRIMARY KEY (wear_log_id, wardrobe_item_id)
);

-- 13. Outfit Plans Table
CREATE TABLE IF NOT EXISTS public.outfit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  occasion TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outfit_plans_user_date ON public.outfit_plans(user_id, planned_date);

-- 14. AI Generation Jobs Table
CREATE TABLE IF NOT EXISTS public.ai_generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT DEFAULT 'openai',
  model TEXT,
  request_metadata JSONB,
  result_metadata JSONB,
  error_code TEXT,
  token_usage JSONB,
  estimated_cost NUMERIC(10, 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'profiles', 'style_preferences', 'wardrobe_items', 'outfits',
    'outfit_collections', 'outfit_plans'
  ])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I', tbl, tbl);
    EXECUTE format('CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', tbl, tbl);
  END LOOP;
END $$;

-- Create a profile row after email/password registration.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_item_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_collection_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wear_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wear_log_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_jobs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS user_isolation_%I ON public.%I', tbl, tbl);
  END LOOP;
END $$;

CREATE POLICY user_isolation_profiles ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'style_preferences', 'wardrobe_items', 'wardrobe_images', 'ai_item_analyses',
    'outfits', 'outfit_collections', 'outfit_feedback', 'wear_logs',
    'outfit_plans', 'ai_generation_jobs'
  ])
  LOOP
    EXECUTE format('
      CREATE POLICY user_isolation_%I ON public.%I
        FOR ALL USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    ', tbl, tbl);
  END LOOP;
END $$;

CREATE POLICY user_isolation_outfit_items ON public.outfit_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.wardrobe_items wi WHERE wi.id = wardrobe_item_id AND wi.user_id = auth.uid())
  );

CREATE POLICY user_isolation_outfit_collection_memberships ON public.outfit_collection_memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.outfit_collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.outfit_collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.outfits o WHERE o.id = outfit_id AND o.user_id = auth.uid())
  );

CREATE POLICY user_isolation_wear_log_items ON public.wear_log_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.wear_logs w WHERE w.id = wear_log_id AND w.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.wear_logs w WHERE w.id = wear_log_id AND w.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.wardrobe_items wi WHERE wi.id = wardrobe_item_id AND wi.user_id = auth.uid())
  );

-- Private storage bucket for wardrobe images.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wardrobe-images',
  'wardrobe-images',
  FALSE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS wardrobe_images_select_own ON storage.objects;
DROP POLICY IF EXISTS wardrobe_images_insert_own ON storage.objects;
DROP POLICY IF EXISTS wardrobe_images_update_own ON storage.objects;
DROP POLICY IF EXISTS wardrobe_images_delete_own ON storage.objects;

CREATE POLICY wardrobe_images_select_own ON storage.objects
  FOR SELECT USING (
    bucket_id = 'wardrobe-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY wardrobe_images_insert_own ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wardrobe-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY wardrobe_images_update_own ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'wardrobe-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'wardrobe-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY wardrobe_images_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'wardrobe-images'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
