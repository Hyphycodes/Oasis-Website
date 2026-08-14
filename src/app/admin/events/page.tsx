import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell, Card, Warning } from '@/components/admin/AdminShell';
import { assets } from '@/content/assets';
import { getAllSeries, getSeriesOccurrences } from '@/lib/events';
import { formatEventDateLong, formatTimeRange } from '@/lib/format';
import { getStaff } from '@/lib/supabase/auth';
import { EventEditor } from './EventEditor';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const now = new Date();
  const series = getAllSeries();

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title="Events"
      description="Your Friday and Saturday nights repeat automatically, so the dates on the website are always right. You never have to add them one by one."
    >
      <div className="mb-6">
        <Warning tone="success">
          Dates are worked out from the schedule and printed as text over the flyer — never read
          from the picture. That is why the website can never show an out-of-date flyer date.
        </Warning>
      </div>

      <div className="grid gap-6">
        {series.map((entry) => {
          const occurrences = getSeriesOccurrences(entry.slug, now, 5);
          const artwork = assets[entry.artworkAssetId as keyof typeof assets];
          const artworkMissing = !artwork || artwork.status === 'placeholder';

          return (
            <Card key={entry.slug} title={entry.title}>
              <p className="mb-4 text-[0.875rem] text-brown-soft">
                {entry.musicFormats.join(' · ')} · {entry.ageMin ? `${entry.ageMin}+` : 'All ages'} ·{' '}
                <Link
                  href={`/events/${entry.slug}`}
                  className="text-clay underline underline-offset-4"
                >
                  Preview on the website
                </Link>
              </p>

              {artworkMissing ? (
                <div className="mb-5">
                  <Warning>
                    No flyer uploaded for this night, so the website shows a plain Oasis panel.
                    Send your developer a flyer with <strong>no date printed on it</strong> — the
                    website adds the date itself.
                  </Warning>
                </div>
              ) : null}

              <EventEditor series={entry} />

              <div className="mt-6 border-t border-brown/15 pt-5">
                <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-brown-soft">
                  Next dates on the website
                </h3>
                <ul className="mt-3 space-y-1.5 text-[0.875rem]">
                  {occurrences.map((occurrence) => (
                    <li key={occurrence.id} className="flex justify-between gap-4">
                      <span className="tabular text-brown">
                        {formatEventDateLong(occurrence.startsAt)}
                      </span>
                      <span className="tabular text-brown-soft">
                        {formatTimeRange(occurrence.startsAt, occurrence.endsAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>
    </AdminShell>
  );
}
