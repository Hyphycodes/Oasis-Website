import type { Metadata } from 'next';
import Link from 'next/link';
import { EventFilters } from '@/components/events/EventFilters';
import { EventBanner, EventCard, EventRow } from '@/components/events/EventListing';
import { Flyer } from '@/components/events/Flyer';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalButtonLink } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Type';
import { getPageCopy } from '@/server/content/pages';
import { getPublicEvents } from '@/server/content/events';
import { resolveManyEventArtwork } from '@/server/content/event-art';
import { getSiteSettings } from '@/content/resolve';
import { CATEGORY_FILTERS } from '@/content/event-presentation';
import { seo } from '@/content/pages';
import type { ResolvedEvent } from '@/content/types';
import { buildCalendar, type CategoryFilter } from '@/lib/event-calendar';
import { STATUS_LABEL } from '@/lib/events';
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

/**
 * Events — the entertainment calendar.
 *
 * The shape of the page, top to bottom:
 *
 *   1  what this place is on a night out, once, in a sentence
 *   2  the filter, if there is more than one kind of night on
 *   3  the one event we are leading with
 *   4  every remaining upcoming event, in date order, grouped by month
 *   5  October, when it comes, as its own dark room rather than another month
 *   6  the two recurring nights, which have their own pages
 *   7  the kitchen is open before the music starts
 *
 * Past events disappear on their own: everything comes from `buildCalendar`,
 * which reads `getUpcomingEvents`, which drops anything already finished. There
 * is no "archive" to prune and no date to remember to change.
 */
export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const now = new Date();
  const [{ kind }, input, copy, settings] = await Promise.all([
    searchParams,
    getPublicEvents(),
    getPageCopy('events'),
    getSiteSettings(),
  ]);

  const filter: CategoryFilter =
    kind && (CATEGORY_FILTERS as string[]).includes(kind) ? (kind as CategoryFilter) : 'all';

  const calendar = buildCalendar(input, now, filter);
  const featured = calendar.weekly;

  // The lead is also in its own month, so this is deduplicated: one artwork
  // lookup and one piece of structured data per event, however many times the
  // page shows it.
  const listed = [
    ...new Map(
      [
        ...(calendar.lead ? [calendar.lead] : []),
        ...calendar.months.flatMap((month) => month.events),
      ].map((event) => [event.id, event]),
    ).values(),
  ];
  const artwork = await resolveManyEventArtwork(listed);

  const october = calendar.months.filter((month) => month.isOctober);
  const ordinary = calendar.months.filter((month) => !month.isOctober);

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

      {/* 2 and 3 — the filter, then the event we are leading with. */}
      <Band surface="ivory" size="sm">
        <Frame wide>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <Eyebrow>What&apos;s on</Eyebrow>
              <h2 className="display mt-2 text-[clamp(1.5rem,2.6vw,2rem)] text-brown">
                {calendar.total === 0
                  ? 'No special events on sale right now'
                  : calendar.total === 1
                    ? 'One special event coming up'
                    : `${calendar.total} special events coming up`}
              </h2>
            </div>
          </div>

          <EventFilters active={filter} counts={calendar.counts} />

          {calendar.lead ? (
            <div className="mt-7">
              <EventBanner
                event={calendar.lead}
                artwork={artwork.get(calendar.lead.id)!}
                eyebrow="Next up"
              />
            </div>
          ) : (
            <p className="measure mt-6 text-[length:var(--text-body-lg)] text-brown-soft">
              Nothing is on sale for this kind of night at the moment. The weekly nights below are
              still on, and{' '}
              <Link href="/events" className="underline underline-offset-4">
                the whole calendar
              </Link>{' '}
              may have something else.
            </p>
          )}

          {/* The weekly nights are the reason the calendar above can be short
              without the page implying the place is dark. */}
          {featured.length > 0 ? (
            <p className="mt-6 text-[0.9375rem] text-brown-soft">
              Plus{' '}
              {featured.map((event, index) => (
                <span key={event.id}>
                  {index > 0 ? (index === featured.length - 1 ? ' and ' : ', ') : null}
                  <Link
                    href={`/events/${event.seriesSlug}`}
                    className="font-semibold text-brown underline underline-offset-4"
                  >
                    {event.title}
                  </Link>
                </span>
              ))}{' '}
              every week.
            </p>
          ) : null}
        </Frame>
      </Band>

      {/* 4 — the calendar proper, month by month. */}
      {ordinary.length > 0 ? (
        <Band surface="ivory" size="sm">
          <Frame wide>
            {ordinary.map((month) => (
              <section key={month.key} className="mt-10 first:mt-0" aria-labelledby={`month-${month.key}`}>
                <h2
                  id={`month-${month.key}`}
                  className="display border-b-2 border-brown/15 pb-2 text-[1.375rem] text-brown"
                >
                  {month.label}
                </h2>
                <div className="mt-1">
                  {month.events.map((event) => (
                    <EventRow key={event.id} event={event} artwork={artwork.get(event.id)!} />
                  ))}
                </div>
              </section>
            ))}
          </Frame>
        </Band>
      ) : null}

      {/* 5 — October is the restaurant's biggest month. It gets the dark room,
          the seasonal accent and cards rather than rows: the same events, said
          louder. The characters stay on their own events; this is atmosphere. */}
      {october.map((month) => (
        <Band key={month.key} surface="espresso" size="sm" topRule>
          <Frame wide>
            <Eyebrow tone="night">Halloween &amp; Día de los Muertos</Eyebrow>
            <h2 className="display mt-2 text-[clamp(1.75rem,3vw,2.5rem)] text-night-text">
              {month.label} at Oasis
            </h2>
            <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-night-soft">
              The whole month leans into it — costumes, marigolds, painted faces and a different
              reason to be here most nights.
            </p>
            {/* The grid fits the month. One card stretched across three columns
                reads as a mistake; one card at card width reads as a choice. */}
            <div
              className={`mt-7 grid gap-5 ${
                month.events.length === 1
                  ? 'sm:max-w-md'
                  : month.events.length === 2
                    ? 'sm:grid-cols-2'
                    : 'sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {month.events.map((event) => (
                <EventCard key={event.id} event={event} artwork={artwork.get(event.id)!} />
              ))}
            </div>
          </Frame>
        </Band>
      ))}

      {/* 6 — the two recurring nights, once each. */}
      {featured.length > 0 ? (
        <Band surface="ivory-deep" size="sm">
          <Frame wide>
            <Eyebrow>Every week</Eyebrow>
            <h2 className="display mt-2 text-[clamp(1.5rem,2.6vw,2rem)] text-brown">
              The nights that come round again
            </h2>
            <div className="mt-7 grid gap-6 sm:gap-8">
              {featured.map((event, index) => (
                <NightFeature
                  key={event.id}
                  event={event}
                  tone={index === 0 ? 'teal' : 'plum'}
                  flip={index % 2 === 1}
                  priority={false}
                />
              ))}
            </div>
            <p className="measure mt-6 text-[0.875rem] leading-relaxed text-brown-soft">
              These run every week. Each night&apos;s own page lists its next few confirmed dates —
              they are not repeated in the calendar above, which is for one-off events.
            </p>
          </Frame>
        </Band>
      ) : null}

      {/* 7 — restaurant context, one line. */}
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

      {listed.map((event) => (
        <JsonLd key={event.id} data={eventJsonLd(event, settings)} />
      ))}
    </>
  );
}
