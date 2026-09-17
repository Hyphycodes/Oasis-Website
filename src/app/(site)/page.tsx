import type { Metadata } from 'next';
import { Celebrations } from '@/components/home/Celebrations';
import { FindUs } from '@/components/home/FindUs';
import { ActionRail, Hero } from '@/components/home/Hero';
import { FeaturedEvents } from '@/components/home/FeaturedEvents';
import { Offerings } from '@/components/home/Offerings';
import { ThemeWorld } from '@/components/theme/ThemeWorld';
import { seo } from '@/content/pages';
import { getSiteSettings } from '@/content/resolve';
import { getPublicEvents } from '@/server/content/events';
import { getPageCopy } from '@/server/content/pages';
import { selectHomepageEvents } from '@/lib/event-feature';
import { getOpenState } from '@/lib/hours';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.home!, path: '/' });

/**
 * Five minutes, not an hour.
 *
 * The homepage renders the next event date. With an hour-long window a cached
 * page can keep advertising a night that has already finished, which is precisely
 * what the August 15 audit found. The page is still statically served; the
 * staleness is just bounded to something shorter than a service.
 * See docs/EVENTS-FRESHNESS.md.
 */
export const dynamic = 'force-dynamic';

/**
 * Homepage — four movements, and a short one.
 *
 *   1. Hero          one dominant visual, one primary action
 *   2. Action rail   open state, directions, phone
 *   3. What's on     the next night, then the two weekly ones
 *   4. Food & bar    two doors into the menu
 *   5. Celebrations  birthdays and quinceañeras
 *   6. Find us       address, hours, catering
 *
 * EVENTS ARE THE POINT. People already know how to have dinner somewhere; what
 * makes a given night worth choosing here is what is on, so the calendar is the
 * first content section and everything else follows it.
 *
 * Two things were removed rather than restyled, both because they said
 * something the page already said:
 *
 *   - An "on next" strip named the soonest event, dated it and offered tickets
 *     — directly above a What's on section that leads with the same event, the
 *     same date and the same ticket button. Two of everything inside one
 *     screen is what made the top of the page feel like a wall of buttons.
 *   - An "Oasis After Dark" band previewed Fridays and Latin Saturdays, which
 *     are already the two supporting cards in What's on. It also promised the
 *     room "changes after ten", which is not true of a calendar whose paint
 *     nights start at seven.
 */

export default async function HomePage() {
  const now = new Date();
  const [settings, events, breadth, twoPaths] = await Promise.all([
    getSiteSettings(),
    getPublicEvents(),
    getPageCopy('home', 'breadth'),
    getPageCopy('home', 'two-paths'),
  ]);

  // One pass decides everything the homepage says about events: what is on
  // next, what leads the featured module, and whether a scheduled takeover is
  // running right now.
  const homepageEvents = selectHomepageEvents(events, now);
  const openState = getOpenState(
    settings.hours.value,
    settings.temporaryClosures,
    now,
    settings.timeZone,
  );

  return (
    <>
      {/* The soonest night of any series, not the first series' next night —
          "what's on" means tonight's Saturday, not next week's Friday. */}
      <Hero takeover={homepageEvents.takeover} />
      <ActionRail openLabel={openState.label} isOpen={openState.open} />
      {/* Events sit high: the second thing a visitor learns about Oasis is that
          there is always something on. */}
      <FeaturedEvents events={homepageEvents} />
      {/* Seasonal scenes share the room with the content. */}
      <ThemeWorld scene="paint" />
      {/* The kitchen and the bar, formerly two bands. */}
      <Offerings section={breadth} />
      <ThemeWorld scene="music" />
      <Celebrations />
      <FindUs section={twoPaths} />
    </>
  );
}
