# NEFRA website

*Flavors of Civilization.* Website for NEFRA, a premium fast-casual Mediterranean restaurant opening in Sterling, Virginia.

A fast static site with an editable CMS. It's built as a multi-location restaurant brand site, not a single landing page.

## Quick start

```bash
npm run build      # node build.mjs -> dist/   (no dependencies needed)
npm run preview    # build and serve at http://localhost:8080
npm install && npm run images   # optional: responsive WebP versions of photos
npm run cms        # local CMS backend; then open http://localhost:8080/admin/
```

Node 18+. Deploy `dist/` to Netlify, Cloudflare Pages or Vercel (build command `node build.mjs`, output `dist`).

## Docs

- **[docs/HANDOFF.md](docs/HANDOFF.md):** architecture, content model, CMS setup, SEO and analytics, accessibility, testing, ownership, launch phases
- **[docs/ORDERING.md](docs/ORDERING.md):** ordering integration plan and the embed vs. link recommendation

## Project layout

```
content/            editable content (what the CMS edits)
  site.json           settings: contact, social, navigation, footer, analytics, hero
  ordering.json       ordering provider settings
  menu.json           categories, items, homepage featured cards
  locations.json      restaurants (each gets /locations/<slug>/)
  social.json         curated Instagram posts
  stories/*.md        brand stories (Our Story, future editorial)
  events/*.md         events and updates
src/pages/          page templates (front matter + {{components}})
src/assets/         CSS, JS, images
src/admin/          Decap CMS (served at /admin/)
lib/                build modules: ordering layer, schema.org, images, markdown
scripts/            image optimizer
build.mjs           the site generator
```

## Pages

`/`, `/menu/`, `/our-story/`, `/our-standards/`, `/locations/`, `/locations/<slug>/`, `/contact/`, `/privacy-policy/`, `/order/` (permanent ordering link), `/events/` (once something is published), `/catering/` (when enabled), `/404.html`.

## How the site changes at opening

While no location is open, every Order button reads **Get Opening Updates** and points to the email signup, and a "Coming soon to Sterling" bar shows. When a location's status is set to **Open** and it has an ordering link:
- Order Online appears in the header and on the homepage, the menu (per item) and the location page.
- A Menu / Order / Directions bar appears at the bottom of the screen on phones.
- Hours appear once **Hours confirmed** is on.

## Before launch checklist

- [ ] Official NEFRA wordmark SVG → **Site settings → Logo** (the header uses a temporary Cinzel text stand-in). Replace `src/assets/img/favicon.svg` too.
- [ ] Professional photography for every labeled placeholder (hero, featured dishes, philosophy and story images, location, Instagram highlights), with alt text.
- [ ] Final menu: items, prices, allergens and dietary tags (only verified ones).
- [ ] Founder review of Our Story (`content/stories/our-story.md` is a draft written from the brief).
- [ ] Verify every Our Standards commitment against real suppliers and recipes before publishing product-level claims.
- [ ] Newsletter and contact form endpoints, email address, phone.
- [ ] Sterling address, coordinates, Google Place ID, parking, then hours and status at opening.
- [ ] Site URL, Search Console, GA4, Google Business Profile (see HANDOFF.md).
- [ ] CMS backend repo setting in `src/admin/config.yml`, and privacy policy review.

## Design tokens

Defined at the top of `src/assets/css/site.css`, using the names from the brand brief (`--nefra-emerald`, `--nefra-walnut`, `--nefra-charcoal`, `--nefra-gold`, `--nefra-stone`, `--nefra-ivory`, `--nefra-sand`, `--nefra-white`), plus the typography scale, focus colors, spacing and radius. Type is Cinzel for headings and Inter for body text. Antique Gold is for accents only: it doesn't meet contrast requirements as text on light or emerald backgrounds.
