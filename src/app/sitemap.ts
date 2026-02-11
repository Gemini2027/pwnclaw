import { getAllPosts } from '@/lib/blog';
import { ATTACK_CATEGORIES } from '@/lib/attack-categories';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogUrls = posts.map(post => ({
    url: `https://www.pwnclaw.com/blog/${post.slug}`,
    lastModified: new Date(post.updated || post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: 'https://www.pwnclaw.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.pwnclaw.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.pwnclaw.com/privacy',
      lastModified: new Date('2026-02-07'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.pwnclaw.com/terms',
      lastModified: new Date('2026-02-11'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.pwnclaw.com/imprint',
      lastModified: new Date('2026-02-11'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.pwnclaw.com/benchmarks',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://www.pwnclaw.com/attacks',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...ATTACK_CATEGORIES.map(cat => ({
      url: `https://www.pwnclaw.com/attacks/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // V10: Auth pages for SEO
    {
      url: 'https://www.pwnclaw.com/sign-in',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://www.pwnclaw.com/sign-up',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...blogUrls,
  ];
}
