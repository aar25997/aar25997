import 'server-only';
import { getContext, statusLabel } from '@/lib/site';
import { getEvents } from '@/lib/content';
import { NewsletterForm } from './NewsletterForm';
import { Wordmark } from './Wordmark';

export function Footer() {
  const { site, locations, ordering, instagram } = getContext();
  const links = [...site.footerLinks];
  // Future pages appear only once switched on in content/site.json -> features
  if (site.features.events && getEvents().length) links.splice(-1, 0, { label: 'News & Events', path: '/events/' });
  if (site.features.catering) links.splice(-1, 0, { label: 'Catering', path: '/catering/' });
  if (site.features.giftCards && ordering.extras.giftCards) links.splice(-1, 0, { label: 'Gift Cards', path: '/gift-cards/' });
  if (site.features.rewards && ordering.extras.rewards) links.splice(-1, 0, { label: 'Rewards', path: '/rewards/' });

  return (
    <footer className="on-dark bg-charcoal text-stone">
      <section id="signup" aria-labelledby="signup-heading" className="pattern-pills border-b border-gold/40 bg-emerald py-16 text-ivory md:py-20">
        <div className="container-site grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <span className="eyebrow">{ordering.isLive ? 'Stay in touch' : 'Opening soon'}</span>
            <h2 id="signup-heading" className="text-[clamp(1.7rem,3vw,2.4rem)] text-beige">
              {ordering.isLive ? 'News from the NEFRA Kitchen' : 'Be the First to Know When We Open'}
            </h2>
            <p className="mt-3 max-w-md text-stone">Opening updates, launches, events and offers, straight to your inbox.</p>
          </div>
          <NewsletterForm endpoint={site.forms.newsletterEndpoint} source="footer" instagram={instagram?.handle ?? '@nefrahouse'} />
        </div>
      </section>

      <div className="container-site grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Wordmark logo={site.logo} name={site.name} size="lg" />
        </div>
        <nav aria-labelledby="footer-explore" className="flex flex-col gap-2.5">
          <h2 id="footer-explore" className="mb-2 font-sans text-label font-semibold uppercase text-gold">Explore</h2>
          {links.map((l) => (
            <a key={l.path} href={l.path} className="text-[0.95rem] text-stone no-underline hover:text-ivory">{l.label}</a>
          ))}
        </nav>
        <div className="flex flex-col gap-2.5">
          <h2 className="mb-2 font-sans text-label font-semibold uppercase text-gold">Visit</h2>
          {locations.map((l) => (
            <p key={l.slug}>
              <a href={`/locations/${l.slug}/`} className="text-[0.95rem] text-stone no-underline hover:text-ivory">{l.address.city}, {l.address.region}</a>
              <br />
              <span className="text-[0.85rem] text-stone/75">{statusLabel(l)}</span>
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          <h2 className="mb-2 font-sans text-label font-semibold uppercase text-gold">Connect</h2>
          {site.social.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener" data-track="social_click" className="text-[0.95rem] text-stone no-underline hover:text-ivory">
              {s.network} {s.handle}
            </a>
          ))}
          {site.email && <a href={`mailto:${site.email}`} className="text-[0.95rem] text-stone no-underline hover:text-ivory">{site.email}</a>}
          <a href="/contact/" className="text-[0.95rem] text-stone no-underline hover:text-ivory">Contact us</a>
        </div>
      </div>
      <div className="container-site flex flex-wrap justify-between gap-3 border-t border-stone/15 py-6 text-[0.85rem] text-stone/80">
        <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
        <a href="/privacy-policy/" className="text-stone/80 underline-offset-4 hover:text-ivory">Privacy Policy</a>
      </div>
    </footer>
  );
}
