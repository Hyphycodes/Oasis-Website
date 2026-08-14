import type { Metadata } from 'next';
import { CareersForm } from '@/components/forms/CareersForm';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { Display, Eyebrow } from '@/components/primitives/Type';
import { pageCopy, seo } from '@/content/pages';
import { site } from '@/content/site';
import { formatPhoneHref } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.careers!, path: '/careers' });

/** Positions are drawn from the roles a restaurant of this shape actually runs.
 *  "Something else" exists so nobody is turned away by a list. */
const POSITIONS = [
  'Server',
  'Bartender',
  'Host',
  'Busser',
  'Line cook',
  'Prep cook',
  'Dishwasher',
  'Barback',
  'Security',
  'Something else',
];

export default function CareersPage() {
  return (
    <>
      <Band surface="sand" size="sm">
        <Frame wide>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-6">
              <Eyebrow>{pageCopy.careers.eyebrow}</Eyebrow>
              <Display as="h1" size="xl" className="mt-3 text-brown">
                {pageCopy.careers.heading}
              </Display>
              <p className="measure-lead mt-6 text-[length:var(--text-body-lg)] leading-relaxed text-brown">
                {pageCopy.careers.body}
              </p>
              <a
                href="#apply"
                className="mt-8 inline-flex min-h-11 items-center justify-center rounded-(--radius-md) bg-orange px-7 py-3.5 font-semibold tracking-[0.02em] text-on-orange transition-colors hover:bg-orange-deep"
              >
                View openings
              </a>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <Asset
                id="teamEnergy"
                className="aspect-3/2 w-full"
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
              />
            </div>
          </div>
        </Frame>
      </Band>

      <Band surface="cream">
        <Frame>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <Eyebrow tone="orange">{pageCopy.careers.energyHeading}</Eyebrow>
              <ul className="mt-6 space-y-2">
                {pageCopy.careers.perks.map((perk) => (
                  <li
                    key={perk}
                    className="text-[length:var(--text-display-md)] font-semibold leading-tight tracking-[-0.025em] text-brown [font-variation-settings:'wdth'_104]"
                  >
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="measure text-[length:var(--text-body-lg)] leading-relaxed text-brown-soft">
                {pageCopy.careers.energyBody}
              </p>
              <p className="eyebrow mt-8 text-clay">{pageCopy.careers.marquee}</p>
            </div>
          </div>
        </Frame>
      </Band>

      <Band surface="linen" id="apply">
        <Frame>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <Eyebrow>Apply</Eyebrow>
              <h2 className="mt-4 text-[length:var(--text-display-md)] font-semibold leading-none tracking-[-0.025em] text-brown [font-variation-settings:'wdth'_104]">
                Join the familia.
              </h2>
              <p className="measure mt-5 text-[0.9375rem] leading-relaxed text-brown-soft">
                Fill this in and someone from Oasis will reach out if it looks like a fit. You can
                also stop by in person or call us at{' '}
                <a
                  href={formatPhoneHref(site.phone.value)}
                  className="tabular text-brown underline underline-offset-4"
                >
                  {site.phone.value}
                </a>
                .
              </p>
            </div>

            <div className="lg:col-span-7">
              <CareersForm phone={site.phone.value} positions={POSITIONS} />
            </div>
          </div>
        </Frame>
      </Band>
    </>
  );
}
