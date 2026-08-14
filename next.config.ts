import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // No remotePatterns. Every production image is served from /public/media.
    // Adding a remote host here would reintroduce the Wix hotlinking this rebuild removes.
  },

  async redirects() {
    return [
      // Legacy Wix routes -> new equivalents. See PLAN.md §2.
      { source: '/menus', destination: '/menu', permanent: true },
      // The three menus are one page now. These keep every inbound link and
      // indexed URL working, landing on the right tab via the hash.
      { source: '/menu/cocktails', destination: '/menu#cocktails', permanent: true },
      { source: '/menu/brunch', destination: '/menu#brunch', permanent: true },
      { source: '/menu/food', destination: '/menu', permanent: true },
      { source: '/event-list', destination: '/events', permanent: true },
      { source: '/join-our-team', destination: '/careers', permanent: true },
      // Orphan Wix Stores route: nothing was ever sold through it.
      { source: '/cart-page', destination: '/', permanent: true },
      // Wix event-detail slugs carry a trailing date segment (…-2026-08-14-22-00).
      // Strip it so every occurrence of a series lands on the series page.
      {
        source: '/event-details/:slug(.*)-:y(\\d{4})-:m(\\d{2})-:d(\\d{2})-:hh(\\d{2})-:mm(\\d{2})',
        destination: '/events/:slug',
        permanent: true,
      },
      { source: '/event-details/:slug', destination: '/events/:slug', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
