import { redirect } from 'next/navigation';
import { AdminShell, Card, Warning } from '@/components/admin/AdminShell';
import { getSiteSettings } from '@/content/resolve';
import { canAdminister, getStaff } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  // Server-side authorization. Hiding the nav link is not enough on its own.
  if (!canAdminister(staff.role)) {
    return (
      <AdminShell
        role={staff.role}
        name={staff.name}
        email={staff.user.email ?? ''}
        title="Settings"
      >
        <Warning tone="danger">
          Only the owner or a manager can change these settings. Ask them if something here needs
          updating.
        </Warning>
      </AdminShell>
    );
  }

  const settings = await getSiteSettings();

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title="Settings"
      description="The business details that appear across the whole website and in Google search results."
    >
      <div className="grid gap-6">
        {settings.phone.provisional || settings.hours.provisional ? (
          <Warning>
            Some details below have not been confirmed by the restaurant. They came from the old
            website and disagree with what your Toast page says. Your developer has the full list
            in docs/CONTENT-QUESTIONS.md — confirming them is the last thing standing between this
            site and launch.
          </Warning>
        ) : null}

        <Card title="Business details">
          <dl className="grid gap-x-8 gap-y-3 text-[0.9375rem] sm:grid-cols-2">
            <div>
              <dt className="text-brown-soft">Name</dt>
              <dd className="text-brown">{settings.name}</dd>
            </div>
            <div>
              <dt className="text-brown-soft">Address</dt>
              <dd className="text-brown">
                {settings.street}, {settings.locality}, {settings.region} {settings.postalCode}
              </dd>
            </div>
            <div>
              <dt className="text-brown-soft">
                Phone {settings.phone.provisional ? '⚠️ not confirmed' : ''}
              </dt>
              <dd className="tabular text-brown">{settings.phone.value}</dd>
            </div>
            <div>
              <dt className="text-brown-soft">Other number on Toast</dt>
              <dd className="tabular text-brown">{settings.altPhone?.value ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-brown-soft">Email</dt>
              <dd className="text-brown">{settings.email ?? 'None published'}</dd>
            </div>
            <div>
              <dt className="text-brown-soft">Time zone</dt>
              <dd className="text-brown">{settings.timeZone}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.8125rem] text-brown-soft">
            Changing the name, address, or phone number affects Google listings as well as the
            website. Ask your developer to make those changes so nothing is missed.
          </p>
        </Card>

        <Card title="Booking and ordering links">
          <dl className="grid gap-3 text-[0.875rem]">
            <div>
              <dt className="text-brown-soft">Reservations</dt>
              <dd className="break-all text-brown">{settings.reservationUrl}</dd>
            </div>
            <div>
              <dt className="text-brown-soft">Online ordering</dt>
              <dd className="break-all text-brown">{settings.orderUrl}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Social accounts">
          <ul className="grid gap-2 text-[0.9375rem]">
            {settings.socials.map((social) => (
              <li key={social.platform} className="flex justify-between gap-4">
                <span className="capitalize text-brown-soft">{social.platform}</span>
                <span className="text-brown">{social.handle}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.8125rem] text-brown-soft">
            Only accounts that actually exist are linked. The old website linked YouTube, X,
            LinkedIn and TikTok to those companies&rsquo; own homepages, which went nowhere useful —
            those were removed. If you have a real TikTok, tell your developer and it goes back.
          </p>
        </Card>

        <Card title="Analytics">
          <p className="text-[0.9375rem] leading-relaxed text-brown-soft">
            No analytics or tracking is installed on this website. That is why guests are never
            asked to accept cookies. If you want visitor numbers later, your developer can add them
            — the privacy page has to be updated in the same change.
          </p>
        </Card>
      </div>
    </AdminShell>
  );
}
