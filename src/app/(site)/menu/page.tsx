import type { Metadata } from 'next';
import { MenuView } from '@/components/menu/MenuView';
import { Band, Frame } from '@/components/primitives/Band';
import { ExternalButtonLink, ButtonLink } from '@/components/primitives/Button';
import { PageHeader } from '@/components/primitives/PageHeader';
import { pageCopy, seo } from '@/content/pages';
import { getMenu } from '@/content/resolve';
import { site } from '@/content/site';
import { buildMetadata, JsonLd, menuJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.menu!, path: '/menu' });
export const revalidate = 3600;

export default async function MenuPage() {
  const menu = await getMenu('food');
  const unpriced = menu.categories.flatMap((c) => c.items).filter((i) => i.priceCents == null).length;

  return (
    <>
      <PageHeader
        eyebrow={pageCopy.menu.eyebrow}
        heading={pageCopy.menu.heading}
        body={pageCopy.menu.body}
        actions={
          <>
            <ExternalButtonLink href={site.orderUrl} destination="Toast ordering">
              Order online
            </ExternalButtonLink>
            <ButtonLink href="/menu/cocktails" variant="secondary">
              Cocktails & bar
            </ButtonLink>
            <ButtonLink href="/menu/brunch" variant="secondary">
              Brunch
            </ButtonLink>
          </>
        }
      />

      <Band surface="cream" size="flush">
        <MenuView menu={menu} />
      </Band>

      {unpriced > 0 ? (
        <Band surface="linen" size="sm">
          <Frame>
            <p className="measure text-[0.875rem] leading-relaxed text-brown-soft">
              Some dishes are priced by the market or by your choice of protein. Where a price is
              not listed, ask your server — we would rather tell you than print a number that
              changes.
            </p>
          </Frame>
        </Band>
      ) : null}

      <JsonLd data={menuJsonLd(menu)} />
    </>
  );
}
