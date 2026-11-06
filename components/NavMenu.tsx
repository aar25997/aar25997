'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Link as NavLink } from '@/lib/types';

/**
 * Main navigation. Desktop: inline links. Mobile: a disclosure button that opens a
 * panel. Escape closes it and returns focus to the button.
 */
export function NavMenu({ links, cta }: { links: NavLink[]; cta: { label: string; href: string; track: string } }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (p: string) => p !== '/' && pathname?.startsWith(p);

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-8 md:flex lg:gap-10">
        {links.map((l) => (
          <a
            key={l.path}
            href={l.path}
            aria-current={isActive(l.path) ? 'page' : undefined}
            className="border-b border-transparent py-1.5 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-stone no-underline transition-colors hover:border-gold hover:text-ivory aria-[current=page]:border-gold aria-[current=page]:text-ivory"
          >
            {l.label}
          </a>
        ))}
        <a href={cta.href} className="btn btn-light btn-sm" data-track={cta.track}>{cta.label}</a>
      </nav>

      <button
        ref={button}
        type="button"
        className="relative -mr-2 grid h-11 w-11 place-items-center md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">{open ? 'Close menu' : 'Menu'}</span>
        <span aria-hidden="true" className="relative block h-3.5 w-6">
          <span className={`absolute left-0 top-0 h-[1.5px] w-6 bg-ivory transition duration-300 ${open ? 'translate-y-[6.5px] rotate-45' : ''}`} />
          <span className={`absolute left-0 top-[6.5px] h-[1.5px] w-6 bg-ivory transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`absolute left-0 top-[13px] h-[1.5px] w-6 bg-ivory transition duration-300 ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
        </span>
      </button>

      <div
        id="mobile-nav"
        ref={panel}
        hidden={!open}
        className="on-dark absolute inset-x-0 top-full border-b border-gold/40 bg-emerald px-gutter pb-8 pt-2 shadow-[0_24px_40px_-24px_rgb(0_0_0/0.6)] md:hidden"
      >
        <nav aria-label="Main mobile">
          <ul>
            {links.map((l) => (
              <li key={l.path} className="border-b border-stone/20">
                <a
                  href={l.path}
                  aria-current={isActive(l.path) ? 'page' : undefined}
                  className="block py-4 font-display text-xl tracking-[0.06em] text-ivory no-underline aria-[current=page]:text-stone"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={cta.href} className="btn btn-light mt-6 w-full" data-track={cta.track} onClick={() => setOpen(false)}>
            {cta.label}
          </a>
        </nav>
      </div>
    </>
  );
}
