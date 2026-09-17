'use server';

import { getReadDb, isLocalDb } from '@/lib/db';
import { headers } from 'next/headers';
import type { InquiryType } from '@/content/types';
import { makeReference, SCHEMAS, type InquiryResult } from '@/lib/inquiries';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase/server';

/**
 * Inquiry submission.
 *
 * Honesty rules enforced here:
 *  - Success requires durable database persistence. Failure asks guests to retry or call.
 *  - NOTHING claims email notification anywhere, because no mailer is configured.
 *    See docs/ENVIRONMENT.md.
 */

/**
 * Naive in-process rate limit. Adequate for a restaurant site on a warm instance; validation and the honeypot also apply.
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
  if (!Object.hasOwn(SCHEMAS, type)) return { ok: false, fieldErrors: {}, formError: 'Choose a valid inquiry form.' };
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

  try {
  if (isLocalDb()) {
    await getReadDb()!.insert('inquiries', { id: crypto.randomUUID(), type, name, email, phone, payload, reference, status: 'new', created_at: new Date().toISOString() });
    return { ok: true, reference, stored: 'database' };
  }
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

  } catch {
    console.error('[inquiry] storage unavailable');
  }
  return { ok: false, fieldErrors: {}, formError: 'Your message could not be saved. Please try again or call (815) 545-7556. Your details are still in the form.' };
}
