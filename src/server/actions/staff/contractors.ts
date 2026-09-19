'use server';

import type { ContractorService } from '@/content/staff-types';
import { recordOpsAudit } from '@/server/staff/audit';
import { markBookingPaid, saveBooking, saveContractor } from '@/server/staff/contractors';
import { bool, cents, fail, isoDate, optional, runOps, savedOps, text, type ActionState } from './shared';

const SERVICES: ContractorService[] = ['dj', 'instructor', 'painter', 'band', 'performer', 'photographer', 'security', 'other'];

export async function saveContractorAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('contractors.manage', async ({ db, context }) => {
    const name = text(form, 'name');
    if (!name) return fail('Enter a name.');
    const service = text(form, 'serviceType') as ContractorService;
    const w9 = text(form, 'w9Status');
    const id = optional(form, 'id');
    const row = await saveContractor(db, id, {
      name,
      companyName: optional(form, 'companyName'),
      phone: optional(form, 'phone'),
      email: optional(form, 'email'),
      serviceType: SERVICES.includes(service) ? service : 'other',
      defaultRateCents: cents(form, 'defaultRate'),
      paymentMethodNote: optional(form, 'paymentMethodNote'),
      w9Status: ['missing', 'requested', 'received'].includes(w9) ? (w9 as 'missing' | 'requested' | 'received') : 'missing',
      notes: optional(form, 'notes'),
      active: !bool(form, 'archived'),
    });
    await recordOpsAudit(context.staff, id ? 'contractor.edited' : 'contractor.created', 'contractor', String(row.id), { after: { name, service } });
    return { ...savedOps(id ? 'Contractor saved.' : 'Contractor added.'), affected: [`/staff/contractors/${String(row.id)}`] };
  });
}

export async function saveBookingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('contractors.manage', async ({ db, context }) => {
    const contractorId = text(form, 'contractorId');
    if (!contractorId) return fail('Pick a contractor.');
    const role = text(form, 'role') as ContractorService;
    const status = text(form, 'status');
    const agreed = cents(form, 'agreed') ?? 0;
    const deposit = cents(form, 'deposit') ?? 0;
    const paid = cents(form, 'paid') ?? 0;
    const id = optional(form, 'id');
    const { before, after } = await saveBooking(db, id, {
      contractorId,
      eventId: optional(form, 'eventId'),
      locationId: optional(form, 'locationId') ?? context.location.id,
      role: SERVICES.includes(role) ? role : 'other',
      startsAt: optional(form, 'startsAt'),
      endsAt: optional(form, 'endsAt'),
      status: ['tentative', 'confirmed', 'cancelled', 'completed'].includes(status) ? (status as 'tentative' | 'confirmed' | 'cancelled' | 'completed') : 'tentative',
      agreedCents: agreed,
      depositCents: deposit,
      paidCents: paid,
      paymentNote: optional(form, 'paymentNote'),
      paidOn: isoDate(optional(form, 'paidOn')),
      note: optional(form, 'note'),
    }, context.staff);
    await recordOpsAudit(context.staff, id ? 'booking.edited' : 'booking.created', 'contractor_booking', String(after.id), { before, after });
    return savedOps(id ? 'Booking saved.' : 'Booked.', after.event_id ? [`/admin/events/one/${encodeURIComponent(String(after.event_id))}`] : []);
  });
}

export async function markPaid(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('contractors.manage', async ({ db, context }) => {
    const id = text(form, 'id');
    const { before, after } = await markBookingPaid(db, id, optional(form, 'note'));
    await recordOpsAudit(context.staff, 'booking.paid', 'contractor_booking', id, { before, after });
    return savedOps('Marked paid.');
  });
}
