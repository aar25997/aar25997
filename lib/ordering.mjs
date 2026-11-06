// Ordering integration layer.
//
// Every "Order" button on the site asks this module where to go. Nothing else in the
// site knows which POS NEFRA uses, so switching between Toast, Clover, SpotOn or
// anything else means editing content/ordering.json and each location's orderUrl,
// not templates. See docs/ORDERING.md.

export function createOrdering({ ordering = {}, locations = [] }) {
  const withTracking = (url) => {
    if (!url) return '';
    if (!ordering.trackingParams) return url;
    return url + (url.includes('?') ? '&' : '?') + ordering.trackingParams;
  };

  /** The provider ordering URL for one location, or '' when it can't take orders yet. */
  const urlFor = (loc) => (loc && loc.status === 'open' ? withTracking(loc.orderUrl || ordering.defaultUrl) : '');

  const orderable = locations.filter((l) => urlFor(l));
  const embed = ordering.mode === 'embed';

  /**
   * Where a generic "Order Online" button points.
   * - one orderable location in link mode: straight to the provider (one tap)
   * - several locations, or embed mode: the site's /order/ page (two taps)
   * Returns { url, external } or null when ordering isn't live.
   */
  function primary() {
    if (!orderable.length) return null;
    if (orderable.length === 1 && !embed) return { url: urlFor(orderable[0]), external: true };
    return { url: '/order/', external: false };
  }

  /** Item-level deep link if the provider supports one, otherwise the primary order link. */
  function forItem(item) {
    if (!primary() || item.available === false || item.orderable === false) return null;
    if (item.orderUrl) return { url: withTracking(item.orderUrl), external: true };
    return primary();
  }

  return {
    provider: ordering.provider || '',
    mode: embed ? 'embed' : 'link',
    newTab: !!ordering.openInNewTab,
    isLive: orderable.length > 0,
    orderable,
    urlFor,
    primary,
    forItem,
    extras: {
      catering: withTracking(ordering.cateringUrl),
      giftCards: withTracking(ordering.giftCardsUrl),
      familyMeals: withTracking(ordering.familyMealsUrl),
    },
  };
}
