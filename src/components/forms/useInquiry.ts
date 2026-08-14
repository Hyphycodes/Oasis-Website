'use client';

import { useId, useRef, useState, useTransition } from 'react';
import { submitInquiry } from '@/app/actions/inquiry';
import type { InquiryType } from '@/content/types';
import type { InquiryResult } from '@/lib/inquiries';

/**
 * Shared submit behavior for every inquiry form.
 *
 * Lives in a hook rather than a render-prop wrapper because a function child
 * cannot cross the server/client boundary — each form is its own client
 * component and owns its fields.
 */
export function useInquiry(type: InquiryType) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<InquiryResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusId = useId();

  const errors = result && !result.ok ? result.fieldErrors : {};
  const formError = result && !result.ok ? result.formError : undefined;
  const succeeded = result?.ok === true;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Guards against a double submit and against re-sending a successful form.
    if (pending || succeeded) return;

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const next = await submitInquiry(type, formData);
      setResult(next);
      if (next.ok) formRef.current?.reset();
      // Move focus to the status so the outcome is announced, not just painted.
      requestAnimationFrame(() => document.getElementById(statusId)?.focus());
    });
  }

  return { pending, result, errors, formError, succeeded, formRef, statusId, onSubmit };
}
