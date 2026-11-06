import 'server-only';
import { getEvents } from './content';
import { getContext } from './site';

/**
 * Future pages are built into the site but stay hidden (404, not linked, not in the
 * sitemap) until switched on in content/site.json -> features.
 */
export function enabledFeatures() {
  const { site, ordering } = getContext();
  return {
    events: site.features.events && getEvents().length > 0,
    catering: site.features.catering,
    giftCards: site.features.giftCards && !!ordering.extras.giftCards,
    rewards: site.features.rewards && !!ordering.extras.rewards,
  };
}
