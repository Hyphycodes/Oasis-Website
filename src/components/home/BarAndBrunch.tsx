import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Display, Eyebrow, Lead } from '@/components/primitives/Type';
import type { PageSection } from '@/content/types';

/**
 * Image-led section, media on the LEFT — the mirror of the signature section
 * above it, so the page alternates rather than repeating one split template.
 */
export function BarAndBrunch({ section }: { section: PageSection }) {
  if (!section.visible) return null;

  return (
    <Band surface="sand">
      <Frame wide>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            {/* Deliberately NOT cocktailPair — that image already carries the
                "Drink" cell above, and repeating it two sections later reads as
                a stock library running thin. */}
            <Asset
              id="bartender"
              className="aspect-square w-full"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </Reveal>

          <Reveal delay={80} className="lg:col-span-6 lg:col-start-7">
            {section.eyebrow ? <Eyebrow tone="orange">{section.eyebrow}</Eyebrow> : null}
            <Display as="h2" size="md" className="mt-4 text-brown">
              {section.heading}
            </Display>
            {section.body ? (
              <Lead className="mt-5 text-brown">{section.body}</Lead>
            ) : null}

            <dl className="mt-8 space-y-4 border-t border-brown/20 pt-6">
              <div>
                <dt className="text-[0.9375rem] font-semibold text-brown">Weekend brunch</dt>
                <dd className="mt-1 text-[0.9375rem] text-brown">
                  Saturday and Sunday, 10am to 3pm.
                </dd>
              </div>
              <div>
                <dt className="text-[0.9375rem] font-semibold text-brown">Built for the table</dt>
                <dd className="mt-1 text-[0.9375rem] text-brown">
                  Margarita towers, pitchers, and the jumbo cantarito.
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/menu/cocktails">Cocktails & bar</ButtonLink>
              <ButtonLink href="/menu/brunch" variant="secondary">
                Brunch
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Frame>
    </Band>
  );
}
