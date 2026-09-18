import { ThemeWorld } from '@/components/theme/ThemeWorld';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Flyer } from '@/components/events/Flyer';
import { EventPage } from '@/components/events/EventPage';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink, ExternalButtonLink, ExternalTextLink } from '@/components/primitives/Button';
import { Display, Eyebrow } from '@/components/primitives/Type';
import { getSiteSettings } from '@/content/resolve';
import { getEditableEvents, getPublicEvents } from '@/server/content/events';
import { getReadDb } from '@/lib/db';
import { verifyPreviewToken } from '@/lib/ticketing/tokens';
import { resolveEventArtwork, resolveManyEventArtwork } from '@/server/content/event-art';
import { getTicketOffer, offersFor } from '@/server/ticketing/offer';
import { addToCalendarUrl, findStandaloneEvent, getSeriesOccurrences, getUpcomingEvents, nextEvent, standaloneEvents, STATUS_LABEL } from '@/lib/events';
import { formatEventDateLong, formatPrice, formatTimeRange } from '@/lib/format';
import { absoluteUrl, buildMetadata, eventJsonLd, JsonLd } from '@/lib/seo';

// Bounded staleness, for the same reason as /events: a cached page must never be
// able to hold a finished night for long.
export const dynamic = 'force-dynamic';

