import type { Metadata } from 'next';
import { EventCard } from '@/components/events/EventCard';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Eyebrow } from '@/components/primitives/Type';
import { pageCopy, seo } from '@/content/pages';
import { getAllSeries, getUpcomingEvents } from '@/lib/events';
import { buildMetadata, eventJsonLd, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.events!, path: '/events' });

// Five minutes: an event that has just ended must drop off the list promptly.
export const revalidate = 300;

export default function EventsPage() {
  const now = new Date();
  const events = getUpcomingEvents(now, 12);
  const series = getAllSeries();

  return (
    <>
      <PageHeader
        surface="espresso"
        eyebrow={pageCopy.events.eyebrow}
        heading={pageCopy.events.heading}
        body={pageCopy.events.body}
      />

      <Band surface="espresso" size="sm">
        <Frame wide>
          {/* The recurring series, described once. Dates never appear here — they
              belong to occurrences, which is what makes stale artwork impossible. */}
          <ul className="grid gap-8 border-b border-night-text/15 pb-12 sm:grid-cols-2">
            {series.map((s) => (
              <li key={s.slug}>
                <h2 className="text-[length:var(--text-heading)] font-semibold tracking-[-0.015em] text-night-text">
                  {s.title}
                </h2>
                <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-night-soft">
                  {s.description}
                </p>
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[0.875rem] text-night-soft">
                  <div className="flex gap-2">
                    <dt className="text-night-text/60">Music</dt>
                    <dd>{s.musicFormats.join(', ')}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-night-text/60">Age</dt>
                    <dd>{s.ageMin ? `${s.ageMin}+` : 'All ages'}</dd>
                  </div>
                </dl>
                <ButtonLink href={`/events/${s.slug}`} variant="on-dark" className="mt-5">
                  {s.title} dates
                </ButtonLink>
              </li>
            ))}
          </ul>

          <div className="pt-12">
            <Eyebrow tone="night">Upcoming</Eyebrow>

            {events.length === 0 ? (
              <p className="mt-6 text-[length:var(--text-body-lg)] text-night-soft">
                Nothing on the calendar right now. Check back soon, or follow us on Instagram for
                the next announcement.
              </p>
            ) : (
              <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} tone="dark" showDescription={false} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Frame>
      </Band>

      {events.slice(0, 4).map((event) => (
        <JsonLd key={event.id} data={eventJsonLd(event)} />
      ))}
    </>
  );
}
