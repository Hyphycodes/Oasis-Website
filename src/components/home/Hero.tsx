import { AssetVideo } from '@/components/media/AssetVideo';
import { ExternalButtonLink, ButtonLink } from '@/components/primitives/Button';
import { pageCopy } from '@/content/pages';
import { site } from '@/content/site';

/**
 * Hero.
 *
 * Composition is editorial, not the centered-overlay default: type occupies a
 * left column on a sand field, media bleeds off the right page edge. The headline
 * breaks at an authored point (one line per sentence) instead of wherever the
 * browser lands, and the type sits on a solid surface rather than on top of video,
 * so contrast is a constant and not a function of which frame is showing.
 */
export function Hero() {
  return (
    // `on-sand` steps secondary ink up to full brown (see globals.css). The hero
    // is not a <Band>, so it opts in explicitly.
    <section className="relative overflow-hidden bg-sand grain on-sand">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-14 pt-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:pb-24 lg:pt-24">
        <div className="lg:col-span-7">
          <h1 className="text-[length:var(--text-display-xl)] font-semibold leading-[0.94] tracking-[-0.035em] text-brown [font-variation-settings:'wdth'_108]">
            {pageCopy.home.heroHeadlineLines.map((line) => (
              // Authored break: one line per sentence from 640px up. Below that it
              // stacks to four lines, which is a chosen composition rather than
              // wherever the browser happens to land.
              // `text-wrap: nowrap` is deliberate: the sentence is the unit. The
              // clamp below is sized so both sentences fit on one line at 360px,
              // which is the narrowest viewport this site targets.
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h1>

          <p className="measure-lead mt-6 text-[length:var(--text-body-lg)] leading-relaxed text-brown">
            {pageCopy.home.heroBody}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ExternalButtonLink
              href={site.reservationUrl}
              destination="Toast reservations"
              size="lg"
            >
              Reserve a table
            </ExternalButtonLink>
            <ButtonLink href="/events" variant="secondary" size="lg">
              See what&rsquo;s on
            </ButtonLink>
            <a
              href={site.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center px-1 text-[0.9375rem] font-medium text-clay underline underline-offset-4 transition-[text-underline-offset] hover:underline-offset-[6px]"
            >
              Order online
              <span className="sr-only">(opens Toast in a new tab)</span>
            </a>
          </div>
        </div>

        {/* The source is a vertical 9:16 reel, so the frame stays portrait rather
            than letterboxing it into a landscape crop. Height is capped so a short
            viewport never pushes the CTAs off-screen. */}
        <div className="lg:col-span-4 lg:col-start-9">
          <AssetVideo
            id="heroVideo"
            mobileBelow={0}
            className="mx-auto aspect-4/5 w-full max-w-md rounded-(--radius-lg) sm:aspect-3/4 lg:max-h-[70vh] lg:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
