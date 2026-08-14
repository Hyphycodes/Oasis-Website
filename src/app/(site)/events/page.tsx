import type { Metadata } from 'next';
import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalButtonLink, ExternalTextLink } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Type';
import { pageCopy, seo } from '@/content/pages';
import { site } from '@/content/site';
import type { ResolvedEvent } from '@/content/types';
import { getAllSeries, getUpcomingEvents, STATUS_LABEL } from '@/lib/events';
import { formatEventDate, formatEventTime, formatPrice, formatTimeRange } from '@/lib/format';
import { buildMetadata, eventJsonLd, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.events!, path: '/events' });
export const revalidate = 300;

/** Friday leans amber on teal; Saturday leans coral on plum. Related, not identical. */
const ACCENT = {
  friday: {
    surface: 'bg-teal',
    rule: 'border-amber',
    accent: 'text-amber',
    soft: 'text-teal-soft',
    chip: 'bg-amber text-plum',
  },
  saturday: {
    surface: 'bg-plum',
    rule: 'border-coral-light',
    // coral-light, not coral: coral type on plum measures 4.20:1.
    accent: 'text-coral-light',
    soft: 'text-plum-soft',
    chip: 'bg-coral text-on-orange',
  },
} as const;

function NightFeature({ event }: { event: ResolvedEvent }) {
  const { series } = event;
  const isFriday = series.cadence.kind === 'weekly' && series.cadence.weekday === 5;
  const theme = isFriday ? ACCENT.friday : ACCENT.saturday;
  const statusLabel = STATUS_LABEL[event.status] ?? '';

  return (
    <article className={`${theme.surface} on-dark rounded-(--radius-lg) p-6 sm:p-8`}>
      <div className={`flex items-baseline justify-between gap-4 border-b-2 ${theme.rule} pb-3`}>
        <h2 className={`display text-[clamp(1.5rem,2.6vw,2rem)] ${theme.accent}`}>
          {series.title.replace('Oasis ', '')}
        </h2>
        <span className="eyebrow shrink-0 text-night-text/70">
          {series.ageMin ? `${series.ageMin}+` : 'All ages'}
        </span>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-3 text-[0.9375rem] sm:grid-cols-2">
        <div>
          <dt className={`text-[0.8125rem] ${theme.soft}`}>Next</dt>
          <dd className={`tabular mt-0.5 font-semibold ${theme.accent}`}>
            {formatEventDate(event.startsAt)}
          </dd>
        </div>
        <div>
          <dt className={`text-[0.8125rem] ${theme.soft}`}>Doors</dt>
          <dd className="tabular mt-0.5 text-night-text">
            {formatTimeRange(event.startsAt, event.endsAt)}
          </dd>
        </div>
        <div>
          <dt className={`text-[0.8125rem] ${theme.soft}`}>Music</dt>
          <dd className="mt-0.5 text-night-text">{series.musicFormats.join(' · ')}</dd>
        </div>
        <div>
          <dt className={`text-[0.8125rem] ${theme.soft}`}>Entry</dt>
          <dd className="tabular mt-0.5 text-night-text">
            {event.priceCents != null ? formatPrice(event.priceCents) : 'At the door'}
            {series.feeCents ? ` + ${formatPrice(series.feeCents)} fee` : ''}
          </dd>
        </div>
      </dl>

      <p className={`measure mt-4 text-[0.875rem] leading-relaxed ${theme.soft}`}>
        {series.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {statusLabel ? (
          <p className="rounded-(--radius-md) border-2 border-danger px-4 py-2.5 text-[0.9375rem] font-semibold text-danger">
            {statusLabel}
          </p>
        ) : event.ticketUrl ? (
          <ExternalButtonLink href={event.ticketUrl} destination={`${series.title} tickets`}>
            Tickets — {formatEventDate(event.startsAt)}
          </ExternalButtonLink>
        ) : null}
        <Link
          href={`/events/${series.slug}`}
          className="inline-flex min-h-11 items-center text-[0.9375rem] text-night-text underline underline-offset-4 hover:underline-offset-[6px]"
        >
          All {series.title.replace('Oasis ', '')} dates
        </Link>
      </div>
    </article>
  );
}

/** Groups later dates by month so the schedule reads like a calendar. */
function byMonth(events: ResolvedEvent[]) {
  const groups = new Map<string, ResolvedEvent[]>();
  for (const event of events) {
    const key = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Chicago',
    }).format(new Date(event.startsAt));
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }
  return [...groups.entries()];
}

/**
 * Events.
 *
 * Previously: an oversized page statement, then Friday and Saturday explained in
 * their own large sections, then every recurring date rendered as another
 * full-height poster card — the same two nights described three times over.
 *
 * Now: one compact intro, each night featured exactly once with its own accent,
 * then later dates as a dense month-grouped schedule. Twelve upcoming nights fit
 * in the space one poster card used to take.
 */
