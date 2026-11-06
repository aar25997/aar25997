// NEFRA static site builder. No dependencies: `node build.mjs` -> dist/
//
// Pages live in src/pages/*.html. Each starts with a small front-matter block:
//   ---
//   title: Menu
//   description: ...
//   path: /menu/
//   ---
// and can use {{tokens}} that are filled from content/*.json (see `components`).
// Location pages are generated automatically from content/locations.json.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const site = readJSON('content/site.json');
const menu = readJSON('content/menu.json');
const { locations } = readJSON('content/locations.json');

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const base = (site.basePath || '/').replace(/\/?$/, '/');
const href = (p = '') => base + String(p).replace(/^\//, '');
const isOpen = site.status === 'open' && !!site.orderUrl;
const igUrl = site.instagram ? `https://www.instagram.com/${site.instagram}/` : '';
const money = (n) => (typeof n === 'number' ? `$${n.toFixed(2)}` : '');
const ext = (url) => `href="${esc(url)}" target="_blank" rel="noopener"`;

const photo = (label, image, cls = '', alt) =>
  image
    ? `<img class="photo ${cls}" src="${esc(href(image))}" alt="${esc(alt ?? label)}" loading="lazy" decoding="async">`
    : `<div class="photo photo-slot ${cls}" role="img" aria-label="${esc(label)}"><span>${esc(label)}</span></div>`;

const orderCta = (cls = '') =>
  isOpen
    ? `<a class="btn ${cls}" ${ext(site.orderUrl)}>Order Online</a>`
    : `<a class="btn ${cls}" href="#signup">Get Opening Updates</a>`;

const mapsLink = (loc) =>
  loc.mapsUrl ||
  (loc.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${loc.address}, ${loc.city}, ${loc.region} ${loc.postalCode || ''}`)}`
    : '');

const locStatusLabel = (loc) => (loc.status === 'open' ? 'Now open' : 'Coming soon');

function hoursList(loc) {
  const rows = (loc.hours || []).filter((h) => h.open && h.close);
  if (loc.status !== 'open' || !rows.length)
    return `<p class="muted">Hours will be announced ahead of opening.</p>`;
  return `<dl class="hours">${rows.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.open)} – ${esc(h.close)}</dd></div>`).join('')}</dl>`;
}

function addressBlock(loc) {
  if (!loc.address) return `<p>${esc(loc.city)}, ${esc(loc.regionName || loc.region)}<br><span class="muted">Exact address coming soon.</span></p>`;
  return `<address>${esc(loc.address)}<br>${esc(loc.city)}, ${esc(loc.region)} ${esc(loc.postalCode)}</address>`;
}

function locationActions(loc) {
  const btns = [];
  const order = loc.orderUrl || site.orderUrl;
  if (loc.status === 'open' && order) btns.push(`<a class="btn" ${ext(order)}>Order Online</a>`);
  const dir = mapsLink(loc);
  if (dir) btns.push(`<a class="btn ${btns.length ? 'btn-outline' : ''}" ${ext(dir)}>Get Directions</a>`);
  if (loc.status !== 'open') btns.push(`<a class="btn ${btns.length ? 'btn-outline' : ''}" href="#signup">Get Opening Updates</a>`);
  return `<div class="actions">${btns.join('')}</div>`;
}

// ---------- components (usable as {{name}} in pages) ----------
const components = {
  orderCta: () => orderCta(),
  orderCtaLight: () => orderCta('btn-light'),
  instagramUrl: () => esc(igUrl),
  instagramHandle: () => esc(site.instagram ? '@' + site.instagram : ''),

  hero: () => {
    const h = site.hero || {};
    let media;
    if (h.video)
      media = `<video class="hero-media" autoplay muted loop playsinline ${h.poster ? `poster="${esc(href(h.poster))}"` : ''} aria-hidden="true"><source src="${esc(href(h.video))}"></video>`;
    else if (h.image) media = `<img class="hero-media" src="${esc(href(h.image))}" alt="${esc(h.imageAlt)}">`;
    else media = `<div class="hero-media photo-slot" role="img" aria-label="Shawarma roasting over heat"><span>Hero photo or video: shawarma over heat</span></div>`;
    return media;
  },

  featuredMenu: () =>
    `<div class="feature-grid">${menu.featured
      .map(
        (f) => `<a class="feature-card" href="${href('menu/')}#${esc(f.category)}">
        ${photo(f.imageLabel || f.title, f.image, 'feature-photo', f.title)}
        <div class="feature-body"><h3>${esc(f.title)}</h3><p>${esc(f.description)}</p><span class="link-arrow">View on menu</span></div>
      </a>`
      )
      .join('')}</div>`,

  menuNav: () =>
    `<nav class="menu-tabs" aria-label="Menu categories"><div class="container menu-tabs-inner">${menu.categories
      .map((c) => `<a href="#${esc(c.id)}">${esc(c.name)}</a>`)
      .join('')}</div></nav>`,

  menuSections: () =>
    menu.categories
      .map((c) => {
        const items = c.items?.length
          ? `<ul class="menu-items">${c.items
              .map(
                (i) => `<li class="menu-item">
            ${i.image ? photo(i.name, i.image, 'menu-photo') : ''}
            <div class="menu-item-body">
              <div class="menu-item-head"><h3>${esc(i.name)}</h3><span class="price">${money(i.price) || '<span class="muted">Price coming soon</span>'}</span></div>
              ${i.description ? `<p>${esc(i.description)}</p>` : ''}
              ${i.dietary?.length ? `<ul class="tags">${i.dietary.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
              ${i.allergens?.length ? `<p class="allergens">Contains: ${i.allergens.map(esc).join(', ')}</p>` : ''}
              ${isOpen && i.orderable !== false ? `<a class="btn btn-small" ${ext(site.orderUrl)}>Order Now</a>` : ''}
            </div>
          </li>`
              )
              .join('')}</ul>`
          : `<p class="muted menu-empty">Items for this category are being finalized.</p>`;
        return `<section class="menu-category" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-h">
        <header><h2 id="${esc(c.id)}-h">${esc(c.name)}</h2>${c.blurb ? `<p class="muted">${esc(c.blurb)}</p>` : ''}</header>
        ${items}
      </section>`;
      })
      .join(''),

  menuDisclaimer: () => `<p>${esc(menu.disclaimer)}</p>`,

  locationCards: () =>
    `<div class="location-grid">${locations
      .map(
        (l) => `<article class="location-card">
        ${photo(`${l.city} restaurant`, l.photos?.[0], 'location-photo')}
        <div class="location-body">
          <p class="status ${l.status === 'open' ? 'status-open' : ''}">${locStatusLabel(l)}</p>
          <h3>${esc(l.city)}, ${esc(l.regionName || l.region)}</h3>
          ${addressBlock(l)}
          <a class="link-arrow" href="${href(`locations/${l.slug}/`)}">Location details</a>
        </div>
      </article>`
      )
      .join('')}</div>`,

  homeVisit: () => {
    const l = locations[0];
    if (!l) return '';
    const heading = l.status === 'open' ? `Visit us in ${esc(l.city)}` : `Coming Soon to ${esc(l.city)}, ${esc(l.regionName || l.region)}`;
    return `<div class="visit">
      <div class="visit-text">
        <p class="eyebrow eyebrow-light">Visit</p>
        <h2>${heading}</h2>
        ${l.status === 'open' ? '' : `<p>${esc(l.openingNote)}</p>`}
        <div class="visit-details">
          <div><h3>Location</h3>${addressBlock(l)}</div>
          <div><h3>Hours</h3>${hoursList(l)}</div>
          ${l.parking ? `<div><h3>Parking</h3><p>${esc(l.parking)}</p></div>` : ''}
        </div>
        ${locationActions(l).replace(/class="btn( btn-outline)?"/g, (m, o) => `class="btn ${o ? 'btn-outline-light' : 'btn-light'}"`)}
      </div>
      ${photo(`${l.city} restaurant interior`, l.photos?.[0], 'visit-photo')}
    </div>`;
  },

  contactDetails: () => {
    const rows = [];
    if (site.email) rows.push(`<li><span>Email</span><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>`);
    if (site.phone) rows.push(`<li><span>Phone</span><a href="tel:${esc(site.phone.replace(/[^\d+]/g, ''))}">${esc(site.phone)}</a></li>`);
    if (igUrl) rows.push(`<li><span>Instagram</span><a ${ext(igUrl)}>@${esc(site.instagram)}</a></li>`);
    rows.push(`<li><span>Location</span>${locations.map((l) => `${esc(l.city)}, ${esc(l.region)}${l.status === 'open' ? '' : ' (coming soon)'}`).join('<br>')}</li>`);
    return `<ul class="contact-details">${rows.join('')}</ul>`;
  },

  contactForm: () => form('contact', site.contactEndpoint, `
      <label>Name<input name="name" type="text" autocomplete="name" required></label>
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Topic
        <select name="topic">
          <option>General question</option>
          ${site.cateringAvailable ? '<option>Catering</option>' : '<option>Catering (future interest)</option>'}
          <option>Partnerships &amp; press</option>
          <option>Careers</option>
        </select>
      </label>
      <label>Message<textarea name="message" rows="5" required></textarea></label>
      <button class="btn" type="submit">Send Message</button>`),

  year: () => String(new Date().getFullYear()),
};

