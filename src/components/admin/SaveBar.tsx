'use client';

import type { ActionState } from '@/app/admin/actions';

/** Consistent save affordance + result feedback for every admin form. */
export function SaveBar({
  state,
  pending,
  label = 'Save changes',
  hint,
}: {
  state: ActionState;
  pending: boolean;
  label?: string;
  hint?: string;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-brown/15 pt-5">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-(--radius-md) bg-orange px-6 font-semibold text-on-orange transition-colors hover:bg-orange-deep disabled:opacity-50"
      >
        {pending ? 'Saving…' : label}
      </button>

      {state ? (
        <p
          role="status"
          className={`text-[0.9375rem] font-medium ${state.ok ? 'text-success' : 'text-danger'}`}
        >
          {state.message}
        </p>
      ) : hint ? (
        <p className="text-[0.8125rem] text-brown-soft">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  'min-h-11 w-full rounded-(--radius-sm) border border-brown/25 bg-linen px-3.5 py-2.5 text-[0.9375rem] text-brown';

export const labelClass = 'block text-[0.875rem] font-medium text-brown';
