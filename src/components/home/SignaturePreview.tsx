import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Display, Eyebrow, Lead } from '@/components/primitives/Type';
import type { Menu, PageSection } from '@/content/types';
import { formatPrice } from '@/lib/format';

const SIGNATURE_IDS = ['quesabirrias', 'bizza', 'birria-ramen'];

/**
 * Typographic, not photographic.
 *
 * No photography exists for these three dishes, and three branded placeholders
 * in a row on the homepage would read as unfinished. A large-type numbered list
 * is more editorial than a photo grid would have been anyway, and it is honest:
 * the type carries the section, and the food photography request is logged in
 * docs/ASSET-HANDOFF.md.
 *
 * Items and prices come from the same menu data /menu renders, so the two can
 * never drift. Nothing here is invented.
 */
export function SignaturePreview({ section, menu }: { section: PageSection; menu: Menu }) {
  if (!section.visible) return null;

  const items = SIGNATURE_IDS.map((id) =>
    menu.categories.flatMap((c) => c.items).find((item) => item.id === id),
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (items.length === 0) return null;

  return (
    <Band surface="linen">
      <Frame wide>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
              <Display as="h2" size="lg" className="mt-4 max-w-[12ch] text-brown">
                {section.heading}
              </Display>
              {section.body ? <Lead className="mt-5">{section.body}</Lead> : null}
              <ButtonLink href="/menu" variant="secondary" className="mt-8">
                See the full menu
              </ButtonLink>
            </div>
          </Reveal>

          <div className="lg:col-span-7 lg:col-start-6">
            <ol className="border-t border-brown/15">
              {items.map((item, index) => (
                <li key={item.id} className="border-b border-brown/15">
                  <Reveal delay={index * 70}>
                    <div className="flex gap-5 py-8 sm:gap-8">
                      <span
                        aria-hidden="true"
                        className="tabular shrink-0 pt-1 text-[0.8125rem] font-semibold text-clay"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                          <h3 className="text-[length:var(--text-display-md)] font-semibold leading-none tracking-[-0.025em] text-brown [font-variation-settings:'wdth'_104]">
                            {item.name}
                          </h3>
                          {item.priceCents != null ? (
                            <p className="tabular text-[1.0625rem] font-semibold text-brown">
                              {formatPrice(item.priceCents)}
                            </p>
                          ) : null}
                        </div>
                        {item.description ? (
                          <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-brown-soft">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Frame>
    </Band>
  );
}
