import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalTextLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import { site } from '@/content/site';
import type { PageSection } from '@/content/types';
import { formatPhoneHref } from '@/lib/format';
import { groupHours } from '@/lib/hours';

/**
 * How to get here — the last thing the homepage says.
 *
 * This replaces a closing band that ran about 1470px on a phone: a catering
 * headline, a list of three catering packages with their serving ranges, a
 * private-events blurb with a photograph of its own, and only then the address
 * and the hours. Catering and celebrations are real parts of the business, but
 * they are not what a homepage visitor is here to do, and both already have a
 * whole page, a nav item and a footer link. They keep one line each at the
 * bottom of this block, which is the right weight for a homepage, and the
 * arrival details — the thing people actually open a restaurant's site for —
 * get to the top of it instead of the end.
 */
export function FindUs({ section }: { section: PageSection }) {
  const groups = groupHours(site.hours.value);

  return (
    <Band surface="ivory">
      <Frame wide>
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
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

        {/* One line, not two. Celebrations now have a section of their own
            further up the page, so repeating them here would be the third time
            the homepage points at the same form. Catering is the one that is
            still only reachable from the nav. */}
        {section.visible ? (
          <Reveal delay={60}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-brown/15 pt-6">
              {section.eyebrow ? (
                <span className="eyebrow text-clay">{section.eyebrow}</span>
              ) : null}
              <Link
                href="/catering"
                className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-brown underline underline-offset-4 hover:text-coral hover:underline-offset-[6px]"
              >
                Feed the party — catering packages
              </Link>
            </div>
          </Reveal>
        ) : null}
      </Frame>
    </Band>
  );
}
