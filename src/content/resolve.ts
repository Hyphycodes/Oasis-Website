import 'server-only';

import { cache } from 'react';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { cateringItems, cateringPackages } from './catering';
import { allMenus, brunchMenu, cocktailMenu, foodMenu } from './menu';
import { announcements, site } from './site';
import type {
  Announcement,
  CateringItem,
  CateringPackage,
  Menu,
  MenuSlug,
  SiteSettings,
} from './types';

/**
 * THE CONTENT RESOLUTION RULE (PLAN.md §1.1)
 *
 *   component -> resolve.ts -> Supabase (if configured AND reachable)
 *                           -> static TS modules (always, as fallback)
 *
 * Consequences that matter:
 *  - The public site cannot go blank because the CMS is down or misconfigured.
 *  - `git clone && npm i && npm run dev` works with zero configuration.
 *  - The static modules double as seed data for supabase/seed.sql.
 *
 * Every function here is wrapped in React `cache` so a single render never issues
 * the same query twice.
 */

/** Supabase must answer quickly or we serve last-known-good content instead. */
const QUERY_TIMEOUT_MS = 2500;

async function withFallback<T>(label: string, query: () => Promise<T | null>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;

  try {
    const result = await Promise.race([
      query(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), QUERY_TIMEOUT_MS)),
    ]);
    return result ?? fallback;
  } catch (error) {
    // Never throw from a content read. A CMS outage degrades to static content;
    // it does not take the restaurant's website offline.
    console.error(`[content] ${label} failed, serving static fallback:`, error);
    return fallback;
  }
}

/* -------------------------------------------------------------------------- */

export const getSiteSettings = cache(async (): Promise<SiteSettings> =>
  withFallback(
    'site settings',
    async () => {
      const supabase = getServiceClient();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
      if (error || !data) return null;
      return { ...site, ...(data.payload as Partial<SiteSettings>) } as SiteSettings;
    },
    site,
  ),
);

export const getAnnouncements = cache(async (): Promise<Announcement[]> =>
  withFallback(
    'announcements',
    async () => {
      const supabase = getServiceClient();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('enabled', true)
        .order('created_at', { ascending: false });
      if (error || !data) return null;
      return data.map(
        (row): Announcement => ({
          id: row.id as string,
          message: row.message as string,
          href: (row.href as string | null) ?? null,
          linkLabel: (row.link_label as string | null) ?? null,
          startsAt: (row.starts_at as string | null) ?? null,
          endsAt: (row.ends_at as string | null) ?? null,
          enabled: row.enabled as boolean,
          tone: (row.tone as Announcement['tone']) ?? 'default',
        }),
      );
    },
    announcements,
  ),
);

const STATIC_MENUS: Record<MenuSlug, Menu> = {
  food: foodMenu,
  cocktails: cocktailMenu,
  brunch: brunchMenu,
};

export const getMenu = cache(async (slug: MenuSlug): Promise<Menu> =>
  withFallback(
    `menu:${slug}`,
    async () => {
      const supabase = getServiceClient();
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('menus')
        .select(
          `slug, title, note, empty_state,
           menu_categories ( id, name, note, sort,
             menu_items ( id, name, description, price_cents, price_note,
                          modifier_group_label, dietary, available, featured, sort,
                          menu_modifiers ( label, price_cents, sort ) ) )`,
        )
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) return null;

      const categories = (data.menu_categories ?? [])
        .slice()
        .sort((a, b) => (a.sort as number) - (b.sort as number))
        .map((category) => ({
          id: category.id as string,
          name: category.name as string,
          note: (category.note as string | null) ?? null,
          items: (category.menu_items ?? [])
            .slice()
            .sort((a, b) => (a.sort as number) - (b.sort as number))
            .map((item) => ({
              id: item.id as string,
              name: item.name as string,
              description: (item.description as string | null) ?? null,
              priceCents: (item.price_cents as number | null) ?? null,
              priceNote: (item.price_note as string | null) ?? null,
              modifierGroupLabel: (item.modifier_group_label as string | null) ?? null,
              modifiers: (item.menu_modifiers ?? [])
                .slice()
                .sort((a, b) => (a.sort as number) - (b.sort as number))
                .map((m) => ({
                  label: m.label as string,
                  priceCents: (m.price_cents as number | null) ?? null,
                })),
              dietary: (item.dietary as Menu['categories'][number]['items'][number]['dietary']) ?? [],
              available: item.available as boolean,
              featured: item.featured as boolean,
            })),
        }));

      return {
        slug,
        title: data.title as string,
        note: (data.note as string | null) ?? null,
        emptyState: (data.empty_state as string | null) ?? null,
        categories,
      };
    },
    STATIC_MENUS[slug],
  ),
);

export const getAllMenus = cache(async (): Promise<Menu[]> => {
  const resolved = await Promise.all(allMenus.map((menu) => getMenu(menu.slug)));
  return resolved;
});

export const getCateringPackages = cache(async (): Promise<CateringPackage[]> =>
  withFallback(
    'catering packages',
    async () => {
      const supabase = getServiceClient();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('catering_packages')
        .select('*')
        .order('sort', { ascending: true });
      if (error || !data?.length) return null;
      return data.map(
        (row): CateringPackage => ({
          id: row.id as string,
          name: row.name as string,
          servesMin: (row.serves_min as number | null) ?? null,
          servesMax: (row.serves_max as number | null) ?? null,
          priceCents: row.price_cents as number,
          includes: (row.includes as string[]) ?? [],
        }),
      );
    },
    cateringPackages,
  ),
);

export const getCateringItems = cache(async (): Promise<CateringItem[]> =>
  withFallback(
    'catering items',
    async () => {
      const supabase = getServiceClient();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('catering_items')
        .select('*')
        .order('sort', { ascending: true });
      if (error || !data?.length) return null;
      return data.map(
        (row): CateringItem => ({
          id: row.id as string,
          name: row.name as string,
          priceCents: row.price_cents as number,
          note: (row.note as string | null) ?? null,
        }),
      );
    },
    cateringItems,
  ),
);
