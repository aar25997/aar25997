'use client';

import { useEffect, useState } from 'react';
import type { PictureData } from '@/lib/images';
import type { OrderDestination } from '@/lib/ordering';
import type { MenuCategory } from '@/lib/types';
import { Picture } from './Picture';

export type MenuItemView = {
  key: string;
  name: string;
  category: string;
  description: string;
  price: string;
  picture: PictureData | null;
  alt: string;
  allergens: string[];
  dietary: string[];
  customization: string;
  available: boolean;
  draft: boolean;
  where: string;
  order: OrderDestination | null;
};

/**
 * Menu with a category filter. Every item is in the pre-rendered HTML (good for
 * search engines and no-JS visitors); the filter only hides categories.
 * A link like /menu/#falafel opens with that category selected.
 */
export function MenuBrowser({ categories, items }: { categories: MenuCategory[]; items: MenuItemView[] }) {
  const [active, setActive] = useState<string>('all');

  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (categories.some((c) => c.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [categories]);

  const choose = (id: string) => {
    setActive(id);
    history.replaceState(null, '', id === 'all' ? location.pathname : `#${id}`);
    document.getElementById('menu-list')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  };

  const tab = 'flex-none rounded-pill border px-4 py-2 text-[0.76rem] font-semibold uppercase tracking-[0.12em] transition-colors min-h-10';
  return (
    <>
      <div className="sticky top-[calc(env(safe-area-inset-top,0px)+var(--header-h))] z-40 border-b border-stone bg-ivory/95 backdrop-blur">
        <div className="container-site">
          <div role="group" aria-label="Filter menu by category" className="-mx-gutter flex gap-2 overflow-x-auto px-gutter py-3 [scrollbar-width:none]">
            {[{ id: 'all', name: 'All' }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                data-filter={c.id}
                aria-pressed={active === c.id}
                onClick={() => choose(c.id)}
                className={`${tab} ${active === c.id ? 'border-emerald bg-emerald text-ivory' : 'border-stone bg-transparent text-muted hover:border-emerald hover:text-emerald'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="menu-list" className="container-site scroll-mt-40 pb-20 pt-6">
        {categories.map((c) => {
          const list = items.filter((i) => i.category === c.id);
          return (
            <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`} hidden={active !== 'all' && active !== c.id} className="border-b border-stone py-12 last:border-b-0">
              <header className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
                <h2 id={`${c.id}-h`} className="text-h2 text-emerald">{c.name}</h2>
                {c.description && <p className="text-muted">{c.description}</p>}
              </header>
              {list.length ? (
                <ul className="grid gap-5 md:grid-cols-2">
                  {list.map((i) => (
                    <li key={i.key} className="flex gap-5 rounded-card border border-stone/70 bg-white p-5 sm:p-6">
                      {i.picture && (
                        <div className="h-24 w-24 flex-none overflow-hidden rounded-card sm:h-28 sm:w-28">
                          <Picture data={i.picture} alt={i.alt} label={i.name} sizes="112px" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className={`text-[1.12rem] ${i.available ? '' : 'line-through decoration-walnut'}`}>{i.name}</h3>
                          <span className="whitespace-nowrap text-[0.95rem] font-semibold tabular-nums">
                            {i.price || <span className="text-[0.82rem] font-normal italic text-muted">Price at opening</span>}
                          </span>
                        </div>
                        {i.draft && (
                          <span className="mt-1 inline-block rounded-pill border border-walnut/50 px-2 py-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-walnut" title="Draft item: not yet approved for the final menu">
                            Preview
                          </span>
                        )}
                        {i.description && <p className="mt-2 text-[0.97rem] text-muted">{i.description}</p>}
                        {i.customization && <p className="mt-2 text-[0.88rem] text-walnut"><span className="font-semibold">Make it yours:</span> {i.customization}</p>}
                        {(i.dietary.length > 0 || i.allergens.length > 0) && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.8rem]">
                            {i.dietary.map((d) => (
                              <span key={d} className="rounded-pill border border-emerald px-2.5 py-0.5 font-semibold uppercase tracking-[0.08em] text-emerald">{d}</span>
                            ))}
                            {i.allergens.length > 0 && <span className="text-muted">Contains: {i.allergens.join(', ')}</span>}
                          </div>
                        )}
                        {i.where && <p className="mt-2 text-[0.85rem] text-muted">{i.where}</p>}
                        {!i.available && <p className="mt-2 text-[0.88rem] font-semibold text-walnut">Currently unavailable</p>}
                        {i.order && (
                          <a href={i.order.url} data-track="order_item_click" className="btn btn-primary btn-sm mt-4">
                            Order Now<span className="sr-only">: {i.name}</span>
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-muted">Items for this category are being finalized.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
