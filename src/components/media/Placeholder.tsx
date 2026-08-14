import { getAsset, ratioToCss, type AssetId } from '@/content/assets';

/**
 * Branded neutral fill for a slot with no photograph yet.
 *
 * Renders at the registry's exact aspect ratio, so a missing image produces zero
 * layout shift and the composition is final before the pixels arrive.
 *
 * It is `aria-hidden` and carries NO text. An earlier version exposed the
 * sentence "Oasis photography for this slot has not been supplied yet" to
 * screen readers and to the rendered DOM, which meant internal production
 * language was shipping on public pages. Nothing user-facing may describe the
 * state of our asset pipeline — that belongs in `npm run assets:check` and
 * docs/ASSET-HANDOFF.md, not on the website.
 */
export function Placeholder({
  id,
  className = '',
  tone = 'light',
}: {
  id: AssetId;
  className?: string;
  label?: string;
  tone?: 'light' | 'dark';
}) {
  const asset = getAsset(id);
  const surface = tone === 'dark' ? 'bg-espresso-lift' : 'bg-sand-deep';
  const mark = tone === 'dark' ? 'text-night-text opacity-[0.10]' : 'text-brown opacity-[0.08]';

  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center overflow-hidden ${surface} ${className}`}
      style={{ aspectRatio: ratioToCss(asset) }}
      data-asset-placeholder={id}
    >
      <svg viewBox="0 0 100 100" className={`w-[22%] max-w-24 ${mark}`} fill="currentColor">
        <path d="M50 4a46 46 0 1 0 0 92 46 46 0 0 0 0-92Zm0 16a30 30 0 1 1 0 60 30 30 0 0 1 0-60Z" />
      </svg>
    </div>
  );
}
