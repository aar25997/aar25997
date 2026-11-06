'use client';

import { useEffect } from 'react';

/** Sends clicks on [data-track] links (Order, Directions, Instagram...) to GA4 / dataLayer. */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-track]');
      if (!el) return;
      const params = { link_url: el.href || '', page_path: location.pathname };
      if (typeof window.gtag === 'function') window.gtag('event', el.dataset.track, params);
      else (window.dataLayer = window.dataLayer || []).push({ event: el.dataset.track, ...params });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
