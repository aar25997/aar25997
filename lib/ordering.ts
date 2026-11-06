// Ordering integration layer.
//
// Every "Order" button on the site asks this module where to go. Nothing else knows
// which POS NEFRA uses, so switching between Toast, Clover, SpotOn or anything else
// is an edit to content/ordering.json and each location's orderUrl, not to code.
// NEFRA never handles payments: checkout happens on the provider's secure page.
// See docs/ORDERING.md.
import type { Location, MenuItem, OrderingSettings } from './types';

export type OrderDestination = { url: string; external: boolean };

export function createOrdering(settings: OrderingSettings, locations: Location[]) {
  const withTracking = (url: string) => {
    if (!url) return '';
    if (!settings.trackingParams) return url;
    return url + (url.includes('?') ? '&' : '?') + settings.trackingParams;
  };

  /** Provider URL for one location, or '' when it can't take orders yet. */
  const urlFor = (loc?: Location) => (loc && loc.status === 'open' ? withTracking(loc.orderUrl || settings.defaultUrl) : '');

  const orderable = locations.filter((l) => urlFor(l));
  const embed = settings.mode === 'embed';

  /**
   * Where a generic "Order Online" button points:
   * one orderable location in link mode -> straight to the provider (one tap);
   * several locations, or embed mode -> the site's /order/ page (two taps);
   * null -> ordering isn't live yet.
   */
  function primary(): OrderDestination | null {
    if (!orderable.length) return null;
    if (orderable.length === 1 && !embed) return { url: urlFor(orderable[0]), external: true };
    return { url: '/order/', external: false };
  }

  /** Item-level deep link when the provider supports one, otherwise the primary link. */
  function forItem(item: MenuItem): OrderDestination | null {
    const p = primary();
    if (!p || item.available === false) return null;
    return item.orderUrl ? { url: withTracking(item.orderUrl), external: true } : p;
  }

  return {
    provider: settings.provider,
    mode: embed ? ('embed' as const) : ('link' as const),
    newTab: settings.openInNewTab,
    isLive: orderable.length > 0,
    orderable,
    urlFor,
    primary,
    forItem,
    extras: {
      catering: withTracking(settings.cateringUrl),
      giftCards: withTracking(settings.giftCardsUrl),
      familyMeals: withTracking(settings.familyMealsUrl),
      rewards: withTracking(settings.rewardsUrl),
    },
  };
}

export type Ordering = ReturnType<typeof createOrdering>;
