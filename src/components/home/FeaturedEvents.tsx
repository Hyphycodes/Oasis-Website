import Link from 'next/link';
import { EventArt, presetVars } from '@/components/events/EventArt';
import { Frame } from '@/components/primitives/Band';
import { Reveal } from '@/components/primitives/Reveal';
import { CATEGORY_LABEL } from '@/content/event-presentation';
import type { ResolvedEvent } from '@/content/types';
import { formatEventDate, formatEventTime, formatPrice } from '@/lib/format';
import { resolveManyEventArtwork } from '@/server/content/event-art';
import type { HomepageEvents } from '@/lib/event-feature';

/**
 * What's on at Oasis — the homepage's event moment.
 *
 * One dominant event and two supporting ones, deliberately NOT three equal
 * cards: a restaurant with a Halloween headliner and two paint nights is not
 * saying those three things equally loudly, and a 1/1/1 grid would make it say
 * exactly that. The lead gets the wide composition and the full detail line;
 * the supporting pair get upright cards.
 *
 * Every fact — name, date, time, price, sold out — is HTML text. Nothing a
 * guest needs is only inside a picture.
 */
export async function FeaturedEvents({
  events,
  heading,
}: {
  events: HomepageEvents;
  heading?: string;
}) {
  const { lead, supporting } = events;
  if (!lead) return null;

  const artwork = await resolveManyEventArtwork([lead, ...supporting]);

  return (
    <section className="relative isolate bg-espresso on-dark py-(--spacing-band-sm)" aria-labelledby="whats-on">
      <Frame wide>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <p className="eyebrow text-amber">What&apos;s on</p>
              <h2 id="whats-on" className="display mt-2 text-[clamp(1.75rem,3vw,2.375rem)] text-night-text">
                {heading ?? 'Something on almost every night'}
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-(--radius-md) border border-night-text/30 px-5 text-[0.9375rem] font-semibold text-night-text transition-colors hover:bg-night-text/10"
            >
              All events
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>

        <div className="mt-7 grid gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <LeadEvent event={lead} artwork={artwork.get(lead.id)!} />
          </Reveal>

          {supporting.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              {supporting.map((event, index) => (
                <Reveal key={event.id} delay={60 + index * 60}>
                  <SupportingEvent event={event} artwork={artwork.get(event.id)!} />
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>
      </Frame>
    </section>
  );
}

/** Sold out and cancelled are words, never a colour alone. */
function StatusChip({ event }: { event: ResolvedEvent }) {
  if (event.status === 'sold-out') {
    return (
      <span className="inline-flex shrink-0 items-center rounded-(--radius-sm) border border-danger bg-danger/15 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-danger">
        Sold out
      </span>
    );
  }
  if (event.status === 'free') {
    return (
      <span className="inline-flex shrink-0 items-center rounded-(--radius-sm) border border-success/60 bg-success/15 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-success">
        Free entry
      </span>
    );
  }
  return null;
}

/** What entry costs: the admin's own words first, then the number, then nothing. */
function priceLabel(event: ResolvedEvent): string | null {
  if (event.presentation.priceText) return event.presentation.priceText;
  if (event.priceCents != null) return formatPrice(event.priceCents);
  return null;
}

function eventHref(event: ResolvedEvent): string {
  return event.slug ? `/events/${event.slug}` : '/events';
}

function LeadEvent({ event, artwork }: { event: ResolvedEvent; artwork: Parameters<typeof EventArt>[0]['art'] }) {
  const price = priceLabel(event);
  const category = event.presentation.category;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-(--radius-lg) border border-night-text/12"
      style={presetVars(event.presentation.visualPreset)}
    >
      <Link href={eventHref(event)} className="block">
        <EventArt
          art={artwork}
          title={event.title}
          preset={event.presentation.visualPreset}
          size="lead"
          sizes="(min-width: 1024px) 58vw, 100vw"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 bg-obsidian/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {category ? (
            <span className="eyebrow text-[color:var(--e-accent)]">{CATEGORY_LABEL[category]}</span>
          ) : null}
          <StatusChip event={event} />
        </div>

        <h3 className="display text-[clamp(1.5rem,2.6vw,2.125rem)] text-night-text">
          <Link href={eventHref(event)} className="hover:text-[color:var(--e-accent)]">
            {event.title}
          </Link>
        </h3>

        <p className="tabular text-[1.0625rem] font-semibold text-[color:var(--e-accent)]">
          {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
        </p>

        {event.summary ? (
          <p className="measure text-[0.9375rem] leading-relaxed text-night-soft">{event.summary}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          {event.ticketUrl && event.status !== 'sold-out' ? (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-(--radius-md) bg-coral px-5 text-[0.9375rem] font-semibold text-on-orange transition-colors hover:bg-coral-deep"
            >
              Get tickets
              <span className="sr-only">for {event.title} (opens the ticket page in a new tab)</span>
            </a>
          ) : null}
          <Link
            href={eventHref(event)}
            className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-night-text underline underline-offset-4 hover:underline-offset-[6px]"
          >
            Full details
          </Link>
          {price ? <span className="tabular text-[0.9375rem] text-night-soft">{price}</span> : null}
        </div>
      </div>
    </article>
  );
}

function SupportingEvent({
  event,
  artwork,
}: {
  event: ResolvedEvent;
  artwork: Parameters<typeof EventArt>[0]['art'];
}) {
  const price = priceLabel(event);

  return (
    <article
      className="group flex h-full gap-4 overflow-hidden rounded-(--radius-lg) border border-night-text/12 bg-obsidian/60 p-3 transition-colors hover:border-[color:var(--e-accent)]/45 sm:flex-col sm:p-0"
      style={presetVars(event.presentation.visualPreset)}
    >
      <Link href={eventHref(event)} className="w-28 shrink-0 sm:w-full">
        <EventArt
          art={artwork}
          title={event.title}
          preset={event.presentation.visualPreset}
          size="card"
          sizes="(min-width: 1024px) 26vw, (min-width: 640px) 40vw, 30vw"
          className="sm:rounded-b-none"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:p-4 sm:pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="tabular text-[0.875rem] font-semibold text-[color:var(--e-accent)]">
            {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
          </p>
          <StatusChip event={event} />
        </div>

        <h3 className="display text-[1.125rem] leading-tight text-night-text">
          <Link href={eventHref(event)} className="hover:text-[color:var(--e-accent)]">
            {event.title}
          </Link>
        </h3>

        {event.summary ? (
          <p className="line-clamp-2 text-[0.8125rem] leading-relaxed text-night-soft">
            {event.summary}
          </p>
        ) : null}

        {price ? <p className="tabular mt-auto text-[0.8125rem] text-night-soft">{price}</p> : null}
      </div>
    </article>
  );
}
