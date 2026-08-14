import type { Metadata } from 'next';
import { Band, Frame } from '@/components/primitives/Band';
import { PageHeader } from '@/components/primitives/PageHeader';
import { seo } from '@/content/pages';
import { site } from '@/content/site';
import { formatPhoneHref } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.privacy!, path: '/legal/privacy' });

/**
 * Describes what this site ACTUALLY does. No analytics is configured, so this
 * page says there is no analytics — and that is why there is no cookie banner.
 * If analytics is added later, this page must be updated in the same change.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        heading="What we do with your information."
        body="Short version: we only use what you send us to reply to you."
      />

      <Band surface="cream">
        <Frame>
          <div className="measure space-y-8 text-[0.9375rem] leading-relaxed text-brown-soft">
            <section>
              <h2 className="text-[length:var(--text-heading)] font-semibold text-brown">
                What we collect
              </h2>
              <p className="mt-3">
                Only what you type into a form on this site — your name, email, phone number, and
                the details of your catering enquiry, event enquiry, or job application. We do not
                ask for payment details anywhere on this website.
              </p>
            </section>

            <section>
              <h2 className="text-[length:var(--text-heading)] font-semibold text-brown">
                What we do with it
              </h2>
              <p className="mt-3">
                We use it to reply to you and to plan the thing you asked about. We do not sell it,
                rent it, or share it with advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-[length:var(--text-heading)] font-semibold text-brown">
                Cookies and tracking
              </h2>
              <p className="mt-3">
                This website runs no analytics, no advertising pixels, and no third-party tracking
                cookies. That is why you were not asked to accept any. The only browser storage we
                use is what the site needs to work.
              </p>
            </section>

            <section>
              <h2 className="text-[length:var(--text-heading)] font-semibold text-brown">
                Other services
              </h2>
              <p className="mt-3">
                Reservations, online ordering, and event tickets are handled by companies other than
                us. When you follow one of those links you leave this website and their own privacy
                terms apply. We have marked every one of those links so you know before you click.
              </p>
            </section>

            <section>
              <h2 className="text-[length:var(--text-heading)] font-semibold text-brown">
                Getting your information removed
              </h2>
              <p className="mt-3">
                Call us at{' '}
                <a
                  href={formatPhoneHref(site.phone.value)}
                  className="tabular text-brown underline underline-offset-4"
                >
                  {site.phone.value}
                </a>{' '}
                or ask for a manager in person and we will delete what you sent us.
              </p>
            </section>

            <p className="border-t border-brown/15 pt-6 text-[0.8125rem]">
              {site.name}, {site.street}, {site.locality}, {site.region} {site.postalCode}.
            </p>
          </div>
        </Frame>
      </Band>
    </>
  );
}
