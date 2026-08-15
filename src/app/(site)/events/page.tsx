import type { Metadata } from 'next';
import Link from 'next/link';
import { Flyer } from '@/components/events/Flyer';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalButtonLink } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Type';
import { getPageCopy } from '@/server/content/pages';
import { getPublicEvents } from '@/server/content/events';
import { getSiteSettings } from '@/content/resolve';
import { seo } from '@/content/pages';
import type { ResolvedEvent } from '@/content/types';
import { getUpcomingEvents, nextPerSeries, STATUS_LABEL } from '@/lib/events';
import { formatEventDate, formatPrice, formatTimeRange } from '@/lib/format';
import { buildMetadata, eventJsonLd, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.events!, path: '/events' });
// Five minutes. Anything that renders a "next date" has to have a small, bounded
// staleness window — a cached page holding a finished night is the exact defect
// the August 15 audit found. See docs/EVENTS-FRESHNESS.md.
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
  const theme = ACCENT[tone];
  const statusLabel = STATUS_LABEL[event.status] ?? '';
  const shortName = event.title.replace('Oasis ', '');
  // "Show all Fridays dates" reads badly; the series names are plural, the label
  // wants the singular night. Both titles end in a plural "s".
  const nightName = shortName.replace(/s$/, '');

  return (
    <article className={`${theme.surface} on-dark rounded-(--radius-lg) p-5 sm:p-8`}>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className={`lg:col-span-5 ${flip ? 'lg:order-2 lg:col-start-8' : ''}`}>
          <Flyer
            assetId={event.flyerAssetId}
            printedDate={event.flyerPrintedDate}
            eventName={shortName}
            tone={tone}
            priority={priority}
          />
        </div>

        <div className={`lg:col-span-6 ${flip ? 'lg:order-1' : 'lg:col-start-7'}`}>
          <div
            className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-2 ${theme.rule} pb-3`}
          >
            <h2 className={`display text-[clamp(1.75rem,3vw,2.5rem)] ${theme.accent}`}>
              {shortName}
            </h2>
            <span className="eyebrow shrink-0 text-night-text/75">
              {event.ageMin ? `${event.ageMin}+` : 'All ages'}
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
              <dd className="mt-1 text-night-text">{event.musicFormats.join(' · ')}</dd>
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
              <ExternalButtonLink href={event.ticketUrl} destination={`${event.title} tickets`}>
                Tickets — {formatEventDate(event.startsAt)}
              </ExternalButtonLink>
            ) : null}
            {/* The full recurring schedule lives on the series page, one series at
                a time — never as one mixed Friday-and-Saturday list. */}
            {event.seriesSlug ? (
              <Link
                href={`/events/${event.seriesSlug}`}
                className="inline-flex min-h-11 items-center text-[0.9375rem] text-night-text underline underline-offset-4 hover:underline-offset-[6px]"
              >
                Show all {nightName} dates
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/** A special one-off event created in the admin, including its connected artwork. */
function SpecialEventFeature({ event, index }: { event: ResolvedEvent; index: number }) {
  const tone = index % 2 === 0 ? 'teal' : 'plum';
  const surface = tone === 'teal' ? 'bg-teal' : 'bg-plum';
  const accent = tone === 'teal' ? 'text-amber' : 'text-coral-light';
  const soft = tone === 'teal' ? 'text-teal-soft' : 'text-plum-soft';

  return (
    <article className={`${surface} on-dark rounded-(--radius-lg) p-5 sm:p-7`}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:items-center">
        <Flyer
          assetId={event.flyerAssetId}
          printedDate={null}
          eventName={event.title}
          tone={tone}
          sizes="(min-width: 768px) 15rem, 90vw"
        />
        <div>
          <p className={`eyebrow ${soft}`}>Special event</p>
          <h2 className={`display mt-2 text-[clamp(1.75rem,3vw,2.5rem)] ${accent}`}>
            {event.title}
          </h2>
          <p className="tabular mt-3 font-semibold text-night-text">
            {formatEventDate(event.startsAt)} · {formatTimeRange(event.startsAt, event.endsAt)}
          </p>
          {event.description ? (
            <p className={`measure mt-4 text-[0.9375rem] leading-relaxed ${soft}`}>
              {event.description}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.9375rem] text-night-text">
            {event.musicFormats.length > 0 ? <span>{event.musicFormats.join(' · ')}</span> : null}
            <span>{event.priceCents != null ? formatPrice(event.priceCents) : 'Entry at the door'}</span>
            {event.ticketUrl ? (
              <ExternalButtonLink href={event.ticketUrl} destination={`${event.title} tickets`}>
                Tickets
              </ExternalButtonLink>
            ) : null}
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
 * been confirmed, and it mixed both series into one list. Each feature links to
 * its own series page, which lists only that night's future dates.
 */
export default async function EventsPage() {
  const now = new Date();
  const [input, copy, settings] = await Promise.all([
    getPublicEvents(),
    getPageCopy('events'),
    getSiteSettings(),
  ]);
  const featured = nextPerSeries(input, now);
  const specialEvents = getUpcomingEvents(input, now)
    .filter((event) => event.seriesSlug === null)
    .slice(0, 6);

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
            <Eyebrow tone="night">{copy.eyebrow}</Eyebrow>
            <h1 className="display mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] text-night-text">
              {copy.heading}
            </h1>
            {copy.body ? (
              <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-teal-soft">
                {copy.body}
              </p>
            ) : null}
          </div>
        </Frame>
      </section>

      {specialEvents.length > 0 ? (
        <Band surface="ivory" size="sm">
          <Frame wide>
            <Eyebrow>Coming up</Eyebrow>
            <h2 className="display mt-3 text-[clamp(1.75rem,3vw,2.5rem)] text-brown">
              Special events
            </h2>
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              {specialEvents.map((event, index) => (
                <SpecialEventFeature key={event.id} event={event} index={index} />
              ))}
            </div>
          </Frame>
        </Band>
      ) : null}

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
            <ExternalButtonLink href={settings.reservationUrl} destination="Toast reservations">
              Reserve a table
            </ExternalButtonLink>
          </div>
        </Frame>
      </Band>

      {featured.map((event) => (
        <JsonLd key={event.id} data={eventJsonLd(event, settings)} />
      ))}
    </>
  );
}
