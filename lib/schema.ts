// Schema.org JSON-LD. A field is only emitted when the information is confirmed in
// content/ and visible on the page, as Google requires. Validate pages with
// https://search.google.com/test/rich-results
import type { EventPost, Location, SiteSettings } from './types';

type LD = Record<string, unknown>;

export function createSchema(site: SiteSettings) {
  const abs = (p: string) => (site.siteUrl ? site.siteUrl + p : '');
  const sameAs = site.social.map((s) => s.url).filter(Boolean);

  function address(loc: Location): LD {
    const a = loc.address;
    return {
      '@type': 'PostalAddress',
      ...(a.street ? { streetAddress: a.street } : {}),
      addressLocality: a.city,
      addressRegion: a.region,
      ...(a.postalCode ? { postalCode: a.postalCode } : {}),
      addressCountry: 'US',
    };
  }

  function restaurant(loc: Location): LD {
    const page = `/locations/${loc.slug}/`;
    const ld: LD = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      ...(site.siteUrl ? { '@id': `${abs(page)}#restaurant`, url: abs(page), menu: abs('/menu/') } : {}),
      name: loc.name || site.name,
      description: site.description,
      slogan: site.tagline,
      servesCuisine: site.cuisines,
      address: address(loc),
    };
    if (loc.coordinates.lat != null && loc.coordinates.lng != null)
      ld.geo = { '@type': 'GeoCoordinates', latitude: loc.coordinates.lat, longitude: loc.coordinates.lng };
    if (loc.phone) ld.telephone = loc.phone;
    if (loc.hoursConfirmed) {
      const spec = loc.hours.filter((h) => h.opens && h.closes && h.days.length);
      if (spec.length)
        ld.openingHoursSpecification = spec.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map((d) => `https://schema.org/${d}`), opens: h.opens, closes: h.closes }));
    }
    const photos = loc.photos.map((p) => p.src).filter(Boolean);
    if (photos.length && site.siteUrl) ld.image = photos.map(abs);
    if (sameAs.length) ld.sameAs = sameAs;
    return ld;
  }

  const website = (): LD | null =>
    site.siteUrl ? { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${abs('/')}#website`, name: site.name, url: abs('/') } : null;

  const organization = (): LD => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    slogan: site.tagline,
    ...(site.siteUrl ? { '@id': `${abs('/')}#organization`, url: abs('/') } : {}),
    ...(site.logo && site.siteUrl ? { logo: abs(site.logo) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  });

  const breadcrumbs = (trail: [string, string][]): LD | null =>
    site.siteUrl
      ? { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })) }
      : null;

  const event = (ev: EventPost, loc?: Location): LD => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    startDate: ev.date,
    ...(ev.endDate ? { endDate: ev.endDate } : {}),
    description: ev.summary,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(ev.image && site.siteUrl ? { image: [abs(ev.image)] } : {}),
    ...(loc ? { location: { '@type': 'Place', name: `${site.name} ${loc.address.city}`, address: address(loc) } } : {}),
    organizer: { '@type': 'Organization', name: site.name, ...(site.siteUrl ? { url: abs('/') } : {}) },
  });

  return { restaurant, website, organization, breadcrumbs, event };
}