function form(kind, endpoint, fields) {
  return `<form class="form" data-form="${kind}" ${endpoint ? `action="${esc(endpoint)}" method="post"` : ''} novalidate>
    ${fields}
    <p class="form-status" role="status" aria-live="polite"></p>
  </form>`;
}

// ---------- layout ----------
const NAV = [
  ['menu/', 'Menu'],
  ['our-story/', 'Our Story'],
  ['our-standards/', 'Our Standards'],
  ['locations/', 'Locations'],
];

const wordmark = (cls = '') =>
  site.logo
    ? `<img class="wordmark-img ${cls}" src="${esc(href(site.logo))}" alt="${esc(site.name)}">`
    : `<span class="wordmark ${cls}" aria-label="${esc(site.name)}">${esc(site.name)}</span>`;

function header(pagePath) {
  const links = NAV.map(([p, label]) => {
    const active = pagePath.startsWith('/' + p);
    return `<a href="${href(p)}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
  const announce = isOpen
    ? ''
    : `<div class="announce"><div class="container">Coming soon to ${esc(locations[0]?.city || 'Sterling')}, ${esc(locations[0]?.regionName || 'Virginia')} · <a href="#signup">Get opening updates</a></div></div>`;
  return `${announce}<header class="site-header">
  <div class="container nav">
    <a href="${href()}" class="brand">${wordmark()}</a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span><span></span><span></span></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      ${links}
      ${isOpen ? `<a class="btn btn-small" ${ext(site.orderUrl)}>Order Online</a>` : `<a class="btn btn-small" href="#signup">Join the List</a>`}
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <section class="signup" id="signup" aria-labelledby="signup-h">
    <div class="container signup-inner">
      <div>
        <p class="eyebrow eyebrow-gold">${isOpen ? 'Stay in touch' : 'Opening soon'}</p>
        <h2 id="signup-h">${isOpen ? 'News from the NEFRA kitchen' : 'Be the first to know when we open'}</h2>
        <p>Opening news, new dishes and community events. No spam.</p>
      </div>
      ${form('newsletter', site.newsletterEndpoint, `
        <div class="signup-row">
          <label class="sr-only" for="signup-email">Email address</label>
          <input id="signup-email" name="email" type="email" autocomplete="email" placeholder="Your email address" required>
          <button class="btn btn-light" type="submit">Sign Up</button>
        </div>`)}
    </div>
  </section>
  <div class="container footer-grid">
    <div class="footer-brand">
      ${wordmark('wordmark-light')}
      <p class="footer-tagline">${esc(site.tagline)}</p>
    </div>
    <nav aria-label="Footer">
      <h3>Explore</h3>
      <a href="${href('menu/')}">Menu</a>
      <a href="${href('our-story/')}">Our Story</a>
      <a href="${href('our-standards/')}">Our Standards</a>
      <a href="${href('locations/')}">Locations</a>
      <a href="${href('contact/')}">Contact</a>
    </nav>
    <div>
      <h3>Visit</h3>
      ${locations.map((l) => `<p><a href="${href(`locations/${l.slug}/`)}">${esc(l.city)}, ${esc(l.region)}</a><br><span class="muted-light">${locStatusLabel(l)}</span></p>`).join('')}
    </div>
    <div>
      <h3>Connect</h3>
      ${igUrl ? `<a ${ext(igUrl)}>Instagram @${esc(site.instagram)}</a>` : ''}
      ${site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ''}
      ${site.phone ? `<a href="tel:${esc(site.phone.replace(/[^\d+]/g, ''))}">${esc(site.phone)}</a>` : ''}
    </div>
  </div>
  <div class="container footer-bottom">
    <span>&copy; ${components.year()} ${esc(site.name)}. All rights reserved.</span>
    <a href="${href('privacy-policy/')}">Privacy Policy</a>
  </div>
</footer>`;
}

function restaurantLD(loc) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: loc ? loc.name : site.name,
    slogan: site.tagline,
    servesCuisine: ['Mediterranean', 'Egyptian'],
    description: site.description,
  };
  if (site.siteUrl) ld.url = site.siteUrl + href(loc ? `locations/${loc.slug}/` : '');
  if (igUrl) ld.sameAs = [igUrl];
  if (site.orderUrl && isOpen) ld.hasMenu = site.siteUrl ? site.siteUrl + href('menu/') : undefined;
  const l = loc || locations[0];
  if (l) {
    ld.address = { '@type': 'PostalAddress', addressLocality: l.city, addressRegion: l.region, addressCountry: 'US' };
    if (l.address) ld.address.streetAddress = l.address;
    if (l.postalCode) ld.address.postalCode = l.postalCode;
    if (l.phone) ld.telephone = l.phone;
  }
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

function layout({ title, description, path: pagePath, body, bodyClass = '', ld = '' }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | ${site.tagline} · Mediterranean in Sterling, VA`;
  const desc = description || site.description;
  const canonical = site.siteUrl ? site.siteUrl + href(pagePath) : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
${site.hero?.image && site.siteUrl ? `<meta property="og:image" content="${esc(site.siteUrl + href(site.hero.image))}">` : ''}
<meta name="theme-color" content="#0E5A4F">
<link rel="icon" href="${href('assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${href('assets/css/site.css')}">
${ld}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
${header(pagePath)}
<main id="main">
${body}
</main>
${footer()}
<script src="${href('assets/js/site.js')}" defer></script>
</body>
</html>
`;
}

// ---------- build ----------
function parsePage(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  if (m) for (const line of m[1].split('\n')) { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  return { meta, body: m ? src.slice(m[0].length) : src };
}

const fill = (body, extra = {}) =>
  body.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (all, key) => {
    if (key in extra) return extra[key];
    if (key in components) return components[key]();
    if (key.startsWith('site.')) return esc(site[key.slice(5)]);
    console.warn(`  ! unknown token ${all}`);
    return '';
  });

function write(pagePath, html) {
  const file = path.join(OUT, pagePath.replace(/^\//, ''), pagePath.endsWith('/') ? 'index.html' : '');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
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

const built = [];
for (const f of fs.readdirSync(path.join(ROOT, 'src/pages')).filter((f) => f.endsWith('.html'))) {
  const { meta, body } = parsePage(fs.readFileSync(path.join(ROOT, 'src/pages', f), 'utf8'));
  if (meta.requires === 'catering' && !site.cateringAvailable) continue;
  const p = meta.path || '/';
  write(p === '/404/' ? '/404.html' : p, layout({ ...meta, path: p, body: fill(body), ld: meta.jsonld === 'restaurant' ? restaurantLD() : '' }));
  if (p !== '/404/') built.push(p);
}

for (const loc of locations) {
  const p = `/locations/${loc.slug}/`;
  const body = `
<section class="page-hero page-hero-emerald">
  <div class="container">
    <p class="eyebrow eyebrow-light"><a href="${href('locations/')}">Locations</a> · ${locStatusLabel(loc)}</p>
    <h1>${loc.status === 'open' ? `NEFRA ${esc(loc.city)}` : `Coming Soon to ${esc(loc.city)}, ${esc(loc.regionName || loc.region)}`}</h1>
    ${loc.status === 'open' ? '' : `<p class="lead">${esc(loc.openingNote)}</p>`}
  </div>
</section>
<section class="section">
  <div class="container location-detail">
    <div class="location-info">
      <div><h2 class="h-small">Address</h2>${addressBlock(loc)}</div>
      <div><h2 class="h-small">Hours</h2>${hoursList(loc)}</div>
      ${loc.phone ? `<div><h2 class="h-small">Phone</h2><p><a href="tel:${esc(loc.phone.replace(/[^\d+]/g, ''))}">${esc(loc.phone)}</a></p></div>` : ''}
      ${loc.parking ? `<div><h2 class="h-small">Parking</h2><p>${esc(loc.parking)}</p></div>` : ''}
      ${loc.menuNote ? `<div><h2 class="h-small">Menu</h2><p>${esc(loc.menuNote)}</p></div>` : ''}
      ${locationActions(loc)}
    </div>
    <div class="location-gallery">
      ${(loc.photos?.length ? loc.photos : [''])
        .map((ph) => photo(`${loc.city} restaurant`, ph, 'location-photo-lg'))
        .join('')}
    </div>
  </div>
</section>`;
  write(p, layout({ title: `${loc.city}, ${loc.region}`, description: `NEFRA in ${loc.city}, ${loc.regionName || loc.region}: ${locStatusLabel(loc).toLowerCase()}. Address, hours, directions and ordering.`, path: p, body, ld: restaurantLD(loc) }));
  built.push(p);
}

// robots + sitemap
if (site.siteUrl) {
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${built.map((p) => `  <url><loc>${esc(site.siteUrl + href(p))}</loc></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.siteUrl}${href('sitemap.xml')}\n`);
} else {
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n`);
  console.warn('  ! siteUrl is empty in content/site.json: skipped sitemap.xml and canonical links');
}

console.log(`Built ${built.length} pages into dist/:\n  ${built.join('\n  ')}`);
