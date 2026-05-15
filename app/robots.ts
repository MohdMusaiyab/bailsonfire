import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Robots needs the absolute URL to your sitemap
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bailsonfire.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/'], 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
