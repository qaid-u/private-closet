import { NextRequest, NextResponse } from 'next/server';
import { analyzeGarmentImage } from '@/lib/ai/visionService';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { image, hint_name } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data or URL is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const userId = authData.user?.id ?? 'anonymous';

    const result = await analyzeGarmentImage(image, hint_name, userId);

    if (supabase && authData.user) {
      await supabase.from('ai_item_analyses').insert({
        user_id: authData.user.id,
        provider: result.providerUsed,
        model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
        analysis_result: result.data,
        confidence_metadata: {
          confidence: result.data.confidence,
          is_ai_generated: result.isAiGenerated,
          fallback_reason: result.fallbackReason ?? null,
        },
        status: 'completed',
      });
    }

    return NextResponse.json({
      data: result.data,
      provider_used: result.providerUsed,
      is_ai_generated: result.isAiGenerated,
      from_cache: result.fromCache,
      fallback_reason: result.fallbackReason,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
