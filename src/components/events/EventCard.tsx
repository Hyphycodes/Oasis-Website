import Link from 'next/link';
import { Asset } from '@/components/media/Asset';
import type { AssetId } from '@/content/assets';
import type { ResolvedEvent } from '@/content/types';
import { formatEventDate, formatPrice, formatTimeRange } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/events';

/**
 * Event card.
 *
 * The date is rendered as HTML text from `event.startsAt` and composited over the
 * artwork — it is never read from, or baked into, the flyer image. That is the
 * structural fix for the current site's stale-flyer problem. See PLAN.md §4.1.
 *
 * Status is carried by TEXT plus a border treatment, never by color alone.
 */
export function EventCard({
  event,
  tone = 'light',
  showDescription = true,
}: {
  event: ResolvedEvent;
  tone?: 'light' | 'dark';
  showDescription?: boolean;
}) {
  const { series } = event;
  const statusLabel = STATUS_LABEL[event.status] ?? '';
  const muted = event.status === 'cancelled' || event.status === 'postponed';

  const titleColor = tone === 'dark' ? 'text-night-text' : 'text-brown';
  const bodyColor = tone === 'dark' ? 'text-night-soft' : 'text-brown-soft';
  const metaBorder = tone === 'dark' ? 'border-night-text/20' : 'border-brown/18';

  return (
    <article className={muted ? 'opacity-70' : undefined}>
      <Link href={`/events/${series.slug}`} className="group block">
        <div className="relative">
          <Asset
            id={series.artworkAssetId as AssetId}
            className="aspect-4/5 w-full"
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            alt={`${series.title} artwork`}
            tone={tone}
          />

          {/* Live date chip. Always HTML, always from the occurrence. */}
          <div className="absolute left-4 top-4 rounded-(--radius-sm) bg-cream px-3 py-2 text-center">
            <span className="tabular block text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.14em] text-clay">
              {formatEventDate(event.startsAt).split(',')[0]}
            </span>
            <span className="tabular mt-1 block text-[0.9375rem] font-semibold leading-none text-brown">
              {formatEventDate(event.startsAt).split(', ')[1]}
            </span>
          </div>

          {statusLabel ? (
            <p className="absolute right-4 top-4 rounded-(--radius-sm) border border-danger bg-cream px-2.5 py-1.5 text-[0.75rem] font-semibold text-danger">
              {statusLabel}
            </p>
          ) : null}
        </div>

        <h3
          className={`mt-5 text-[length:var(--text-heading)] font-semibold tracking-[-0.015em] ${titleColor} transition-colors group-hover:text-orange`}
        >
          {series.title}
        </h3>
      </Link>

      <dl className={`mt-3 space-y-1.5 border-t ${metaBorder} pt-3 text-[0.875rem] ${bodyColor}`}>
        <div className="flex justify-between gap-4">
          <dt className="sr-only">Time</dt>
          <dd className="tabular">{formatTimeRange(event.startsAt, event.endsAt)}</dd>
          <dt className="sr-only">Age requirement</dt>
          <dd>{series.ageMin ? `${series.ageMin}+` : 'All ages'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="sr-only">Music</dt>
          <dd>{series.musicFormats.join(' · ')}</dd>
          <dt className="sr-only">Price</dt>
          <dd className="tabular shrink-0">
            {event.status === 'free'
              ? 'Free'
              : event.priceCents != null
                ? formatPrice(event.priceCents)
                : ''}
          </dd>
        </div>
      </dl>

      {showDescription ? (
        <p className={`mt-3 text-[0.875rem] leading-relaxed ${bodyColor}`}>{series.summary}</p>
      ) : null}
    </article>
  );
}
