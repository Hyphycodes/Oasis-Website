'use client';

import type { ReactNode, RefObject } from 'react';
import { Button } from '@/components/primitives/Button';
import type { InquiryResult } from '@/lib/inquiries';
import { Honeypot } from './Field';

/**
 * Chrome shared by every inquiry form: honeypot, error summary, submit button,
 * and the success panel.
 *
 * The success copy reports what ACTUALLY happened with the submission. It never
 * claims an email was sent, because no mailer is configured anywhere in this
 * project. See src/app/actions/inquiry.ts and docs/ENVIRONMENT.md.
 */
export function FormShell({
  children,
  submitLabel,
  phone,
  pending,
  result,
  formError,
  errorCount,
  formRef,
  statusId,
  onSubmit,
}: {
  children: ReactNode;
  submitLabel: string;
  phone: string;
  pending: boolean;
  result: InquiryResult | null;
  formError?: string;
  errorCount: number;
  formRef: RefObject<HTMLFormElement | null>;
  statusId: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  if (result?.ok) {
    return (
      <div
        id={statusId}
        tabIndex={-1}
        role="status"
        className="rounded-(--radius-md) border-2 border-success bg-linen p-6"
      >
        <p className="text-[length:var(--text-heading)] font-semibold text-brown">
          Thanks — we have your message.
        </p>
        <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-brown-soft">
          {result.stored === 'database'
            ? 'It is saved in our inbox and the Oasis team will follow up. '
            : 'It has been recorded on our server and the Oasis team will follow up. '}
          If your date is soon, call us at{' '}
          <a
            href={`tel:+1${phone.replace(/\D/g, '')}`}
            className="tabular text-brown underline underline-offset-4"
          >
            {phone}
          </a>{' '}
          so we can confirm right away.
        </p>
        <p className="tabular mt-4 text-[0.8125rem] text-brown-soft">
          Reference <span className="font-semibold text-brown">{result.reference}</span>
        </p>
      </div>
    );
  }

  const alert = formError ?? (errorCount > 0 ? 'Please check the highlighted fields below.' : null);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative">
      <Honeypot />

      {alert ? (
        <p
          id={statusId}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-(--radius-md) border-2 border-danger bg-linen px-4 py-3 text-[0.9375rem] font-medium text-danger"
        >
          {alert}
        </p>
      ) : null}

      <div className="grid gap-5">{children}</div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Sending…' : submitLabel}
        </Button>
        <p className="text-[0.8125rem] text-brown-soft">
          We use your details only to reply to this enquiry.
        </p>
      </div>
    </form>
  );
}
