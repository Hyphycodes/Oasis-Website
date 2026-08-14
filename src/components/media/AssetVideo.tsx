'use client';

import { useEffect, useRef, useState } from 'react';
import { getAsset, type AssetId } from '@/content/assets';

/**
 * Decorative background video.
 *
 * Rules enforced here rather than left to the caller:
 *  - muted, looping, inline, no controls, no player chrome
 *  - a poster is required by the registry and is always painted first
 *  - under `prefers-reduced-motion` the video never loads at all — the poster is
 *    the whole treatment, decided before first paint
 *  - under Save-Data the video never loads
 *  - below `mobileBelow` px the video never loads (there is no mobile-specific
 *    source; a 16:9 desktop loop cropped to 9:16 is worse than a good still)
 */
export function AssetVideo({
  id,
  className = '',
  mobileBelow = 768,
  objectPosition,
}: {
  id: AssetId;
  className?: string;
  mobileBelow?: number;
  /** Overrides the registry focal point for this placement. */
  objectPosition?: string;
}) {
  const asset = getAsset(id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const narrow = window.matchMedia(`(max-width: ${mobileBelow - 1}px)`).matches;

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    const saveData = connection?.saveData === true;
    const slow = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';

    setEnabled(!reduced && !narrow && !saveData && !slow);
  }, [mobileBelow]);

  const poster = asset.poster ?? undefined;

  return (
    <div className={`relative overflow-hidden bg-espresso ${className}`}>
      {/* The poster is always painted, so there is no empty frame while the
          first video frame decodes — and it is the entire treatment when
          motion is reduced. */}
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: objectPosition ?? asset.focal }}
        />
      ) : null}

      {enabled && asset.path ? (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: objectPosition ?? asset.focal }}
          src={asset.path}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
    </div>
  );
}
