'use client';

import { useEffect, useRef, useState } from 'react';
import type { Menu, MenuSlug } from '@/content/types';
import { MenuSections } from './MenuSections';

const TAB_LABEL: Record<MenuSlug, string> = {
  food: 'Food',
  cocktails: 'Cocktails & Bar',
  brunch: 'Brunch',
};

/**
 * One menu experience, three views.
 *
 * Food, Cocktails & Bar and Brunch used to be three separate routes, each with
 * its own full-page introduction — so comparing a taco to a margarita meant two
 * page loads and reading two intros. They are now in-page tabs.
 *
 * Behaviour that matters:
 *  - The hash is the state (`/menu#cocktails`), so views are deep-linkable and
 *    the back button moves between them.
 *  - Legacy `/menu/cocktails` and `/menu/brunch` redirect to those hashes, so no
 *    inbound link or indexed URL breaks.
 *  - Real tab semantics: roles, `aria-selected`, and arrow-key roving focus.
 *  - Every panel is rendered, with the inactive ones hidden — so browser
 *    find-in-page and "reader" tools still reach the whole menu, and switching
 *    is instant rather than a fetch.
 */
export function MenuTabs({ menus }: { menus: Menu[] }) {
  const slugs = menus.map((menu) => menu.slug);
  const [active, setActive] = useState<MenuSlug>('food');
  const tabsRef = useRef<HTMLDivElement>(null);

  // Hash drives the state, including on first load and on back/forward.
  useEffect(() => {
    function fromHash() {
      const hash = window.location.hash.replace('#', '') as MenuSlug;
      setActive(slugs.includes(hash) ? hash : 'food');
    }
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function select(slug: MenuSlug) {
    setActive(slug);
    // replaceState, not a jump: switching tabs should not scroll the page.
    window.history.replaceState(null, '', slug === 'food' ? '/menu' : `/menu#${slug}`);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const index = slugs.indexOf(active);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % slugs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + slugs.length) % slugs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = slugs.length - 1;
    else return;

    event.preventDefault();
    const slug = slugs[next]!;
    select(slug);
    tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${slug}"]`)?.focus();
  }

  return (
    <>
      <div className="sticky top-(--o-header-h) z-30 border-y border-brown/12 bg-ivory/95 backdrop-blur-[2px]">
        <div className="mx-auto max-w-[1120px] px-5 sm:px-8 lg:px-12">
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Menu sections"
            onKeyDown={onKeyDown}
            className="-mx-1 flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {menus.map((menu) => {
              const selected = active === menu.slug;
              return (
                <button
                  key={menu.slug}
                  type="button"
                  role="tab"
                  data-tab={menu.slug}
                  id={`tab-${menu.slug}`}
                  aria-selected={selected}
                  aria-controls={`panel-${menu.slug}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(menu.slug)}
                  className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-(--radius-md) px-4 text-[0.9375rem] font-semibold transition-colors ${
                    selected
                      ? 'bg-brown text-ivory'
                      : 'text-brown-soft hover:bg-brown/8 hover:text-brown'
                  }`}
                >
                  {TAB_LABEL[menu.slug]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {menus.map((menu) => (
        <div
          key={menu.slug}
          role="tabpanel"
          id={`panel-${menu.slug}`}
          aria-labelledby={`tab-${menu.slug}`}
          hidden={active !== menu.slug}
        >
          <MenuSections menu={menu} />
        </div>
      ))}
    </>
  );
}
