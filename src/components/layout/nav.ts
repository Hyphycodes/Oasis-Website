export interface NavItem {
  label: string;
  href: string;
}

/**
 * Flat navigation. No dropdowns, no flyouts, no submenus, no disclosures.
 *
 * Every visible item is an ordinary link that navigates immediately. The
 * previous build put Food / Cocktails & Bar / Brunch behind a hover menu on
 * `Menu` and Catering / Private events behind one on `Catering`, which meant
 * clicking a top-level item did something different from hovering it. Those
 * three menus now live inside `/menu` as in-page tabs, so the nav does not need
 * to expose them at all.
 *
 * Private Events and Careers stay discoverable from page content, the mobile
 * drawer and the footer. They do not justify a desktop dropdown.
 */
export const primaryNav: NavItem[] = [
  { label: 'Menu', href: '/menu' },
  { label: 'Events', href: '/events' },
  { label: 'Catering', href: '/catering' },
  { label: 'Visit', href: '/visit' },
];

/** Mobile drawer and footer only — never the desktop bar. */
export const secondaryNav: NavItem[] = [
  { label: 'Private events', href: '/private-events' },
  { label: 'Join our team', href: '/careers' },
];
