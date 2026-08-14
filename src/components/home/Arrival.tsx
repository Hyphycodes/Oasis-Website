import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalButtonLink, ExternalTextLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import { site } from '@/content/site';
import { formatPhoneHref } from '@/lib/format';
import { getOpenState, groupHours } from '@/lib/hours';

/**
 * Arrival — the page ends where the visit starts.
 *
 * Address, hours, open state, directions and phone, next to the building itself.
 * The footer deliberately does NOT repeat the hours table any more; carrying it
 * twice was most of the old page's excess length.
 */
export function Arrival() {
  const groups = groupHours(site.hours.value);
  const state = getOpenState(site.hours.value, site.temporaryClosures, new Date(), site.timeZone);

  return (
    <Band surface="cream">
      <Frame wide>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>Find us</Eyebrow>
            <h2 className="display mt-4 text-[clamp(2.25rem,5vw,3.5rem)] text-brown">
              {site.street}
              <br />
              {site.locality}, {site.region}
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ExternalButtonLink href={site.directionsUrl} destination="Google Maps">
                Get directions
              </ExternalButtonLink>
              <a
                href={formatPhoneHref(site.phone.value)}
                className="tabular inline-flex min-h-11 items-center justify-center rounded-(--radius-md) border border-brown/30 px-5 font-semibold text-brown transition-colors hover:bg-brown/8"
              >
                {site.phone.value}
              </a>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-2 rounded-full ${state.open ? 'bg-success' : 'bg-brown-soft'}`}
              />
              <p className={`font-semibold ${state.open ? 'text-success' : 'text-brown-soft'}`}>
                {state.label}
              </p>
            </div>

            <dl className="mt-4 max-w-sm border-t border-brown/15 text-[0.9375rem]">
              {groups.map((group) => (
                <div
                  key={group.label}
                  className="flex justify-between gap-6 border-b border-brown/15 py-2.5"
                >
                  <dt className="text-brown-soft">{group.label}</dt>
                  <dd className="tabular text-brown">{group.value}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-6 flex flex-wrap gap-x-6 text-[0.9375rem]">
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
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6 lg:col-start-7 lg:gap-6">
            <Reveal className="sm:col-span-2">
              <Asset
                id="exteriorSign"
                className="aspect-16/9 w-full"
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
            </Reveal>
            <Reveal delay={70}>
              <Asset
                id="diningRoom"
                className="aspect-2/3 w-full"
                sizes="(min-width: 1024px) 24vw, 50vw"
              />
            </Reveal>
            <Reveal delay={140} className="mt-6">
              <Asset
                id="backBar"
                className="aspect-2/3 w-full"
                sizes="(min-width: 1024px) 24vw, 50vw"
              />
            </Reveal>
          </div>
        </div>
      </Frame>
    </Band>
  );
}
