'use server';

import { headers } from 'next/headers';
import type { InquiryType } from '@/content/types';
import { makeReference, SCHEMAS, type InquiryResult } from '@/lib/inquiries';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase/server';

/**
 * Inquiry submission.
 *
 * Honesty rules enforced here:
 *  - The success message states where the submission actually went. When Supabase
 *    is not configured, it says the message was recorded on the server and gives
 *    the phone number — it does not claim an email was sent.
 *  - NOTHING claims email notification anywhere, because no mailer is configured.
 *    See docs/ENVIRONMENT.md.
 */

/**
 * Naive in-process rate limit. Adequate for a restaurant site on a single
 * instance; the real defence is the honeypot plus validation.
 */
const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 500) {
    for (const [k, v] of recent) if (v.every((t) => now - t >= WINDOW_MS)) recent.delete(k);
  }
  return hits.length > MAX_PER_WINDOW;
}

export async function submitInquiry(type: InquiryType, formData: FormData): Promise<InquiryResult> {
  const schema = SCHEMAS[type];
  const raw = Object.fromEntries(formData.entries());

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      // Honeypot: report a generic failure rather than naming the trap field.
      if (key === 'company_website') {
        return { ok: false, fieldErrors: {}, formError: 'Something went wrong. Please try again.' };
      }
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const headerList = await headers();
  const fingerprint =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerList.get('x-real-ip') ??
    'local';

  if (rateLimited(`${type}:${fingerprint}`)) {
    return {
      ok: false,
      fieldErrors: {},
      formError:
        'We have already received several messages from you. Please call us instead so we can help right away.',
    };
  }

  const data = parsed.data as Record<string, unknown>;
  const { name, email, phone, company_website: _trap, ...payload } = data;
  void _trap;

  const reference = makeReference(type, new Date());

  if (isSupabaseConfigured()) {
    const supabase = getServiceClient();
    if (supabase) {
      const { error } = await supabase
        .from('inquiries')
        .insert({ type, name, email, phone, payload, reference, status: 'new' });

      if (!error) return { ok: true, reference, stored: 'database' };
      console.error('[inquiry] insert failed:', error.message);
    }
  }

  // No CMS configured. Recorded in the server log so it is not lost, and the UI
  // says exactly that plus the phone number — it does not pretend an email went out.
  console.warn(
    `[inquiry] ${reference} ${type} — ${String(name)} <${String(email)}> ${String(phone)} :: ${JSON.stringify(payload)}`,
  );
  return { ok: true, reference, stored: 'log' };
}
