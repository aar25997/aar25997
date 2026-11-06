// NEFRA static site builder. No runtime dependencies: `node build.mjs` -> dist/
//
// Content (edited by hand or in the CMS at /admin/):
//   content/site.json        site settings: contact, social, navigation, footer, analytics
//   content/ordering.json    ordering provider settings (see lib/ordering.mjs)
//   content/menu.json        menu categories, items and homepage featured cards
//   content/locations.json   restaurants; each gets /locations/<slug>/
//   content/social.json      curated Instagram posts for the homepage
//   content/stories/*.md     brand stories (Our Story and future editorial pages)
//   content/events/*.md      events and updates
// Templates: src/pages/*.html, each with a front-matter block (title, description, path)
// and {{tokens}} that are filled by the `components` below.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, dayRange, time12, money, formatDate } from './lib/format.mjs';
import { createOrdering } from './lib/ordering.mjs';
import { parseFrontMatter, renderMarkdown } from './lib/markdown.mjs';
import { createPicture } from './lib/images.mjs';
import { createSchema } from './lib/schema.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const readCollection = (dir) =>
  fs.existsSync(path.join(ROOT, dir))
    ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.md')).map((f) => {
        const { data, body } = parseFrontMatter(fs.readFileSync(path.join(ROOT, dir, f), 'utf8'));
        return { slug: f.replace(/\.md$/, ''), ...data, body };
      })
    : [];

const site = readJSON('content/site.json');
const menu = readJSON('content/menu.json');
const { locations } = readJSON('content/locations.json');
const social = readJSON('content/social.json');
const order = createOrdering({ ordering: readJSON('content/ordering.json'), locations });
const stories = readCollection('content/stories').filter((s) => s.published !== false).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
const events = readCollection('content/events').filter((e) => e.status === 'published').sort((a, b) => String(b.date).localeCompare(String(a.date)));

