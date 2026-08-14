'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireRole } from '@/lib/supabase/auth';
import { getSessionClient } from '@/lib/supabase/server';

/**
 * Admin mutations.
 *
 * Every one of these calls `requireRole` FIRST. That is the server-side check;
 * Postgres RLS is the second, independent one. The admin UI hiding a control is
 * neither — it is only a courtesy.
 */

export type ActionState = { ok: boolean; message: string } | null;

function fail(error: unknown): ActionState {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return { ok: false, message };
}

/* ---------------------------------------------------------------- auth --- */

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

export async function signOut() {
  const supabase = await getSessionClient();
  await supabase?.auth.signOut();
  redirect('/admin/login');
}

/* -------------------------------------------------------- announcements --- */

const announcementSchema = z
  .object({
    id: z.string().uuid().optional().or(z.literal('')),
    message: z.string().trim().min(1, 'Write the message.').max(240),
    href: z.string().trim().url('Enter a full web address, or leave it blank.').or(z.literal('')),
    linkLabel: z.string().trim().max(40),
    startsAt: z.string().trim(),
    endsAt: z.string().trim(),
    enabled: z.coerce.boolean(),
    tone: z.enum(['default', 'night']),
  })
  .refine((v) => !v.href || v.linkLabel.length > 0, {
    message: 'A link needs button text.',
    path: ['linkLabel'],
  })
  .refine((v) => !v.startsAt || !v.endsAt || new Date(v.endsAt) > new Date(v.startsAt), {
    message: 'The end date must be after the start date.',
    path: ['endsAt'],
  });

export async function saveAnnouncement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole('editor');
    const parsed = announcementSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check the form.' };
    }

    const supabase = await getSessionClient();
    if (!supabase) return { ok: false, message: 'The content system is not connected.' };

    const value = parsed.data;
    const row = {
      message: value.message,
      href: value.href || null,
      link_label: value.href ? value.linkLabel : null,
      starts_at: value.startsAt ? new Date(value.startsAt).toISOString() : null,
      ends_at: value.endsAt ? new Date(value.endsAt).toISOString() : null,
      enabled: value.enabled,
      tone: value.tone,
    };

    const { error } = value.id
      ? await supabase.from('announcements').update(row).eq('id', value.id)
      : await supabase.from('announcements').insert(row);

    if (error) return { ok: false, message: error.message };

    revalidatePath('/', 'layout');
    return { ok: true, message: value.enabled ? 'Announcement is live.' : 'Announcement saved (off).' };
  } catch (error) {
    return fail(error);
  }
}

/* ----------------------------------------------------------------- hours --- */

const hoursSchema = z.object({
  hours: z.string().min(2),
});

export async function saveHours(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole('editor');
    const parsed = hoursSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { ok: false, message: 'Could not read the hours.' };

    const supabase = await getSessionClient();
    if (!supabase) return { ok: false, message: 'The content system is not connected.' };

    const hours = JSON.parse(parsed.data.hours) as {
      day: number;
      closed: boolean;
      open: string;
      close: string;
    }[];

    const toMinutes = (value: string) => {
      const [h, m] = value.split(':').map(Number);
      return (h ?? 0) * 60 + (m ?? 0);
    };

    const payloadHours = hours.map((day) => {
      const openMinutes = toMinutes(day.open);
      let closeMinutes = toMinutes(day.close);
      // A close time earlier than the open time means it closes after midnight.
      if (closeMinutes <= openMinutes) closeMinutes += 1440;
      return {
        day: day.day,
        closed: day.closed,
        ranges: day.closed ? [] : [{ openMinutes, closeMinutes }],
      };
    });

    const { data: existing } = await supabase
      .from('site_settings')
      .select('payload')
      .eq('id', 'default')
      .maybeSingle();

    const payload = {
      ...((existing?.payload as Record<string, unknown>) ?? {}),
      hours: { value: payloadHours, provisional: false },
    };

    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 'default', payload }, { onConflict: 'id' });

    if (error) return { ok: false, message: error.message };

    revalidatePath('/', 'layout');
    revalidatePath('/visit');
    return { ok: true, message: 'Hours updated on the website.' };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------------------------------------ menu item --- */

const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'The dish needs a name.').max(120),
  description: z.string().trim().max(600),
  price: z.string().trim(),
  priceNote: z.string().trim().max(80),
  available: z.coerce.boolean(),
  featured: z.coerce.boolean(),
});

export async function saveMenuItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole('editor');
    const parsed = menuItemSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check the form.' };
    }

    const value = parsed.data;
    const trimmed = value.price.replace(/[$,\s]/g, '');
    let priceCents: number | null = null;

    if (trimmed) {
      const amount = Number(trimmed);
      if (!Number.isFinite(amount) || amount < 0) {
        return { ok: false, message: 'Enter the price as a number, for example 16 or 16.50.' };
      }
      priceCents = Math.round(amount * 100);
    }

    // The database requires one or the other, so a blank price must say why.
    const priceNote = priceCents == null ? value.priceNote || 'Ask your server' : null;

    const supabase = await getSessionClient();
    if (!supabase) return { ok: false, message: 'The content system is not connected.' };

    const { error } = await supabase
      .from('menu_items')
      .update({
        name: value.name,
        description: value.description || null,
        price_cents: priceCents,
        price_note: priceNote,
        available: value.available,
        featured: value.featured,
      })
      .eq('id', value.id);

    if (error) return { ok: false, message: error.message };

    revalidatePath('/menu');
    revalidatePath('/');
    return { ok: true, message: `Saved “${value.name}”.` };
  } catch (error) {
    return fail(error);
  }
}

/* --------------------------------------------------------------- events --- */

const eventStatusSchema = z.object({
  slug: z.string().min(1),
  status: z.enum(['scheduled', 'sold-out', 'cancelled', 'postponed', 'free']),
  ticketUrl: z.string().trim().url('Enter a full ticket link.').or(z.literal('')),
  price: z.string().trim(),
});

export async function saveEventSeries(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole('editor');
    const parsed = eventStatusSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check the form.' };
    }

    const value = parsed.data;
    const amount = value.price ? Number(value.price.replace(/[$,\s]/g, '')) : null;
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      return { ok: false, message: 'Enter the ticket price as a number, for example 10.' };
    }

    const supabase = await getSessionClient();
    if (!supabase) return { ok: false, message: 'The content system is not connected.' };

    const { error } = await supabase
      .from('event_series')
      .update({
        status: value.status,
        ticket_url: value.ticketUrl || null,
        price_cents: amount === null ? null : Math.round(amount * 100),
      })
      .eq('slug', value.slug);

    if (error) return { ok: false, message: error.message };

    revalidatePath('/events');
    revalidatePath(`/events/${value.slug}`);
    revalidatePath('/');
    return { ok: true, message: 'Event updated.' };
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------------------------------------ inquiries --- */

const inquiryUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['new', 'in-progress', 'closed']),
  notes: z.string().trim().max(2000),
});

export async function updateInquiry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole('editor');
    const parsed = inquiryUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { ok: false, message: 'Could not save that change.' };

    const supabase = await getSessionClient();
    if (!supabase) return { ok: false, message: 'The content system is not connected.' };

    const { error } = await supabase
      .from('inquiries')
      .update({ status: parsed.data.status, notes: parsed.data.notes || null })
      .eq('id', parsed.data.id);

    if (error) return { ok: false, message: error.message };

    revalidatePath('/admin/inquiries');
    return { ok: true, message: 'Enquiry updated.' };
  } catch (error) {
    return fail(error);
  }
}
