import { NextRequest, NextResponse } from 'next/server';
import { generateOutfitRecommendations } from '@/lib/ai/stylistService';
import { WardrobeItem } from '@/types/wardrobe';
import { StylistRequest } from '@/types/stylist';
import { INITIAL_DEMO_WARDROBE } from '@/lib/demoData';
import { getAllCapabilities, getUsageStats } from '@/lib/ai/providers/router';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServerClient();
    const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    let wardrobe: WardrobeItem[] = body.wardrobe || INITIAL_DEMO_WARDROBE;
    if (supabase && authData.user && !body.wardrobe) {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('status', 'Active');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      wardrobe = (data ?? []) as WardrobeItem[];
    }

    const request: StylistRequest = body.request || {};
    const userId: string = authData.user?.id ?? 'anonymous';
    // enhance_with_ai=true triggers optional AI explanation enrichment
    const enhanceWithAi: boolean = body.enhance_with_ai === true;

    if (!wardrobe || wardrobe.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 wardrobe items are required to generate an outfit' },
        { status: 400 }
      );
    }

    const outfits = await generateOutfitRecommendations(wardrobe, request, {
      enhanceWithAi,
      userId,
      styleProfile: body.style_profile,
    });

    const usage = getUsageStats(userId);

    return NextResponse.json({
      data: outfits,
      count: outfits.length,
      ai_enhanced: enhanceWithAi && outfits.some((o) => o.ai_enhanced),
      usage: {
        requests_used_today: usage.used,
        requests_limit_per_day: usage.limit,
        last_error: usage.lastError,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stylist generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** GET endpoint — returns current provider capabilities and usage stats */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id') ?? 'anonymous';

  const capabilities = getAllCapabilities();
  const usage = getUsageStats(userId);

  return NextResponse.json({
    providers: capabilities,
    usage: {
      requests_used_today: usage.used,
      requests_limit_per_day: usage.limit,
      last_error: usage.lastError,
    },
    config: {
      vision_provider: process.env.AI_VISION_PROVIDER ?? 'gemini',
      text_provider: process.env.AI_TEXT_PROVIDER ?? 'gemini',
      rule_based_fallback_enabled: process.env.AI_ENABLE_RULE_BASED_FALLBACK !== 'false',
      allow_paid_models: process.env.AI_ALLOW_PAID_MODELS === 'true',
    },
  });
}
