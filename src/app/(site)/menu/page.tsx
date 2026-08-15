import type { Metadata } from 'next';
import { Asset } from '@/components/media/Asset';
import { MenuExperience } from '@/components/menu/MenuExperience';
import { Frame } from '@/components/primitives/Band';
import { ExternalButtonLink } from '@/components/primitives/Button';
import { pageCopy, seo } from '@/content/pages';
import { getAllMenus } from '@/content/resolve';
import { site } from '@/content/site';
import type { AssetId } from '@/content/assets';
import { buildMetadata, JsonLd, menuJsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ ...seo.menu!, path: '/menu' });
export const revalidate = 3600;

/**
 * Three shallow crops instead of one large hero photograph.
 *
 * The point of the strip is range: this page holds a kitchen menu, a bar list
 * and a brunch service, and a single quesabirria still said "birria" and nothing
 * else. There is no approved brunch photograph in the repository, so the strip
 * is the strongest truthful food/food/bar set rather than a stock stand-in —
 * see docs/ASSET-HANDOFF.md for the outstanding brunch shot.
 */
const STRIP: AssetId[] = ['consommeDip', 'plateTorta', 'cocktailPour'];

/**
 * The complete menu, in one place.
 *
 * The masthead is deliberately short. What replaced it was a full landing-page
 * introduction — a near-empty cream field, a detached photograph, two buttons
 * and a paragraph explaining unlisted prices — which pushed the first actual
 * category below the fold on a 1440×900 screen. A visitor arriving at a menu is
 * there to read the menu: title, one sentence, one action, and the mode control
 * they are going to use first.
 */
export default async function MenuPage() {
  const menus = await getAllMenus();

  // The bar list is the only menu with items the restaurant does not publish a
  // price for, so its note belongs at the foot of the bar list — not in an
  // introduction every visitor has to read before seeing a dish.
  const unpricedIn = (slug: string) =>
    menus
      .find((menu) => menu.slug === slug)
      ?.categories.flatMap((category) => category.items)
      .some((item) => item.priceCents == null) ?? false;

  return (
    <>
      <section className="bg-ivory">
        <Frame>
          <div className="grid items-center gap-6 py-7 sm:grid-cols-12 sm:gap-10 lg:py-8">
            <div className="sm:col-span-7">
              <p className="eyebrow text-clay">{pageCopy.menu.eyebrow}</p>
              <h1 className="display mt-2.5 text-[clamp(1.875rem,3.6vw,2.75rem)] text-brown">
                {pageCopy.menu.heading}
              </h1>
              <p className="measure mt-2.5 text-[0.9375rem] leading-relaxed text-brown-soft">
                {pageCopy.menu.body}
              </p>
              {/* One action. Reserving a table is a header-level job on every
                  page; ordering is what this page is for. */}
              <div className="mt-5">
                <ExternalButtonLink href={site.orderUrl} destination="Toast ordering">
                  Order online
                </ExternalButtonLink>
              </div>
            </div>

            <ul className="grid grid-cols-3 gap-2 sm:col-span-5">
              {STRIP.map((id, index) => (
                <li key={id}>
                  <Asset
                    id={id}
                    className="aspect-square w-full"
                    sizes="(min-width: 640px) 14vw, 30vw"
                    priority={index === 0}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Frame>
      </section>

      <MenuExperience
        menus={menus}
        footNotes={{
          cocktails: unpricedIn('cocktails') ? pageCopy.menu.unpricedNote : undefined,
        }}
      />

      {menus.map((menu) => (
        <JsonLd key={menu.slug} data={menuJsonLd(menu)} />
      ))}
    </>
  );
}
