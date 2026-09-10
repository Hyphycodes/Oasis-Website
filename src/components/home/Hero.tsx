import Link from 'next/link';
import { AssetVideo } from '@/components/media/AssetVideo';
import { AssetView } from '@/components/media/Asset';
import { ThemeHeroBackground, ThemeHeroLayer } from '@/components/theme/ThemeHeroLayer';
import { getPublicAsset } from '@/content/media';
import { ExternalTextLink } from '@/components/primitives/Button';
import { pageCopy } from '@/content/pages';
import { site } from '@/content/site';
import type { ResolvedEvent } from '@/content/types';
import { presetVars } from '@/components/events/EventArt';
import { resolveEventArtwork } from '@/server/content/event-art';
import { getActiveTheme } from '@/themes/resolve';

/**
 * Hero — ONE dominant visual.
 *
 * The previous version put the reel beside a static taco-dipping still: two
 * near-identical food-action visuals splitting attention. This keeps only the
 * reel, full-bleed behind the type, because it is the single strongest asset
 * and it is native 9:16 on a phone.
 *
 * Legibility never depends on the video. The scrim is a solid gradient over a
 * poster that is always painted, so the headline holds the same contrast on the
 * first frame, the last frame, under reduced motion, and on a dead connection.
 * Height is bounded so the actions always sit inside the first viewport.
 */
