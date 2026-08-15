'use client';

import Link from 'next/link';
import { useActionState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionState } from '@/content/admin-types';

/**
 * The form wrapper every admin mutation uses.
 *
 * It exists so that four things are impossible to forget on an individual form:
 * a pending state, an announced result, a message that names the record, and
 * links to the public pages a change affected. `aria-live` matters more than it
 * looks — without it a screen-reader user gets no confirmation at all that a save
 * happened, because nothing about the page visibly moves.
 */

export type { ActionState };

export function ActionForm({
  action,
  children,
  className = '',
  /** Rendered after a successful save; receives the result. */
  onDone,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode | ((state: ActionState) => ReactNode);
  className?: string;
  onDone?: (state: ActionState) => ReactNode;
}) {
  const [state, formAction] = useActionState(action, { ok: true, message: '' });

  return (
    <form action={formAction} className={className}>
      {typeof children === 'function' ? children(state) : children}

      <div aria-live="polite" className="empty:hidden">
        {state.message ? (
          <p
            className={`mt-3 rounded-(--radius-sm) border px-3 py-2 text-[0.875rem] leading-relaxed ${
              state.ok
                ? 'border-success/50 bg-success/8 text-success'
                : 'border-danger/50 bg-danger/8 text-danger'
            }`}
          >
            {state.message}
          </p>
        ) : null}

        {/* Which pages this actually changed, as links. Opening in a new tab is
            the point: you check the page and the form is still where you left
            it, mid-edit. */}
        {state.ok && state.affected?.length ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-brown-soft">
            <span>See it on:</span>
            {state.affected.map((route) => (
              <Link
                key={route}
                href={route}
                className="font-semibold text-clay underline underline-offset-4"
                target="_blank"
              >
                {route === '/' ? 'the homepage' : route} ↗
              </Link>
            ))}
          </p>
        ) : null}

        {state.ok && state.message && onDone ? onDone(state) : null}
      </div>
    </form>
  );
}

/**
 * A submit button, optionally carrying an intent.
 *
 * `name`/`value` on the button is NOT used to carry the intent, and that is not a
 * style preference: React's `useActionState` builds the FormData from the form
 * itself and drops the submitter's name and value, so a "Save and publish" button
 * relying on `name="publish" value="true"` silently saves a draft instead. The
 * intent is written into a real hidden field on click, before the form submits,
 * where FormData will actually see it.
 */
export function SubmitButton({
  children,
  variant = 'primary',
  name,
  value,
  title,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  /** Field to set on click, e.g. `publish`. */
  name?: string;
  value?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();

  const style = {
    primary: 'bg-coral text-on-orange hover:bg-coral-deep hover:text-linen',
    secondary: 'border border-brown/30 text-brown hover:bg-brown/8',
    quiet: 'text-clay underline underline-offset-4 hover:underline-offset-[6px]',
    danger: 'border border-danger text-danger hover:bg-danger/8',
  }[variant];

  return (
    <button
      type="submit"
      title={title}
      disabled={pending}
      onClick={(event) => {
        if (!name) return;
        const form = event.currentTarget.form;
        const field = form?.elements.namedItem(name);
        if (field instanceof HTMLInputElement) field.value = value ?? '';
      }}
      className={`inline-flex min-h-11 items-center justify-center rounded-(--radius-sm) px-4 text-[0.9375rem] font-semibold transition-colors disabled:opacity-60 ${style}`}
    >
      {pending ? 'Saving…' : children}
    </button>
  );
}

/**
 * The hidden field a `SubmitButton` intent writes into.
 * Rendered by every form that offers both "publish" and "save as a draft".
 */
export function IntentField({ name, initial = '' }: { name: string; initial?: string }) {
  return <input type="hidden" name={name} defaultValue={initial} />;
}

/**
 * An icon-sized button for reordering.
 * Labelled, not just an arrow glyph, so it is announced properly.
 */
export function MoveButton({ direction, label }: { direction: 'up' | 'down'; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-(--radius-sm) border border-brown/20 text-brown-soft transition-colors hover:bg-brown/8 hover:text-brown disabled:opacity-40"
    >
      <span aria-hidden="true">{direction === 'up' ? '↑' : '↓'}</span>
    </button>
  );
}
