import type { Metadata } from 'next';
import Link from 'next/link';
import { Flyer } from '@/components/events/Flyer';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalButtonLink } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Type';
import { pageCopy, seo } from '@/content/pages';
import { site } from '@/content/site';
import type { ResolvedEvent } from '@/content/types';
import { getAllSeries, getUpcomingEvents, STATUS_LABEL } from '@/lib/events';
import { formatEventDate, formatPrice, formatTimeRange } from '@/lib/format';
import { buildMetadata, eventJsonLd, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.events!, path: '/events' });
export const revalidate = 300;

/** Friday leans amber on teal; Saturday leans coral on plum. Related, not identical. */
const ACCENT = {
  teal: {
    surface: 'bg-teal',
    rule: 'border-amber',
    accent: 'text-amber',
    soft: 'text-teal-soft',
  },
  plum: {
    surface: 'bg-plum',
    rule: 'border-coral-light',
    // coral-light, not coral: coral type on plum measures 4.20:1.
    accent: 'text-coral-light',
    soft: 'text-plum-soft',
  },
} as const;

/**
 * One recurring night: its flyer, its next verified date, and one way to buy.
 *
 * Every fact appears once. The age limit is a single chip beside the title, the
 * music is a single line, and the price is stated once — the ticket page is
 * where the final total, including any service fee, is settled.
 */
function NightFeature({
  event,
  tone,
  flip,
  priority,
}: {
  event: ResolvedEvent;
  tone: 'teal' | 'plum';
  /** Mirrors the composition so the two nights do not read as one template. */
  flip: boolean;
  priority: boolean;
}) {
  const { series } = event;
  const theme = ACCENT[tone];
  const statusLabel = STATUS_LABEL[event.status] ?? '';
  const shortName = series.title.replace('Oasis ', '');
  // "Show all Fridays dates" reads badly; the series names are plural, the label
  // wants the singular night. Both titles end in a plural "s".
  const nightName = shortName.replace(/s$/, '');

  return (
    <article className={`${theme.surface} on-dark rounded-(--radius-lg) p-5 sm:p-8`}>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className={`lg:col-span-5 ${flip ? 'lg:order-2 lg:col-start-8' : ''}`}>
          <Flyer series={series} tone={tone} priority={priority} />
        </div>

        <div className={`lg:col-span-6 ${flip ? 'lg:order-1' : 'lg:col-start-7'}`}>
          <div className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-2 ${theme.rule} pb-3`}>
            <h2 className={`display text-[clamp(1.75rem,3vw,2.5rem)] ${theme.accent}`}>
              {shortName}
            </h2>
            <span className="eyebrow shrink-0 text-night-text/75">
              {series.ageMin ? `${series.ageMin}+` : 'All ages'}
            </span>
          </div>

          <dl className="mt-5 grid gap-x-8 gap-y-4 text-[0.9375rem] sm:grid-cols-2">
            <div>
              <dt className={`text-[0.8125rem] ${theme.soft}`}>Next</dt>
              <dd className={`tabular mt-1 text-[1.125rem] font-semibold ${theme.accent}`}>
                {formatEventDate(event.startsAt)}
              </dd>
            </div>
            <div>
              <dt className={`text-[0.8125rem] ${theme.soft}`}>Doors</dt>
              <dd className="tabular mt-1 text-[1.125rem] font-semibold text-night-text">
                {formatTimeRange(event.startsAt, event.endsAt)}
              </dd>
            </div>
            <div>
              <dt className={`text-[0.8125rem] ${theme.soft}`}>Music</dt>
              <dd className="mt-1 text-night-text">{series.musicFormats.join(' · ')}</dd>
            </div>
            <div>
              <dt className={`text-[0.8125rem] ${theme.soft}`}>Entry</dt>
              <dd className="tabular mt-1 text-night-text">
                {event.priceCents != null ? formatPrice(event.priceCents) : 'At the door'}
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            {statusLabel ? (
              <p className="rounded-(--radius-md) border-2 border-danger px-4 py-2.5 text-[0.9375rem] font-semibold text-danger">
                {statusLabel}
              </p>
            ) : event.ticketUrl ? (
              <ExternalButtonLink href={event.ticketUrl} destination={`${series.title} tickets`}>
                Tickets — {formatEventDate(event.startsAt)}
              </ExternalButtonLink>
            ) : null}
            {/* The full recurring schedule lives on the series page, one series at
                a time — never as one mixed Friday-and-Saturday list. */}
            <Link
              href={`/events/${series.slug}`}
              className="inline-flex min-h-11 items-center text-[0.9375rem] text-night-text underline underline-offset-4 hover:underline-offset-[6px]"
            >
              Show all {nightName} dates
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Events.
 *
 * Two nights, featured once each, flyer-led. The combined multi-week schedule
 * that used to sit underneath is gone: it published months of dates that had not
 * been confirmed, and it mixed both series into one list. Each feature now links
 * to its own series page, which lists only that night's future dates.
 */
export default function EventsPage() {
  const now = new Date();
  const upcoming = getUpcomingEvents(now);
  const series = getAllSeries();

  const featured: ResolvedEvent[] = [];
  for (const slug of series.map((s) => s.slug)) {
    const next = upcoming.find((event) => event.series.slug === slug);
    if (next) featured.push(next);
  }

  return (
    <>
      {/* 1 — compact, atmosphere-led intro with real photography. */}
      <section className="relative isolate overflow-hidden bg-teal on-dark">
        {/* Wrapped, not positioned directly: Asset sets `relative` and an
            aspect-ratio on its own root, which would otherwise size this
            background layer to 3:2 of the full page width. */}
        <div className="absolute inset-0 opacity-35">
          <Asset id="roomCrowd" className="size-full" sizes="100vw" rounded={false} priority />
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
            <div className="grid gap-6 sm:gap-8">
              {featured.map((event, index) => (
                <NightFeature
                  key={event.id}
                  event={event}
                  tone={index === 0 ? 'teal' : 'plum'}
                  flip={index % 2 === 1}
                  priority={index === 0}
                />
              ))}
            </div>
          )}
        </Frame>
      </Band>

      {/* 3 — restaurant context, one line. */}
      <Band surface="ivory-deep" size="sm">
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
