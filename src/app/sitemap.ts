import type { MetadataRoute } from 'next';
import { getPublicEvents } from '@/server/content/events';
import { absoluteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { series } = await getPublicEvents();

  const staticRoutes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/menu', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/events', priority: 0.9, changeFrequency: 'daily' },
    { path: '/catering', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/private-events', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/visit', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/careers', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/legal/privacy', priority: 0.2, changeFrequency: 'monthly' },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    // Archived or paused series drop out of the sitemap automatically, because
    // the loader has already filtered them.
    ...series.map((entry) => ({
      url: absoluteUrl(`/events/${entry.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
