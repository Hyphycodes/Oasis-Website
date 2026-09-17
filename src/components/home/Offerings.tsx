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
 * One band now. Four photographs that all fit on the screen at once, so nothing
 * is hidden behind a swipe; the two weakest tiles (a colour field standing in
 * for Starters, another for Brunch, because neither has an approved
 * photograph — see docs/ASSET-HANDOFF.md) are gone rather than padding the
 * grid, and brunch survives where it is actually useful: as a fact, with its
 * hours, on the line under the grid.
 */
type Tile = {
  label: string;
  note: string;
  href: string;
  assetId: AssetId;
};

/** Four real photographs. The kitchen twice, then the bar twice. */
const TILES: Tile[] = [
  {
    label: 'Quesabirrias',
    note: 'Crisped with cheese, consommé to dip',
    href: '/menu#specialty-tacos',
    assetId: 'dishQuesabirria',
  },
  {
    label: 'Plates & entrées',
    note: 'Fajitas, carne asada, tortas',
    href: '/menu#entrees',
    assetId: 'plateTorta',
  },
  {
    label: 'Margaritas',
    note: 'Six flavours, rocks or frozen',
    href: '/menu#classic-cocktails',
    assetId: 'cocktailPour',
  },
  {
    label: 'The bar',
    note: 'Tequila, beer, wine, towers',
    href: '/menu#shareables',
    assetId: 'backBar',
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
                    <Asset
                      id={tile.assetId}
                      className="aspect-square w-full sm:aspect-3/4"
                      sizes="(min-width: 640px) 23vw, 46vw"
                      rounded={false}
                    />
                    {/* Type over photography never relies on the photograph
                        being dark in the right place. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-obsidian/90 to-transparent"
                    />
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

        {/* What the separate bar band existed to carry, compressed to a label
            and two facts. It keeps its own eyebrow and heading so the section
            stays something an editor can actually change and see change — the
            admin still lists it, and a control that does nothing is worse than
            no control. */}
        <Reveal delay={90}>
          <div className="mt-8 border-t border-brown/15 pt-5">
            {bar.visible ? (
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {bar.eyebrow ? <Eyebrow tone="orange">{bar.eyebrow}</Eyebrow> : null}
                <p className="display text-[1.125rem] text-brown">{bar.heading}</p>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.9375rem]">
              {bar.visible ? (
                <>
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-brown">Brunch</span>
                    <span className="tabular text-brown-soft">Sat &amp; Sun · 10am–3pm</span>
                  </p>
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-brown">Built to share</span>
                    <span className="text-brown-soft">Towers · Pitchers · Cantaritos</span>
                  </p>
                </>
              ) : null}
              <ButtonLink href="/menu" className="ml-auto">
                See the full menu
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Frame>
    </Band>
  );
}
