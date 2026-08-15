import Link from 'next/link';
import type { ReactNode } from 'react';
import type { EditorialState } from '@/content/admin-types';

/**
 * Admin primitives.
 *
 * The same tokens as the public site, arranged for density rather than drama.
 * Three rules run through all of them:
 *
 *   - state is never colour alone; every chip carries a word;
 *   - touch targets are 44px, because most of this is used on a phone
 *     mid-service;
 *   - nothing is a modal unless focus can be managed properly, so panels are
 *     ordinary page sections and disclosures.
 */

export function Card({
  title,
  action,
  children,
  tone = 'default',
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  tone?: 'default' | 'quiet';
}) {
  return (
    <section
      className={`rounded-(--radius-md) border border-brown/15 ${
        tone === 'quiet' ? 'bg-ivory' : 'bg-linen'
      } p-4 shadow-[0_12px_35px_rgba(78,49,20,0.05)] sm:p-5`}
    >
      {title || action ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title ? <h2 className="text-[1.0625rem] font-semibold text-brown">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const STATE_STYLE: Record<EditorialState, { chip: string; label: string }> = {
  published: { chip: 'border-success/40 bg-success/10 text-success', label: 'Live' },
  changed: { chip: 'border-warning/50 bg-warning/10 text-warning', label: 'Draft waiting' },
  draft: { chip: 'border-brown/30 bg-brown/8 text-brown-soft', label: 'Draft' },
  archived: { chip: 'border-brown/25 bg-brown/5 text-brown-soft', label: 'Off the website' },
};

/** State, always as a word. Colour is the second signal, never the only one. */
export function StateChip({ state }: { state: EditorialState }) {
  const style = STATE_STYLE[state];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-(--radius-sm) border px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] ${style.chip}`}
    >
      {style.label}
    </span>
  );
}

export function Notice({
  tone = 'info',
  children,
  action,
}: {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  children: ReactNode;
  action?: ReactNode;
}) {
  const style = {
    info: 'border-brown/25 bg-brown/5 text-brown',
    warning: 'border-warning/60 bg-warning/8 text-warning',
    danger: 'border-danger/60 bg-danger/8 text-danger',
    success: 'border-success/60 bg-success/8 text-success',
  }[tone];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-(--radius-md) border px-4 py-3 text-[0.9375rem] leading-relaxed ${style}`}
    >
      <p className="min-w-0">{children}</p>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-(--radius-md) border border-dashed border-brown/25 px-5 py-8 text-center text-[0.9375rem] text-brown-soft">
      {children}
    </p>
  );
}

/** A big, obvious thing to do. The dashboard is made of these. */
export function TaskLink({
  href,
  title,
  hint,
  number,
}: {
  href: string;
  title: string;
  hint: string;
  number?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-28 items-start gap-3 rounded-(--radius-md) border border-brown/12 bg-linen p-4 shadow-[0_12px_35px_rgba(78,49,20,0.05)] transition-all hover:-translate-y-0.5 hover:border-coral/60 hover:shadow-[0_18px_45px_rgba(78,49,20,0.10)]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal text-[0.8125rem] font-semibold text-amber">
        {number ?? '→'}
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block text-[1rem] font-semibold text-brown group-hover:text-clay">
          {title}
        </span>
        <span className="mt-1 block text-[0.8125rem] leading-relaxed text-brown-soft">{hint}</span>
      </span>
    </Link>
  );
}

export function Label({
  children,
  hint,
  htmlFor,
}: {
  children: ReactNode;
  hint?: string;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-[0.875rem] font-semibold text-brown">{children}</span>
      {hint ? <span className="mt-0.5 block text-[0.8125rem] text-brown-soft">{hint}</span> : null}
    </label>
  );
}

const FIELD =
  'mt-1.5 block min-h-11 w-full rounded-(--radius-sm) border border-brown/25 bg-linen px-3 py-2 text-[0.9375rem] text-brown placeholder:text-brown-soft/60 focus:border-clay';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${FIELD} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${FIELD} ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${FIELD} ${props.className ?? ''}`} />;
}

export function Checkbox({
  id,
  name,
  defaultChecked,
  children,
}: {
  id: string;
  name: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex min-h-11 items-center gap-2.5 text-[0.9375rem] text-brown">
      <input
        id={id}
        name={name}
        type="checkbox"
        value="true"
        defaultChecked={defaultChecked}
        className="size-4 shrink-0 accent-[var(--color-coral)]"
      />
      {children}
    </label>
  );
}

/** Field-level help and errors, associated with their control by id. */
export function FieldNote({ id, tone, children }: { id: string; tone?: 'error'; children: ReactNode }) {
  return (
    <p
      id={id}
      className={`mt-1.5 text-[0.8125rem] ${tone === 'error' ? 'font-medium text-danger' : 'text-brown-soft'}`}
    >
      {children}
    </p>
  );
}
