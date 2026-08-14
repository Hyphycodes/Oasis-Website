import type { Metadata } from 'next';
import { MenuView } from '@/components/menu/MenuView';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink, ExternalTextLink } from '@/components/primitives/Button';
import { PageHeader } from '@/components/primitives/PageHeader';
import { pageCopy, seo } from '@/content/pages';
import { getMenu } from '@/content/resolve';
import { site } from '@/content/site';
import { formatPhoneHref } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.brunch!, path: '/menu/brunch' });
export const revalidate = 3600;

/**
 * The brunch menu genuinely has no published items — the current site shows a
 * "Brunch Plates" heading with nothing behind it. Nothing is invented here. The
 * page states the service window honestly and gives a real way to find out what
 * the kitchen is running. See docs/CONTENT-QUESTIONS.md §6.
 */
export default async function BrunchPage() {
  const menu = await getMenu('brunch');

  return (
    <>
      <PageHeader
        surface="linen"
        eyebrow={pageCopy.brunch.eyebrow}
        heading={pageCopy.brunch.heading}
        body={menu.note ?? pageCopy.brunch.body}
        actions={
          <>
            <ButtonLink href="/menu">Food menu</ButtonLink>
            <ButtonLink href="/menu/cocktails" variant="secondary">
              Cocktails & bar
            </ButtonLink>
          </>
        }
      />

      <Band surface="cream">
        <MenuView menu={menu} />

        {menu.categories.length === 0 ? (
          <Frame>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.9375rem]">
              <a
                href={formatPhoneHref(site.phone.value)}
                className="tabular inline-flex min-h-11 items-center font-medium text-brown underline underline-offset-4"
              >
                Call {site.phone.value}
              </a>
              <ExternalTextLink
                href={site.reservationUrl}
                destination="Toast reservations"
                className="text-brown"
              >
                Reserve a table
              </ExternalTextLink>
            </div>
          </Frame>
        ) : null}
      </Band>
    </>
  );
}
