import type { Metadata } from 'next';
import { Asset } from '@/components/media/Asset';
import { MenuTabs } from '@/components/menu/MenuTabs';
import { Frame } from '@/components/primitives/Band';
import { ExternalButtonLink } from '@/components/primitives/Button';
import { Eyebrow } from '@/components/primitives/Type';
import { pageCopy, seo } from '@/content/pages';
import { getAllMenus } from '@/content/resolve';
import { site } from '@/content/site';
import { buildMetadata, JsonLd, menuJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.menu!, path: '/menu' });
export const revalidate = 3600;

/**
 * The complete menu, in one place.
 *
 * Food, Cocktails & Bar and Brunch were three routes with three full-page
 * introductions. They are now three tabs on this page, and the introduction is
 * a single compact band — a strip of type beside one food image, not a
 * near-empty screen the visitor has to scroll past to reach a price.
 */
export default async function MenuPage() {
  const menus = await getAllMenus();
  const unpriced = menus
    .flatMap((menu) => menu.categories.flatMap((c) => c.items))
    .filter((item) => item.priceCents == null).length;

  return (
    <>
      {/* Compact intro: fits well inside 420–620px, media included. */}
      <section className="border-b border-brown/12 bg-ivory">
        <Frame wide>
          <div className="grid items-center gap-6 py-8 sm:grid-cols-12 sm:gap-8 lg:py-10">
            <div className="sm:col-span-8">
              <Eyebrow tone="orange">{pageCopy.menu.eyebrow}</Eyebrow>
              <h1 className="display mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] text-brown">
                {pageCopy.menu.heading}
              </h1>
              <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-brown-soft">
                {pageCopy.menu.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ExternalButtonLink href={site.orderUrl} destination="Toast ordering">
                  Order online
                </ExternalButtonLink>
                <ExternalButtonLink
                  href={site.reservationUrl}
                  destination="Toast reservations"
                  variant="secondary"
                >
                  Reserve a table
                </ExternalButtonLink>
              </div>
            </div>

            <div className="sm:col-span-4">
              <Asset
                id="consommeDip"
                className="aspect-3/2 w-full sm:aspect-4/3"
                sizes="(min-width: 640px) 30vw, 100vw"
                priority
              />
            </div>
          </div>
        </Frame>
      </section>

      <MenuTabs menus={menus} />

      {unpriced > 0 ? (
        <section className="border-t border-brown/12 bg-ivory-deep py-8">
          <Frame>
            <p className="measure text-[0.875rem] leading-relaxed text-brown-soft">
              A few things on the bar list are priced by the pour or by the bottle. Where a price is
              not shown, ask your server — we would rather tell you than print a number that moves.
            </p>
          </Frame>
        </section>
      ) : null}

      {menus.map((menu) => (
        <JsonLd key={menu.slug} data={menuJsonLd(menu)} />
      ))}
    </>
  );
}
