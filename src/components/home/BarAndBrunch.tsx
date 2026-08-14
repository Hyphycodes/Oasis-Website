import { Asset } from '@/components/media/Asset';
import { Band, Frame } from '@/components/primitives/Band';
import { ButtonLink } from '@/components/primitives/Button';
import { Reveal } from '@/components/primitives/Reveal';
import { Eyebrow } from '@/components/primitives/Type';
import type { PageSection } from '@/content/types';

/**
 * Bar and brunch — social, table-scale.
 *
 * Three real drink frames from the reel: the pour, the finished margarita, and
 * the bartender. Sequenced pour → glass → person so it reads as a moment rather
 * than a product catalogue, and offset vertically so it is not a row of thumbs.
 */
export function BarAndBrunch({ section }: { section: PageSection }) {
  if (!section.visible) return null;

  return (
    <Band surface="sand">
      <Frame wide>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
              <h2 className="display mt-4 text-[clamp(2.25rem,5vw,3.5rem)] text-brown">
                {section.heading}
              </h2>
              {section.body ? (
                <p className="measure-lead mt-5 text-[length:var(--text-body-lg)] leading-relaxed text-brown">
                  {section.body}
                </p>
              ) : null}

              <dl className="mt-8 border-t border-brown/25 pt-5 text-[0.9375rem]">
                <div className="flex justify-between gap-4 border-b border-brown/20 py-2.5">
                  <dt className="font-semibold text-brown">Brunch</dt>
                  <dd className="tabular text-brown">Sat & Sun · 10am–3pm</dd>
                </div>
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="font-semibold text-brown">Built to share</dt>
                  <dd className="text-brown">Towers · Pitchers · Cantaritos</dd>
                </div>
              </dl>

              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/menu/cocktails">Cocktails & bar</ButtonLink>
                <ButtonLink href="/menu/brunch" variant="secondary">
                  Brunch
                </ButtonLink>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-7 lg:col-start-6">
            <Reveal className="col-span-1">
              <Asset
                id="cocktailPour"
                className="aspect-4/5 w-full"
                sizes="(min-width: 1024px) 28vw, 50vw"
              />
            </Reveal>
            <Reveal delay={70} className="col-span-1 mt-8 sm:mt-12">
              <Asset
                id="margaritaTajin"
                className="aspect-square w-full"
                sizes="(min-width: 1024px) 28vw, 50vw"
              />
            </Reveal>
            <Reveal delay={140} className="col-span-2 -mt-4 sm:-mt-8">
              <Asset
                id="bartender"
                className="aspect-3/2 w-full"
                sizes="(min-width: 1024px) 56vw, 100vw"
              />
            </Reveal>
          </div>
        </div>
      </Frame>
    </Band>
  );
}