export async function Hero({
  takeover = null,
}: {
  /**
   * An event whose scheduled hero takeover is running right now. It lends the
   * hero its artwork and a line of copy; it never takes the navigation, the
   * headline hierarchy or the restaurant's own actions away.
   */
  takeover?: ResolvedEvent | null;
}) {
  // Resolved here, on the server, because AssetVideo runs in the browser and the
  // media store does not.
  const [video, theme] = await Promise.all([getPublicAsset('heroVideo'), getActiveTheme()]);
  if (!video) return null;

  const takeoverArt = takeover ? await resolveEventArtwork(takeover) : null;
  // Key art only. A takeover borrows the event's WEBSITE art for the hero — the
  // official flyer belongs to the event's own card and page, where it is shown
  // whole, not stretched across a 16:9 hero.
  const takeoverBackdrop = takeoverArt?.keyArt?.path ? takeoverArt.keyArt : null;

  // A seasonal theme may supply its own backdrop. When it does not, the reel
  // stays and the theme art-directs around it.
  const themedBackdrop = Boolean(theme.assets.heroBackground.path);

  return (
    <section
      className="relative isolate overflow-hidden bg-plum"
      style={takeover ? presetVars(takeover.presentation.visualPreset) : undefined}
    >
      {/* Wrapped rather than positioned directly: AssetVideo sets `relative` on
          its own root, which would fight an `absolute` passed through className
          (same specificity — stylesheet order decides, not the class list). */}
      <div className="absolute inset-0">
        {takeoverBackdrop ? (
          <AssetView
            asset={takeoverBackdrop}
            id="hero-takeover"
            alt=""
            rounded={false}
            priority
            sizes="100vw"
            className="size-full"
          />
        ) : themedBackdrop ? (
          <ThemeHeroBackground theme={theme} />
        ) : (
          <AssetVideo
            asset={video}
            mobileBelow={0}
            className="size-full"
            objectPosition="50% 42%"
          />
        )}
      </div>

      {/* Directional scrims, not a blanket.

          The previous pair ran to solid plum at the bottom AND to 75% plum across
          the whole left half, which put every pixel at roughly the same muddy
          value — the tacos and the room lights were technically on screen and
          effectively invisible.

          Now the darkening is concentrated where the type actually sits: ~85%
          plum along the bottom edge, falling away to ~10% over the top two
          thirds, plus a left-edge wash on wide screens that clears entirely by
          55% of the width. The focal area of the loop keeps a light tint, so the
          plum mood survives while the food, the glassware and the movement read.

          Legibility still does not depend on the video: the headline block sits
          inside the strong end of the vertical gradient, over a poster that is
          always painted. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-plum/92 from-5% via-plum/45 via-40% to-plum/12"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-linear-to-r from-plum/85 via-plum/35 via-30% to-transparent to-55% lg:block"
      />

      {/* Seasonal layers sit over the reel and under the type. Nothing when
          the default look is on. */}
      <ThemeHeroLayer theme={theme} />

      <div className="relative mx-auto flex max-w-[1600px] flex-col justify-end px-5 pb-10 pt-24 sm:px-8 sm:pt-32 lg:min-h-[560px] lg:px-12 lg:pb-12 lg:pt-40">
        <div className="max-w-xl">
          {/* One quiet line above the headline, and nothing else. A live
              NEXT UP pill sat here and made the hero busy: it competed with the
              headline, repeated what the What's on section says immediately
              below, and was the first thing the eye hit. The calendar belongs
              further down the page, behind "Explore events". */}
          <p className="eyebrow text-amber">Lockport, Illinois</p>

          <h1 className="display mt-5 text-[clamp(2rem,6vw,3.25rem)] leading-[1.06] text-night-text">
            {(takeover ? [takeover.title] : pageCopy.home.heroHeadlineLines).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-night-text/85">
            {takeover
              ? takeover.summary || pageCopy.home.heroBody
              : pageCopy.home.heroBody}
          </p>

          {/* Reserve is primary, Explore Events is a strong secondary, Order
              online is tertiary. A takeover slots its ticket link in at the
              front and pushes the rest along — it never removes them, because
              the hero still has to work as a restaurant's front door. */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {takeover?.ticketUrl && takeover.status !== 'sold-out' ? (
              <a
                href={takeover.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-(--radius-md) bg-[color:var(--e-accent)] px-6 text-[0.9375rem] font-semibold tracking-[0.02em] text-obsidian transition-opacity hover:opacity-90"
              >
                Get tickets
                <span className="sr-only">for {takeover.title} (opens the ticket page in a new tab)</span>
              </a>
            ) : null}

            <a
              href={site.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-12 items-center justify-center rounded-(--radius-md) px-6 text-[0.9375rem] font-semibold tracking-[0.02em] transition-colors ${
                takeover
                  ? 'border border-night-text/45 text-night-text hover:bg-night-text/12'
                  : 'bg-coral text-on-orange hover:bg-coral-deep'
              }`}
            >
              Reserve a table
              <span className="sr-only">(opens Toast in a new tab)</span>
            </a>

            <Link
              href="/events"
              className="inline-flex min-h-12 items-center justify-center rounded-(--radius-md) border border-night-text/45 px-6 text-[0.9375rem] font-semibold tracking-[0.02em] text-night-text transition-colors hover:bg-night-text/12"
            >
              Explore events
            </Link>

            <a
              href={site.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center text-[0.9375rem] font-medium text-night-text/85 underline underline-offset-4 transition-[text-underline-offset] hover:underline-offset-[6px]"
            >
              Order online
              <span className="sr-only">(opens Toast in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Utility rail — open state, directions, phone. The things people open a
 * restaurant site for, one line, immediately under the hero.
 */
export function ActionRail({ openLabel, isOpen }: { openLabel: string; isOpen: boolean }) {
  return (
    <div className="border-b border-brown/12 bg-ivory-deep">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-7 gap-y-1 px-5 py-2 text-[0.9375rem] sm:px-8 lg:px-12">
        <span className="inline-flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${isOpen ? 'bg-success' : 'bg-brown-soft'}`}
          />
          <span className={isOpen ? 'text-success' : 'text-brown-soft'}>{openLabel}</span>
        </span>

        <ExternalTextLink href={site.directionsUrl} destination="Google Maps" className="text-brown">
          Directions
        </ExternalTextLink>

        <a
          href={`tel:+1${site.phone.value.replace(/\D/g, '')}`}
          className="tabular inline-flex min-h-11 items-center text-brown underline underline-offset-4"
        >
          {site.phone.value}
        </a>

        <span className="hidden text-brown-soft sm:inline">
          {site.street}, {site.locality}
        </span>
      </div>
    </div>
  );
}

