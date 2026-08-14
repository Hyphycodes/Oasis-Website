import type { Metadata } from 'next';
import { AfterDark } from '@/components/home/AfterDark';
import { BarAndBrunch } from '@/components/home/BarAndBrunch';
import { CateringPromo } from '@/components/home/CateringPromo';
import { ExperienceGrid } from '@/components/home/ExperienceGrid';
import { Gallery } from '@/components/home/Gallery';
import { Hero } from '@/components/home/Hero';
import { SignaturePreview } from '@/components/home/SignaturePreview';
import { VisitStrip } from '@/components/home/VisitStrip';
import { homeSections, seo } from '@/content/pages';
import { getCateringPackages, getMenu } from '@/content/resolve';
import { getUpcomingEvents } from '@/lib/events';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.home!, path: '/' });

// Hourly: the open/closed indicator and the upcoming-events list both move.
export const revalidate = 3600;

function section(key: string) {
  return homeSections.find((s) => s.key === key)!;
}

export default async function HomePage() {
  const [foodMenu, packages] = await Promise.all([getMenu('food'), getCateringPackages()]);
  const events = getUpcomingEvents(new Date(), 3);

  return (
    <>
      <Hero />
      <ExperienceGrid section={section('experience')} />
      <SignaturePreview section={section('signatures')} menu={foodMenu} />
      <BarAndBrunch section={section('bar')} />
      <AfterDark section={section('after-dark')} events={events} />
      <CateringPromo section={section('catering')} packages={packages} />
      <Gallery section={section('gallery')} />
      <VisitStrip />
    </>
  );
}
