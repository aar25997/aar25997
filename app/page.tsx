import { HeroVideo } from '@/components/HeroVideo';
import { JsonLd } from '@/components/JsonLd';
import { Address, HoursList, LocationActions } from '@/components/LocationBits';
import { NewsletterForm } from '@/components/NewsletterForm';
import { OrderLink } from '@/components/OrderLink';
import { Photo } from '@/components/Photo';
import { SectionHeading } from '@/components/SectionHeading';
import { getEvents, getHome, getMenu, getSocial } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { cityLine, getContext, pageMetadata, statusLabel, wherePhrase } from '@/lib/site';
import { createSchema } from '@/lib/schema';

export function generateMetadata() {
  const { primaryLocation } = getContext();
  return pageMetadata({
    title: 'NEFRA | Mediterranean Shawarma & Falafel in Sterling, VA',
    description: `NEFRA is a premium fast-casual Mediterranean restaurant ${wherePhrase(primaryLocation)}. Beef and chicken shawarma, Egyptian falafel, bowls and plates, rooted in tradition and crafted for today.`,
    path: '/',
  });
}

export default function HomePage() {
  const { site, locations, ordering, instagram, primaryLocation: loc } = getContext();
  const home = getHome();
  const menu = getMenu();
  const social = getSocial();
  const events = site.features.events ? getEvents().slice(0, 3) : [];
  const schema = createSchema(site);
  const dest = ordering.primary();
  const igUrl = instagram?.url ?? '#';

  return (
    <>
      <JsonLd data={[schema.website(), locations.length === 1 ? schema.restaurant(locations[0]) : schema.organization()]} />

      {/* 2 — Cinematic hero */}
      <section className="on-dark relative flex min-h-[min(88svh,52rem)] items-end overflow-hidden bg-charcoal text-ivory" aria-labelledby="hero-heading">
        <div className="absolute inset-0">
          {home.hero.video ? (
            <HeroVideo src={home.hero.video} poster={home.hero.poster} />
          ) : (
            <Photo src={home.hero.image} alt={home.hero.imageAlt} label="Hero: shawarma roasting over heat" className="kenburns caption-top h-full w-full" priority />
          )}
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgb(35_35_35/0.35)_0%,rgb(35_35_35/0.55)_40%,rgb(20_26_24/0.92)_100%)] md:bg-[linear-gradient(90deg,rgb(20_26_24/0.85)_0%,rgb(20_26_24/0.55)_45%,rgb(35_35_35/0.15)_100%),linear-gradient(180deg,transparent_50%,rgb(20_26_24/0.6)_100%)]" />
        <div className="container-site relative pb-16 pt-32 md:pb-24">
          <span className="eyebrow rise">{home.hero.eyebrow}</span>
          <h1 id="hero-heading" className="rise rise-1 max-w-[12ch] text-display font-normal tracking-[0.05em] text-ivory">{home.hero.headline}</h1>
          <p className="rise rise-2 mt-5 font-display text-[clamp(1.1rem,2.2vw,1.55rem)] tracking-[0.06em] text-stone">{home.hero.subheadline}</p>
          <p className="rise rise-3 mt-5 max-w-xl text-[1.08rem] text-ivory/90">{home.hero.copy}</p>
          <div className="rise rise-4 mt-9 flex flex-wrap gap-3">
            {dest && <OrderLink dest={dest} className="btn btn-light" />}
            <a href="/menu/" className={dest ? 'btn btn-outline-light' : 'btn btn-light'}>Explore Our Menu</a>
            <a href="/our-story/" className="btn btn-outline-light">Our Story</a>
          </div>
        </div>
      </section>

      {/* 3 — Introduction */}
      <section className="py-section" aria-labelledby="intro-heading">
        <div className="container-site grid items-center gap-12 md:grid-cols-[1fr_1.05fr] md:gap-20">
          <div data-reveal>
            <span className="rule-gold mb-8" aria-hidden="true" />
            <SectionHeading eyebrow={home.intro.eyebrow} title={home.intro.headline} id="intro-heading" />
            <p className="mt-6 max-w-xl text-lead text-muted">{home.intro.body}</p>
          </div>
          <div data-reveal className="aspect-[4/5] max-w-full overflow-hidden rounded-card">
            <Photo src={home.intro.image} alt={home.intro.imageAlt} label="Editorial: the NEFRA table" className="h-full w-full" sizes="(min-width: 864px) 50vw, 100vw" />
          </div>
        </div>
      </section>

      {/* 4 — Featured menu */}
      <section className="bg-sand py-section" aria-labelledby="featured-heading">
        <div className="container-site">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={home.featured.eyebrow} title={home.featured.headline} id="featured-heading" className="max-w-2xl" />
            <a href="/menu/" className="link-arrow">See the full menu</a>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {menu.featured.map((f) => (
              <li key={f.title} data-reveal>
                <a href={`/menu/#${f.category}`} className="group flex h-full flex-col overflow-hidden rounded-card bg-ivory text-charcoal no-underline shadow-[0_1px_0_rgb(107_74_50/0.12)] transition duration-500 ease-brand hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(35_35_35/0.55)]">
                  <div className="aspect-[4/5] max-w-full overflow-hidden">
                    <Photo src={f.image} alt={f.alt} label={f.alt || f.title} className="h-full w-full transition duration-700 ease-brand group-hover:scale-[1.04]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-h3">{f.title}</h3>
                    <p className="mt-2 flex-1 text-[0.97rem] text-muted">{f.description}</p>
                    <span className="link-arrow mt-5 self-start">View on menu<span className="sr-only">: {f.title}</span></span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5 — Philosophy: full-width image with editorial panel */}
      <section aria-labelledby="philosophy-heading" className="relative">
        <div className="aspect-[4/5] max-w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]">
          <Photo src={home.philosophy.image} alt={home.philosophy.imageAlt} label="Ingredient close-up: herbs, tahini, vegetables" className="caption-top h-full w-full" />
        </div>
        <div className="container-site">
          <div data-reveal className="relative -mt-20 ml-auto max-w-xl rounded-card bg-ivory p-8 shadow-[0_30px_60px_-40px_rgb(35_35_35/0.6)] sm:-mt-28 sm:p-12 lg:-mt-40">
            <span className="rule-gold mb-6" aria-hidden="true" />
            <SectionHeading eyebrow={home.philosophy.eyebrow} title={home.philosophy.headline} id="philosophy-heading" />
            <p className="mt-5 text-lead text-muted">{home.philosophy.body}</p>
            <a href="/our-standards/" className="link-arrow mt-7">How we prepare our food</a>
          </div>
        </div>
        <div className="h-[clamp(3rem,6vw,5rem)]" aria-hidden="true" />
      </section>

      {/* 6 — Standards */}
      <section className="on-dark bg-emerald py-section text-ivory" aria-labelledby="standards-heading">
        <div className="container-site">
          <SectionHeading eyebrow={home.standards.eyebrow} title={home.standards.headline} id="standards-heading" align="center" className="max-w-2xl [&_h2]:text-ivory" />
          <ul className="my-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {home.standards.pillars.map((p) => (
              <li key={p.title} data-reveal className="lg:border-l lg:border-gold/45 lg:px-8 lg:first:border-l-0 lg:first:pl-0">
                <span className="mb-5 block h-px w-8 bg-gold" aria-hidden="true" />
                <h3 className="text-h3 text-ivory">{p.title}</h3>
                <p className="mt-2 text-stone">{p.body}</p>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <a href="/our-standards/" className="btn btn-outline-light">Read Our Standards</a>
          </div>
        </div>
      </section>

      {/* 7 — Our Story */}
      <section className="py-section" aria-labelledby="story-heading">
        <div className="container-site grid items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-20">
          <div data-reveal className="aspect-[4/5] max-w-full overflow-hidden rounded-card">
            <Photo src={home.story.image} alt={home.story.imageAlt} label="Craft: hands preparing food" className="h-full w-full" sizes="(min-width: 864px) 50vw, 100vw" />
          </div>
          <div data-reveal>
            <span className="rule-gold mb-8" aria-hidden="true" />
            <SectionHeading eyebrow={home.story.eyebrow} title={home.story.headline} id="story-heading" />
            {home.story.body.map((p) => (
              <p key={p.slice(0, 24)} className="mt-5 max-w-xl text-muted">{p}</p>
            ))}
            <a href="/our-story/" className="btn btn-primary mt-8">Discover Our Story</a>
          </div>
        </div>
      </section>

      {/* 8 — Location */}
      {loc && (
        <section className="on-dark bg-charcoal py-section text-ivory" aria-labelledby="location-heading">
          <div className="container-site grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
            <div data-reveal>
              <span className="eyebrow eyebrow-gold">{home.location.eyebrow}</span>
              <h2 id="location-heading" className="text-h2 text-ivory">{home.location.headline}</h2>
              <p className="mt-5 inline-flex items-center gap-2 rounded-pill border border-gold/70 px-4 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-stone">
                <span className={`h-2 w-2 rounded-full ${loc.status === 'open' ? 'bg-stone' : 'bg-gold'}`} aria-hidden="true" />
                {loc.status === 'open' ? statusLabel(loc) : `Coming soon to ${cityLine(loc)}`}
              </p>
              {loc.status !== 'open' && <p className="mt-5 max-w-lg text-stone">{loc.openingNote}</p>}
              <dl className="mt-8 grid gap-6 border-t border-gold/40 pt-7 sm:grid-cols-2">
                <div>
                  <dt className="mb-2 text-label font-semibold uppercase text-gold">Address</dt>
                  <dd className="text-ivory"><Address loc={loc} /></dd>
                </div>
                <div>
                  <dt className="mb-2 text-label font-semibold uppercase text-gold">Hours</dt>
                  <dd className="text-ivory"><HoursList loc={loc} /></dd>
                </div>
                {loc.parking && (
                  <div>
                    <dt className="mb-2 text-label font-semibold uppercase text-gold">Parking</dt>
                    <dd className="text-ivory">{loc.parking}</dd>
                  </div>
                )}
              </dl>
              {loc.status === 'open' ? (
                <LocationActions loc={loc} dark />
              ) : (
                <div className="mt-9 max-w-lg">
                  <h3 className="mb-4 font-sans text-[0.95rem] font-semibold text-ivory">Get opening updates</h3>
                  <NewsletterForm endpoint={site.forms.newsletterEndpoint} source="home-location" instagram={instagram?.handle ?? '@nefrahouse'} />
                </div>
              )}
            </div>
            <div data-reveal className="aspect-square max-w-full overflow-hidden rounded-card">
              <Photo src={loc.photos[0]?.src} alt={loc.photos[0]?.alt} label={`NEFRA ${loc.address.city} restaurant`} className="h-full w-full" sizes="(min-width: 864px) 45vw, 100vw" />
            </div>
          </div>
        </section>
      )}

      {/* 9 — Community */}
      <section className="py-section" aria-labelledby="community-heading">
        <div className="container-site grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div data-reveal>
            <span className="rule-gold mb-8" aria-hidden="true" />
            <SectionHeading eyebrow={home.community.eyebrow} title={home.community.headline} id="community-heading" />
            <p className="mt-5 max-w-lg text-lead text-muted">{home.community.body}</p>
            <a href={igUrl} target="_blank" rel="noopener" data-track="instagram_click" className="btn btn-outline mt-8">
              Follow {instagram?.handle} on Instagram
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div data-reveal className="row-span-2 min-h-72 max-w-full overflow-hidden rounded-card">
              <Photo src={home.community.image} alt={home.community.imageAlt} label="Community: guests sharing a meal" className="h-full w-full" sizes="(min-width: 1024px) 30vw, 50vw" />
            </div>
            {(social.posts.length ? social.posts.slice(0, 2) : [{ image: '', alt: '', url: '' }, { image: '', alt: '', url: '' }]).map((p, i) => (
              <a key={i} data-reveal href={p.url || igUrl} target="_blank" rel="noopener" data-track="instagram_click" className="group block aspect-square max-w-full overflow-hidden rounded-card">
                <Photo src={p.image} alt={p.alt ? `${p.alt} (opens Instagram)` : `${site.name} on Instagram`} label="Instagram photo" className="h-full w-full transition duration-700 ease-brand group-hover:scale-[1.04]" sizes="(min-width: 1024px) 25vw, 50vw" />
              </a>
            ))}
          </div>
        </div>

        {events.length > 0 && (
          <div className="container-site mt-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h3 className="text-[1.6rem]">News &amp; Events</h3>
              <a href="/events/" className="link-arrow">All news &amp; events</a>
            </div>
            <ul className="grid gap-6 md:grid-cols-3">
              {events.map((e) => (
                <li key={e.slug} className="overflow-hidden rounded-card border border-stone bg-white">
                  <div className="aspect-[16/10] max-w-full overflow-hidden"><Photo src={e.image} alt={e.alt} label={e.title} className="h-full w-full" sizes="(min-width: 864px) 33vw, 100vw" /></div>
                  <div className="p-6">
                    <p className="text-label font-semibold uppercase text-walnut">{e.type === 'event' ? 'Event' : 'Update'} · <time dateTime={e.date}>{formatDate(e.date)}</time></p>
                    <h4 className="mt-2 font-display text-h3"><a href={`/events/${e.slug}/`} className="text-charcoal hover:text-emerald">{e.title}</a></h4>
                    <p className="mt-2 text-muted">{e.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
