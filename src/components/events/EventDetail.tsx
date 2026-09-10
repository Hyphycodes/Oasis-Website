import { EventArt, presetVars } from '@/components/events/EventArt';
import { priceLabel, StatusChip } from '@/components/events/EventBits';
import { AssetView } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink, ExternalButtonLink, ExternalTextLink } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Type';
import { CATEGORY_LABEL } from '@/content/event-presentation';
import type { ResolvedEvent, SiteSettings } from '@/content/types';
import { addToCalendarUrl, STATUS_LABEL } from '@/lib/events';
import { formatEventDateLong, formatTimeRange } from '@/lib/format';
import { resolveEventArtwork } from '@/server/content/event-art';

/**
 * One special event.
 *
 * A standalone event — a Paint & Sip, a brunch, a comedy night — as opposed to
 * one night of a recurring series, which has its own page shape.
 *
 * Order of business: what it is and when, how to get in, then the official
 * flyer, then everything else. A guest arrives here from a ticket link or a
 * share and wants two facts and a button.
 */
export async function EventDetail({
  event,
  settings,
}: {
  event: ResolvedEvent;
  settings: SiteSettings;
}) {
  const artwork = await resolveEventArtwork(event);
  const flyer = artwork.flyer;
  const price = priceLabel(event);
  const category = event.presentation.category;
  const address = `${settings.street}, ${settings.locality}, ${settings.region} ${settings.postalCode}`;
  const statusLabel = STATUS_LABEL[event.status] ?? '';
  const isOff = event.status === 'cancelled' || event.status === 'postponed';

  const elsewhere = (
    <div className="flex flex-wrap gap-3">
      <ButtonLink href="/events" variant="secondary">
        All events
      </ButtonLink>
      <ExternalButtonLink href={settings.reservationUrl} destination="Toast reservations">
        Reserve a table first
      </ExternalButtonLink>
    </div>
  );

  return (
    <>
      {/* The key art carries the name. It is website art, so it may be cropped
          freely — the flyer below is the one that never is. */}
      <section
        className="relative isolate flex min-h-[20rem] flex-col justify-end overflow-hidden bg-obsidian on-dark sm:min-h-[26rem]"
        style={presetVars(event.presentation.visualPreset)}
      >
        <EventArt
          art={{ ...artwork, flyer: null }}
          title={event.title}
          preset={event.presentation.visualPreset}
          size="lead"
          sizes="100vw"
          priority
          fill
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-3/5 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent"
        />
        <Frame wide>
          <div className="relative z-20 py-8 sm:py-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {category ? (
                <span className="eyebrow text-[color:var(--e-accent)]">
                  {CATEGORY_LABEL[category]}
                </span>
              ) : (
                <Eyebrow tone="night">Special event</Eyebrow>
              )}
              <StatusChip event={event} />
            </div>
            <h1 className="display mt-3 max-w-4xl text-[clamp(2rem,5vw,3.75rem)] leading-[0.92] text-night-text">
              {event.title}
            </h1>
            <p className="tabular mt-3 text-[1.125rem] font-semibold text-[color:var(--e-accent)]">
              {formatEventDateLong(event.startsAt)} ·{' '}
              {formatTimeRange(event.startsAt, event.endsAt)}
            </p>
          </div>
        </Frame>
      </section>

      <Band surface="cream" size="sm">
        <Frame wide>
          {/* Two columns only when there is a flyer to put in the second one.
              An event whose artwork has not arrived yet should read as a
              single column of text, not as a column of text beside a hole. */}
          <div className={`grid gap-10 lg:gap-12 ${flyer ? 'lg:grid-cols-12' : ''}`}>
            <div className={flyer ? 'lg:col-span-7' : ''}>
              {/* An event that is off says so first, before anything that could
                  read as an invitation. */}
              {isOff ? (
                <p className="rounded-(--radius-md) border-2 border-danger bg-danger/10 px-4 py-3 text-[1rem] font-semibold text-danger">
                  {statusLabel || 'This event is not going ahead'} — if you bought a ticket, refunds
                  are handled where you bought it.
                </p>
              ) : null}

              {event.description ? (
                <p
                  className={`measure text-[length:var(--text-body-lg)] leading-relaxed text-brown ${isOff ? 'mt-6' : ''}`}
                >
                  {event.description}
                </p>
              ) : event.summary ? (
                <p
                  className={`measure text-[length:var(--text-body-lg)] leading-relaxed text-brown ${isOff ? 'mt-6' : ''}`}
                >
                  {event.summary}
                </p>
              ) : null}

              <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-brown/15 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="eyebrow text-brown-soft">Date</dt>
                  <dd className="tabular mt-1.5 text-brown">{formatEventDateLong(event.startsAt)}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-brown-soft">Time</dt>
                  <dd className="tabular mt-1.5 text-brown">
                    {formatTimeRange(event.startsAt, event.endsAt)}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-brown-soft">Entry</dt>
                  {/* Base entry only. Any service fee is whatever the ticket page
                      charges on the day — quoting it here would go stale. */}
                  <dd className="tabular mt-1.5 text-brown">{price ?? 'Ask at the door'}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-brown-soft">Age</dt>
                  <dd className="mt-1.5 text-brown">
                    {event.ageMin ? `${event.ageMin}+` : 'All ages'}
                    {event.ageNote ? (
                      <span className="block text-[0.875rem] text-brown-soft">{event.ageNote}</span>
                    ) : null}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="eyebrow text-brown-soft">Where</dt>
                  <dd className="mt-1.5 text-brown">
                    {event.venueName}
                    <span className="block text-[0.875rem] text-brown-soft">{address}</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
                {event.ticketUrl && !isOff && event.status !== 'sold-out' ? (
                  <ExternalButtonLink
                    href={event.ticketUrl}
                    destination={`${event.title} tickets`}
                    size="lg"
                  >
                    {event.ticketLabel ?? 'Get tickets'}
                  </ExternalButtonLink>
                ) : statusLabel ? (
                  <p className="rounded-(--radius-md) border border-danger px-4 py-3 text-[0.9375rem] font-semibold text-danger">
                    {statusLabel}
                  </p>
                ) : null}
                {!isOff ? (
                  <ExternalTextLink
                    href={addToCalendarUrl(event, address)}
                    destination="Google Calendar"
                    className="text-clay"
                  >
                    Add to calendar
                  </ExternalTextLink>
                ) : null}
              </div>

              {flyer ? null : <div className="mt-10">{elsewhere}</div>}
            </div>

            {/* THE OFFICIAL FLYER. Whole, contained, never cropped — the edges of
                a flyer carry its own name, date, price and age line. */}
            {flyer ? (
              <div className="lg:col-span-4 lg:col-start-9">
                <figure>
                  <AssetView
                    asset={flyer}
                    id="event-flyer-detail"
                    fit="contain"
                    tone="light"
                    sizes="(min-width: 1024px) 32vw, 90vw"
                    alt={`Official flyer for ${event.title}`}
                    className="w-full rounded-(--radius-md) border border-brown/15 bg-linen p-2"
                  />
                  <figcaption className="mt-3 text-[0.8125rem] text-brown-soft">
                    The event&apos;s official flyer. The date and time above are the ones to go by.
                  </figcaption>
                </figure>
                <div className="mt-6">{elsewhere}</div>
              </div>
            ) : null}
          </div>
        </Frame>
      </Band>
    </>
  );
}

/** The share image for a standalone event: its key art, else its flyer. */
export async function eventShareImage(event: ResolvedEvent): Promise<string | null> {
  const artwork = await resolveEventArtwork(event);
  const asset = artwork.keyArt ?? artwork.flyer;
  return asset?.path ?? null;
}
