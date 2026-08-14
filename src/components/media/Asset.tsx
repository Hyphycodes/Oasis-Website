import Image from 'next/image';
import { getAsset, ratioToCss, type AssetId } from '@/content/assets';
import { Placeholder } from './Placeholder';

interface AssetProps {
  id: AssetId;
  /** Wrapper classes. Aspect ratio comes from the registry, not from here. */
  className?: string;
  /** Responsive sizes hint. Always pass one for non-fixed placements. */
  sizes?: string;
  priority?: boolean;
  /** Overrides the registry alt text where context makes it more useful. */
  alt?: string;
  rounded?: boolean;
  /** Keeps a missing-asset placeholder inside the surrounding surface's ramp. */
  tone?: 'light' | 'dark';
}

/**
 * The only way a photograph enters a page.
 *
 * Components request a semantic ID; they never see a file path. Aspect ratio,
 * focal point, alt text, and dimensions all come from src/content/assets.ts, so
 * swapping the entire media package is a registry edit — no component changes.
 *
 * If the registry entry has no file yet, this renders the branded placeholder at
 * the identical geometry, so layout never depends on whether the photo exists.
 */
export function Asset({
  id,
  className = '',
  sizes = '100vw',
  priority = false,
  alt,
  rounded = true,
  tone = 'light',
}: AssetProps) {
  const asset = getAsset(id);
  const radius = rounded ? 'rounded-(--radius-lg)' : '';

  if (!asset.path) {
    return (
      <Placeholder
        id={id}
        className={`${radius} ${className}`}
        label={alt ?? undefined}
        tone={tone}
      />
    );
  }

  const decorative = asset.alt === null && !alt;

  return (
    <div
      className={`relative overflow-hidden ${radius} ${className}`}
      style={{ aspectRatio: ratioToCss(asset) }}
    >
      <Image
        src={asset.path}
        alt={decorative ? '' : (alt ?? asset.alt ?? '')}
        aria-hidden={decorative || undefined}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        className="object-cover"
        style={{ objectPosition: asset.focal }}
      />
    </div>
  );
}
