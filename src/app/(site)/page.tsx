import type { Metadata } from 'next';
import { SocialScene } from '@/components/home/SocialScene';
import { AfterDark } from '@/components/home/AfterDark';
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
import { nextPerSeries } from '@/lib/events';
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
 * Homepage — five movements, no more.
 *
 *   1. Hero              one dominant visual
 *   2. Action rail       open state, directions, phone
 *   3. What's on         the next night, then the weekly two
 *   4. The kitchen and the bar   four categories, brunch, one way to the menu
 *   5. Oasis After Dark  preview only; the schedule lives on /events
 *   6. Social, then arrival
 *
 * It was nine content bands and three seasonal scenes, which on a phone ran to
 * eight and a half screens and asked the visitor to work through a catering
 * package list before being told the address. Food and bar are one band now,
 * catering and celebrations are two links inside the closing block, and one
 * scene went with them.
 *
 * Nothing here stores its own copy of a menu item, an event date, or a business
 * fact: menu features reference menu records, event cards derive from the same
 * selector /events uses, and hours and address come from site settings.
 */
export default async function HomePage() {
  const now = new Date();
  const [settings, events, breadth, bar, afterDark, twoPaths] = await Promise.all([
    getSiteSettings(),
    getPublicEvents(),
    getPageCopy('home', 'breadth'),
    getPageCopy('home', 'bar'),
    getPageCopy('home', 'after-dark'),
    getPageCopy('home', 'two-paths'),
  ]);

  const nights = nextPerSeries(events, now);
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
      <Offerings section={breadth} bar={bar} />
      <AfterDark section={afterDark} events={nights} />
      <ThemeWorld scene="music" />
      <SocialScene />
      <FindUs section={twoPaths} />
    </>
  );
}
