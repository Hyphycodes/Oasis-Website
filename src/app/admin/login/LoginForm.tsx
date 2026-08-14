'use client';

import { useActionState } from 'react';
import { signIn, type ActionState } from '../actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, null);

  return (
    <form action={action} className="grid gap-5">
      {state && !state.ok ? (
        <p
          role="alert"
          className="rounded-(--radius-md) border-2 border-danger bg-linen px-4 py-3 text-[0.9375rem] font-medium text-danger"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="email" className="block text-[0.875rem] font-medium text-brown">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1.5 min-h-11 w-full rounded-(--radius-sm) border border-brown/25 bg-linen px-3.5 py-2.5 text-[0.9375rem] text-brown"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-[0.875rem] font-medium text-brown">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 min-h-11 w-full rounded-(--radius-sm) border border-brown/25 bg-linen px-3.5 py-2.5 text-[0.9375rem] text-brown"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-(--radius-md) bg-orange px-7 py-3 font-semibold text-on-orange transition-colors hover:bg-orange-deep disabled:opacity-50"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-[0.8125rem] text-brown-soft">
        Forgot your password? Ask whoever set up your account to reset it for you.
      </p>
    </form>
  );
}
