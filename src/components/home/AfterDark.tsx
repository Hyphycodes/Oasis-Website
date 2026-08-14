import { EventCard } from '@/components/events/EventCard';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Display, Eyebrow } from '@/components/primitives/Type';
import type { PageSection, ResolvedEvent } from '@/content/types';

/**
 * Oasis After Dark — the single day-to-night transition on the site.
 *
 * The espresso band is entered through one orange hairline and nothing else: no
 * gradient, no fade. Events come from structured data, so the dates on these
 * cards are live HTML and cannot go stale.
 */
export function AfterDark({
  section,
  events,
}: {
  section: PageSection;
  events: ResolvedEvent[];
}) {
  if (!section.visible || events.length === 0) return null;

  return (
    <Band surface="espresso" topRule>
      <Frame wide>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <div className="max-w-2xl">
              {section.eyebrow ? <Eyebrow tone="night">{section.eyebrow}</Eyebrow> : null}
              <Display as="h2" size="lg" className="mt-4 text-night-text">
                {section.heading}
              </Display>
              {section.body ? (
                <p className="measure-lead mt-5 text-[length:var(--text-body-lg)] leading-relaxed text-night-soft">
                  {section.body}
                </p>
              ) : null}
            </div>
          </Reveal>
          <Reveal delay={60}>
            <ButtonLink href="/events" variant="on-dark" className="shrink-0">
              All events
            </ButtonLink>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {events.slice(0, 3).map((event, index) => (
            <li key={event.id}>
              <Reveal delay={index * 80}>
                <EventCard event={event} tone="dark" />
              </Reveal>
            </li>
          ))}
        </ul>
      </Frame>
    </Band>
  );
}
