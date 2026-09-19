import type { HubBlockConfig, HubBlockType, HubTemplate, LinkHubType } from './types';

export interface HubTemplateDefinition {
  label: string;
  description: string;
  hubType: LinkHubType;
  title: string;
  subtitle: string;
  theme: string;
  blocks: { type: HubBlockType; label: string; config: HubBlockConfig }[];
}

const action = (type: HubBlockType, title: string, config: HubBlockConfig = {}) => ({
  type,
  label: title,
  config: { title, style: 'standard' as const, ...config },
});

export const HUB_TEMPLATES: Record<HubTemplate, HubTemplateDefinition> = {
  'main-links': {
    label: 'Oasis Main Links',
    description: 'The all-purpose Instagram bio and guest shortcut page.',
    hubType: 'instagram-bio',
    title: 'Oasis',
    subtitle: 'Good food. Good music. Stay a while.',
    theme: 'oasis-default',
    blocks: [
      action('events', 'Upcoming Events / Get Tickets', { style: 'featured', eventCount: 3, showArtwork: true, showTicketCta: true }),
      action('reservation', 'Reserve a Table'),
      action('menu', 'View Menu'),
      action('private-event', 'Book a Birthday or Private Event'),
      action('directions', 'Directions'),
      action('social', 'Instagram', { platform: 'instagram' }),
      action('review', 'Leave Oasis a Google Review'),
    ],
  },
  live: {
    label: 'Oasis Live',
    description: 'Fast actions for a permanent QR shown inside the restaurant.',
    hubType: 'live',
    title: 'Oasis Live',
    subtitle: 'Tonight at Oasis.',
    theme: 'evening',
    blocks: [
      action('review', 'Leave Oasis a Review', { style: 'featured' }),
      action('featured-event', 'See What’s Next', { showArtwork: true, showTicketCta: true }),
      action('tickets', 'Get Tickets'),
      action('birthday', 'Book Your Birthday'),
      action('social', 'Follow Oasis', { platform: 'instagram' }),
    ],
  },
  'paint-and-sip': {
    label: 'Paint & Sip',
    description: 'Tonight’s artist, the next session, reviews, and private bookings.',
    hubType: 'event',
    title: 'Paint & Sip at Oasis',
    subtitle: 'Everything for tonight, in one place.',
    theme: 'plum',
    blocks: [
      action('review', 'Show Oasis Some Love', { style: 'featured' }),
      action('artist', 'Meet Tonight’s Artist'),
      action('events', 'See the Next Paint & Sip', { eventCount: 3, eventCategory: 'paint-sip', showArtwork: true }),
      action('private-event', 'Book a Private Paint & Sip'),
    ],
  },
  nightlife: {
    label: 'Nightlife',
    description: 'A high-energy event and birthday conversion page.',
    hubType: 'event',
    title: 'Tonight at Oasis',
    subtitle: 'What’s happening now and what’s next.',
    theme: 'teal',
    blocks: [
      action('featured-event', 'Tonight’s Feature', { showArtwork: true, showTicketCta: true }),
      action('events', 'Upcoming Events', { eventCount: 3, showArtwork: true, showTicketCta: true }),
      action('birthday', 'Birthday Reservations'),
      action('social', 'Follow Oasis', { platform: 'instagram' }),
      action('review', 'Leave a Review'),
    ],
  },
  artist: {
    label: 'Artist Spotlight',
    description: 'A focused artist card with event and booking actions.',
    hubType: 'artist',
    title: 'Artist Spotlight',
    subtitle: 'Featured at Oasis.',
    theme: 'evening',
    blocks: [action('artist', 'Featured Artist'), action('featured-event', 'See the Event', { showArtwork: true }), action('social', 'Follow Oasis', { platform: 'instagram' })],
  },
  hiring: {
    label: 'Hiring',
    description: 'A direct, branded path from QR to the Oasis application.',
    hubType: 'hiring',
    title: 'Come Work With Us',
    subtitle: 'Bring your energy to Oasis.',
    theme: 'oasis-default',
    blocks: [action('text', 'Join the Team', { body: 'We’re always interested in good people who care about hospitality.' }), action('link', 'See Open Roles', { url: '/careers', style: 'featured' }), action('directions', 'Find Oasis')],
  },
  blank: {
    label: 'Blank',
    description: 'Start with the Oasis identity and add only what you need.',
    hubType: 'custom',
    title: 'Oasis',
    subtitle: '',
    theme: 'oasis-default',
    blocks: [],
  },
};
