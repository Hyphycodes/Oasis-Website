import 'server-only';

import type { Db, Row } from '@/lib/db/types';
import { getUpcomingEvents, ineligibleReason, venueIsoDate } from '@/lib/events';
import { getEditableEvents } from './events';
import { stateOf, type EditorialRow } from './editorial';
import { getMediaLibrary } from './media';
import { getEditableMenus } from './menu';
import { listThemeRecords } from './theme';
import { THEMES } from '@/themes/registry';
import { formatVenueMoment, themeStatusAt } from '@/themes/schedule';

/**
 * What needs attention, computed from the real records.
 *
 * Every warning here has to satisfy one rule: it links to the exact field that
 * fixes it. A dashboard that says "3 problems" and makes you hunt for them is
 * worse than no dashboard, because it trains people to ignore it.
 */

export interface Attention {
  id: string;
  severity: 'blocking' | 'warning' | 'info';
  message: string;
  /** Where to go to fix it. */
  href: string;
  actionLabel: string;
}

export async function getAttention(db: Db, now: Date): Promise<Attention[]> {
  const items: Attention[] = [];

  const [menus, events, media, sections, lists, specials] = await Promise.all([
    getEditableMenus(db),
    getEditableEvents(db),
    getMediaLibrary(db),
    db.list<Row>('page_sections'),
    db.list<Row>('page_lists'),
    db.list<Row>('special_hours', { orderBy: 'on_date' }),
  ]);

  /* ------------------------------------------------------------- events -- */

  const upcoming = getUpcomingEvents(events, now);

  for (const series of events.series) {
    if (series.archivedAt) continue;

    const future = upcoming.filter((event) => event.seriesSlug === series.slug);
    if (future.length === 0 && !series.paused) {
      items.push({
        id: `series-empty-${series.slug}`,
        severity: 'blocking',
        message: `${series.title} has no dates coming up. Guests see nothing for it.`,
        href: `/admin/events/${series.slug}`,
        actionLabel: 'Open the series',
      });
    }

    if (series.ticketPolicy === 'required' && !series.flyerAssetId) {
      items.push({
        id: `series-artwork-${series.slug}`,
        severity: 'warning',
        message: `${series.title} has no flyer, so the events page shows a placeholder.`,
        href: `/admin/events/${series.slug}`,
        actionLabel: 'Add artwork',
      });
    }
  }

  // The failure the August 15 audit found: something already finished still being
  // presented as what is on. It cannot happen through the selector, so this
  // checks the stored overrides, which a person can edit by hand.
  for (const row of await db.list<Row>('event_occurrences')) {
    if (row.archived_at) continue;
    const date = String(row.starts_at).slice(0, 10);
    const isPast = date < venueIsoDate(now.toISOString());
    if (isPast && row.published !== false && row.status !== 'cancelled') {
      items.push({
        id: `stale-occurrence-${row.id}`,
        severity: 'warning',
        message: `${row.title ?? 'A night'} on ${date} has passed but is still published. It is hidden from guests automatically — tidy it up when you get a moment.`,
        href: '/admin/events',
        actionLabel: 'Review',
      });
    }
  }

  for (const event of upcoming.slice(0, 8)) {
    if (!event.ticketUrl && event.series?.ticketPolicy === 'required') {
      items.push({
        id: `no-tickets-${event.id}`,
        severity: 'blocking',
        message: `${event.title} on ${venueIsoDate(event.startsAt)} has no ticket link.`,
        href: `/admin/events/${event.seriesSlug ?? ''}`,
        actionLabel: 'Add the link',
      });
    }
    const reason = ineligibleReason(event, now);
    if (reason === 'Draft — not on the website yet') {
      items.push({
        id: `draft-event-${event.id}`,
        severity: 'info',
        message: `${event.title} on ${venueIsoDate(event.startsAt)} is still a draft.`,
        href: '/admin/events',
        actionLabel: 'Publish it',
      });
    }
  }

  /* --------------------------------------------------------------- menu -- */

  const allItems = menus.flatMap((menu) =>
    menu.categories.flatMap((category) => category.items.map((item) => ({ menu, category, item }))),
  );

  const waiting = allItems.filter(({ item }) => item.state === 'changed');
  if (waiting.length > 0) {
    items.push({
      id: 'menu-drafts',
      severity: 'warning',
      message: `${waiting.length} menu ${waiting.length === 1 ? 'change is' : 'changes are'} saved but not published yet.`,
      href: '/admin/menu',
      actionLabel: 'Review and publish',
    });
  }

  const soldOut = allItems.filter(({ item }) => item.availability === 'unavailable');
  if (soldOut.length > 0) {
    items.push({
      id: 'menu-sold-out',
      severity: 'info',
      message: `${soldOut.length} ${soldOut.length === 1 ? 'dish is' : 'dishes are'} marked sold out: ${soldOut
        .slice(0, 3)
        .map(({ item }) => item.name)
        .join(', ')}. Guests still see them, greyed out.`,
      href: '/admin/menu',
      actionLabel: 'Put them back',
    });
  }

  const unpriced = allItems.filter(
    ({ item }) => item.priceMode === 'ask-server' && item.availability !== 'hidden',
  );
  if (unpriced.length > 0) {
    items.push({
      id: 'menu-unpriced',
      severity: 'info',
      message: `${unpriced.length} ${unpriced.length === 1 ? 'item shows' : 'items show'} “Ask your server” instead of a price.`,
      href: '/admin/menu',
      actionLabel: 'Add prices',
    });
  }

  /* -------------------------------------------------------------- media -- */

  for (const asset of media) {
    if (asset.archivedAt || !asset.path) continue;
    if (!asset.decorative && !asset.alt?.trim()) {
      items.push({
        id: `alt-${asset.assetId}`,
        severity: 'blocking',
        message: `“${asset.title}” has no description, so screen readers cannot describe it.`,
        href: `/admin/media/${asset.assetId}`,
        actionLabel: 'Describe it',
      });
    }
  }

  /* ------------------------------------------------------------ website -- */

  for (const row of [...sections, ...lists]) {
    if (stateOf(row as EditorialRow) !== 'changed') continue;
    const page = String(row.page ?? 'home');
    items.push({
      id: `page-draft-${row.id}`,
      severity: 'warning',
      message: `Changes to the ${page === 'home' ? 'homepage' : page} are saved but not published.`,
      href: `/admin/website/${page}`,
      actionLabel: 'Review and publish',
    });
  }

  /* -------------------------------------------------------------- hours -- */

  const today = venueIsoDate(now.toISOString());
  const soon = venueIsoDate(new Date(now.getTime() + 7 * 86_400_000).toISOString());
  for (const row of specials) {
    const date = String(row.on_date);
    if (date >= today && date <= soon) {
      items.push({
        id: `special-${row.id}`,
        severity: 'info',
        message: `Special hours are set for ${date}: ${row.note}.`,
        href: '/admin/settings',
        actionLabel: 'Check it',
      });
    }
  }

  /* -------------------------------------------------------------- theme -- */

  // Guarded: the table arrives with migration 0004, and a dashboard must not
  // fail because one migration has not been applied yet.
  const themes = await listThemeRecords(db).catch(() => []);
  for (const record of themes) {
    const status = themeStatusAt(record, now);
    const name = THEMES[record.slug].name;
    if (status === 'ended') {
      items.push({
        id: `theme-ended-${record.slug}`,
        severity: 'warning',
        message: `${name} is switched on but its dates have passed, so guests see Default Oasis. Set new dates or switch it off.`,
        href: '/admin/theme',
        actionLabel: 'Open the seasonal look',
      });
    } else if (status === 'scheduled') {
      items.push({
        id: `theme-scheduled-${record.slug}`,
        severity: 'info',
        message: `${name} switches itself on ${formatVenueMoment(record.startAt, 'America/Chicago')}.`,
        href: '/admin/theme',
        actionLabel: 'Preview it',
      });
    }
  }

  const order = { blocking: 0, warning: 1, info: 2 };
  return items.sort((a, b) => order[a.severity] - order[b.severity]);
}

/** The most recent edits across every kind of record, for "recently changed". */
export async function getRecentChanges(db: Db, limit = 8) {
  const rows = await db.list<Row>('content_versions', { orderBy: 'at', desc: true, limit });
  return rows.map((row) => ({
    id: String(row.id),
    table: String(row.table_name),
    rowId: String(row.row_id),
    label: String(row.label ?? ''),
    actorName: String(row.actor_name ?? 'Someone'),
    at: String(row.at),
  }));
}

export const TABLE_LABEL: Record<string, string> = {
  menu_items: 'Menu item',
  menu_categories: 'Menu section',
  menus: 'Menu',
  event_series: 'Event series',
  event_occurrences: 'Event night',
  page_sections: 'Website copy',
  page_lists: 'Form options',
  media_assets: 'Photo',
  catering_packages: 'Catering package',
  catering_items: 'Catering tray',
};
