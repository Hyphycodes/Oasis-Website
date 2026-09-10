import 'server-only';

import type { EventArtwork } from '@/components/events/EventArt';
import { getMediaMap, type PublicAsset } from '@/content/media';
import type { ResolvedEvent } from '@/content/types';

/**
 * An event's four artwork slots, resolved to real files.
 *
 * One media lookup for a whole page — the map is request-cached, so a homepage
 * showing three events and a page showing twenty both cost one query.
 *
 * A slot whose asset was archived or never existed comes back null, and the
 * composition handles that: an event with nothing but its flyer still renders,
 * and an event with nothing at all still renders as its own lit colour field.
 */
export async function resolveEventArtwork(event: ResolvedEvent): Promise<EventArtwork> {
  const media = await getMediaMap();
  const pick = (id: string | null): PublicAsset | null => {
    if (!id) return null;
    const asset = media[id];
    return asset?.path ? asset : null;
  };

  return {
    // The official flyer, first and always available.
    flyer: pick(event.flyerAssetId),
    keyArt: pick(event.presentation.keyArtAssetId),
    keyArtMobile: pick(event.presentation.keyArtMobileAssetId),
    foreground: pick(event.presentation.foregroundAssetId),
  };
}

/** The same, for a list, without re-reading the map per event. */
export async function resolveManyEventArtwork(
  events: ResolvedEvent[],
): Promise<Map<string, EventArtwork>> {
  const media = await getMediaMap();
  const pick = (id: string | null): PublicAsset | null => {
    if (!id) return null;
    const asset = media[id];
    return asset?.path ? asset : null;
  };

  return new Map(
    events.map((event) => [
      event.id,
      {
        flyer: pick(event.flyerAssetId),
        keyArt: pick(event.presentation.keyArtAssetId),
        keyArtMobile: pick(event.presentation.keyArtMobileAssetId),
        foreground: pick(event.presentation.foregroundAssetId),
      },
    ]),
  );
}
