import 'server-only';
import { directionsUrl, getContext } from '@/lib/site';

const icon = 'h-[22px] w-[22px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6]';
const pin = <svg aria-hidden="true" viewBox="0 0 24 24" className={icon}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;

/** Phone-only quick actions: Menu / Order / Directions. Rendered only once ordering is live. */
export function BottomBar() {
  const { ordering } = getContext();
  const dest = ordering.primary();
  if (!dest) return null;
  const dir = ordering.orderable.length === 1 ? directionsUrl(ordering.orderable[0]) : '';
  const item = 'flex flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] no-underline';
  return (
    <nav aria-label="Quick actions" className="on-dark fixed inset-x-0 bottom-0 z-[60] grid grid-cols-3 border-t border-gold/50 bg-charcoal pb-[env(safe-area-inset-bottom)] md:hidden">
      <a href="/menu/" className={`${item} h-16 text-stone hover:text-ivory`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={icon}><path d="M4 6h16M4 12h16M4 18h10" /></svg>Menu
      </a>
      <a href={dest.url} data-track="order_click" className={`${item} h-16 bg-emerald text-ivory`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className={icon}><path d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0" /></svg>Order
      </a>
      {dir ? (
        <a href={dir} target="_blank" rel="noopener" data-track="directions_click" className={`${item} h-16 text-stone hover:text-ivory`}>{pin}Directions</a>
      ) : (
        <a href="/locations/" className={`${item} h-16 text-stone hover:text-ivory`}>{pin}Locations</a>
      )}
    </nav>
  );
}
