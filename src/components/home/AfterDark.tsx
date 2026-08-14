import { EventPoster } from '@/components/media/EventPoster';
import { Frame } from '@/components/primitives/Band';
import { ButtonLink, ExternalButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { PageSection, ResolvedEvent } from '@/content/types';
import { STATUS_LABEL } from '@/lib/events';
import { formatEventDate, formatPrice, formatTimeRange } from '@/lib/format';

/**
 * Oasis After Dark — the day-to-night turn.
 *
 * The transition is built rather than declared: a graded band steps cream → sand
 * → espresso → obsidian over a full section of height, so the page darkens the
 * way a room does at closing time instead of hitting a flat dark rectangle. The
 * electric accent appears here and essentially nowhere else, which is what makes
 * it read as a different part of the night rather than a different website.
 *
 * Every fact on the posters — night, music, age, door, price, next date — is
 * live data. There is no artwork to go stale.
 */
export function AfterDark({
  section,
  events,
}: {
  section: PageSection;
  events: ResolvedEvent[];
}) {
  if (!section.visible || events.length === 0) return null;

  // One card per SERIES, showing that series' next night.
  const bySeries = new Map<string, ResolvedEvent>();
  for (const event of events) {
    if (!bySeries.has(event.series.slug)) bySeries.set(event.series.slug, event);
  }
  const nights = [...bySeries.values()];

  return (
    <section className="relative isolate">
      {/* The gradient IS the transition. Nothing else changes surface here. */}
      <div
        aria-hidden="true"
        className="h-24 w-full bg-linear-to-b from-cream via-sand to-obsidian sm:h-32"
      />

      <div className="bg-obsidian on-dark pb-(--spacing-band)">
        <Frame wide>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <div className="max-w-2xl">
                {section.eyebrow ? <Eyebrow tone="night">{section.eyebrow}</Eyebrow> : null}
                <h2 className="display mt-4 text-[clamp(2.5rem,8vw,5.5rem)] text-night-text">
                  {section.heading}
                </h2>
                {section.body ? (
                  <p className="measure-lead mt-6 text-[length:var(--text-body-lg)] leading-relaxed text-night-soft">
                    {section.body}
                  </p>
                ) : null}
              </div>
            </Reveal>
            <Reveal delay={60}>
              <ButtonLink href="/events" variant="on-dark" className="shrink-0">
                All event nights
              </ButtonLink>
            </Reveal>
          </div>

          <ul className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-2">
            {nights.map((event, index) => {
              const statusLabel = STATUS_LABEL[event.status] ?? '';
              return (
                <li key={event.id}>
                  <Reveal delay={index * 80}>
                    <article className="grid gap-6 sm:grid-cols-2">
                      <EventPoster
                        series={event.series}
                        className="aspect-4/5 w-full rounded-(--radius-lg)"
                        compact
                      />

                      <div className="flex flex-col justify-center">
                        <h3 className="text-[length:var(--text-heading)] font-semibold text-night-text">
                          {event.series.title}
                        </h3>

                        <dl className="mt-4 space-y-2.5 text-[0.9375rem]">
                          <div className="flex justify-between gap-4 border-b border-night-text/15 pb-2.5">
                            <dt className="text-night-text/60">Next</dt>
                            <dd className="tabular text-neon">{formatEventDate(event.startsAt)}</dd>
                          </div>
                          <div className="flex justify-between gap-4 border-b border-night-text/15 pb-2.5">
                            <dt className="text-night-text/60">Doors</dt>
                            <dd className="tabular text-night-text">
                              {formatTimeRange(event.startsAt, event.endsAt)}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4 border-b border-night-text/15 pb-2.5">
                            <dt className="text-night-text/60">Age</dt>
                            <dd className="text-night-text">
                              {event.series.ageMin ? `${event.series.ageMin}+` : 'All ages'}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-night-text/60">Entry</dt>
                            <dd className="tabular text-night-text">
                              {event.status === 'free'
                                ? 'Free'
                                : event.priceCents != null
                                  ? formatPrice(event.priceCents)
                                  : 'At the door'}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-6">
                          {statusLabel ? (
                            <p className="inline-flex rounded-(--radius-md) border-2 border-danger px-4 py-2.5 text-[0.9375rem] font-semibold text-danger">
                              {statusLabel}
                            </p>
                          ) : event.ticketUrl ? (
                            // Composed per night, so this button always lands on
                            // THIS date's ticket page. See ticketUrlForOccurrence.
                            <ExternalButtonLink
                              href={event.ticketUrl}
                              destination={`${event.series.title} tickets`}
                            >
                              Tickets — {formatEventDate(event.startsAt)}
                            </ExternalButtonLink>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </Frame>
      </div>
    </section>
  );
}

/**
 * The weekly line, once, as a marquee. Pure atmosphere — every fact in it is
 * also stated as normal text above, so nothing depends on reading a moving band.
 */
export function NightTicker() {
  const items = ['Oasis Fridays · House · Top 100 · Hip-Hop', 'Oasis Latin Saturdays · Reggaetón · Corridos · Guaracha', 'Doors 10pm', '18+', 'Tickets $10'];
  const line = (
    <span className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="display-poster px-6 py-3 text-[clamp(1rem,2.2vw,1.5rem)] text-night-text/85">
            {item}
          </span>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-neon" />
        </span>
      ))}
    </span>
  );

  return (
    <div className="ticker overflow-hidden border-y border-night-text/15 bg-obsidian on-dark">
      <div className="ticker-track">
        {line}
        <span aria-hidden="true" className="flex shrink-0 items-center">
          {line}
        </span>
      </div>
    </div>
  );
}
