import type { Metadata } from 'next';
import { AfterDark, NightTicker } from '@/components/home/AfterDark';
import { Arrival } from '@/components/home/Arrival';
import { BarAndBrunch } from '@/components/home/BarAndBrunch';
import { ActionRail, Hero } from '@/components/home/Hero';
import { Signatures } from '@/components/home/Signatures';
import { TwoPaths } from '@/components/home/TwoPaths';
import { homeSections, seo } from '@/content/pages';
import { getCateringPackages, getMenu } from '@/content/resolve';
import { site } from '@/content/site';
import { getUpcomingEvents } from '@/lib/events';
import { getOpenState } from '@/lib/hours';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.home!, path: '/' });

// Hourly: the open/closed state and the next event both move.
export const revalidate = 3600;

function section(key: string) {
  return homeSections.find((s) => s.key === key)!;
}

/**
 * Homepage — the journey is: room → food → bar → night → party → arrival.
 *
 * Deliberately shorter than the previous build. The old page repeated the
 * restaurant description in three sections and carried an "experience grid"
 * that only restated the navigation; both are gone. Every section now earns its
 * height with either real photography or real data.
 */
export default async function HomePage() {
  const now = new Date();
  const [foodMenu, packages] = await Promise.all([getMenu('food'), getCateringPackages()]);
  const events = getUpcomingEvents(now, 6);
  const openState = getOpenState(site.hours.value, site.temporaryClosures, now, site.timeZone);

  return (
    <>
      <Hero nextEvent={events[0] ?? null} />
      <ActionRail openLabel={openState.label} isOpen={openState.open} />
      <Signatures section={section('signatures')} menu={foodMenu} />
      <BarAndBrunch section={section('bar')} />
      <AfterDark section={section('after-dark')} events={events} />
      <NightTicker />
      <TwoPaths section={section('two-paths')} packages={packages} />
      <Arrival />
    </>
  );
}
