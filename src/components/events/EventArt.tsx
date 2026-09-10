import { AssetView } from '@/components/media/Asset';
import { PRESET_STYLE, type VisualPreset } from '@/content/event-presentation';
import type { PublicAsset } from '@/content/media';
import type { CSSProperties } from 'react';

/**
 * An event's artwork, composed.
 *
 * THE FLYER IS ALWAYS AVAILABLE AND IS ALWAYS SHOWN WHOLE. Two arrangements:
 *
 *   with key art     a wide cinematic background carries the composition, and
 *                    the official flyer sits on it as an upright card — the
 *                    flyer is smaller but complete, and it is still the thing
 *                    that identifies the event.
 *   without key art  the flyer IS the composition: contained inside a lit
 *                    frame, on the event's own colour, at its own aspect ratio.
 *
 * `object-contain` in both, always. A flyer prints its own name, date, price
 * and age line along its edges, and cropping it throws those away.
 */

export interface EventArtwork {
  flyer: PublicAsset | null;
  /** Shipped art carries a `srcSet`; art uploaded through the admin does not. */
  keyArt: (PublicAsset & { srcSet?: string }) | null;
  keyArtMobile: (PublicAsset & { srcSet?: string }) | null;
  foreground: PublicAsset | null;
}

/** The CSS custom properties an event's preset contributes. */
export function presetVars(preset: VisualPreset): CSSProperties {
  const style = PRESET_STYLE[preset];
  return {
    '--e-accent': style.accent,
    '--e-surface': style.surface,
    '--e-glow': style.glow,
  } as CSSProperties;
}

export function EventArt({
  art,
  title,
  preset,
  /** `lead` is the dominant homepage slot; `card` is everything else. */
  size = 'card',
  sizes,
  priority = false,
  className = '',
  fill = false,
  uprightMedia = '(max-width: 639px)',
}: {
  art: EventArtwork;
  title: string;
  preset: VisualPreset;
  size?: 'lead' | 'card';
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Drop the fixed ratio and fill the height the parent gives us. */
  fill?: boolean;
  /**
   * When to use the upright crop. Defaults to phones. A frame that is upright
   * on a wide screen too — the homepage lead card, whose height is set by the
   * column beside it — passes its own query. It cannot be inferred from `fill`:
   * a full-width banner also fills, and is emphatically landscape.
   */
  uprightMedia?: string;
}) {
  const hasKeyArt = Boolean(art.keyArt?.path);
  const hasFlyer = Boolean(art.flyer?.path);
  const wide = art.keyArt;
  const resolvedSizes = sizes ?? (size === 'lead' ? '(min-width: 1024px) 62vw, 100vw' : '(min-width: 1024px) 30vw, 90vw');

  return (
    <div
      className={`event-art ${hasKeyArt ? 'event-art-wide' : 'event-art-flyer'} ${fill ? 'event-art-fill' : ''} ${className}`}
      style={presetVars(preset)}
      data-size={size}
    >
      {/* The lit field. Present in both arrangements, so an event with no
          artwork at all still reads as a designed object rather than a gap. */}
      <span aria-hidden="true" className="event-art-field" />

      {hasKeyArt && wide?.path ? (
        <>
          {/* A plain <picture>, not next/image: these are decorative
              backgrounds already shipped at their final size, and <picture> is
              the only way to art-direct a different CROP without downloading
              both files.

              The upright crop is used wherever the FRAME is upright, which is
              not only on phones: in backdrop mode the lead card is as tall as
              the column beside it, so on a wide screen it is portrait too. Feed
              a 16:9 file to a portrait frame and `cover` throws away most of
              the composition. */}
          <picture className="event-art-bg">
            {art.keyArtMobile?.path ? (
              <source
                media={uprightMedia}
                srcSet={art.keyArtMobile.srcSet ?? art.keyArtMobile.path}
                sizes={art.keyArtMobile.srcSet ? resolvedSizes : undefined}
              />
            ) : null}
            <img
              src={wide.path}
              srcSet={wide.srcSet}
              sizes={wide.srcSet ? resolvedSizes : undefined}
              alt=""
              width={wide.width || undefined}
              height={wide.height || undefined}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'low'}
              decoding="async"
            />
          </picture>
          <span aria-hidden="true" className="event-art-scrim" />
        </>
      ) : null}

      {hasFlyer && art.flyer ? (
        <figure className="event-art-official">
          <AssetView
            asset={art.flyer}
            id="event-flyer"
            // Contained, never cropped — the flyer's edges carry its own text.
            fit="contain"
            rounded={false}
            tone="dark"
            // Beside key art the flyer is a corner card that CSS caps at
            // 190px, so a viewport-fraction hint just over-fetches: `40vw` on a
            // phone asks for 156px for a slot that is 43px wide. Alone, it is
            // the whole composition and takes the composition's own sizes.
            sizes={
              hasKeyArt
                ? size === 'lead'
                  ? '(min-width: 640px) 190px, 140px'
                  : '(min-width: 640px) 190px, 48px'
                : resolvedSizes
            }
            priority={priority && !hasKeyArt}
            alt={`Official flyer for ${title}`}
            className="event-art-flyer-img"
          />
        </figure>
      ) : null}

      {/* Nothing at all: the event's own name, set as poster type on its own
          colour. An event awaiting artwork should look like a designed placard,
          not a hole — and the name is information, so it belongs in the DOM
          rather than in a picture anyway. */}
      {!hasKeyArt && !hasFlyer ? (
        <span className="event-art-nameplate" aria-hidden="true">
          <span className="display-poster">{title}</span>
        </span>
      ) : null}

      {art.foreground?.path ? (
        <AssetView
          asset={art.foreground}
          id="event-foreground"
          fit="contain"
          rounded={false}
          tone="dark"
          sizes="(min-width: 1024px) 22vw, 45vw"
          alt=""
          className="event-art-foreground"
        />
      ) : null}
    </div>
  );
}
