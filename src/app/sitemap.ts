import type { MetadataRoute } from 'next';
import { getAllSeries } from '@/lib/events';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/menu', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/menu/cocktails', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/menu/brunch', priority: 0.7, changeFrequency: 'weekly' },
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
    ...getAllSeries().map((series) => ({
      url: absoluteUrl(`/events/${series.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
