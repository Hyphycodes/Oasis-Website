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
  keyArt: PublicAsset | null;
  keyArtMobile: PublicAsset | null;
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
}: {
  art: EventArtwork;
  title: string;
  preset: VisualPreset;
  size?: 'lead' | 'card';
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const hasKeyArt = Boolean(art.keyArt?.path);
  const hasFlyer = Boolean(art.flyer?.path);
  const wide = art.keyArt;
  const resolvedSizes = sizes ?? (size === 'lead' ? '(min-width: 1024px) 62vw, 100vw' : '(min-width: 1024px) 30vw, 90vw');

  return (
    <div
      className={`event-art ${hasKeyArt ? 'event-art-wide' : 'event-art-flyer'} ${className}`}
      style={presetVars(preset)}
      data-size={size}
    >
      {/* The lit field. Present in both arrangements, so an event with no
          artwork at all still reads as a designed object rather than a gap. */}
      <span aria-hidden="true" className="event-art-field" />

      {hasKeyArt && wide ? (
        <>
          <AssetView
            asset={wide}
            id="event-key-art"
            className="event-art-bg"
            sizes={resolvedSizes}
            priority={priority}
            rounded={false}
            tone="dark"
            alt=""
          />
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
            sizes={hasKeyArt ? '(min-width: 1024px) 18vw, 40vw' : resolvedSizes}
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
