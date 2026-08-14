'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Sticky category navigation with scroll-spy.
 *
 * Anchors are real `#id` links, so every category has a shareable URL and the
 * back button works. The active item is marked with `aria-current`, not only a
 * color change — status is never carried by color alone.
 */
export function CategoryNav({ categories }: { categories: { id: string; name: string }[] }) {
  const [active, setActive] = useState<string | null>(categories[0]?.id ?? null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Top band only, so the "current" section is the one under the sticky bar.
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    for (const category of categories) {
      const node = document.getElementById(category.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [categories]);

  // Keep the active chip in view when the rail scrolls horizontally on mobile.
  useEffect(() => {
    if (!active || !listRef.current) return;
    const chip = listRef.current.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    chip?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [active]);

  if (categories.length < 2) return null;

  return (
    <nav
      aria-label="Menu sections"
      className="sticky top-(--o-header-h) z-30 border-y border-brown/12 bg-cream/95 backdrop-blur-[2px]"
    >
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8 lg:px-12">
        <ul
          ref={listRef}
          className="-mx-1 flex snap-x gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => {
            const isActive = active === category.id;
            return (
              <li key={category.id} className="snap-start">
                <a
                  href={`#${category.id}`}
                  data-cat={category.id}
                  aria-current={isActive ? 'true' : undefined}
                  className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-(--radius-md) px-3 text-[0.875rem] font-medium transition-colors ${
                    isActive
                      ? 'bg-brown text-cream'
                      : 'text-brown-soft hover:bg-brown/8 hover:text-brown'
                  }`}
                >
                  {category.name}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
