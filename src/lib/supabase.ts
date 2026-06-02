import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/* ─────────────────────────────────────────────────────────
   Singleton pattern — prevents duplicate client instances
   that cause Navigator LockManager contention.

   In Next.js App Router, modules are re-evaluated on HMR
   and on server/client bundle splits. Without a singleton
   guard, multiple createClient() calls compete for the same
   storageKey lock, causing a 10s timeout and auth hang.
───────────────────────────────────────────────────────── */
const GLOBAL_KEY = '__cluvion_supabase_client__';

declare global {
  // eslint-disable-next-line no-var
  var __cluvion_supabase_client__: SupabaseClient | undefined;
}

function getSupabaseClient(): SupabaseClient {
  // On the server (SSR), always create a fresh client (no window/lock APIs)
  if (typeof window === 'undefined') {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  // On the client, return the cached singleton or create it once
  if (!globalThis[GLOBAL_KEY]) {
    globalThis[GLOBAL_KEY] = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'cluvion-auth-token',
        storage: window.localStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Override the navigator lock with a fast-failing fallback.
        // This prevents the 10s hang when a previous tab's lock is orphaned.
        lock: async <R>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
          // In development, Next.js hot-reloading frequently orphans locks.
          // Bypass the lock manager entirely to prevent 8-second query hangs.
          if (process.env.NODE_ENV === 'development') {
            return fn();
          }

          // Use the native lock manager if available
          if (typeof navigator !== 'undefined' && 'locks' in navigator) {
            try {
              return await Promise.race([
                navigator.locks.request(name, { mode: 'exclusive' }, fn as () => Promise<R>),
                new Promise<R>((_, reject) =>
                  setTimeout(() => reject(new Error(`Lock "${name}" timed out`)), 2000)
                ),
              ]);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              // If it timed out, run without lock (degraded mode, single-tab safe)
              if (msg.includes('timed out')) {
                console.warn('[Supabase] Lock timed out — running in degraded mode');
                return fn();
              }
              throw err;
            }
          }
          // Fallback for browsers without LockManager (Firefox private mode, etc.)
          return fn();
        },
      },
    });
  }

  return globalThis[GLOBAL_KEY]!;
}

export const supabase = getSupabaseClient();
