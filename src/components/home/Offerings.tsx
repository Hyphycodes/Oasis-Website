import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { AssetId } from '@/content/assets';
import type { PageSection } from '@/content/types';

/**
 * What you can get here — range, not a ranking.
 *
 * The previous section was headed "What we are known for: Birria, a torta, and a
 * margarita", which declared a permanent top three for a kitchen with 38 items
 * and a full bar. Six real categories replace it, each linking straight to its
 * own part of the menu.
 *
 * Two tiles are typographic rather than photographic. That is deliberate: there
 * is no approved photograph of the starters and no brunch photograph at all, and
 * a colour field with the category set in the display face is honest, whereas
 * reusing a birria shot to stand for either is not. See docs/ASSET-HANDOFF.md.
 */
type Tile = {
  label: string;
  note: string;
  href: string;
} & ({ assetId: AssetId } | { field: 'sand' | 'plum' });

const TILES: Tile[] = [
  {
    label: 'Quesabirrias',
    note: 'Crisped with cheese, consommé to dip',
    href: '/menu#specialty-tacos',
    assetId: 'dishQuesabirria',
  },
  {
    label: 'Plates & entrées',
    note: 'Fajitas, carne asada, tortas, pasta',
    href: '/menu#entrees',
    assetId: 'plateTorta',
  },
  {
    label: 'Starters',
    note: 'Wings, queso, street corn, nachos',
    href: '/menu#starters',
    field: 'sand',
  },
  {
    label: 'Margaritas',
    note: 'Six flavours, on the rocks or frozen',
    href: '/menu#classic-cocktails',
    assetId: 'cocktailPour',
  },
  {
    label: 'The bar',
    note: 'Tequila, beer, wine, towers, pitchers',
    href: '/menu#shareables',
    assetId: 'backBar',
  },
  {
    label: 'Weekend brunch',
    note: 'Saturday & Sunday, 10am–3pm',
    href: '/menu#brunch',
    field: 'plum',
  },
];

const FIELD = {
  sand: { surface: 'bg-sand grain', label: 'text-brown' },
  plum: { surface: 'bg-plum', label: 'text-night-text' },
} as const;

export function Offerings({ section }: { section: PageSection }) {
  if (!section.visible) return null;

  return (
    <Band surface="ivory" size="sm">
      <Frame wide>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div>
              {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
              <h2 className="display mt-2 text-[clamp(1.75rem,3vw,2.375rem)] text-brown">
                {section.heading}
              </h2>
              {section.body ? (
                <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-brown-soft">
                  {section.body}
                </p>
              ) : null}
            </div>
            <ButtonLink href="/menu" variant="secondary">
              See the full menu
            </ButtonLink>
          </div>
        </Reveal>

        {/* One strip, not six cards. Below `sm` it scrolls horizontally with snap
            points; above it, it is a plain grid. Either way each tile is a link,
            so keyboard focus moves through them and the browser scrolls the
            focused tile into view without any script. */}
        <Reveal delay={60}>
          <ul className="-mx-5 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden">
            {TILES.map((tile) => (
              <li
                key={tile.label}
                className="w-[45vw] max-w-[240px] shrink-0 snap-start sm:w-auto sm:max-w-none"
              >
                {/* The category name is set INSIDE the tile in both treatments,
                    so a photograph and a colour field carry it the same way and
                    nothing is stated twice. */}
                <Link href={tile.href} className="group block">
                  <div className="relative isolate overflow-hidden rounded-(--radius-lg)">
                    {'assetId' in tile ? (
                      <>
                        <Asset
                          id={tile.assetId}
                          className="aspect-3/4 w-full"
                          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 45vw"
                          rounded={false}
                        />
                        {/* Type over photography never relies on the photograph
                            being dark in the right place. */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-obsidian/90 to-transparent"
                        />
                      </>
                    ) : (
                      <div className={`aspect-3/4 w-full ${FIELD[tile.field].surface}`} />
                    )}
                    <p
                      className={`absolute inset-x-0 bottom-0 p-3.5 text-[clamp(1rem,1.4vw,1.25rem)] leading-none ${
                        'assetId' in tile ? 'display text-night-text' : `display ${FIELD[tile.field].label}`
                      }`}
                    >
                      {tile.label}
                    </p>
                  </div>
                  <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-brown-soft transition-colors group-hover:text-clay">
                    {tile.note}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </Frame>
    </Band>
  );
}
