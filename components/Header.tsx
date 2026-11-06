import 'server-only';
import { getContext } from '@/lib/site';
import { NavMenu } from './NavMenu';
import { OrderLink } from './OrderLink';
import { Wordmark } from './Wordmark';

export function Header() {
  const { site, ordering } = getContext();
  const dest = ordering.primary();
  const cta = dest
    ? { label: 'Order Online', href: dest.url, track: 'order_click' }
    : { label: 'Get Opening Updates', href: '#signup', track: 'signup_cta' };
  const showAnnouncement = site.announcement.enabled && !ordering.isLive;

  return (
    <>
      {showAnnouncement && (
        <div role="region" aria-label="Announcement" className="on-dark bg-charcoal py-2 text-center text-[0.8rem] tracking-[0.06em] text-stone">
          <div className="container-site">
            {site.announcement.text}
            {site.announcement.linkUrl && (
              <>
                {' · '}
                <a href={site.announcement.linkUrl} className="text-ivory underline underline-offset-4">{site.announcement.linkLabel}</a>
              </>
            )}
          </div>
        </div>
      )}
      <header className="on-dark sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-gold/35 bg-emerald">
        <div className="container-site relative flex h-[var(--header-h)] items-center justify-between">
          <a href="/" className="no-underline" aria-label={`${site.name} home`}>
            <Wordmark logo={site.logo} name={site.name} />
          </a>
          <div className="flex items-center gap-2">
            {dest && (
              <OrderLink dest={dest} className="btn btn-light btn-sm md:hidden">Order</OrderLink>
            )}
            <NavMenu links={site.navigation} cta={cta} />
          </div>
        </div>
      </header>
    </>
  );
}
