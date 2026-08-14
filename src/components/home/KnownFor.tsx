import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { AssetId } from '@/content/assets';
import type { Menu, PageSection } from '@/content/types';
import { formatPrice } from '@/lib/format';

/**
 * What we're known for — three things, deliberately unalike.
 *
 * The previous trio was quesabirrias, the Bizza and birria ramen: three birria
 * dishes, which made a restaurant with 38 items look like it sells one. This is
 * one birria signature, one non-birria plate, and one drink — the widest honest
 * span of the menu that the available photography can actually support.
 *
 * Each entry is a real menu row, so names and prices come from the same data
 * /menu renders and cannot drift.
 */
const FEATURES: {
  id: string;
  menu: 'food' | 'cocktails';
  assetId: AssetId;
  kicker: string;
  note: string;
}[] = [
  {
    id: 'quesabirrias',
    menu: 'food',
    assetId: 'dishQuesabirria',
    kicker: 'The signature',
    note: 'Slow-braised birria, crisped with cheese, with consommé to dip.',
  },
  {
    id: 'torta',
    menu: 'food',
    assetId: 'plateTorta',
    kicker: 'From the kitchen',
    note: 'Toasted telera, avocado, melted cheese, your choice of meat.',
  },
  {
    // The house cocktail. Unpriced by every Oasis system, so the flavour list
    // carries it instead of a number — see docs/CONTENT-QUESTIONS.md §3.
    id: 'margarita',
    menu: 'cocktails',
    assetId: 'cocktailPour',
    kicker: 'From the bar',
    note: 'Cazadores, triple sec, fresh lime. Six flavours, on the rocks or frozen.',
  },
];

export function KnownFor({
  section,
  menus,
}: {
  section: PageSection;
  menus: { food: Menu; cocktails: Menu };
}) {
  if (!section.visible) return null;

  const items = FEATURES.map((entry) => {
    const item = menus[entry.menu].categories
      .flatMap((category) => category.items)
      .find((candidate) => candidate.id === entry.id);
    return item ? { ...entry, item } : null;
  }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (items.length === 0) return null;

  return (
    <Band surface="ivory">
      <Frame wide>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
              <h2 className="display mt-2 text-[clamp(1.75rem,3vw,2.375rem)] text-brown">
                {section.heading}
              </h2>
            </div>
            <ButtonLink href="/menu" variant="secondary">
              See the menu
            </ButtonLink>
          </div>
        </Reveal>

        <ul className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-3">
          {items.map((entry, index) => (
            <li key={entry.id}>
              <Reveal delay={index * 60}>
                <Asset
                  id={entry.assetId}
                  className="aspect-4/5 w-full"
                  sizes="(min-width: 640px) 30vw, 100vw"
                />
                <p className="eyebrow mt-4 text-clay">{entry.kicker}</p>
                <div className="mt-1.5 flex items-baseline justify-between gap-3">
                  <h3 className="text-[1.0625rem] font-semibold leading-snug text-brown">
                    {entry.item.name}
                  </h3>
                  {entry.item.priceCents != null ? (
                    <p className="tabular shrink-0 font-semibold text-brown">
                      {formatPrice(entry.item.priceCents)}
                    </p>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-brown-soft">
                  {entry.note}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Frame>
    </Band>
  );
}
