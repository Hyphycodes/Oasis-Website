import type { Metadata } from 'next';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalButtonLink, ExternalTextLink } from '@/components/primitives/Button';
import { Display, Eyebrow } from '@/components/primitives/Type';
import { pageCopy, seo } from '@/content/pages';
import { site } from '@/content/site';
import { formatPhoneHref } from '@/lib/format';
import { getOpenState, groupHours } from '@/lib/hours';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.visit!, path: '/visit' });

// Hourly — the open/closed state changes through the day.
export const revalidate = 3600;

export default function VisitPage() {
  const groups = groupHours(site.hours.value);
  const state = getOpenState(site.hours.value, site.temporaryClosures, new Date(), site.timeZone);

  return (
    <>
      <Band surface="sand" size="sm">
        <Frame wide>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <Eyebrow>{pageCopy.visit.eyebrow}</Eyebrow>
              <Display as="h1" size="lg" className="mt-4 text-brown">
                {site.street}
                <br />
                {site.locality}, {site.region} {site.postalCode}
              </Display>
              <p className="measure-lead mt-5 text-[length:var(--text-body-lg)] leading-relaxed text-brown">
                {pageCopy.visit.body}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ExternalButtonLink href={site.directionsUrl} destination="Google Maps" size="lg">
                  Get directions
                </ExternalButtonLink>
                <a
                  href={formatPhoneHref(site.phone.value)}
                  className="tabular inline-flex min-h-11 items-center justify-center rounded-(--radius-md) border border-brown/25 px-7 py-3.5 font-semibold text-brown transition-colors hover:bg-brown/8"
                >
                  {site.phone.value}
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <ExternalButtonLink href={site.reservationUrl} destination="Toast reservations">
                  Reserve a table
                </ExternalButtonLink>
                <ExternalButtonLink
                  href={site.orderUrl}
                  destination="Toast ordering"
                  variant="secondary"
                >
                  Order online
                </ExternalButtonLink>
              </div>
            </div>

            <div className="lg:col-span-5 lg:col-start-8">
              <Asset
                id="exteriorSign"
                className="aspect-4/3 w-full"
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
              />
              {/* No interactive map embed: it would load a third-party script and
                  cost a network round trip before the guest has shown any intent.
                  "Get directions" opens the real map when they actually want it. */}
            </div>
          </div>
        </Frame>
      </Band>

      <Band surface="cream">
        <Frame wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow>Hours</Eyebrow>
                <span
                  className={`inline-flex items-center gap-1.5 text-[0.75rem] font-semibold ${
                    state.open ? 'text-success' : 'text-brown-soft'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block size-1.5 rounded-full ${
                      state.open ? 'bg-success' : 'bg-brown-soft'
                    }`}
                  />
                  {state.label}
                </span>
              </div>

              <dl className="mt-6 border-t border-brown/15">
                {groups.map((group) => (
                  <div
                    key={group.label}
                    className="flex justify-between gap-6 border-b border-brown/15 py-3.5"
                  >
                    <dt className="text-brown-soft">{group.label}</dt>
                    <dd className="tabular font-medium text-brown">{group.value}</dd>
                  </div>
                ))}
              </dl>

              {site.hours.provisional ? (
                <p className="measure mt-4 text-[0.8125rem] leading-relaxed text-brown-soft">
                  Kitchen and bar hours can shift on holidays and event nights — call ahead if you
                  are making a special trip.
                </p>
              ) : null}
            </div>

            <div className="lg:col-span-3 lg:col-start-7">
              <Eyebrow>Getting here</Eyebrow>
              <address className="mt-6 not-italic leading-relaxed text-brown">
                <span className="block font-medium">{site.name}</span>
                <span className="block">{site.street}</span>
                <span className="block">
                  {site.locality}, {site.region} {site.postalCode}
                </span>
              </address>
              <div className="mt-4 flex flex-col gap-2 text-[0.9375rem]">
                <ExternalTextLink
                  href={site.directionsUrl}
                  destination="Google Maps"
                  className="text-brown"
                >
                  Open in Google Maps
                </ExternalTextLink>
                <a
                  href={formatPhoneHref(site.phone.value)}
                  className="tabular inline-flex min-h-11 items-center text-brown underline underline-offset-4"
                >
                  {site.phone.value}
                </a>
              </div>
            </div>

            <div className="lg:col-span-3 lg:col-start-10">
              <Eyebrow>Follow</Eyebrow>
              <ul className="mt-6 space-y-2 text-[0.9375rem]">
                {site.socials.map((social) => (
                  <li key={social.platform}>
                    <ExternalTextLink
                      href={social.url}
                      destination={social.platform}
                      className="text-brown"
                    >
                      {social.handle}
                    </ExternalTextLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Frame>
      </Band>
    </>
  );
}
