import type { Metadata } from 'next';
import { CateringForm } from '@/components/forms/CateringForm';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalButtonLink } from '@/components/primitives/Button';
import { PageHeader } from '@/components/primitives/PageHeader';
import { Eyebrow } from '@/components/primitives/Type';
import { pageCopy, seo } from '@/content/pages';
import { getCateringItems, getCateringPackages } from '@/content/resolve';
import { site } from '@/content/site';
import { formatPrice, formatPriceRange } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.catering!, path: '/catering' });
export const revalidate = 3600;

export default async function CateringPage() {
  const [packages, items] = await Promise.all([getCateringPackages(), getCateringItems()]);

  return (
    <>
      <PageHeader
        eyebrow={pageCopy.catering.eyebrow}
        heading={pageCopy.catering.heading}
        body={pageCopy.catering.body}
        actions={
          <ExternalButtonLink
            href={site.cateringOrderUrl}
            destination="Toast ordering"
            size="lg"
          >
            Order catering on Toast
          </ExternalButtonLink>
        }
      />

      {/* Packages as a full-width editorial table, not a card grid. */}
      <Band surface="linen">
        <Frame wide>
          <Eyebrow tone="orange">Party packages</Eyebrow>
          <ul className="mt-8 border-t-2 border-brown/25">
            {packages.map((pkg) => (
              <li key={pkg.id} className="border-b border-brown/15">
                <div className="grid gap-x-8 gap-y-3 py-7 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <h2 className="display text-[clamp(1.5rem,3vw,2.125rem)] text-brown">
                      {pkg.name}
                    </h2>
                    {pkg.servesMin ? (
                      <p className="tabular mt-2 text-[0.875rem] text-brown-soft">
                        Serves {formatPriceRange(pkg.servesMin, pkg.servesMax)}
                      </p>
                    ) : null}
                  </div>
                  <ul className="space-y-1 text-[0.9375rem] text-brown-soft sm:col-span-6">
                    {pkg.includes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className="tabular text-[1.375rem] font-semibold text-brown sm:col-span-2 sm:text-right">
                    {formatPrice(pkg.priceCents)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Frame>
      </Band>

      <Band surface="cream">
        <Frame>
          <Eyebrow>By the tray</Eyebrow>
          <ul className="mt-8 columns-1 gap-x-12 sm:columns-2">
            {items.map((item) => (
              <li key={item.id} className="mb-5 break-inside-avoid border-b border-brown/12 pb-4">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[0.9375rem] font-semibold text-brown">{item.name}</h3>
                  <p className="tabular shrink-0 text-[0.9375rem] font-semibold text-brown">
                    {formatPrice(item.priceCents)}
                  </p>
                </div>
                {item.note ? (
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-brown-soft">
                    {item.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="measure mt-6 text-[0.875rem] leading-relaxed text-brown-soft">
            {pageCopy.catering.note}
          </p>
        </Frame>
      </Band>

      <Band surface="sand" id="inquiry">
        <Frame>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <Eyebrow>Catering enquiry</Eyebrow>
              <h2 className="display mt-4 text-[clamp(1.75rem,3.5vw,2.5rem)] text-brown">
                Tell us what you need.
              </h2>
              <p className="measure mt-5 text-[0.9375rem] leading-relaxed text-brown">
                Send the date, the headcount, and roughly what you have in mind. Someone from Oasis
                will come back to you to confirm what we can do and what it costs.
              </p>
            </div>

            <div className="lg:col-span-7">
              <CateringForm
                phone={site.phone.value}
                packageNames={packages.map((p) => p.name)}
              />
            </div>
          </div>
        </Frame>
      </Band>
    </>
  );
}