/** A flyer near the 1.91:1 social ratio can be the card itself; anything else is composed. */
function flyerIsShareable(flyer: { width: number; height: number } | null): boolean {
  if (!flyer || !flyer.width || !flyer.height) return false;
  const ratio = flyer.width / flyer.height;
  return ratio >= 1.5 && ratio <= 2.2;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [input, settings] = await Promise.all([getPublicEvents(), getSiteSettings()]);

  const series = input.series.find((entry) => entry.slug === slug);
  if (series) {
    return buildMetadata({
      title: `${series.title} — ${settings.name}, Lockport IL`,
      description: series.description.slice(0, 300),
      path: `/events/${series.slug}`,
    });
  }

  const event = findStandaloneEvent(input, slug);
  if (!event) return {};

  const artwork = await resolveEventArtwork(event);
  const flyer = artwork.flyer;
  return buildMetadata({
    title: `${event.title} — ${formatEventDateLong(event.startsAt)} at ${settings.name}`,
    description: (event.summary || event.description).slice(0, 300),
    path: `/events/${event.slug}`,
    // A landscape flyer is the card. Otherwise the images key is left out so
    // the composed card in opengraph-image.tsx is used.
    ...(flyer?.path && flyerIsShareable(flyer) ? { images: [absoluteUrl(flyer.path)] } : {}),
  });
}

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams ?? Promise.resolve<{ preview?: string }>({})]);
  const [input, settings] = await Promise.all([getPublicEvents(), getSiteSettings()]);
  const now = new Date();

  const series = input.series.find((entry) => entry.slug === slug);
  if (!series) {
    let event = findStandaloneEvent(input, slug);
    // A signed preview link lets staff see a draft on the real page, with its
    // unpublished edits, for a day. Nothing about it is cached.
    if (query.preview) {
      const previewId = verifyPreviewToken(query.preview);
      const db = previewId ? getReadDb() : null;
      if (previewId && db) {
        const working = await getEditableEvents(db);
        const draft = standaloneEvents(working.occurrences).find((entry) => entry.overrideId === previewId && !entry.archivedAt);
        if (draft && (draft.slug === slug || !event)) event = draft;
      }
    }
    if (!event) notFound();

    // One pass for everything the page shows: this event's artwork and offer,
    // and the next three special events beside it.
    const others = getUpcomingEvents(input, now)
      .filter((entry) => entry.seriesSlug === null && entry.id !== event.id)
      .slice(0, 3);
    const [artwork, offer, otherArt, otherOffers] = await Promise.all([
      resolveEventArtwork(event),
      getTicketOffer(event),
      resolveManyEventArtwork(others),
      offersFor(others),
    ]);
    const upcoming = others.map((entry) => ({
      event: entry,
      flyer: otherArt.get(entry.id)?.flyer ?? null,
      offer: otherOffers.get(entry.id)!,
    }));

    return (
      <>
        <EventPage event={event} settings={settings} offer={offer} artwork={artwork} upcoming={upcoming} />
        <JsonLd
          data={eventJsonLd(event, settings, {
            offer,
            image: artwork.flyer?.path ? absoluteUrl(artwork.flyer.path) : null,
          })}
        />
      </>
    );
  }

  // Six weeks, not a quarter. Occurrences are generated from cadence, so the
  // list could run indefinitely — but publishing months of nights the owner has
  // not looked at turns a schedule into a promise. Six is "the next few weeks".
  const occurrences = getSeriesOccurrences(input, slug, now, 6);
  const next = nextEvent(input, now, slug);
  // The series keeps its own identity across the site: Friday is teal, Latin
  // Saturday is plum, on the listing and on its own page alike.
  const tone = series.cadence.kind === 'weekly' && series.cadence.weekday === 5 ? 'teal' : 'plum';
  const address = `${settings.street}, ${settings.locality}, ${settings.region} ${settings.postalCode}`;

  return (
    <>
      <Band surface={tone} size="sm" topRule>
        <Frame wide>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Eyebrow tone="night">Oasis After Dark</Eyebrow>
              <Display as="h1" size="lg" className="mt-4 text-night-text">
                {series.title}
              </Display>
              <p className="measure mt-6 text-[length:var(--text-body-lg)] leading-relaxed text-night-soft">
                {series.description}
              </p>

              <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-night-text/15 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="eyebrow text-night-text/50">Next date</dt>
                  <dd className="tabular mt-1.5 text-night-text">
                    {next ? formatEventDateLong(next.startsAt) : 'To be announced'}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-night-text/50">Time</dt>
                  <dd className="tabular mt-1.5 text-night-text">
                    {next ? formatTimeRange(next.startsAt, next.endsAt) : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-night-text/50">Age</dt>
                  <dd className="mt-1.5 text-night-text">
                    {series.ageMin ? `${series.ageMin}+` : 'All ages'}
                    {series.ageNote ? (
                      <span className="block text-[0.875rem] text-night-soft">{series.ageNote}</span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-night-text/50">Entry</dt>
                  {/* Base entry only. Any service fee is whatever the ticket page
                      charges on the day — quoting it here would go stale. */}
                  <dd className="tabular mt-1.5 text-night-text">
                    {series.ticketPolicy === 'free' ? 'Free entry · No tickets needed' : next?.priceCents != null ? formatPrice(next.priceCents) : 'Ask at the door'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="eyebrow text-night-text/50">Music</dt>
                  <dd className="mt-1.5 text-night-text">{series.musicFormats.join(' · ')}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {/* The NEXT night's own ticket page, not a series-level link —
                    a date-less slug resolves to the wrong event entirely. */}
                {next?.ticketUrl && next.status !== 'sold-out' ? (
                  <ExternalButtonLink
                    href={next.ticketUrl}
                    destination={`${series.title} tickets`}
                    size="lg"
                  >
                    Tickets — {formatEventDateLong(next.startsAt)}
                  </ExternalButtonLink>
                ) : (
                  <p className="rounded-(--radius-md) border border-danger px-4 py-3 text-[0.9375rem] font-semibold text-danger">
                    {STATUS_LABEL[next?.status ?? 'scheduled'] || 'Tickets at the door'}
                  </p>
                )}
                {next ? (
                  <ExternalTextLink
                    href={addToCalendarUrl(next, address)}
                    destination="Google Calendar"
                    className="text-night-text"
                  >
                    Add to calendar
                  </ExternalTextLink>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <Flyer
                assetId={next?.flyerAssetId ?? series.flyerAssetId}
                printedDate={next?.flyerPrintedDate ?? series.flyerPrintedDate}
                eventName={series.title.replace('Oasis ', '')}
                tone={tone}
                priority
                sizes="(min-width: 1024px) 32vw, 90vw"
              />
              <p className="mt-3 text-[0.8125rem] text-night-soft">
                {series.venueName}, {address}
              </p>
            </div>
          </div>
        </Frame>
      </Band>

      <Band surface="cream">
        <Frame>
          {/* This series only. Fridays and Latin Saturdays are never merged into
              one schedule — that was the list nobody could read. */}
          <h2 className="display text-[clamp(1.5rem,2.4vw,1.875rem)] text-brown">
            All upcoming {series.title.replace('Oasis ', '')}
          </h2>
          {/* Dates come from generated occurrences. Nothing here is read from the
              flyer artwork, which is why this list cannot go stale. */}
          <ul className="mt-8 border-t border-brown/15">
            {occurrences.map((occurrence) => {
              const statusLabel = STATUS_LABEL[occurrence.status] ?? '';
              return (
                <li
                  key={occurrence.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-brown/15 py-4"
                >
                  <p className="tabular font-medium text-brown">
                    {formatEventDateLong(occurrence.startsAt)}
                  </p>
                  <p className="tabular text-[0.9375rem] text-brown-soft">
                    {formatTimeRange(occurrence.startsAt, occurrence.endsAt)}
                  </p>
                  {/* No price per row. Entry is the same every week and is stated
                      once above; ten copies of it are ten things to keep right. */}
                  {statusLabel ? (
                    <p className="text-[0.875rem] font-semibold text-danger">{statusLabel}</p>
                  ) : occurrence.ticketUrl ? (
                    <ExternalTextLink
                      href={occurrence.ticketUrl}
                      destination={`${series.title} tickets`}
                      className="text-clay"
                    >
                      Tickets
                    </ExternalTextLink>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <p className="measure mt-5 text-[0.875rem] leading-relaxed text-brown-soft">
            {series.title} runs every week. Dates further out are added as they are confirmed.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/events" variant="secondary">
              All events
            </ButtonLink>
            <ExternalButtonLink href={settings.reservationUrl} destination="Toast reservations">
              Reserve a table first
            </ExternalButtonLink>
          </div>
        </Frame>
      </Band>

      {next ? <JsonLd data={eventJsonLd(next, settings)} /> : null}
      <ThemeWorld scene="paint" />
    </>
  );
}
