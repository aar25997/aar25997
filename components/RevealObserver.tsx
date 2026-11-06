'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Subtle fade-up for elements marked data-reveal. Anything already on screen when the
 * page loads stays visible (no flash), and nothing animates for reduced-motion users.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.remove('reveal-pending');
        e.target.classList.add('reveal-in');
        io.unobserve(e.target);
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    document.querySelectorAll<HTMLElement>('[data-reveal]:not(.reveal-in)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal-pending');
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
