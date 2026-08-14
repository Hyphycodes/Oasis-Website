import { Band, Frame } from '@/components/primitives/Band';
import { ExternalTextLink } from '@/components/primitives/Button';
import { Display, Eyebrow } from '@/components/primitives/Type';
import { site } from '@/content/site';
import { formatPhoneHref } from '@/lib/format';
import { getOpenState, groupHours } from '@/lib/hours';

/**
 * Hours and address, above the footer rather than only inside it.
 *
 * "Are you open?" is the most-asked question about a restaurant and the current
 * site answers it last, in small type, on every page.
 */
export function VisitStrip() {
  const groups = groupHours(site.hours.value);
  // Computed at request time on the server; the page revalidates hourly.
  const state = getOpenState(site.hours.value, site.temporaryClosures, new Date(), site.timeZone);

  return (
    <Band surface="sand" size="sm">
      <Frame wide>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Eyebrow>Find us</Eyebrow>
            <Display as="h2" size="md" className="mt-4 text-brown">
              {site.street}
              <br />
              {site.locality}, {site.region}
            </Display>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.9375rem]">
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

          <div className="lg:col-span-4 lg:col-start-7">
            <div className="flex items-center gap-2">
              <Eyebrow>Hours</Eyebrow>
              <span
                className={`inline-flex items-center gap-1.5 text-[0.75rem] font-semibold ${
                  state.open ? 'text-success' : 'text-brown-soft'
                }`}
              >
                {/* Status is text first; the dot is redundant reinforcement, not
                    the only signal. */}
                <span
                  aria-hidden="true"
                  className={`inline-block size-1.5 rounded-full ${
                    state.open ? 'bg-success' : 'bg-brown-soft'
                  }`}
                />
                {state.label}
              </span>
            </div>
            <dl className="mt-4 space-y-1.5 text-[0.9375rem]">
              {groups.map((group) => (
                <div key={group.label} className="flex justify-between gap-4">
                  <dt className="text-brown">{group.label}</dt>
                  <dd className="tabular text-brown">{group.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Frame>
    </Band>
  );
}