export default function EventsPage() {
  const now = new Date();
  const upcoming = getUpcomingEvents(now, 16);
  const series = getAllSeries();

  // The next night of each series is featured; everything after is schedule.
  const featuredIds = new Set<string>();
  const featured: ResolvedEvent[] = [];
  for (const slug of series.map((s) => s.slug)) {
    const next = upcoming.find((event) => event.series.slug === slug);
    if (next) {
      featured.push(next);
      featuredIds.add(next.id);
    }
  }
  const later = upcoming.filter((event) => !featuredIds.has(event.id));

  return (
    <>
      {/* 1 — compact, atmosphere-led intro with real photography. */}
      <section className="relative isolate overflow-hidden bg-teal on-dark">
        {/* Wrapped, not positioned directly: Asset sets `relative` and an
            aspect-ratio on its own root, which would otherwise size this
            background layer to 3:2 of the full page width. */}
        <div className="absolute inset-0 opacity-35">
          <Asset
            id="roomCrowd"
            className="size-full"
            sizes="100vw"
            rounded={false}
            priority
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-teal to-teal/70" />
        <Frame wide>
          <div className="relative max-w-2xl py-10 lg:py-14">
            <Eyebrow tone="night">{pageCopy.events.eyebrow}</Eyebrow>
            <h1 className="display mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] text-night-text">
              {pageCopy.events.heading}
            </h1>
            <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-teal-soft">
              {pageCopy.events.body}
            </p>
          </div>
        </Frame>
      </section>

      {/* 2 — the two recurring nights, once each. */}
      <Band surface="ivory" size="sm">
        <Frame wide>
          {featured.length === 0 ? (
            <p className="text-[length:var(--text-body-lg)] text-brown-soft">
              Nothing on the calendar right now. Follow us on Instagram for the next announcement.
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {featured.map((event) => (
                <NightFeature key={event.id} event={event} />
              ))}
            </div>
          )}
        </Frame>
      </Band>

      {/* 3 — later dates as a compact schedule, not more posters. */}
      {later.length > 0 ? (
        <Band surface="ivory-deep" size="sm">
          <Frame>
            <Eyebrow tone="orange">Coming up</Eyebrow>
            <h2 className="display mt-2 text-[clamp(1.5rem,2.4vw,1.875rem)] text-brown">
              The next few weeks
            </h2>

            <div className="mt-6">
              {byMonth(later).map(([month, rows]) => (
                <section key={month} className="mt-6 first:mt-0">
                  <h3 className="eyebrow border-b border-brown/20 pb-2 text-brown-soft">{month}</h3>
                  <ul>
                    {rows.map((event) => {
                      const isFriday =
                        event.series.cadence.kind === 'weekly' &&
                        event.series.cadence.weekday === 5;
                      const statusLabel = STATUS_LABEL[event.status] ?? '';
                      return (
                        <li
                          key={event.id}
                          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-brown/12 py-2.5 text-[0.9375rem]"
                        >
                          <span className="tabular w-24 shrink-0 font-semibold text-brown">
                            {formatEventDate(event.startsAt)}
                          </span>
                          <span
                            className={`shrink-0 rounded-(--radius-sm) px-2 py-0.5 text-[0.75rem] font-semibold ${
                              isFriday ? 'bg-teal text-amber' : 'bg-plum text-plum-soft'
                            }`}
                          >
                            {event.series.title.replace('Oasis ', '')}
                          </span>
                          <span className="tabular text-brown-soft">
                            {formatEventTime(event.startsAt)}
                          </span>
                          <span className="text-brown-soft">
                            {event.series.ageMin ? `${event.series.ageMin}+` : 'All ages'}
                          </span>
                          <span className="tabular ml-auto font-semibold text-brown">
                            {event.priceCents != null ? formatPrice(event.priceCents) : ''}
                          </span>
                          {statusLabel ? (
                            <span className="font-semibold text-danger">{statusLabel}</span>
                          ) : event.ticketUrl ? (
                            <ExternalTextLink
                              href={event.ticketUrl}
                              destination={`${event.series.title} tickets`}
                              className="text-clay"
                            >
                              Tickets
                            </ExternalTextLink>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </Frame>
        </Band>
      ) : null}

      {/* 4 — restaurant context, one line. */}
      <Band surface="ivory" size="sm">
        <Frame>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="measure text-[0.9375rem] leading-relaxed text-brown-soft">
              The kitchen is open before the music starts. Come for dinner, get a table, and stay
              for the night.
            </p>
            <ExternalButtonLink href={site.reservationUrl} destination="Toast reservations">
              Reserve a table
            </ExternalButtonLink>
          </div>
        </Frame>
      </Band>

      {featured.map((event) => (
        <JsonLd key={event.id} data={eventJsonLd(event)} />
      ))}
    </>
  );
}
