// Schema.org JSON-LD. Every field is only emitted when the matching information is
// confirmed in content/ and visible on the page (Google requires structured data to
// match what visitors can see). Validate with https://search.google.com/test/rich-results

const DAY_URL = (d) => `https://schema.org/${d}`;

export function createSchema({ site, href }) {
  const abs = (p) => (site.siteUrl ? site.siteUrl + href(p) : '');
  const socialUrls = (site.social || []).map((s) => s.url).filter(Boolean);
  const script = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

  function restaurant(loc) {
    const page = `locations/${loc.slug}/`;
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: loc.name || site.name,
      description: site.description,
      slogan: site.tagline,
      servesCuisine: site.cuisines,
    };
    if (site.siteUrl) {
      ld['@id'] = abs(page) + '#restaurant';
      ld.url = abs(page);
      ld.menu = abs('menu/');
    }
    const a = loc.address || {};
    ld.address = { '@type': 'PostalAddress', addressLocality: a.city, addressRegion: a.region, addressCountry: 'US' };
    if (a.street) ld.address.streetAddress = a.street;
    if (a.postalCode) ld.address.postalCode = a.postalCode;
    if (loc.coordinates?.lat && loc.coordinates?.lng)
      ld.geo = { '@type': 'GeoCoordinates', latitude: loc.coordinates.lat, longitude: loc.coordinates.lng };
    if (loc.phone) ld.telephone = loc.phone;
    if (loc.hoursConfirmed && loc.hours?.length)
      ld.openingHoursSpecification = loc.hours
        .filter((h) => h.opens && h.closes && h.days?.length)
        .map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map(DAY_URL), opens: h.opens, closes: h.closes }));
    const photos = (loc.photos || []).map((p) => p.src).filter(Boolean);
    if (photos.length && site.siteUrl) ld.image = photos.map((p) => site.siteUrl + href(p));
    if (socialUrls.length) ld.sameAs = socialUrls;
    return script(ld);
  }

  function website() {
    if (!site.siteUrl) return '';
    return script({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('') + '#website', name: site.name, url: abs('') });
  }

  function organization() {
    const ld = { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, slogan: site.tagline };
    if (site.siteUrl) { ld['@id'] = abs('') + '#organization'; ld.url = abs(''); }
    if (site.logo && site.siteUrl) ld.logo = site.siteUrl + href(site.logo);
    if (socialUrls.length) ld.sameAs = socialUrls;
    return script(ld);
  }

  function breadcrumbs(trail) {
    if (!site.siteUrl) return '';
    return script({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: trail.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })),
    });
  }

  function event(ev, loc) {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: ev.title,
      startDate: ev.date,
      description: ev.summary,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      organizer: { '@type': 'Organization', name: site.name, ...(site.siteUrl ? { url: abs('') } : {}) },
    };
    if (ev.endDate) ld.endDate = ev.endDate;
    if (ev.image && site.siteUrl) ld.image = [site.siteUrl + href(ev.image)];
    if (loc) {
      const a = loc.address || {};
      ld.location = { '@type': 'Place', name: `${site.name} ${a.city}`, address: { '@type': 'PostalAddress', streetAddress: a.street || undefined, addressLocality: a.city, addressRegion: a.region, postalCode: a.postalCode || undefined, addressCountry: 'US' } };
    }
    return script(ld);
  }

  return { restaurant, website, organization, breadcrumbs, event };
}
