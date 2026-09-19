import { redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { HelpNote, LinkButton } from '@/components/admin/ui';
import { EMAIL_TEMPLATES } from '@/emails/registry';
import { isLocalDb } from '@/lib/db';
import { getStaff } from '@/server/auth';
import { emailConfig } from '@/server/email/config';
import { listEventsForEmail } from '@/server/email/data';
import { canOpen } from '@/server/permissions';
import { isTicketingConfigured } from '@/server/ticketing/db';
import { EmailGallery } from './EmailGallery';

export const dynamic = 'force-dynamic';

/**
 * The email gallery: every template and every version of it, drawn small,
 * side by side, the way Link Hubs shows every hub.
 *
 * Communications is the working screen — status, one preview, the test
 * send, the log. This is the looking screen, for the afternoon someone
 * changes the footer or the palette and wants to see what happened to all
 * eighteen of them at once. Read-only: nothing here sends anything.
 */
export default async function EmailGalleryPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');
  const local = isLocalDb();
  if (!canOpen({ role: staff.role, sections: staff.sections }, 'events')) {
    return (
      <AdminShell staff={staff} local={local} title="Every email">
        <NoAccess what="emails" />
      </AdminShell>
    );
  }

  const config = emailConfig();
  const events = await listEventsForEmail().catch(() => []);

  return (
    <AdminShell
      staff={staff}
      local={local}
      title="Every email"
      description="Every template the site can send, and every version of the ones that have versions, rendered against real event data. Click any of them to see it full size."
      backTo={{ href: '/admin/communications', label: 'Emails' }}
      actions={<LinkButton href="/admin/communications">Status, tests & log</LinkButton>}
    >
      <div className="grid gap-5">
        {events.length === 0 && isTicketingConfigured() ? (
          <HelpNote>There are no events to preview against, so the ticket, reminder, refund and change emails cannot be drawn. Publish an event and they will appear here.</HelpNote>
        ) : null}
        <EmailGallery templates={EMAIL_TEMPLATES} events={events} defaultTicketDirection={config.ticketDirection} />
        <p className="text-[0.8125rem] leading-relaxed text-brown-soft">
          Designs live in code (<code>src/emails/</code>). For the awkward cases — five tickets, a missing artwork, a name that runs long — run <code>npm run email:dev</code>, which serves every scenario in <code>src/emails/previews/</code>. docs/email-system.md explains the rest.
        </p>
      </div>
    </AdminShell>
  );
}
