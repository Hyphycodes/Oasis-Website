import { getAsset, ratioToCss, type AssetId } from '@/content/assets';

/**
 * Branded neutral placeholder.
 *
 * Deliberately NOT an image file: it renders at the registry's exact aspect ratio,
 * so a missing photograph produces zero layout shift and the composition is final
 * before the pixels arrive. No stock imagery, no generated food, no blurred upscale.
 *
 * `tone` keeps the placeholder inside the surrounding surface's ramp — a sand block
 * dropped onto the espresso band would read as a broken image rather than a
 * reserved slot.
 */
export function Placeholder({
  id,
  className = '',
  label,
  tone = 'light',
}: {
  id: AssetId;
  className?: string;
  label?: string;
  tone?: 'light' | 'dark';
}) {
  const asset = getAsset(id);
  const surface = tone === 'dark' ? 'bg-espresso-lift' : 'bg-sand-deep';
  const mark = tone === 'dark' ? 'text-night-text opacity-[0.08]' : 'text-brown opacity-[0.06]';

  return (
    <div
      role="img"
      aria-label={label ?? asset.alt ?? 'Photograph coming soon'}
      className={`relative flex items-center justify-center overflow-hidden ${surface} ${className}`}
      style={{ aspectRatio: ratioToCss(asset) }}
      data-asset-placeholder={id}
    >
      <svg aria-hidden="true" viewBox="0 0 100 100" className={`w-[22%] max-w-24 ${mark}`} fill="currentColor">
        <path d="M50 4a46 46 0 1 0 0 92 46 46 0 0 0 0-92Zm0 16a30 30 0 1 1 0 60 30 30 0 0 1 0-60Z" />
      </svg>
      <span className="sr-only">Oasis photography for this slot has not been supplied yet.</span>
    </div>
  );
}
