import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import { AssetVideo } from '@/components/media/AssetVideo';
import { ExternalTextLink } from '@/components/primitives/Button';
import { pageCopy } from '@/content/pages';
import { site } from '@/content/site';
import type { ResolvedEvent } from '@/content/types';
import { formatEventDate, formatEventTime, formatPrice } from '@/lib/format';

/**
 * Hero — media-led, edge to edge.
 *
 * The previous hero was a 50/50 sand split with a rounded rectangle floating in
 * the right half: the media decorated the composition instead of creating it.
 * This is a full-height mosaic where photography is the structure.
 *
 * Resolution honesty drives the layout. The reel is 720×1280, which is native
 * on a phone and would be a 2× upscale stretched across a 1440px viewport. So
 * the media is used in PORTRAIT columns at close to native size rather than as
 * one full-bleed landscape wash — the composition is built around what the
 * assets can actually carry.
 */
export function Hero({ nextEvent }: { nextEvent: ResolvedEvent | null }) {
  return (
    <section className="relative isolate overflow-hidden bg-cream on-sand">
      {/* Bounded `height`, not `min-height`: min-height beats max-height in CSS,
          so a min-only rule would let a tall monitor stretch the hero and upscale
          720px-wide media into mush. Bounds keep the crop honest at any height. */}
      <div className="mx-auto grid max-w-[1600px] lg:h-[calc(100svh-8rem)] lg:max-h-[860px] lg:min-h-[620px] lg:grid-cols-12">
        {/* ---------------------------------------------------------- type */}
        <div className="relative z-10 flex flex-col justify-center bg-sand grain px-5 pb-12 pt-14 sm:px-8 lg:col-span-6 lg:px-12 lg:py-20 xl:col-span-5">
          <p className="eyebrow text-brown">Lockport, Illinois</p>

          <h1 className="display mt-5 text-[clamp(3rem,11vw,6.5rem)] text-brown lg:text-[clamp(3.5rem,5.2vw,6rem)]">
            {pageCopy.home.heroHeadlineLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <p className="measure-lead mt-6 text-[length:var(--text-body-lg)] leading-relaxed text-brown">
            {pageCopy.home.heroBody}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={site.reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-(--radius-md) bg-orange px-7 text-base font-semibold tracking-[0.02em] text-on-orange transition-colors hover:bg-orange-deep"
            >
              Reserve a table
              <span className="sr-only">(opens Toast in a new tab)</span>
            </a>
            <a
              href={site.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-(--radius-md) border-2 border-brown px-7 text-base font-semibold tracking-[0.02em] text-brown transition-colors hover:bg-brown hover:text-cream"
            >
              Order online
              <span className="sr-only">(opens Toast in a new tab)</span>
            </a>
          </div>

          {/* Next event, inside the first viewport. Answers "what's happening?"
              without a scroll, and the date is live data, never artwork. */}
          {nextEvent ? (
            <Link
              href="/events"
              className="group mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-brown/25 pt-5 text-brown"
            >
              <span className="inline-flex items-center gap-2 bg-obsidian px-2.5 py-1.5">
                <span className="size-1.5 rounded-full bg-neon" aria-hidden="true" />
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-night-text">
                  Next up
                </span>
              </span>
              <span className="text-[0.9375rem] font-semibold">{nextEvent.series.title}</span>
              <span className="tabular text-[0.9375rem]">
                {formatEventDate(nextEvent.startsAt)} · {formatEventTime(nextEvent.startsAt)}
                {nextEvent.priceCents != null ? ` · ${formatPrice(nextEvent.priceCents)}` : ''}
              </span>
              <span className="text-[0.9375rem] underline underline-offset-4 group-hover:underline-offset-[6px]">
                See events
              </span>
            </Link>
          ) : null}
        </div>

        {/* --------------------------------------------------------- media */}
        {/* Two portrait panels, edge to edge, no radius, no gap. On mobile the
            video runs full-bleed at its native 9:16 — the best it ever looks. */}
        <div className="relative lg:col-span-6 xl:col-span-7">
          <div className="grid h-full grid-cols-1 sm:grid-cols-2">
            <AssetVideo
              id="heroVideo"
              mobileBelow={0}
              className="aspect-4/5 w-full sm:aspect-auto sm:h-full sm:min-h-[420px] lg:min-h-full"
            />
            <div className="hidden sm:block">
              <Asset
                id="consommeDip"
                className="h-full min-h-[420px] w-full lg:min-h-full"
                sizes="(min-width: 1024px) 30vw, 50vw"
                rounded={false}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Utility rail — the four things people actually open a restaurant site for.
 * Sits immediately under the hero so it is reachable on a phone without hunting.
 */
export function ActionRail({ openLabel, isOpen }: { openLabel: string; isOpen: boolean }) {
  return (
    <div className="border-y border-brown/15 bg-linen">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-3.5 text-[0.9375rem] sm:px-8 lg:px-12">
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
