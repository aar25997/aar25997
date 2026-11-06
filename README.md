# NEFRA website

*Flavors of Civilization.* Website for NEFRA, a premium fast-casual Mediterranean restaurant opening in Sterling, Virginia.

A fast static site with no framework and no dependencies. Content lives in JSON files, so menu items, prices, hours and locations can change without touching code.

## Quick start

```bash
npm run build      # or: node build.mjs   -> outputs the site to dist/
npm run preview    # build + serve at http://localhost:8080
```

Requires Node 18+. Deploy `dist/` to any static host. On Netlify, Vercel or Cloudflare Pages set the build command to `node build.mjs` and the output directory to `dist`.

## Pages

| URL | Source |
| --- | --- |
| `/` | `src/pages/index.html` |
| `/menu/` | `src/pages/menu.html` + `content/menu.json` |
| `/our-story/` | `src/pages/our-story.html` |
| `/our-standards/` | `src/pages/our-standards.html` |
| `/locations/` | `src/pages/locations.html` + `content/locations.json` |
| `/locations/<slug>/` | generated for every entry in `content/locations.json` |
| `/catering/` | `src/pages/catering.html`, only built when `cateringAvailable` is `true` |
| `/contact/` | `src/pages/contact.html` |
| `/privacy-policy/` | `src/pages/privacy-policy.html` |
| `/404.html` | `src/pages/404.html` |

## Editing content

**`content/site.json`**: global settings.
- `status`: `"coming-soon"` or `"open"`. While coming soon, every Order button becomes *Get Opening Updates* and points to the email signup, and a "Coming soon to Sterling" bar shows at the top. Set `"open"` **and** fill `orderUrl` to turn ordering on everywhere.
- `siteUrl`: the live domain. It enables canonical links and `sitemap.xml`.
- `logo`: path to the official wordmark SVG (drop it in `src/assets/img/`).
- `email`, `phone`, `instagram`: contact details shown on the site.
- `newsletterEndpoint`, `contactEndpoint`: form service URLs (Mailchimp, Klaviyo, Formspree, etc.). Until set, the forms tell visitors they aren't live yet.
- `hero.image` / `hero.video`: homepage hero media.

**`content/menu.json`**: featured items for the homepage, plus every category and item. Prices are numbers or `null`. Add `dietary` tags and `allergens` only once they are verified.

**`content/locations.json`**: one entry per restaurant, with its own address, hours, phone, parking, maps link, order link, photos and status. Hours stay hidden until a location's status is `"open"`.

The menu and locations are plain JSON, so they can later be connected to a headless CMS (e.g. Decap, Sanity) or exported from the POS/ordering provider without changing the templates.

## Before launch checklist

- [ ] Add the official NEFRA wordmark SVG and set `logo`. The header currently uses a temporary Cinzel text stand-in, not the approved logo.
- [ ] Replace the favicon (`src/assets/img/favicon.svg`) with a mark from the official logo.
- [ ] Add professional photography. Every brown/emerald "photo slot" is a placeholder labeled with the shot it needs (hero, featured dishes, ingredient close-ups, craft, interior, Instagram).
- [ ] Finalize menu items, prices, allergens and dietary tags in `content/menu.json`.
- [ ] Have the founder review and personalize the Our Story copy (it is a draft written from the brand brief).
- [ ] Confirm every claim on Our Standards against real suppliers and recipes. Don't add product-level claims (organic, grass-fed, seed-oil-free, allergen-free) until they are verified.
- [ ] Connect the newsletter and contact form endpoints.
- [ ] Add the Sterling address, phone, parking and maps link once confirmed.
- [ ] Set `siteUrl` and have the privacy policy reviewed.
- [ ] At opening: set `status: "open"`, `orderUrl`, the location's `status`, and its hours.

## Design system

| Token | Hex | Use |
| --- | --- | --- |
| Deep Emerald | `#0E5A4F` | Primary: navigation, buttons, feature sections |
| Walnut | `#6B4A32` | Secondary: labels, warmth, storytelling |
| Matte Charcoal | `#232323` | Text, footer |
| Antique Gold | `#B08D57` | Accents only: rules, borders, numerals. Not body text on light backgrounds (low contrast) |
| Warm Stone | `#D7C9B6` | Dividers, light text on dark backgrounds |
| Warm Ivory | `#F7F4EE` | Main background |
| Light Sand | `#E9E1D6` | Alternate section background |

Type: **Cinzel** for headings, **DM Sans** for body text, both from Google Fonts.
