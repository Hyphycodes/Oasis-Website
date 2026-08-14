import { redirect } from 'next/navigation';
import { AdminShell, EmptyState, Warning } from '@/components/admin/AdminShell';
import type { InquiryRecord } from '@/content/types';
import { getStaff } from '@/lib/supabase/auth';
import { getSessionClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { InquiryRow } from './InquiryRow';

export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  let inquiries: InquiryRecord[] = [];
  let loadError: string | null = null;

  if (isSupabaseConfigured()) {
    const supabase = await getSessionClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        loadError = error.message;
      } else {
        inquiries = (data ?? []).map((row) => ({
          id: row.id as string,
          type: row.type as InquiryRecord['type'],
          name: row.name as string,
          email: row.email as string,
          phone: (row.phone as string | null) ?? null,
          payload: (row.payload as InquiryRecord['payload']) ?? {},
          status: row.status as InquiryRecord['status'],
          notes: (row.notes as string | null) ?? null,
          createdAt: row.created_at as string,
        }));
      }
    }
  }

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title="Enquiries"
      description="Catering requests, private-event requests, and job applications sent through the website."
    >
      {!isSupabaseConfigured() ? (
        <Warning tone="warning">
          The content system is not connected, so enquiries are written to the server log instead of
          being stored here. Guests are told exactly that when they submit — the website does not
          claim to have emailed anyone. A developer needs to finish the setup in
          docs/ENVIRONMENT.md.
        </Warning>
      ) : loadError ? (
        <Warning tone="danger">Could not load enquiries: {loadError}</Warning>
      ) : inquiries.length === 0 ? (
        <EmptyState>
          No enquiries yet. They will appear here the moment someone sends one from the catering,
          private-events, or careers page.
        </EmptyState>
      ) : (
        <>
          <p className="mb-4 text-[0.9375rem] text-brown-soft">
            {newCount} new · {inquiries.length} total
          </p>
          <ul className="border-t border-brown/12">
            {inquiries.map((inquiry) => (
              <InquiryRow key={inquiry.id} inquiry={inquiry} />
            ))}
          </ul>
        </>
      )}
    </AdminShell>
  );
}
