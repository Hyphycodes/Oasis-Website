import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Display, Eyebrow, Lead } from '@/components/primitives/Type';
import type { CateringPackage, PageSection } from '@/content/types';
import { formatPrice, formatPriceRange } from '@/lib/format';

/**
 * Catering is finally visible.
 *
 * On the live site this entire program — five named packages with real prices —
 * exists only inside the Toast ordering flow, reachable from nowhere in the
 * navigation. Real package names and real prices, nothing invented.
 */
export function CateringPromo({
  section,
  packages,
}: {
  section: PageSection;
  packages: CateringPackage[];
}) {
  if (!section.visible) return null;

  const featured = packages.slice(0, 3);

  return (
    <Band surface="cream">
      <Frame wide>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
            <Display as="h2" size="md" className="mt-4 text-brown">
              {section.heading}
            </Display>
            {section.body ? <Lead className="mt-5">{section.body}</Lead> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/catering">Catering packages</ButtonLink>
              <ButtonLink href="/private-events" variant="secondary">
                Host an event
              </ButtonLink>
            </div>

            <Asset
              id="privateEvents"
              className="mt-10 aspect-3/2 w-full"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </Reveal>

          <div className="lg:col-span-7">
            <ul className="divide-y divide-brown/15 border-y border-brown/15">
              {featured.map((pkg, index) => (
                <li key={pkg.id}>
                  <Reveal delay={index * 60}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-6">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[length:var(--text-heading)] font-semibold tracking-[-0.015em] text-brown">
                          {pkg.name}
                        </h3>
                        {pkg.servesMin ? (
                          <p className="tabular mt-1 text-[0.875rem] text-brown-soft">
                            Serves {formatPriceRange(pkg.servesMin, pkg.servesMax)}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[0.875rem] leading-relaxed text-brown-soft">
                          {pkg.includes.join(' · ')}
                        </p>
                      </div>
                      <p className="tabular shrink-0 text-[1.25rem] font-semibold text-brown">
                        {formatPrice(pkg.priceCents)}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.875rem] text-brown-soft">
              Plus taco, fajita and quesabirria trays, rice and beans by the tray, and salsa by the
              gallon.
            </p>
          </div>
        </div>
      </Frame>
    </Band>
  );
}
