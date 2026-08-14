import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { Reveal } from '@/components/primitives/Reveal';
import { Display, Eyebrow } from '@/components/primitives/Type';
import type { PageSection } from '@/content/types';

/**
 * A restrained gallery — NOT a testimonial wall.
 *
 * No verified reviews exist for Oasis anywhere we can cite, so no testimonials
 * are shown. Real photographs of the room instead, at three different crops so
 * the row does not read as a card grid.
 */
export function Gallery({ section }: { section: PageSection }) {
  if (!section.visible) return null;

  return (
    <Band surface="linen">
      <Frame wide>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
              <Display as="h2" size="md" className="mt-4 text-brown">
                {section.heading}
              </Display>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Asset
              id="diningRoom"
              className="aspect-2/3 w-full"
              sizes="(min-width: 1024px) 40vw, 50vw"
            />
          </Reveal>
          <Reveal delay={70} className="lg:col-span-4 lg:mt-12">
            <Asset id="backBar" className="aspect-2/3 w-full" sizes="(min-width: 1024px) 32vw, 50vw" />
          </Reveal>
          <Reveal delay={140} className="col-span-2 lg:col-span-3 lg:mt-24">
            <Asset
              id="exteriorSign"
              className="aspect-4/3 w-full"
              sizes="(min-width: 1024px) 24vw, 100vw"
            />
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
}
