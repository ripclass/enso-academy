import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auth-gated or transactional surfaces: nothing indexable behind these.
        disallow: ['/dashboard', '/lessons/', '/api/', '/auth/', '/login', '/signup'],
      },
    ],
    sitemap: 'https://www.ensoacademy.ai/sitemap.xml',
  }
}
