import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalTextLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import { site } from '@/content/site';
import type { CateringPackage, PageSection } from '@/content/types';
import { formatPhoneHref, formatPrice, formatPriceRange } from '@/lib/format';
import { groupHours } from '@/lib/hours';

/**
 * Catering, celebrations and arrival — merged into one closing movement.
 *
 * These were three separate full-height sections that each repeated the address
 * or an address-adjacent CTA. Combining them removes roughly a screen and a half
 * of scrolling and stops the page ending on its third repetition of the same
 * information. Hours appear here once; the footer no longer repeats them.
 */
export function CateringAndVisit({
  section,
  packages,
}: {
  section: PageSection;
  packages: CateringPackage[];
}) {
  const groups = groupHours(site.hours.value);
  const featured = packages.slice(0, 3);

  return (
    <Band surface="ivory">
      <Frame wide>
        {section.visible ? (
          <>
            <Reveal>
              <div className="max-w-2xl">
                {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
                <h2 className="display mt-2 text-[clamp(1.75rem,3vw,2.375rem)] text-brown">
                  {section.heading}
                </h2>
              </div>
            </Reveal>

            <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
              {/* Take it with you. */}
              <Reveal>
                <Link href="/catering" className="group block">
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-brown pb-2.5">
                    <h3 className="display text-[1.375rem] text-brown transition-colors group-hover:text-coral">
                      Feed the party
                    </h3>
                    <span className="eyebrow shrink-0 text-clay">Pickup</span>
                  </div>
                  <ul className="mt-3">
                    {featured.map((pkg) => (
                      <li
                        key={pkg.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-brown/12 py-2.5 text-[0.9375rem]"
                      >
                        <span className="font-medium text-brown">{pkg.name}</span>
                        <span className="tabular text-[0.8125rem] text-brown-soft">
                          Serves {formatPriceRange(pkg.servesMin, pkg.servesMax)}
                        </span>
                        <span className="tabular font-semibold text-brown">
                          {formatPrice(pkg.priceCents)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-clay underline underline-offset-4 group-hover:underline-offset-[6px]">
                    Catering packages
                  </p>
                </Link>
              </Reveal>

              {/* Bring it here. */}
              <Reveal delay={70}>
                <Link href="/private-events" className="group block">
                  <div className="flex items-baseline justify-between gap-4 border-b-2 border-brown pb-2.5">
                    <h3 className="display text-[1.375rem] text-brown transition-colors group-hover:text-coral">
                      Bring the party here
                    </h3>
                    <span className="eyebrow shrink-0 text-clay">In the room</span>
                  </div>
                  <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-brown-soft">
                    Birthdays, quinceañeras and everything worth making noise about — dessert, the
                    staff song, the LED show and a confetti popper.
                  </p>
                  <Asset
                    id="roomCrowd"
                    className="mt-4 aspect-3/2 w-full"
                    sizes="(min-width: 1024px) 46vw, 100vw"
                  />
                  <p className="mt-3 inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-clay underline underline-offset-4 group-hover:underline-offset-[6px]">
                    Plan a celebration
                  </p>
                </Link>
              </Reveal>
            </div>
          </>
        ) : null}

        {/* Arrival. The one place hours and address appear on the homepage. */}
        <Reveal>
          <div className="mt-12 grid gap-8 border-t border-brown/15 pt-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Eyebrow>Find us</Eyebrow>
              <p className="display mt-2 text-[clamp(1.5rem,2.4vw,1.875rem)] text-brown">
                {site.street}
                <br />
                {site.locality}, {site.region}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-[0.9375rem]">
                <ExternalTextLink
                  href={site.directionsUrl}
                  destination="Google Maps"
                  className="text-brown"
                >
                  Get directions
                </ExternalTextLink>
                <a
                  href={formatPhoneHref(site.phone.value)}
                  className="tabular inline-flex min-h-11 items-center text-brown underline underline-offset-4"
                >
                  {site.phone.value}
                </a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Eyebrow>Hours</Eyebrow>
              <dl className="mt-3 text-[0.9375rem]">
                {groups.map((group) => (
                  <div key={group.label} className="flex justify-between gap-4 py-1">
                    <dt className="text-brown-soft">{group.label}</dt>
                    <dd className="tabular text-brown">{group.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="lg:col-span-4">
              <Asset
                id="exteriorSign"
                className="aspect-16/9 w-full"
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
            </div>
          </div>
        </Reveal>
      </Frame>
    </Band>
  );
}
