/**
 * The five named website screens.
 *
 * This is the whole "Website" section: a fixed list of the real pages, each
 * opening the sections that page actually has. It is not a Pages collection and
 * there is no way to add to it from the admin — adding a page is a design and
 * routing decision, not a content one.
 *
 * It lives outside the route file because a Next route module may only export
 * the framework's own names.
 */
export const PAGES = [
  { slug: 'home', label: 'Homepage', route: '/', hint: 'Hero, what we serve, After Dark, catering' },
  { slug: 'menu', label: 'Menu page', route: '/menu', hint: 'The heading above the menu' },
  { slug: 'events', label: 'Events page', route: '/events', hint: 'The heading above the nights' },
  {
    slug: 'catering',
    label: 'Catering',
    route: '/catering',
    hint: 'Heading, intro and enquiry choices',
  },
  {
    slug: 'private-events',
    label: 'Private events',
    route: '/private-events',
    hint: 'Celebrations copy and enquiry choices',
  },
  { slug: 'visit', label: 'Visit & contact', route: '/visit', hint: 'Heading and directions copy' },
  {
    slug: 'careers',
    label: 'Careers',
    route: '/careers',
    hint: 'Recruitment copy, perks, positions',
  },
];
