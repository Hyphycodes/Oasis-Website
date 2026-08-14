import { Frame } from '@/components/primitives/Band';
import type { Menu, MenuItem } from '@/content/types';
import { formatPrice } from '@/lib/format';
import { CategoryNav } from './CategoryNav';

const DIETARY_LABEL: Record<string, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free-option': 'Gluten-free option',
  spicy: 'Spicy',
};

function Price({ item }: { item: MenuItem }) {
  if (item.priceCents != null) {
    return (
      <p className="tabular shrink-0 text-[1.0625rem] font-semibold text-brown">
        {formatPrice(item.priceCents)}
      </p>
    );
  }

  // A missing base price is stated plainly. It is never rendered as $0 and never
  // silently omitted. See docs/CONTENT-QUESTIONS.md §3.
  return (
    <p className="shrink-0 text-[0.8125rem] font-medium text-brown-soft">
      {item.priceNote ?? 'Ask your server'}
    </p>
  );
}

function Item({ item }: { item: MenuItem }) {
  const priced = item.modifiers.filter((m) => m.priceCents != null);
  const choices = item.modifiers.filter((m) => m.priceCents == null);

  return (
    <li
      className={`border-b border-brown/12 py-6 last:border-b-0 ${
        item.available ? '' : 'opacity-60'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-[1.0625rem] font-semibold leading-snug text-brown">
          {item.name}
          {!item.available ? (
            <span className="ml-2 align-middle text-[0.75rem] font-medium text-warning">
              Currently unavailable
            </span>
          ) : null}
        </h3>
        <Price item={item} />
      </div>

      {item.description ? (
        <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-brown-soft">
          {item.description}
        </p>
      ) : null}

      {item.dietary.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.dietary.map((tag) => (
            <li
              key={tag}
              className="rounded-(--radius-sm) border border-brown/20 px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-brown-soft"
            >
              {DIETARY_LABEL[tag] ?? tag}
            </li>
          ))}
        </ul>
      ) : null}

      {choices.length > 0 ? (
        <p className="mt-3 text-[0.875rem] text-brown-soft">
          {item.modifierGroupLabel ? (
            <span className="font-medium text-brown">{item.modifierGroupLabel}: </span>
          ) : null}
          {choices.map((m) => m.label).join(' · ')}
        </p>
      ) : null}

      {priced.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.875rem] text-brown-soft">
          {priced.map((m) => (
            <li key={m.label} className="tabular">
              {m.label} <span className="text-brown">+{formatPrice(m.priceCents!)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Editorial menu.
 *
 * Two things the current site gets wrong that are fixed structurally here:
 *  1. Modifiers render as compressed inline runs, not as full-width rows with the
 *     same weight as dishes — so a 40-item menu reads as 40 items, not 90.
 *  2. Category navigation sticks, so switching sections does not mean scrolling
 *     back to the top of a 12-screen page on a phone.
 */
export function MenuView({ menu }: { menu: Menu }) {
  if (menu.categories.length === 0) {
    return (
      <Frame>
        <div className="border-y border-brown/15 py-16 text-center">
          <p className="measure mx-auto text-[length:var(--text-body-lg)] leading-relaxed text-brown-soft">
            {menu.emptyState}
          </p>
        </div>
      </Frame>
    );
  }

  return (
    <>
      <CategoryNav categories={menu.categories.map((c) => ({ id: c.id, name: c.name }))} />
      <Frame>
        <div className="pb-(--spacing-band)">
          {menu.categories.map((category) => (
            <section
              key={category.id}
              id={category.id}
              aria-labelledby={`${category.id}-heading`}
              className="pt-14 first:pt-10"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b-2 border-brown/25 pb-3">
                <h2
                  id={`${category.id}-heading`}
                  className="display text-[clamp(1.5rem,3vw,2.125rem)] text-brown"
                >
                  {category.name}
                </h2>
                {category.note ? (
                  <p className="text-[0.875rem] text-brown-soft">{category.note}</p>
                ) : null}
              </div>
              <ul>
                {category.items.map((item) => (
                  <Item key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Frame>
    </>
  );
}
