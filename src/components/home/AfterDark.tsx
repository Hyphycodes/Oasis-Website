import { Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { PageSection, ResolvedEvent } from '@/content/types';
import { formatEventDate, formatPrice, formatEventTime } from '@/lib/format';

/**
 * Oasis After Dark — a preview, not the events page.
 *
 * The previous version carried full poster artwork, a four-row metadata table
 * per night, two ticket buttons and a headline the size of the viewport, all in
 * one homepage section. It has been reduced to what a homepage owes the visitor:
 * a label, one line, the two nights with their next dates, and one way through
 * to the detail. The schedule lives on /events.
 *
 * Language matters here too. Oasis is a restaurant and bar that goes late — not
 * a nightclub — so the copy says the room changes, not that it becomes a club.
 */
export function AfterDark({
  section,
  events,
}: {
  section: PageSection;
  events: ResolvedEvent[];
}) {
  if (!section.visible || events.length === 0) return null;

  const bySeries = new Map<string, ResolvedEvent>();
  for (const event of events) {
    if (!bySeries.has(event.series.slug)) bySeries.set(event.series.slug, event);
  }
  const nights = [...bySeries.values()].slice(0, 2);

  return (
    <section className="relative isolate">
      {/* A short graded step, not a slab. Ivory into teal, over 64px. */}
      <div
        aria-hidden="true"
        className="h-12 w-full bg-linear-to-b from-ivory to-teal sm:h-16"
      />

      <div className="bg-teal on-dark py-(--spacing-band-sm)">
        <Frame wide>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-5">
              <Eyebrow tone="night">{section.eyebrow ?? 'Oasis After Dark'}</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.75rem,3vw,2.375rem)] text-night-text">
                {section.heading}
              </h2>
              {section.body ? (
                <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-teal-soft">
                  {section.body}
                </p>
              ) : null}
              <ButtonLink href="/events" variant="on-dark" className="mt-6">
                See all events
              </ButtonLink>
            </Reveal>

            {/* Two compact features. Friday leans amber, Saturday leans coral —
                distinct but related, and the accent is the only thing that
                differs, so they read as a pair. */}
            <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              {nights.map((event, index) => {
                const friday =
                  event.series.cadence.kind === 'weekly' && event.series.cadence.weekday === 5;
                // coral-light, not coral: coral type on teal measures 3.61:1.
                const accent = friday ? 'text-amber' : 'text-coral-light';
                const rule = friday ? 'border-amber/50' : 'border-coral-light/50';

                return (
                  <li key={event.id}>
                    <Reveal delay={index * 70}>
                      <div className={`border-t-2 ${rule} pt-4`}>
                        <p className={`display text-[1.375rem] ${accent}`}>
                          {event.series.title.replace('Oasis ', '')}
                        </p>
                        <p className="tabular mt-2 text-[0.9375rem] text-night-text">
                          {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
                        </p>
                        <p className="mt-1 text-[0.875rem] text-teal-soft">
                          {event.series.musicFormats.join(' · ')}
                        </p>
                        <p className="tabular mt-1 text-[0.875rem] text-teal-soft">
                          {event.series.ageMin ? `${event.series.ageMin}+` : 'All ages'}
                          {event.priceCents != null ? ` · ${formatPrice(event.priceCents)}` : ''}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </Frame>
      </div>
    </section>
  );
}
