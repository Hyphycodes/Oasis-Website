import 'server-only';

import { buildRecords } from '@/server/migration/records';
import { getServiceClient, getSessionClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { LocalDb } from './local';
import { SupabaseDb } from './supabase';
import type { Db } from './types';

/**
 * Which database answers, and under whose authority.
 *
 * Two axes, kept separate on purpose:
 *
 *   adapter    Supabase when it is configured; otherwise the local development
 *              file, which is REFUSED in production.
 *   authority  a session-scoped client for anything a signed-in staff member
 *              does, so Row Level Security and the publish trigger apply; a
 *              service client only for reading published content during SSR.
 *
 * Getting the second one wrong is how an admin write ends up bypassing RLS, so
 * there are two named functions rather than one with a boolean.
 */

let local: LocalDb | null = null;

function localDb(): LocalDb {
  local ??= new LocalDb(undefined, () => buildRecords().tables);
  return local;
}

/**
 * True when the site is running on the local development database.
 *
 * The admin surfaces this, because "my changes did not stick" is a much worse
 * discovery than a banner saying where the data lives.
 */
export function isLocalDb(): boolean {
  return !isSupabaseConfigured() && process.env.NODE_ENV !== 'production';
}

/** Read-side database for published public content. Never used for admin writes. */
export function getReadDb(): Db | null {
  if (isSupabaseConfigured()) {
    const client = getServiceClient();
    return client ? new SupabaseDb(client) : null;
  }
  // In production with no Supabase, there is no database at all: `resolve.ts`
  // serves the typed static content, which is the documented fallback.
  return isLocalDb() ? localDb() : null;
}

/**
 * Write-side database, carrying the signed-in staff member's session.
 *
 * Returns null when there is nowhere safe to write — production without Supabase
 * — so callers fail closed rather than silently writing somewhere unexpected.
 */
export async function getWriteDb(): Promise<Db | null> {
  if (isSupabaseConfigured()) {
    const client = await getSessionClient();
    return client ? new SupabaseDb(client) : null;
  }
  return isLocalDb() ? localDb() : null;
}

/** Test seam: swap in a throwaway local database. */
export function __setLocalDbForTests(db: LocalDb | null): void {
  local = db;
}
