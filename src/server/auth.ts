import 'server-only';

import { cookies } from 'next/headers';
import { isLocalDb } from '@/lib/db';
import { getSessionClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { can, type Actor, type Capability, type Role, DENIED_MESSAGE } from './permissions';

/**
 * Who is signed in, and what they are allowed to do.
 *
 * Two identity sources, and only one of them can ever run in production:
 *
 *   Supabase Auth — the real one. `getUser()` re-validates with the auth server
 *                   rather than trusting a cookie the client could have forged.
 *   Local staff   — a development identity, available only when Supabase is not
 *                   configured AND this is not a production build. It exists so
 *                   the admin can actually be operated and tested on a clean
 *                   checkout; see docs/ADR-001-ADMIN-BACKEND.md.
 */

export type { Role, Capability };

export interface Staff {
  id: string;
  email: string;
  name: string;
  role: Role;
  sections: string[];
  active: boolean;
  /** Which identity source answered. The admin says so out loud. */
  source: 'supabase' | 'local';
}

const LOCAL_COOKIE = 'oasis_local_staff';

/** The three development identities, one per role, so permissions are testable. */
export const LOCAL_STAFF: Record<Role, Staff> = {
  owner: {
    id: 'local-owner',
    email: 'owner@oasis.local',
    name: 'Sam (Owner)',
    role: 'owner',
    sections: [],
    active: true,
    source: 'local',
  },
  admin: {
    id: 'local-manager',
    email: 'manager@oasis.local',
    name: 'Alex (Manager)',
    role: 'admin',
    sections: [],
    active: true,
    source: 'local',
  },
  editor: {
    id: 'local-contributor',
    email: 'contributor@oasis.local',
    name: 'Robin (Contributor)',
    role: 'editor',
    sections: [],
    active: true,
    source: 'local',
  },
};

export async function getStaff(): Promise<Staff | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSessionClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('role, name, sections, active')
      .eq('user_id', user.id)
      .maybeSingle();

    // No profile row is no access — never a default role.
    if (!data) return null;
    if (data.active === false) return null;

    return {
      id: user.id,
      email: user.email ?? '',
      name: (data.name as string) || (user.email ?? ''),
      role: data.role as Role,
      sections: (data.sections as string[]) ?? [],
      active: true,
      source: 'supabase',
    };
  }

  if (!isLocalDb()) return null;

  const store = await cookies();
  const role = store.get(LOCAL_COOKIE)?.value as Role | undefined;
  return role && role in LOCAL_STAFF ? LOCAL_STAFF[role] : null;
}

/** Development sign-in. Refuses to do anything unless the local database is live. */
export async function signInLocally(role: Role): Promise<void> {
  if (!isLocalDb()) throw new Error('Local sign-in is not available here.');
  const store = await cookies();
  store.set(LOCAL_COOKIE, role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function signOutLocally(): Promise<void> {
  const store = await cookies();
  store.delete(LOCAL_COOKIE);
}

export function actorOf(staff: Staff): Actor {
  return { role: staff.role, sections: staff.sections, active: staff.active };
}

export function staffCan(staff: Staff, capability: Capability): boolean {
  return can(actorOf(staff), capability);
}

/**
 * The server-side guard for every mutation.
 *
 * Throws rather than returning a flag: a forgotten `if` cannot then fall through
 * to a write. It is the first of three independent checks — this one, Row Level
 * Security, and the publish trigger in migration 0003.
 */
export async function requireCapability(capability: Capability): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) throw new Error('Please sign in again.');
  if (!staffCan(staff, capability)) throw new Error(DENIED_MESSAGE[capability]);
  return staff;
}
