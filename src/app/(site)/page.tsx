import type { Metadata } from 'next';
import { AfterDark } from '@/components/home/AfterDark';
import { BarAndBrunch } from '@/components/home/BarAndBrunch';
import { CateringAndVisit } from '@/components/home/CateringAndVisit';
import { ActionRail, Hero } from '@/components/home/Hero';
import { Offerings } from '@/components/home/Offerings';
import { homeSections, seo } from '@/content/pages';
import { getCateringPackages } from '@/content/resolve';
import { site } from '@/content/site';
import { getUpcomingEvents } from '@/lib/events';
import { getOpenState } from '@/lib/hours';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.home!, path: '/' });

export const revalidate = 3600;

function section(key: string) {
  return homeSections.find((s) => s.key === key)!;
}

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
 * The previous build had eight, described the restaurant three times, and
 * repeated the address in both the arrival section and the footer.
 */
export default async function HomePage() {
  const now = new Date();
  const packages = await getCateringPackages();
  const events = getUpcomingEvents(now, 6);
  const openState = getOpenState(site.hours.value, site.temporaryClosures, now, site.timeZone);

  return (
    <>
      <Hero nextEvent={events[0] ?? null} />
      <ActionRail openLabel={openState.label} isOpen={openState.open} />
      <Offerings section={section('breadth')} />
      <BarAndBrunch section={section('bar')} />
      <AfterDark section={section('after-dark')} events={events} />
      <CateringAndVisit section={section('two-paths')} packages={packages} />
    </>
  );
}
