import type { Metadata } from 'next';
import { allMenus } from '@/content/menu';
import { site } from '@/content/site';
import type { ResolvedEvent } from '@/content/types';
import { toSchemaHours } from './hours';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.oasismexicankitchenbar.com'
).replace(/\/$/, '');

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description,
  path,
  images,
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: 'website',
      locale: 'en_US',
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

/**
 * Restaurant structured data.
 *
 * Built ONLY from verified facts. `geo` is omitted rather than guessed, `email`
 * is omitted because none is published, and `priceRange` comes from the actual
 * menu. Hours come from the same source of truth the footer renders, so the two
 * can never drift apart.
 */
export function restaurantJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: site.name,
    url: SITE_URL,
    telephone: site.phone.value,
    servesCuisine: site.cuisine,
    priceRange: site.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.street,
      addressLocality: site.locality,
      addressRegion: site.region,
      postalCode: site.postalCode,
      addressCountry: site.country,
    },
    openingHoursSpecification: toSchemaHours(site.hours.value),
    acceptsReservations: site.reservationUrl,
    hasMenu: allMenus.map((menu) => ({
      '@type': 'Menu',
      name: `${menu.title} menu`,
      url: absoluteUrl(menu.slug === 'food' ? '/menu' : `/menu/${menu.slug}`),
    })),
    sameAs: site.socials.map((s) => s.url),
    potentialAction: {
      '@type': 'OrderAction',
      target: site.orderUrl,
    },
  };
}

export function menuJsonLd(menu: (typeof allMenus)[number]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `${menu.title} menu — ${site.name}`,
    hasMenuSection: menu.categories.map((category) => ({
      '@type': 'MenuSection',
      name: category.name,
      hasMenuItem: category.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
        // A null price is omitted entirely. It is never emitted as 0.
        ...(item.priceCents != null
          ? {
              offers: {
                '@type': 'Offer',
                price: (item.priceCents / 100).toFixed(2),
                priceCurrency: 'USD',
              },
            }
          : {}),
      })),
    })),
  };
}

const EVENT_STATUS: Record<string, string> = {
  scheduled: 'https://schema.org/EventScheduled',
  'sold-out': 'https://schema.org/EventScheduled',
  cancelled: 'https://schema.org/EventCancelled',
  postponed: 'https://schema.org/EventPostponed',
  free: 'https://schema.org/EventScheduled',
};

/** Event data comes from the occurrence, never from artwork. */
export function eventJsonLd(event: ResolvedEvent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.series.title,
    description: event.series.description,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus: EVENT_STATUS[event.status] ?? EVENT_STATUS.scheduled,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: absoluteUrl(`/events/${event.series.slug}`),
    location: {
      '@type': 'Place',
      name: event.series.venueName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.street,
        addressLocality: site.locality,
        addressRegion: site.region,
        postalCode: site.postalCode,
        addressCountry: site.country,
      },
    },
    organizer: { '@type': 'Organization', name: site.name, url: SITE_URL },
    ...(event.priceCents != null && event.ticketUrl
      ? {
          offers: {
            '@type': 'Offer',
            price: (event.priceCents / 100).toFixed(2),
            priceCurrency: 'USD',
            url: event.ticketUrl,
            availability:
              event.status === 'sold-out'
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
            validFrom: new Date().toISOString(),
          },
        }
      : {}),
    ...(event.series.ageMin ? { typicalAgeRange: `${event.series.ageMin}-` } : {}),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is generated from typed content, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
