import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server-only Supabase clients.
 *
 * `import 'server-only'` makes it a build error for any client component to pull
 * this module in — which is what actually keeps the service-role key out of the
 * browser bundle. Hiding it behind a naming convention would not.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && ANON);
}

/**
 * Elevated client for reading published public content during SSR.
 * Falls back to the anon key when no service key is present — public content is
 * readable by `anon` under RLS anyway, so this still works on a minimal setup.
 */
export function getServiceClient(): SupabaseClient | null {
  if (!URL) return null;
  const key = SERVICE ?? ANON;
  if (!key) return null;

  return createClient(URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-oasis-source': 'ssr' } },
  });
}

/** Request-scoped client that carries the signed-in user's session. */
export async function getSessionClient() {
  if (!URL || !ANON) return null;
  const cookieStore = await cookies();

  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (entries: { name: string; value: string; options?: Record<string, unknown> }[]) => {
        try {
          for (const { name, value, options } of entries) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render; middleware refreshes instead.
        }
      },
    },
  });
}
