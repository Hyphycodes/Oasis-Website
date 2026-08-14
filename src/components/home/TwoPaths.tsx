import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { CateringPackage, PageSection } from '@/content/types';
import { formatPrice, formatPriceRange } from '@/lib/format';

/**
 * Two paths, stated as a choice.
 *
 * The old section blurred catering and private events into one block. They are
 * different intentions — take the food somewhere else, or bring the party here —
 * so they get two panels, one action each, and visibly different treatments:
 * the catering side leads with real prices, the celebration side with the room.
 */
export function TwoPaths({
  section,
  packages,
}: {
  section: PageSection;
  packages: CateringPackage[];
}) {
  if (!section.visible) return null;

  const featured = packages.slice(0, 3);

  return (
    <Band surface="linen">
      <Frame wide>
        <Reveal>
          <div className="max-w-3xl">
            {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
            <h2 className="display mt-4 text-[clamp(2.25rem,5.5vw,4rem)] text-brown">
              {section.heading}
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-12">
          {/* ---------------------------------------------- feed the party */}
          <Reveal>
            <Link href="/catering" className="group flex h-full flex-col">
              <div className="flex items-baseline justify-between gap-4 border-b-2 border-brown pb-3">
                <h3 className="display text-[clamp(1.75rem,3.5vw,2.5rem)] text-brown transition-colors group-hover:text-clay">
                  Feed the party
                </h3>
                <span className="eyebrow shrink-0 text-clay">Pickup</span>
              </div>

              <p className="measure mt-4 text-[0.9375rem] leading-relaxed text-brown-soft">
                Taco trays, fajita trays and quesabirria by the forty. Packages that feed a room
                without anybody cooking.
              </p>

              <ul className="mt-6 flex-1 border-t border-brown/15">
                {featured.map((pkg) => (
                  <li
                    key={pkg.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-brown/15 py-3"
                  >
                    <span className="font-medium text-brown">{pkg.name}</span>
                    <span className="tabular text-[0.875rem] text-brown-soft">
                      Serves {formatPriceRange(pkg.servesMin, pkg.servesMax)}
                    </span>
                    <span className="tabular font-semibold text-brown">
                      {formatPrice(pkg.priceCents)}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 inline-flex min-h-11 items-center font-semibold text-clay underline underline-offset-4 group-hover:underline-offset-[6px]">
                See catering packages
              </p>
            </Link>
          </Reveal>

          {/* --------------------------------------- bring the party here */}
          <Reveal delay={80}>
            <Link href="/private-events" className="group flex h-full flex-col">
              <div className="flex items-baseline justify-between gap-4 border-b-2 border-brown pb-3">
                <h3 className="display text-[clamp(1.75rem,3.5vw,2.5rem)] text-brown transition-colors group-hover:text-clay">
                  Bring the party here
                </h3>
                <span className="eyebrow shrink-0 text-clay">In the room</span>
              </div>

              <p className="measure mt-4 text-[0.9375rem] leading-relaxed text-brown-soft">
                Birthdays, quinceañeras and everything worth making noise about — dessert, the
                staff song, the LED show and a confetti popper.
              </p>

              <div className="mt-6 flex-1">
                <Asset
                  id="roomCrowd"
                  className="aspect-3/2 w-full"
                  sizes="(min-width: 1024px) 46vw, 100vw"
                />
              </div>

              <p className="mt-6 inline-flex min-h-11 items-center font-semibold text-clay underline underline-offset-4 group-hover:underline-offset-[6px]">
                Plan a celebration
              </p>
            </Link>
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
}
