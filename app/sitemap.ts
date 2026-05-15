import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getAvailableSeasons } from '@/lib/actions/matches';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sitemaps require absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bailsonfire.vercel.app';

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. Season Hub Pages
  const seasons = await getAvailableSeasons();
  const seasonRoutes: MetadataRoute.Sitemap = seasons.map((year) => ({
    url: `${baseUrl}/matches/${year}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 3. Individual Match Pages
  const matches = await prisma.match.findMany({
    select: {
      externalId: true,
      updatedAt: true,
    },
  });

  const matchRoutes: MetadataRoute.Sitemap = matches.map((match) => ({
    url: `${baseUrl}/match/${match.externalId}`,
    lastModified: match.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...seasonRoutes, ...matchRoutes];
}
