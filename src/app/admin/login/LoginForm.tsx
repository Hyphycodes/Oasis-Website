'use client';

import { ActionForm, SubmitButton } from '@/components/admin/ActionForm';
import { Label, TextInput } from '@/components/admin/ui';
import { signIn, signInAs } from '@/server/actions/team';
import type { Role } from '@/server/permissions';

export function LoginForm() {
  return (
    <ActionForm action={signIn} className="grid gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          placeholder="you@oasis.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <SubmitButton>Sign in</SubmitButton>
      </div>
    </ActionForm>
  );
}

/** Development only — the server action refuses unless the local database is live. */
export function LocalSignIn({
  role,
  name,
  summary,
}: {
  role: Role;
  name: string;
  summary: string;
}) {
  return (
    <ActionForm action={signInAs}>
      <input type="hidden" name="role" value={role} />
      <button
        type="submit"
        className="w-full rounded-(--radius-sm) border border-brown/25 bg-linen px-4 py-3 text-left transition-colors hover:border-coral hover:bg-coral/5"
      >
        <span className="block text-[0.9375rem] font-semibold text-brown">{name}</span>
        <span className="mt-0.5 block text-[0.8125rem] text-brown-soft">{summary}</span>
      </button>
    </ActionForm>
  );
}
