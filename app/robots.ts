import type { MetadataRoute } from 'next';
import { getContext } from '@/lib/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const { site } = getContext();
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/order/'] },
    ...(site.siteUrl ? { sitemap: `${site.siteUrl}/sitemap.xml` } : {}),
  };
}
