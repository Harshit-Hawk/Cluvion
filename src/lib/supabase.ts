import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const GLOBAL_KEY = '__cluvion_supabase_client__';

declare global {
  // eslint-disable-next-line no-var
  var __cluvion_supabase_client__: SupabaseClient | undefined;
}

function getSupabaseClient(): SupabaseClient {
  // On the server during build/prerendering, use a placeholder to avoid errors
  if (typeof window === 'undefined') {
    if (!supabaseUrl || !supabaseAnonKey) {
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  // On the client, return the cached singleton or create it once
  if (!globalThis[GLOBAL_KEY]) {
    // Guard against missing env vars (e.g. during local dev or misconfigured deploys)
    if (!supabaseUrl || !supabaseAnonKey) {
      globalThis[GLOBAL_KEY] = createClient('https://placeholder.supabase.co', 'placeholder-key') as unknown as SupabaseClient;
    } else {
      globalThis[GLOBAL_KEY] = createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
  }

  return globalThis[GLOBAL_KEY]!;
}

export const supabase = getSupabaseClient();
