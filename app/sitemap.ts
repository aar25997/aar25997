import type { MetadataRoute } from 'next';
import { getEvents } from '@/lib/content';
import { enabledFeatures } from '@/lib/features';
import { getContext } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const { site, locations } = getContext();
  if (!site.siteUrl) return []; // set siteUrl in content/site.json to publish a sitemap
  const f = enabledFeatures();
  const paths = [
    '/', '/menu/', '/our-story/', '/our-standards/', '/locations/', '/contact/', '/privacy-policy/',
    ...locations.map((l) => `/locations/${l.slug}/`),
    ...(f.events ? ['/events/', ...getEvents().map((e) => `/events/${e.slug}/`)] : []),
    ...(f.catering ? ['/catering/'] : []),
    ...(f.giftCards ? ['/gift-cards/'] : []),
    ...(f.rewards ? ['/rewards/'] : []),
  ];
  return paths.map((p) => ({ url: site.siteUrl + p }));
}
