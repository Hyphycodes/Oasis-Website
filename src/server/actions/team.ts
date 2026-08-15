'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { isLocalDb } from '@/lib/db';
import { getSessionClient } from '@/lib/supabase/server';
import { signInLocally, signOutLocally, type Role } from '../auth';
import { run, saved, type ActionState } from './shared';

/**
 * Sign-in and staff accounts.
 *
 * Roles are Owner-only, deliberately. In the 0001 policy a Manager could change
 * roles, which meant a Manager could promote themselves to Owner — the classic
 * privilege-escalation shape. Migration 0003 restricts it in the database and
 * this file matches.
 */

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { ok: false, message: 'Enter your email and password.' };
  }

  const supabase = await getSessionClient();
  if (!supabase) {
    return { ok: false, message: 'The content system is not connected yet.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Deliberately vague: do not reveal whether the email exists.
    return { ok: false, message: 'That email and password did not match. Please try again.' };
  }

  redirect('/admin');
}

/** Development sign-in. Refuses outright anywhere the local database is not live. */
export async function signInAs(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isLocalDb()) {
    return { ok: false, message: 'Sign in with your email and password.' };
  }
  const role = String(formData.get('role') ?? '') as Role;
  if (!['owner', 'admin', 'editor'].includes(role)) {
    return { ok: false, message: 'Pick an account.' };
  }
  await signInLocally(role);
  redirect('/admin');
}

export async function signOut(): Promise<void> {
  const supabase = await getSessionClient();
  await supabase?.auth.signOut();
  await signOutLocally();
  redirect('/admin/login');
}

const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['owner', 'admin', 'editor']),
  sections: z.string().max(200).optional(),
  active: z.coerce.boolean(),
});

export async function saveTeamMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('team.manage', async ({ db, staff }) => {
    const parsed = roleSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not save that account.' };
    const value = parsed.data;

    // Locking yourself out of your own admin is not a change anyone means to make.
    if (value.userId === staff.id && (value.role !== 'owner' || !value.active)) {
      return {
        ok: false,
        message: 'You cannot remove your own owner access. Ask another owner to do it.',
      };
    }

    await db.update('profiles', value.userId, {
      role: value.role,
      active: value.active,
      sections: value.sections ? value.sections.split(',').filter(Boolean) : [],
    });

    return saved('Account updated.');
  });
}
