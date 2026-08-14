import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { AssetId } from '@/content/assets';
import type { Menu, PageSection } from '@/content/types';
import { formatPrice } from '@/lib/format';

/**
 * The three Oasis originals, told visually.
 *
 * Two of the three now have real photography pulled from the restaurant's own
 * reel — a plate of quesabirrias with consommé, and the consommé dip itself.
 * The Bizza and the ramen have none, so rather than three near-identical cards
 * the composition is deliberately uneven: the photographed dishes get large
 * portrait crops, and the unphotographed one is carried by type at the same
 * visual weight. Nothing reads as a gap.
 */
/**
 * Only the quesabirrias have a photograph of the actual dish. The Bizza and the
 * birria ramen get the typographic treatment rather than a picture of something
 * else — a taco being dipped is a lovely image, but captioning it "Birria Ramen"
 * would be a lie told in pixels.
 */
const SIGNATURES: { id: string; assetId: AssetId | null; note: string }[] = [
  { id: 'quesabirrias', assetId: 'dishQuesabirria', note: 'Dip it. That is the whole point.' },
  { id: 'bizza', assetId: null, note: 'Birria, on a pizza. Only here.' },
  { id: 'birria-ramen', assetId: null, note: 'Ramen, but make it birria.' },
];

export function Signatures({ section, menu }: { section: PageSection; menu: Menu }) {
  if (!section.visible) return null;

  const items = SIGNATURES.map((entry) => {
    const item = menu.categories.flatMap((c) => c.items).find((i) => i.id === entry.id);
    return item ? { ...entry, item } : null;
  }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (items.length === 0) return null;

  return (
    <Band surface="cream">
      <Frame wide>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
              <h2 className="display mt-4 max-w-[14ch] text-[clamp(2.25rem,5.5vw,4rem)] text-brown">
                {section.heading}
              </h2>
            </div>
            <ButtonLink href="/menu" variant="secondary">
              Full menu
            </ButtonLink>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12">
          {items.map((entry, index) => {
            // 5 / 4 / 3 of twelve, with the middle cell dropped — unequal by
            // construction, so it cannot read as a three-card row.
            const span = ['lg:col-span-5', 'lg:col-span-4 lg:mt-16', 'lg:col-span-3'][index];
            const ratio = ['aspect-4/5', 'aspect-4/5', 'aspect-4/5'][index];

            return (
              <li key={entry.id} className={span}>
                <Reveal delay={index * 70}>
                  {entry.assetId ? (
                    <Asset
                      id={entry.assetId}
                      className={`${ratio} w-full`}
                      sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    // No photograph exists for the Bizza. Instead of an empty
                    // frame, the dish name becomes the image.
                    <div
                      className={`${ratio} flex w-full items-center justify-center overflow-hidden rounded-(--radius-lg) bg-obsidian p-6`}
                    >
                      <p className="display-poster text-center text-[clamp(2.5rem,7vw,4rem)] text-neon">
                        {entry.item.name.replace(/^Our Famous\s+/i, '')}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="text-[1.125rem] font-semibold leading-snug text-brown">
                      {entry.item.name}
                    </h3>
                    {entry.item.priceCents != null ? (
                      <p className="tabular shrink-0 text-[1.0625rem] font-semibold text-brown">
                        {formatPrice(entry.item.priceCents)}
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[0.9375rem] font-medium text-clay">{entry.note}</p>
                  {entry.item.description ? (
                    <p className="measure mt-2 text-[0.875rem] leading-relaxed text-brown-soft">
                      {entry.item.description}
                    </p>
                  ) : null}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Frame>
    </Band>
  );
}