// ---------- helpers ----------
const base = (site.basePath || '/').replace(/\/?$/, '/');
const href = (p = '') => (/^https?:/.test(p) ? p : base + String(p).replace(/^\//, ''));
const picture = createPicture({ root: ROOT, href });
const schema = createSchema({ site, href });
const instagram = (site.social || []).find((s) => /instagram/i.test(s.network));
const primaryLoc = order.orderable[0] || locations[0];
const tel = (p) => p.replace(/[^\d+]/g, '');
const extAttrs = (url) => `href="${esc(url)}" target="_blank" rel="noopener"`;

/** <a> for an ordering destination ({url, external}) */
const orderLink = (dest, { cls = 'btn', label = 'Order Online', track = 'order_click' } = {}) =>
  `<a class="${cls}" href="${esc(href(dest.url))}"${dest.external && order.newTab ? ' target="_blank" rel="noopener"' : ''} data-track="${track}">${label}</a>`;

/** Primary call to action: Order Online once live, opening-updates signup before. */
const orderCta = (cls = 'btn') => {
  const dest = order.primary();
  return dest ? orderLink(dest, { cls }) : `<a class="${cls}" href="#signup" data-track="signup_cta">Get Opening Updates</a>`;
};

const statusLabel = (loc) => ({ open: 'Now open', 'temporarily-closed': 'Temporarily closed' }[loc.status] || 'Coming soon');
const cityLine = (loc) => `${esc(loc.address.city)}, ${esc(loc.address.regionName || loc.address.region)}`;

function directionsUrl(loc) {
  if (!loc) return '';
  if (loc.mapsUrl) return loc.mapsUrl;
  const a = loc.address;
  const dest = a.street ? `${site.name}, ${a.street}, ${a.city}, ${a.region} ${a.postalCode || ''}`.trim()
    : loc.coordinates?.lat ? `${loc.coordinates.lat},${loc.coordinates.lng}` : '';
  if (!dest) return '';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}${loc.googlePlaceId ? `&destination_place_id=${encodeURIComponent(loc.googlePlaceId)}` : ''}`;
}

function hoursList(loc, cls = '') {
  const rows = (loc.hours || []).filter((h) => h.opens && h.closes && h.days?.length);
  if (!loc.hoursConfirmed || !rows.length) return `<p class="muted ${cls}">Hours will be announced ahead of opening.</p>`;
  return `<dl class="hours ${cls}">${rows.map((h) => `<div><dt>${esc(dayRange(h.days))}</dt><dd>${time12(h.opens)} – ${time12(h.closes)}</dd></div>`).join('')}</dl>`;
}

function addressBlock(loc) {
  const a = loc.address;
  if (!a.street) return `<p>${cityLine(loc)}<br><span class="muted">Exact address coming soon.</span></p>`;
  return `<address>${esc(a.street)}<br>${esc(a.city)}, ${esc(a.region)} ${esc(a.postalCode)}</address>`;
}

function locationActions(loc, dark = false) {
  const solid = dark ? 'btn btn-light' : 'btn';
  const outline = dark ? 'btn btn-outline-light' : 'btn btn-outline';
  const btns = [];
  const url = order.urlFor(loc);
  if (url) btns.push(orderLink({ url, external: true }, { cls: solid }));
  const dir = directionsUrl(loc);
  if (dir) btns.push(`<a class="${btns.length ? outline : solid}" ${extAttrs(dir)} data-track="directions_click">Get Directions</a>`);
  if (loc.status !== 'open') btns.push(`<a class="${btns.length ? outline : solid}" href="#signup" data-track="signup_cta">Get Opening Updates</a>`);
  return `<div class="actions">${btns.join('')}</div>`;
}

const sortedCategories = [...menu.categories].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

// ---------- components: usable as {{name}} in src/pages ----------
const components = {
  base: () => base,
  orderCta: () => orderCta(),
  orderCtaLight: () => orderCta('btn btn-light'),
  instagramUrl: () => esc(instagram?.url || ''),
  instagramHandle: () => esc(instagram?.handle || ''),
  year: () => String(new Date().getFullYear()),
  // "coming soon to Sterling, Virginia" before opening, "in Sterling, Virginia" after
  wherePhrase: () => (primaryLoc ? `${primaryLoc.status === 'open' ? 'in' : 'coming soon to'} ${primaryLoc.address.city}, ${primaryLoc.address.regionName || primaryLoc.address.region}` : ''),

  hero: () => {
    const h = site.hero || {};
    if (h.video)
      return `<video class="hero-media" data-hero-video muted loop playsinline preload="none" ${h.poster ? `poster="${esc(href(h.poster))}"` : ''} aria-hidden="true"><source src="${esc(href(h.video))}" type="video/mp4"></video>
      <button class="video-toggle" type="button" data-video-toggle aria-pressed="false"><span class="sr-only">Pause background video</span></button>`;
    if (h.image) return picture({ src: h.image, alt: h.imageAlt, cls: 'hero-media', priority: true });
    return `<div class="hero-media photo-slot" role="img" aria-label="Shawarma roasting over heat"><span>Hero photo or video: shawarma over heat</span></div>`;
  },

  featuredMenu: () =>
    `<div class="feature-grid">${menu.featured
      .map((f) => `<a class="feature-card" href="${href('menu/')}#${esc(f.category)}">
        ${picture({ src: f.image, alt: f.alt || f.title, label: f.alt || f.title, cls: 'feature-photo', sizes: '(min-width: 1024px) 280px, (min-width: 560px) 50vw, 100vw' })}
        <div class="feature-body"><h3>${esc(f.title)}</h3><p>${esc(f.description)}</p><span class="link-arrow">View on menu</span></div>
      </a>`).join('')}</div>`,

  menuNav: () =>
    `<nav class="menu-tabs" aria-label="Menu categories"><div class="container menu-tabs-inner">${sortedCategories
      .map((c) => `<a href="#${esc(c.id)}">${esc(c.name)}</a>`).join('')}</div></nav>`,

  menuExtras: () => {
    const links = [];
    if (order.extras.familyMeals && order.isLive) links.push(`<a class="link-arrow" ${extAttrs(order.extras.familyMeals)} data-track="family_meals_click">Order family meals</a>`);
    if (order.extras.catering) links.push(`<a class="link-arrow" ${extAttrs(order.extras.catering)} data-track="catering_click">Catering</a>`);
    if (order.extras.giftCards) links.push(`<a class="link-arrow" ${extAttrs(order.extras.giftCards)} data-track="gift_cards_click">Gift cards</a>`);
    const cta = order.primary() ? `<div class="actions">${orderCta()}</div>` : '';
    return cta || links.length ? `${cta}${links.length ? `<div class="extra-links">${links.join('')}</div>` : ''}` : '';
  },

  menuSections: () =>
    sortedCategories.map((c) => {
      const items = menu.items.filter((i) => i.category === c.id);
      const list = items.length
        ? `<ul class="menu-items">${items.map((i) => {
            const dest = order.forItem(i);
            const where = locations.length > 1 && i.locations?.length
              ? `<p class="item-where">Available at ${i.locations.map((s) => esc(locations.find((l) => l.slug === s)?.address.city || s)).join(', ')}</p>` : '';
            return `<li class="menu-item${i.available === false ? ' is-unavailable' : ''}">
            ${i.image ? picture({ src: i.image, alt: i.alt || i.name, cls: 'menu-photo', sizes: '112px' }) : ''}
            <div class="menu-item-body">
              <div class="menu-item-head"><h3>${esc(i.name)}</h3><span class="price">${money(i.price) || '<span class="muted">Price coming soon</span>'}</span></div>
              ${i.description ? `<p>${esc(i.description)}</p>` : ''}
              ${i.dietary?.length ? `<ul class="tags" aria-label="Dietary information">${i.dietary.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
              ${i.allergens?.length ? `<p class="allergens">Contains: ${i.allergens.map(esc).join(', ')}</p>` : ''}
              ${where}
              ${i.available === false ? '<p class="unavailable">Currently unavailable</p>' : ''}
              ${dest ? orderLink(dest, { cls: 'btn btn-small', label: `Order Now<span class="sr-only">: ${esc(i.name)}</span>`, track: 'order_item_click' }) : ''}
            </div>
          </li>`;
          }).join('')}</ul>`
        : `<p class="muted menu-empty">Items for this category are being finalized.</p>`;
      return `<section class="menu-category" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-h">
        <header><h2 id="${esc(c.id)}-h">${esc(c.name)}</h2>${c.description ? `<p class="muted">${esc(c.description)}</p>` : ''}</header>
        ${list}
      </section>`;
    }).join(''),

  menuPreviewNote: () => (order.isLive ? '' : ' Our menu is being finalized ahead of opening, so dishes and prices may change.'),

  menuDisclaimer: () => `<p>${esc(menu.disclaimer)}</p>`,

  locationCards: () =>
    `<div class="location-grid">${locations.map((l) => `<article class="location-card">
        ${picture({ src: l.photos?.[0]?.src, alt: l.photos?.[0]?.alt, label: `NEFRA ${l.address.city} restaurant`, cls: 'location-photo', sizes: '(min-width: 760px) 400px, 100vw' })}
        <div class="location-body">
          <p class="status${l.status === 'open' ? ' status-open' : ''}">${statusLabel(l)}</p>
          <h2 class="h3">${cityLine(l)}</h2>
          ${addressBlock(l)}
          ${hoursList(l, 'small')}
          <a class="link-arrow" href="${href(`locations/${l.slug}/`)}">Location details<span class="sr-only">: ${esc(l.address.city)}</span></a>
        </div>
      </article>`).join('')}</div>`,

  homeVisit: () => {
    const l = primaryLoc;
    if (!l) return '';
    const heading = l.status === 'open' ? `Visit Us in ${esc(l.address.city)}` : `Coming Soon to ${cityLine(l)}`;
    return `<div class="visit">
      <div class="visit-text">
        <p class="eyebrow eyebrow-gold">Visit</p>
        <h2>${heading}</h2>
        ${l.status === 'open' ? '' : `<p>${esc(l.openingNote)}</p>`}
        <div class="visit-details">
          <div><h3>Location</h3>${addressBlock(l)}</div>
          <div><h3>Hours</h3>${hoursList(l)}</div>
          ${l.parking ? `<div><h3>Parking</h3><p>${esc(l.parking)}</p></div>` : ''}
        </div>
        ${locationActions(l, true)}
      </div>
      ${picture({ src: l.photos?.[0]?.src, alt: l.photos?.[0]?.alt, label: `NEFRA ${l.address.city} restaurant interior`, cls: 'visit-photo', sizes: '(min-width: 860px) 45vw, 100vw' })}
    </div>`;
  },

  socialGrid: () => {
    const posts = social.posts?.length ? social.posts.slice(0, 8) : Array.from({ length: 4 }, () => ({}));
    const url = instagram?.url || '#';
    return `<div class="social-grid">${posts.map((p) => `<a href="${esc(p.url || url)}" target="_blank" rel="noopener" data-track="instagram_click" class="social-tile">
      ${picture({ src: p.image, alt: p.alt ? `${p.alt} (opens Instagram)` : 'NEFRA on Instagram', label: 'Instagram photo', cls: 'social-photo', sizes: '(min-width: 860px) 25vw, 50vw' })}
    </a>`).join('')}</div>`;
  },

  eventsTeaser: () => {
    if (!events.length) return '';
    return `<div class="events-teaser">
      <div class="section-head section-head-sm"><h3>News &amp; Events</h3><a class="link-arrow" href="${href('events/')}">All news &amp; events</a></div>
      <div class="event-grid">${events.slice(0, 3).map((e) => eventCard(e, 4)).join('')}</div>
    </div>`;
  },

  contactDetails: () => {
    const rows = [];
    if (site.email) rows.push(`<li><span>Email</span><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>`);
    if (site.phone) rows.push(`<li><span>Phone</span><a href="tel:${esc(tel(site.phone))}">${esc(site.phone)}</a></li>`);
    for (const s of site.social || []) rows.push(`<li><span>${esc(s.network)}</span><a ${extAttrs(s.url)}>${esc(s.handle || s.url)}</a></li>`);
    rows.push(`<li><span>Location</span>${locations.map((l) => `${cityLine(l)}${l.status === 'open' ? '' : ' (coming soon)'}`).join('<br>')}</li>`);
    return `<ul class="contact-details">${rows.join('')}</ul>`;
  },

  contactForm: () => form('contact', site.contactEndpoint, `
      <div class="field"><label for="c-name">Name</label><input id="c-name" name="name" type="text" autocomplete="name" required></div>
      <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="c-topic">Topic</label>
      <select id="c-topic" name="topic">
        <option>General question</option>
        <option>${site.cateringEnabled ? 'Catering' : 'Catering (future interest)'}</option>
        <option>Partnerships &amp; press</option>
        <option>Careers</option>
      </select></div>
      <div class="field"><label for="c-message">Message</label><textarea id="c-message" name="message" rows="5" required></textarea></div>
      <button class="btn" type="submit">Send Message</button>`),
};

function eventCard(e, level = 2) {
  return `<article class="event-card">
    ${picture({ src: e.image, alt: e.alt || e.title, label: e.alt || e.title, cls: 'event-photo', sizes: '(min-width: 860px) 33vw, 100vw' })}
    <div class="event-body">
      <p class="event-meta">${e.type === 'event' ? 'Event' : 'Update'} · <time datetime="${esc(e.date)}">${formatDate(e.date)}</time></p>
      <h${level} class="h3"><a href="${href(`events/${e.slug}/`)}">${esc(e.title)}</a></h${level}>
      <p>${esc(e.summary)}</p>
    </div>
  </article>`;
}

function form(kind, endpoint, fields) {
  return `<form class="form" data-form="${kind}" ${endpoint ? `action="${esc(endpoint)}" method="post"` : ''} novalidate>
    ${fields}
    <p class="form-status" role="status" aria-live="polite"></p>
  </form>`;
}

// ---------- layout ----------
const wordmark = (cls = '') =>
  site.logo
    ? `<img class="wordmark-img ${cls}" src="${esc(href(site.logo))}" alt="${esc(site.name)}" width="160" height="36">`
    : `<span class="wordmark ${cls}">${esc(site.name)}</span>`;

function header(pagePath) {
  const links = site.navigation.map((n) => {
    const active = n.path !== '/' && pagePath.startsWith(n.path);
    return `<a href="${href(n.path)}"${active ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`;
  }).join('');
  const city = locations[0] ? cityLine(locations[0]) : '';
  const announce = order.isLive ? '' : `<div class="announce" role="region" aria-label="Announcement"><div class="container">Coming soon to ${city} · <a href="#signup">Get opening updates</a></div></div>`;
  const dest = order.primary();
  return `${announce}<header class="site-header">
  <div class="container nav">
    <a href="${href()}" class="brand" aria-label="${esc(site.name)} home">${wordmark()}</a>
    <div class="nav-right">
      ${dest ? orderLink(dest, { cls: 'btn btn-small btn-light nav-order-mobile', label: 'Order' }) : ''}
      <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav"><span class="sr-only">Menu</span><span class="bar"></span><span class="bar"></span><span class="bar"></span></button>
    </div>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      ${links}
      ${dest ? orderLink(dest, { cls: 'btn btn-small btn-light' }) : `<a class="btn btn-small btn-light" href="#signup" data-track="signup_cta">Join the List</a>`}
    </nav>
  </div>
</header>`;
}

/** Mobile bottom bar: Menu / Order / Directions. Shown only once ordering is live. */
function bottomBar() {
  const dest = order.primary();
  if (!dest) return '';
  const dir = order.orderable.length === 1 ? directionsUrl(order.orderable[0]) : '';
  return `<nav class="bottom-bar" aria-label="Quick actions">
    <a href="${href('menu/')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>Menu</a>
    ${orderLink(dest, { cls: 'bottom-bar-order', label: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0"/></svg>Order' })}
    ${dir ? `<a ${extAttrs(dir)} data-track="directions_click"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>Directions</a>`
      : `<a href="${href('locations/')}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>Locations</a>`}
  </nav>`;
}

function footer(pagePath) {
  const links = [...site.footerLinks];
  if (events.length) links.splice(links.length - 1, 0, { label: 'News & Events', path: '/events/' });
  if (site.cateringEnabled) links.splice(links.length - 1, 0, { label: 'Catering', path: '/catering/' });
  return `<footer class="site-footer">
  <section class="signup" id="signup" aria-labelledby="signup-h">
    <div class="container signup-inner">
      <div>
        <p class="eyebrow eyebrow-light">${order.isLive ? 'Stay in touch' : 'Opening soon'}</p>
        <h2 id="signup-h">${order.isLive ? 'News from the NEFRA Kitchen' : 'Be the First to Know When We Open'}</h2>
        <p>Opening news, new dishes, events and the occasional offer. No spam.</p>
      </div>
      ${form('newsletter', site.newsletterEndpoint, `
        <input type="hidden" name="source" value="${esc(pagePath)}">
        <div class="signup-row">
          <label class="sr-only" for="signup-email">Email address</label>
          <input id="signup-email" name="email" type="email" autocomplete="email" placeholder="Your email address" required>
          <button class="btn btn-light" type="submit">Sign Up</button>
        </div>
        <p class="consent">By signing up you agree to receive emails from ${esc(site.name)}. Unsubscribe anytime. See our <a href="${href('privacy-policy/')}">Privacy Policy</a>.</p>`)}
    </div>
  </section>
  <div class="container footer-grid">
    <div class="footer-brand">
      ${wordmark('wordmark-light')}
      <p class="footer-tagline">${esc(site.tagline)}</p>
    </div>
    <nav aria-labelledby="f-explore">
      <h2 class="footer-h" id="f-explore">Explore</h2>
      ${links.map((l) => `<a href="${href(l.path)}">${esc(l.label)}</a>`).join('')}
    </nav>
    <div>
      <h2 class="footer-h">Visit</h2>
      ${locations.map((l) => `<p><a href="${href(`locations/${l.slug}/`)}">${esc(l.address.city)}, ${esc(l.address.region)}</a><br><span class="muted-light">${statusLabel(l)}</span></p>`).join('')}
    </div>
    <div>
      <h2 class="footer-h">Connect</h2>
      ${(site.social || []).map((s) => `<a ${extAttrs(s.url)}>${esc(s.network)} ${esc(s.handle || '')}</a>`).join('')}
      ${site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ''}
      ${site.phone ? `<a href="tel:${esc(tel(site.phone))}">${esc(site.phone)}</a>` : ''}
      ${order.extras.giftCards ? `<a ${extAttrs(order.extras.giftCards)} data-track="gift_cards_click">Gift Cards</a>` : ''}
    </div>
  </div>
  <div class="container footer-bottom">
    <span>&copy; ${components.year()} ${esc(site.name)}. All rights reserved.</span>
    <a href="${href('privacy-policy/')}">Privacy Policy</a>
  </div>
</footer>
${bottomBar()}`;
}

function analytics() {
  const id = site.analytics?.ga4MeasurementId;
  if (!id) return '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(id)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(id)});</script>`;
}

function layout({ title, description, path: pagePath, body, ld = '', head = '', noindex = false, bodyClass = '' }) {
  const fullTitle = title || `${site.name} | ${site.tagline}`;
  const desc = description || site.description;
  const canonical = site.siteUrl ? site.siteUrl + href(pagePath) : '';
  const ogImage = site.hero?.image || site.hero?.poster;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
${site.analytics?.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.analytics.googleSiteVerification)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:locale" content="en_US">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
${ogImage && site.siteUrl ? `<meta property="og:image" content="${esc(site.siteUrl + href(ogImage))}">` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
<meta name="theme-color" content="#0E5A4F">
<link rel="icon" href="${href('assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${href('assets/css/site.css')}">
${head}
${ld}
${analytics()}
</head>
<body class="${bodyClass}${order.isLive ? ' has-bottom-bar' : ''}">
<a class="skip-link" href="#main">Skip to content</a>
${header(pagePath)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(pagePath)}
<script src="${href('assets/js/site.js')}" defer></script>
</body>
</html>
`;
}

// ---------- page building ----------
function parsePage(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  if (m) for (const line of m[1].split('\n')) { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  return { meta, body: m ? src.slice(m[0].length) : src };
}

const fill = (body) =>
  body.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (all, key) => {
    if (key in components) return components[key]();
    if (key.startsWith('site.')) return esc(site[key.slice(5)]);
    console.warn(`  ! unknown token ${all}`);
    return '';
  });

const built = [];
function write(pagePath, html, { sitemap = true } = {}) {
  const file = pagePath.endsWith('.html') ? path.join(OUT, pagePath) : path.join(OUT, pagePath.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (sitemap) built.push(pagePath);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(path.join(ROOT, 'src/assets'), path.join(OUT, 'assets'));
copyDir(path.join(ROOT, 'src/admin'), path.join(OUT, 'admin'));

const homeLD = () =>
  locations.length === 1 ? schema.website() + schema.restaurant(locations[0]) : schema.website() + schema.organization();

// Template pages
for (const f of fs.readdirSync(path.join(ROOT, 'src/pages')).filter((f) => f.endsWith('.html'))) {
  const { meta, body } = parsePage(fs.readFileSync(path.join(ROOT, 'src/pages', f), 'utf8'));
  if (meta.requires === 'catering' && !site.cateringEnabled) continue;
  const p = meta.path || '/';
  const is404 = p === '/404/';
  const ld = p === '/' ? homeLD() : schema.breadcrumbs([['Home', ''], [meta.crumb || meta.title?.split(/[:|]/)[0].trim(), p]]);
  write(is404 ? '404.html' : p, layout({ ...meta, title: fill(meta.title || ''), description: fill(meta.description || ''), path: p, body: fill(body), ld: is404 ? '' : ld, noindex: is404 || meta.noindex === 'true' }), { sitemap: !is404 && meta.noindex !== 'true' });
}

// Brand stories
for (const s of stories) {
  const p = s.path || `/stories/${s.slug}/`;
  const body = `
<section class="page-hero page-hero-emerald">
  <div class="container narrow">
    <p class="eyebrow eyebrow-light">${esc(s.eyebrow || 'Stories')}</p>
    <h1>${esc(s.heading || s.title)}</h1>
    ${s.lead ? `<p class="lead">${esc(s.lead)}</p>` : ''}
  </div>
</section>
${s.heroImage ? `<div class="container story-hero-img">${picture({ src: s.heroImage, alt: s.heroAlt, cls: 'photo-wide', priority: true })}</div>` : ''}
<article class="section">
  <div class="container prose">
    ${renderMarkdown(s.body, { href, picture, dropcap: s.dropcap })}
    <div class="actions">
      <a class="btn" href="${href('our-standards/')}">Read Our Standards</a>
      <a class="btn btn-outline" href="${href('menu/')}">Explore the Menu</a>
    </div>
  </div>
</article>`;
  write(p, layout({ title: s.seoTitle || `${s.title} | ${site.name}`, description: s.seoDescription, path: p, body, ld: schema.breadcrumbs([['Home', ''], [s.title, p]]) }));
}

// Locations
for (const loc of locations) {
  const p = `/locations/${loc.slug}/`;
  const photos = loc.photos?.length ? loc.photos : [{}];
  const body = `
<section class="page-hero page-hero-emerald">
  <div class="container">
    <p class="eyebrow eyebrow-light"><a href="${href('locations/')}">Locations</a> · ${statusLabel(loc)}</p>
    <h1>${loc.status === 'open' ? `NEFRA ${esc(loc.address.city)}` : `Coming Soon to ${cityLine(loc)}`}</h1>
    <p class="lead">${loc.status === 'open' ? `Mediterranean shawarma, Egyptian falafel and fresh bowls in ${cityLine(loc)}.` : esc(loc.openingNote)}</p>
    ${locationActions(loc, true)}
  </div>
</section>
<section class="section">
  <div class="container location-detail">
    <div class="location-info">
      <div><h2 class="h-small">Address</h2>${addressBlock(loc)}</div>
      <div><h2 class="h-small">Hours</h2>${hoursList(loc)}</div>
      ${loc.phone ? `<div><h2 class="h-small">Phone</h2><p><a href="tel:${esc(tel(loc.phone))}">${esc(loc.phone)}</a></p></div>` : ''}
      ${loc.parking ? `<div><h2 class="h-small">Parking</h2><p>${esc(loc.parking)}</p></div>` : ''}
      <div><h2 class="h-small">Menu</h2><p>${loc.menuNote ? esc(loc.menuNote) + ' ' : ''}<a href="${href('menu/')}">View the menu</a></p></div>
    </div>
    <div class="location-gallery">
      ${photos.map((ph, i) => picture({ src: ph.src, alt: ph.alt, label: `NEFRA ${loc.address.city} restaurant`, cls: 'location-photo-lg', sizes: '(min-width: 860px) 55vw, 100vw', priority: i === 0 && !!ph.src })).join('')}
    </div>
  </div>
</section>`;
  write(p, layout({
    title: loc.seo?.title || `${site.name} ${loc.address.city}, ${loc.address.region}`,
    description: loc.seo?.description,
    path: p,
    body,
    ld: schema.restaurant(loc) + schema.breadcrumbs([['Home', ''], ['Locations', '/locations/'], [loc.address.city, p]]),
  }));
}

// Events and updates (only built once something is published)
if (events.length) {
  write('/events/', layout({
    title: `News & Events | ${site.name} Sterling, VA`,
    description: `News, openings and community events from ${site.name}.`,
    path: '/events/',
    body: `<section class="page-hero"><div class="container"><p class="eyebrow">Community</p><h1>News &amp; Events</h1></div></section>
      <section class="section section-tight"><div class="container"><div class="event-grid">${events.map((e) => eventCard(e, 2)).join('')}</div></div></section>`,
    ld: schema.breadcrumbs([['Home', ''], ['News & Events', '/events/']]),
  }));
  for (const e of events) {
    const p = `/events/${e.slug}/`;
    const loc = locations.find((l) => l.slug === e.location);
    write(p, layout({
      title: `${e.title} | ${site.name}`,
      description: e.summary,
      path: p,
      body: `<section class="page-hero"><div class="container narrow">
          <p class="eyebrow"><a href="${href('events/')}">News &amp; Events</a> · <time datetime="${esc(e.date)}">${formatDate(e.date)}</time></p>
          <h1>${esc(e.title)}</h1>${e.summary ? `<p class="lead">${esc(e.summary)}</p>` : ''}</div></section>
        <article class="section section-tight"><div class="container prose">
          ${e.image ? `<figure class="prose-figure">${picture({ src: e.image, alt: e.alt, cls: 'photo-wide', priority: true })}</figure>` : ''}
          ${renderMarkdown(e.body, { href, picture })}
        </div></article>`,
      ld: (e.type === 'event' ? schema.event(e, loc) : '') + schema.breadcrumbs([['Home', ''], ['News & Events', '/events/'], [e.title, p]]),
    }));
  }
}

// /order/: a stable link for QR codes, Instagram bio and Google Business Profile.
{
  let body, head = '';
  const dest = order.primary();
  if (!order.isLive) {
    body = `<section class="page-hero page-hero-emerald page-404"><div class="container narrow center">
      <p class="eyebrow eyebrow-light">Order Online</p><h1>Online Ordering Opens With Our Restaurant</h1>
      <p class="lead">We're not taking orders yet. Join our list and we'll let you know the moment we open.</p>
      <div class="actions actions-center"><a class="btn btn-light" href="#signup">Get Opening Updates</a><a class="btn btn-outline-light" href="${href('menu/')}">Preview the Menu</a></div></div></section>`;
  } else if (order.mode === 'embed' && order.orderable.length === 1) {
    const url = order.urlFor(order.orderable[0]);
    body = `<section class="order-embed"><iframe src="${esc(url)}" title="Order online from ${esc(site.name)}" allow="payment"></iframe>
      <p class="container order-fallback">Having trouble? <a ${extAttrs(url)}>Open online ordering in a new window</a>.</p></section>`;
  } else if (dest?.external) {
    head = `<meta http-equiv="refresh" content="0; url=${esc(dest.url)}">`;
    body = `<section class="page-hero"><div class="container narrow center"><h1>Taking You to Online Ordering…</h1>
      <p><a class="btn" href="${esc(dest.url)}">Continue to order</a></p></div></section>`;
  } else {
    body = `<section class="page-hero"><div class="container"><p class="eyebrow">Order Online</p><h1>Choose Your NEFRA</h1></div></section>
      <section class="section section-tight"><div class="container"><div class="location-grid">${order.orderable.map((l) => `<article class="location-card"><div class="location-body">
        <h2 class="h3">${cityLine(l)}</h2>${addressBlock(l)}${hoursList(l, 'small')}
        <div class="actions">${orderLink({ url: order.urlFor(l), external: true })}</div></div></article>`).join('')}</div></div></section>`;
  }
  write('/order/', layout({ title: `Order Online | ${site.name}`, description: `Order ${site.name} online for pickup.`, path: '/order/', body, head, noindex: true }), { sitemap: false });
}

// robots.txt + sitemap.xml
const robots = ['User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /order/'];
if (site.siteUrl) {
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${built.map((p) => `  <url><loc>${esc(site.siteUrl + href(p))}</loc></url>`).join('\n')}\n</urlset>\n`);
  robots.push(`Sitemap: ${site.siteUrl}${href('sitemap.xml')}`);
} else {
  console.warn('  ! siteUrl is empty in content/site.json: skipped sitemap.xml, canonical links and absolute schema URLs');
}
fs.writeFileSync(path.join(OUT, 'robots.txt'), robots.join('\n') + '\n');

console.log(`Built ${built.length} indexable pages into dist/ (ordering ${order.isLive ? `live via ${order.provider || 'provider'} (${order.mode})` : 'not live: pre-opening mode'}):\n  ${built.join('\n  ')}`);
