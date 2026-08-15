/**
 * The smallest database surface the admin actually needs.
 *
 * Every repository in `src/server/content/` is written against this interface and
 * nothing else, so the Supabase adapter and the local development adapter cannot
 * drift apart in behaviour — there is one write path, not two.
 *
 * It is deliberately not a query builder. Anything more expressive would be a
 * feature the local adapter has to reimplement, and a place the two could differ.
 */

export type Row = Record<string, unknown>;

export interface ListOptions {
  /** Equality filters, ANDed. `null` matches SQL `is null`. */
  where?: Record<string, string | number | boolean | null>;
  /** Column to sort by, ascending unless `desc`. */
  orderBy?: string;
  desc?: boolean;
  limit?: number;
}

export interface Db {
  /** Rows matching `where`, in `orderBy` order. Never throws on empty. */
  list<T extends Row>(table: string, options?: ListOptions): Promise<T[]>;
  /** One row by primary key, or null. */
  get<T extends Row>(table: string, id: string): Promise<T | null>;
  insert<T extends Row>(table: string, row: Row): Promise<T>;
  /** Partial update by primary key. Returns the updated row. */
  update<T extends Row>(table: string, id: string, patch: Row): Promise<T>;
  /** Insert or update by primary key. */
  upsert<T extends Row>(table: string, row: Row): Promise<T>;
  /**
   * Hard delete. Used only for rows that are genuinely transient — a draft that
   * was never published, a generated occurrence being regenerated. Content that
   * a guest has seen is archived, never deleted.
   */
  remove(table: string, id: string): Promise<void>;
  /** Which adapter answered. Surfaced in the admin so nobody is guessing. */
  readonly kind: 'supabase' | 'local';
}

/**
 * Primary key column per table. The adapters need it; `id` is not universal here
 * because menus and event series are keyed by their public slug, which is the
 * whole point — the slug is a stable public identifier, not a surrogate.
 */
export const PRIMARY_KEY: Record<string, string> = {
  announcements: 'id',
  audit_log: 'id',
  catering_items: 'id',
  catering_packages: 'id',
  content_versions: 'id',
  event_occurrences: 'id',
  event_series: 'slug',
  inquiries: 'id',
  media_assets: 'asset_id',
  menu_categories: 'id',
  menu_items: 'id',
  menu_modifiers: 'id',
  menus: 'slug',
  page_lists: 'id',
  page_sections: 'id',
  page_seo: 'page',
  profiles: 'user_id',
  site_settings: 'id',
  special_hours: 'id',
};

export function primaryKey(table: string): string {
  const key = PRIMARY_KEY[table];
  if (!key) throw new Error(`Unknown table "${table}" — add it to PRIMARY_KEY.`);
  return key;
}
