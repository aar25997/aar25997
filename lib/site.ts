// Shared, derived site data and helpers for pages.
import 'server-only';
import type { Metadata } from 'next';
import { getLocations, getOrderingSettings, getSite } from './content';
import { createOrdering } from './ordering';
import type { Location } from './types';

export function getContext() {
  const site = getSite();
  const locations = getLocations();
  const ordering = createOrdering(getOrderingSettings(), locations);
  const instagram = site.social.find((s) => /instagram/i.test(s.network));
  const primaryLocation = ordering.orderable[0] ?? locations[0];
  return { site, locations, ordering, instagram, primaryLocation };
}

export const statusLabel = (loc: Location) =>
  ({ open: 'Now open', 'temporarily-closed': 'Temporarily closed', 'coming-soon': 'Coming soon' })[loc.status];

export const cityLine = (loc: Location) => `${loc.address.city}, ${loc.address.regionName || loc.address.region}`;

/** "coming soon to Sterling, Virginia" before opening, "in Sterling, Virginia" after. */
export const wherePhrase = (loc?: Location) =>
  loc ? `${loc.status === 'open' ? 'in' : 'coming soon to'} ${cityLine(loc)}` : '';

/** Google Maps directions link, or '' until an address or coordinates are configured. */
export function directionsUrl(loc?: Location): string {
  if (!loc) return '';
  if (loc.mapsUrl) return loc.mapsUrl;
  const a = loc.address;
  const dest = a.street
    ? `NEFRA, ${a.street}, ${a.city}, ${a.region} ${a.postalCode}`.trim()
    : loc.coordinates.lat != null && loc.coordinates.lng != null ? `${loc.coordinates.lat},${loc.coordinates.lng}` : '';
  if (!dest) return '';
  const place = loc.googlePlaceId ? `&destination_place_id=${encodeURIComponent(loc.googlePlaceId)}` : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}${place}`;
}

/** Page metadata with canonical + Open Graph, filled from site settings. */
export function pageMetadata({ title, description, path, noindex = false }: { title: string; description?: string; path: string; noindex?: boolean }): Metadata {
  const { site } = getContext();
  const desc = description || site.description;
  return {
    title,
    description: desc,
    ...(site.siteUrl ? { alternates: { canonical: path } } : {}),
    openGraph: { title, description: desc, siteName: site.name, type: 'website', locale: 'en_US', ...(site.siteUrl ? { url: path } : {}) },
    twitter: { card: 'summary_large_image', title, description: desc },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
