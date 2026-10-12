import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export function createBrowserClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createSupabaseBrowserClient(supabaseUrl!, supabasePublishableKey!);
}

export const supabase = isSupabaseConfigured
  ? createSupabaseBrowserClient(supabaseUrl!, supabasePublishableKey!)
  : null;
