import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { PageSection } from '@/content/types';

/**
 * The bar and the weekend — one compact band.
 *
 * Two square crops side by side rather than a three-image collage with staggered
 * vertical offsets, which is what made this section ~900px tall to deliver two
 * facts and two links.
 */
export function BarAndBrunch({ section }: { section: PageSection }) {
  if (!section.visible) return null;

  return (
    <Band surface="ivory-deep" size="sm">
      <Frame wide>
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-3">
              <Asset
                id="margaritaTajin"
                className="aspect-square w-full"
                sizes="(min-width: 1024px) 24vw, 45vw"
              />
              <Asset
                id="bartender"
                className="aspect-square w-full"
                sizes="(min-width: 1024px) 24vw, 45vw"
              />
            </div>
          </Reveal>

          <Reveal delay={60} className="lg:col-span-5 lg:col-start-8">
            {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
            <h2 className="display mt-2 text-[clamp(1.75rem,3vw,2.375rem)] text-brown">
              {section.heading}
            </h2>
            {section.body ? (
              <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-brown-soft">
                {section.body}
              </p>
            ) : null}

            <dl className="mt-5 border-t border-brown/20 text-[0.9375rem]">
              <div className="flex justify-between gap-4 border-b border-brown/15 py-2.5">
                <dt className="font-semibold text-brown">Brunch</dt>
                <dd className="tabular text-brown-soft">Sat &amp; Sun · 10am–3pm</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="font-semibold text-brown">Built to share</dt>
                <dd className="text-brown-soft">Towers · Pitchers · Cantaritos</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/menu#cocktails">Cocktails &amp; bar</ButtonLink>
              <ButtonLink href="/menu#brunch" variant="secondary">
                Brunch
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
}
