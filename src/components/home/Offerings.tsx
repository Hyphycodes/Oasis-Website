import Link from 'next/link';
import { ThemePhotoGuest } from '@/components/theme/ThemeWorld';
import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { AssetId } from '@/content/assets';
import type { PageSection } from '@/content/types';

/**
 * What you can get here — the kitchen and the bar, in ONE movement.
 *
 * This used to be two full bands: six category tiles in a horizontal scroller,
 * then a separate "Bar & brunch" band with two more photographs, its own
 * headline and its own pair of buttons. Between them they spent about 1100px
 * of a phone to say "we serve food and drinks, here is the menu" — and the
 * scroller hid half of what it offered, so the categories past the second one
 * were only ever found by accident.
 *
 * One band now, and four tiles that all fit on the screen at once, so nothing
 * is hidden behind a swipe.
 */
type Tile = {
  label: string;
  note: string;
  href: string;
} & ({ assetId: AssetId } | { field: 'sand' });

/**
 * FOUR GENERAL DOORS, not a menu in miniature.
 *
 * "Quesabirrias / Plates & entrées / Margaritas / The bar" named two dishes and
 * then split the bar in half, so a guest who wanted a drink had to decide which
 * of two cards meant drinks. These are the four things somebody actually
 * arrives wanting, each landing on the part of the menu that answers it.
 *
 * Brunch is a colour field rather than a photograph because there is no
 * approved brunch photograph, and standing a taco shot in for one would be a
 * small lie about what a weekend morning here looks like. It carries its hours
 * instead, which is the thing worth knowing. See docs/ASSET-HANDOFF.md.
 */
const TILES: Tile[] = [
  {
    label: 'Tacos',
    note: 'Birria, asada, carnitas, shrimp',
    href: '/menu#specialty-tacos',
    assetId: 'dishQuesabirria',
  },
  {
    label: 'Plates',
    note: 'Fajitas, carne asada, tortas, pasta',
    href: '/menu#entrees',
    assetId: 'plateTorta',
  },
  {
    label: 'Cocktails',
    note: 'Margaritas, towers, pitchers, beer',
    href: '/menu#cocktails',
    assetId: 'cocktailPour',
  },
  {
    label: 'Brunch',
    note: 'Saturday & Sunday · 10am–3pm',
    href: '/menu#brunch',
    field: 'sand',
  },
];

export function Offerings({ section, bar }: { section: PageSection; bar: PageSection }) {
  if (!section.visible) return null;

  return (
    <Band surface="ivory" size="sm">
      <Frame wide>
        <Reveal>
          <div className="max-w-2xl">
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
        </Reveal>

        {/* Two up on a phone, four across from `sm`. A plain grid, never a
            scroller: everything on offer is on the screen at once. */}
        <Reveal delay={60}>
          <ul className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <ThemePhotoGuest name="kitty" className="theme-photo-guest-raised" />
            {TILES.map((tile) => (
              <li key={tile.label}>
                <Link href={tile.href} className="group block">
                  <div className="relative isolate overflow-hidden rounded-(--radius-lg)">
                    {'assetId' in tile ? (
                      <>
                        <Asset
                          id={tile.assetId}
                          className="aspect-square w-full sm:aspect-3/4"
                          sizes="(min-width: 640px) 23vw, 46vw"
                          rounded={false}
                        />
                        {/* Type over photography never relies on the
                            photograph being dark in the right place. */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-obsidian/90 to-transparent"
                        />
                      </>
                    ) : (
                      <div className="grain aspect-square w-full bg-sand sm:aspect-3/4" />
                    )}
                    <p className="display absolute inset-x-0 bottom-0 p-3 text-[clamp(0.9375rem,1.4vw,1.25rem)] leading-none text-night-text">
                      {tile.label}
                    </p>
                  </div>
                  <p className="mt-2 text-[0.8125rem] leading-snug text-brown-soft transition-colors group-hover:text-clay">
                    {tile.note}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* One line and one button. The bar keeps its own editable eyebrow and
            heading rather than becoming a bare visibility toggle — a control
            that does nothing is worse than no control — but it no longer
            repeats what the Cocktails and Brunch cards just said. */}
        <Reveal delay={90}>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-brown/15 pt-5">
            {bar.visible ? (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {bar.eyebrow ? <Eyebrow tone="orange">{bar.eyebrow}</Eyebrow> : null}
                <p className="display text-[1.125rem] text-brown">{bar.heading}</p>
              </div>
            ) : null}
            <ButtonLink href="/menu" className="ml-auto">
              See the full menu
            </ButtonLink>
          </div>
        </Reveal>
      </Frame>
    </Band>
  );
}
