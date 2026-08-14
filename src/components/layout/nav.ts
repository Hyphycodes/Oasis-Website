export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

/**
 * Navigation is data, not markup. Catering finally appears here — the current
 * site hides an entire catering program inside the Toast ordering flow.
 */
export const primaryNav: NavItem[] = [
  {
    label: 'Menu',
    href: '/menu',
    children: [
      { label: 'Food', href: '/menu' },
      { label: 'Cocktails & Bar', href: '/menu/cocktails' },
      { label: 'Brunch', href: '/menu/brunch' },
    ],
  },
  { label: 'Events', href: '/events' },
  {
    label: 'Catering',
    href: '/catering',
    children: [
      { label: 'Catering', href: '/catering' },
      { label: 'Private events', href: '/private-events' },
    ],
  },
  { label: 'Visit', href: '/visit' },
];

export const secondaryNav: NavItem[] = [{ label: 'Join our team', href: '/careers' }];
