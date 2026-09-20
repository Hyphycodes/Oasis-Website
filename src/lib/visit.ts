import type { SiteSettings } from '@/content/types';
import { getOpenState, groupHours, type HoursGroup, type OpenState } from './hours';

/**
 * Everything the site needs to send somebody to an Oasis.
 *
 * One shape, built once, rendered by the location card on /contact, the full
 * /visit page and anywhere else that has to answer "where is it and is it
 * open". The list is a LIST on purpose: Lockport is the only Oasis today, and
 * the day there is a second one the pages that map over this array do not
 * change — only this function does.
 *
 * What a second location would need beyond a row in `locations`: its own
 * hours. Hours live once, in site settings, because there is one restaurant;
 * `hoursFor` is where that becomes per-location without touching a component.
 */

export interface MapLinks {
  apple: string;
  google: string;
  waze: string;
}

export interface VisitLocation {
  id: string;
  /** "Oasis Mexican Kitchen & Bar" — what the sign says. */
  name: string;
  /** "Lockport" — what staff call it, and what a second location needs. */
  shortName: string;
  /** Street on one line, town/state/zip on the next. */
  street: string;
  cityLine: string;
  /** One line, for a map query and for structured data. */
  addressOneLine: string;
  phone: string;
  hours: HoursGroup[];
  open: OpenState;
  maps: MapLinks;
  /** The photograph of this place, by semantic id. */
  photoAssetId: string;
}

/**
 * Deep links into the three map apps people actually have.
 *
 * Address-based rather than coordinate-based, because Oasis does not publish
 * coordinates first-party and a guessed pin is how somebody ends up in the
 * wrong car park. `geo` is honoured the moment it exists — Waze in particular
 * navigates better from a point than from a string.
 */
export function mapLinks(address: string, geo: { lat: number; lng: number } | null): MapLinks {
  const query = encodeURIComponent(address);
  const point = geo ? `${geo.lat},${geo.lng}` : null;
  return {
    apple: point
      ? `https://maps.apple.com/?daddr=${point}&q=${query}&dirflg=d`
      : `https://maps.apple.com/?daddr=${query}&dirflg=d`,
    google: point
      ? `https://www.google.com/maps/dir/?api=1&destination=${point}`
      : `https://www.google.com/maps/dir/?api=1&destination=${query}`,
    waze: point
      ? `https://www.waze.com/ul?ll=${point}&navigate=yes`
      : `https://www.waze.com/ul?q=${query}&navigate=yes`,
  };
}

export function buildVisitLocations(site: SiteSettings, now: Date = new Date()): VisitLocation[] {
  const cityLine = `${site.locality}, ${site.region} ${site.postalCode}`;
  const addressOneLine = `${site.name}, ${site.street}, ${cityLine}`;

  return [
    {
      id: 'lockport',
      name: site.name,
      shortName: site.locality,
      street: site.street,
      cityLine,
      addressOneLine,
      phone: site.phone.value,
      hours: groupHours(site.hours.value),
      open: getOpenState(site.hours.value, site.temporaryClosures, now, site.timeZone),
      maps: mapLinks(addressOneLine, site.geo),
      photoAssetId: 'exteriorSign',
    },
  ];
}
