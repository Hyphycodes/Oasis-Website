/**
 * Content model types. These mirror the Supabase schema in supabase/migrations/
 * one-for-one — see docs/CONTENT-MODEL.md.
 *
 * The static modules in this directory are both the zero-config fallback for the
 * public site AND the source used to generate supabase/seed.sql.
 */

export type Provisional<T> = {
  value: T;
  /** True when the value is disputed or unconfirmed. See docs/CONTENT-QUESTIONS.md. */
  provisional: boolean;
  /** Which section of CONTENT-QUESTIONS.md documents the open question. */
  note?: string;
};

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface HoursRange {
  /** Minutes from midnight, local venue time. */
  openMinutes: number;
  /** Minutes from midnight. May exceed 1440 for past-midnight closing. */
  closeMinutes: number;
}

export interface DayHours {
  day: Weekday;
  ranges: HoursRange[];
  closed?: boolean;
}

export interface TemporaryClosure {
  id: string;
  /** ISO date, venue-local. */
  date: string;
  reason: string;
  allDay: boolean;
}

export interface SocialAccount {
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
  handle: string;
  url: string;
}

export interface SiteSettings {
  name: string;
  shortName: string;
  tagline: string;
  street: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
  /** Coordinates are only used for the static map treatment and JSON-LD. */
  geo: { lat: number; lng: number } | null;
  phone: Provisional<string>;
  /** Second number found on Toast. Not published; recorded so it is not lost. */
  altPhone: Provisional<string> | null;
  email: string | null;
  timeZone: string;
  hours: Provisional<DayHours[]>;
  temporaryClosures: TemporaryClosure[];
  reservationUrl: string;
  orderUrl: string;
  cateringOrderUrl: string;
  directionsUrl: string;
  socials: SocialAccount[];
  priceRange: string;
  cuisine: string[];
}

/* -------------------------------------------------------------------------- */
/* Announcement                                                               */
/* -------------------------------------------------------------------------- */

export interface Announcement {
  id: string;
  message: string;
  href: string | null;
  linkLabel: string | null;
  /** ISO datetime, or null for "no start bound". */
  startsAt: string | null;
  endsAt: string | null;
  enabled: boolean;
  tone: 'default' | 'night';
}

/* -------------------------------------------------------------------------- */
/* Menus                                                                      */
/* -------------------------------------------------------------------------- */

export type MenuSlug = 'food' | 'cocktails' | 'brunch';

export type Dietary = 'vegetarian' | 'vegan' | 'gluten-free-option' | 'spicy';

export interface MenuModifier {
  label: string;
  /** null = the upcharge is not published. Renders as a plain choice, not "$0". */
  priceCents: number | null;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  /**
   * null means the base price is genuinely not published anywhere first-party.
   * It renders as `priceNote` ("Market price — ask your server"), never as $0
   * and never silently omitted. See docs/CONTENT-QUESTIONS.md §3.
   */
  priceCents: number | null;
  priceNote: string | null;
  modifierGroupLabel: string | null;
  modifiers: MenuModifier[];
  dietary: Dietary[];
  available: boolean;
  featured: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  note: string | null;
  items: MenuItem[];
}

export interface Menu {
  slug: MenuSlug;
  title: string;
  /** Rendered above the categories. Used for the brunch service window. */
  note: string | null;
  /** Shown when a menu has no categories yet — brunch. Never invented items. */
  emptyState: string | null;
  categories: MenuCategory[];
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export type EventStatus = 'scheduled' | 'sold-out' | 'cancelled' | 'postponed' | 'free';

/** `weekly:5` = every Friday. Weekday uses the same 0=Sunday indexing as Date. */
export type Cadence = { kind: 'weekly'; weekday: Weekday } | { kind: 'one-time' };

/**
 * A series carries NO date. That is the entire point: a recurring series cannot
 * render a stale date because it has no date to render. Dates live only on
 * occurrences and are composited over artwork as live HTML.
 * See PLAN.md §4.1.
 */
export interface EventSeries {
  slug: string;
  title: string;
  summary: string;
  description: string;
  cadence: Cadence;
  /** Minutes from midnight, venue-local. */
  startMinutes: number;
  /** Minutes from midnight; > 1440 means it ends after midnight. */
  endMinutes: number;
  ageMin: number | null;
  ageNote: string | null;
  musicFormats: string[];
  venueName: string;
  /** Optional. When absent the poster is composed from event data instead. */
  artworkAssetId: string | null;
  ticketUrl: string | null;
  priceCents: number | null;
  feeCents: number | null;
  status: EventStatus;
  /** Generated occurrences stop here. null = open-ended. */
  seriesEndsOn: string | null;
}

export interface EventOccurrence {
  id: string;
  seriesSlug: string;
  /** ISO datetime with venue offset. */
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  ticketUrl: string | null;
  priceCents: number | null;
  feeCents: number | null;
}

export interface ResolvedEvent extends EventOccurrence {
  series: EventSeries;
}

/* -------------------------------------------------------------------------- */
/* Catering                                                                   */
/* -------------------------------------------------------------------------- */

export interface CateringPackage {
  id: string;
  name: string;
  servesMin: number | null;
  servesMax: number | null;
  priceCents: number;
  includes: string[];
}

export interface CateringItem {
  id: string;
  name: string;
  priceCents: number;
  note: string | null;
}

/* -------------------------------------------------------------------------- */
/* Page sections                                                              */
/* -------------------------------------------------------------------------- */

export interface PageSection {
  key: string;
  eyebrow: string | null;
  heading: string;
  body: string | null;
  visible: boolean;
  /** Approved layout variants. Editors choose from these; they cannot author CSS. */
  variant: 'editorial-left' | 'editorial-right' | 'stagger' | 'band' | 'plain';
}

export interface PageSeo {
  title: string;
  description: string;
  /** Asset ID for the social image, or null to use the site default. */
  ogAssetId: string | null;
}

/* -------------------------------------------------------------------------- */
/* Inquiries                                                                  */
/* -------------------------------------------------------------------------- */

export type InquiryType = 'catering' | 'private-event' | 'careers';

export interface InquiryRecord {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone: string | null;
  payload: Record<string, string | number | boolean | null>;
  status: 'new' | 'in-progress' | 'closed';
  notes: string | null;
  createdAt: string;
}
