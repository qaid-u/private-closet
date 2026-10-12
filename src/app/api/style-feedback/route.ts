import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { FeedbackEventType } from '@/types/styleDna';

const FEEDBACK_EVENTS = new Set<FeedbackEventType>([
  'like',
  'dislike',
  'save',
  'wear_today',
  'not_my_style',
  'too_casual',
  'too_formal',
  'change_colours',
  'change_fit',
  'show_similar',
]);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const eventType = body.event_type as FeedbackEventType;

  if (!FEEDBACK_EVENTS.has(eventType)) {
    return NextResponse.json({ error: 'Invalid feedback event type' }, { status: 400 });
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, source: 'demo' });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: settings } = await supabase
    .from('personalisation_settings')
    .select('enable_feedback_learning')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  const { error } = await supabase.from('style_feedback_events').insert({
    user_id: authData.user.id,
    local_outfit_id: typeof body.outfit_id === 'string' ? body.outfit_id : null,
    event_type: eventType,
    reason: typeof body.reason === 'string' ? body.reason : null,
    metadata: body.metadata ?? {},
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (settings?.enable_feedback_learning !== false && body.signal_type && body.signal_value) {
    const signalType = String(body.signal_type);
    const signalValue = String(body.signal_value);
    const delta = eventType === 'dislike' || eventType === 'not_my_style' ? -0.08 : 0.08;

    const { data: existing } = await supabase
      .from('learned_style_preferences')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('signal_type', signalType)
      .eq('signal_value', signalValue)
      .maybeSingle();

    await supabase.from('learned_style_preferences').upsert({
      user_id: authData.user.id,
      signal_type: signalType,
      signal_value: signalValue,
      confidence: Math.max(0, Math.min(1, Number(existing?.confidence ?? 0.1) + delta)),
      event_count: Number(existing?.event_count ?? 0) + 1,
    }, { onConflict: 'user_id,signal_type,signal_value' });
  }

  return NextResponse.json({ ok: true });
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
    .from('learned_style_preferences')
    .delete()
    .eq('user_id', authData.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
