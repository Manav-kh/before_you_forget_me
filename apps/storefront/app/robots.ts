import type { MetadataRoute } from 'next';
import { publicUrl } from '../ui/seo';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/order/', '/orders', '/checkout', '/admin'],
    },
    sitemap: publicUrl('/sitemap.xml'),
  };
}
