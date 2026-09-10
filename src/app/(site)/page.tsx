import type { Metadata } from 'next';
import { AfterDark } from '@/components/home/AfterDark';
import { BarAndBrunch } from '@/components/home/BarAndBrunch';
import { CateringAndVisit } from '@/components/home/CateringAndVisit';
import { ActionRail, Hero } from '@/components/home/Hero';
import { Offerings } from '@/components/home/Offerings';
import { ThemeDivider } from '@/components/theme/ThemeDivider';
import { seo } from '@/content/pages';
import { getCateringPackages, getSiteSettings } from '@/content/resolve';
import { getPublicEvents } from '@/server/content/events';
import { getPageCopy } from '@/server/content/pages';
import { nextEvent, nextPerSeries } from '@/lib/events';
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
export const revalidate = 300;

/**
 * Homepage — six movements, no more.
 *
 *   1. Hero              one dominant visual
 *   2. Action rail       open state, directions, phone
 *   3. Offerings         six real categories, one strip
 *   4. Bar & brunch
 *   5. Oasis After Dark  preview only; the schedule lives on /events
 *   6. Catering, celebrations and arrival   (merged)
 *
 * Nothing here stores its own copy of a menu item, an event date, or a business
 * fact: menu features reference menu records, event cards derive from the same
 * selector /events uses, and hours and address come from site settings.
 */
export default async function HomePage() {
  const now = new Date();
  const [packages, settings, events, breadth, bar, afterDark, twoPaths] = await Promise.all([
    getCateringPackages(),
    getSiteSettings(),
    getPublicEvents(),
    getPageCopy('home', 'breadth'),
    getPageCopy('home', 'bar'),
    getPageCopy('home', 'after-dark'),
    getPageCopy('home', 'two-paths'),
  ]);

  const nights = nextPerSeries(events, now);
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
      <Hero nextEvent={nextEvent(events, now)} />
      <ActionRail openLabel={openState.label} isOpen={openState.open} />
      <Offerings section={breadth} />
      {/* Seasonal ornaments. Render nothing on the default look. Two, not five:
          the transitions that already exist do the rest. */}
      <ThemeDivider />
      <BarAndBrunch section={bar} />
      <AfterDark section={afterDark} events={nights} />
      <ThemeDivider tone="dark" />
      <CateringAndVisit section={twoPaths} packages={packages} />
    </>
  );
}
