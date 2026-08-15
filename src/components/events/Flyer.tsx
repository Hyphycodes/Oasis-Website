import { Asset } from '@/components/media/Asset';
import type { AssetId } from '@/content/assets';
import { getAsset } from '@/content/assets';
import type { EventSeries } from '@/content/types';

/**
 * Series flyer.
 *
 * The restaurant's own artwork, shown whole. Two rules make it safe to publish:
 *
 *  1. `object-contain` inside a stable square frame, so nothing is cropped away —
 *     an event flyer squeezed into a landscape card loses the address, the age
 *     line and the times printed along its edges.
 *  2. The date printed INTO the pixels is captioned as what it is. The flyer is
 *     recurring-series artwork; the authoritative next date is rendered as live
 *     HTML text beside it, from a generated occurrence. A visitor is therefore
 *     never left to reconcile two dates on their own. See PLAN.md §4.1.
 *
 * With no approved flyer the frame still reserves its square and states plainly
 * that current artwork is pending, rather than collapsing the layout.
 */
export function Flyer({
  series,
  tone,
  sizes = '(min-width: 1024px) 30vw, 90vw',
  priority = false,
}: {
  series: EventSeries;
  tone: 'teal' | 'plum';
  sizes?: string;
  priority?: boolean;
}) {
  const frame =
    tone === 'teal'
      ? 'border-amber/30 bg-teal-lift/60'
      : 'border-coral-light/30 bg-plum-lift/60';
  const caption = tone === 'teal' ? 'text-teal-soft' : 'text-plum-soft';

  const assetId = series.flyerAssetId as AssetId | null;
  const asset = assetId ? getAsset(assetId) : null;

  return (
    <figure>
      <div className={`overflow-hidden rounded-(--radius-lg) border ${frame} p-2.5 sm:p-3`}>
        {assetId && asset?.path ? (
          <Asset
            id={assetId}
            className="aspect-square w-full"
            sizes={sizes}
            priority={priority}
            fit="contain"
            rounded={false}
            tone="dark"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center px-6 text-center">
            <p className={`text-[0.875rem] leading-relaxed ${caption}`}>
              Current artwork for {series.title} is on the way. The date, time and tickets below
              are live.
            </p>
          </div>
        )}
      </div>

      {/* Deliberately not "the next date is above/below": the flyer sits beside
          the details on wide screens and above them on narrow ones, so the
          caption has to be true at every width. */}
      {series.flyerPrintedDate ? (
        <figcaption className={`mt-2.5 text-[0.8125rem] leading-relaxed ${caption}`}>
          Series artwork, printed for {series.flyerPrintedDate}.{' '}
          {series.title.replace('Oasis ', '')} runs every week — the next date and tickets are
          listed on this page.
        </figcaption>
      ) : null}
    </figure>
  );
}
