# NEFRA website

*Flavors of Civilization.* The website for NEFRA, a premium fast-casual Mediterranean restaurant opening in Sterling, Virginia.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, exported as a static site, with content in editable files managed through a CMS at `/admin/`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000, with live reload
npm run build      # production build -> out/ (static HTML, CSS, JS)
npm run typecheck  # TypeScript check
npm run photos     # place photos from photos/ (named per docs/PHOTO_SHOT_LIST.md)
npm run images     # regenerate responsive WebP versions of photos
npm run cms        # local CMS backend; then open http://localhost:3000/admin/index.html
```

Requires Node.js 20.9+.

## Deploy

Any static host works. On Netlify, Cloudflare Pages or Vercel:
- **Build command:** `npm run build`
- **Output directory:** `out`

Every page is pre-rendered to HTML at build time, so it's fast and fully readable by search engines. Content edits made in the CMS commit to the repository, and the host rebuilds automatically.

Full setup, ownership and launch steps are in **[docs/HANDOFF.md](docs/HANDOFF.md)**.

## Project structure

```
app/                    routes (one folder per URL)
  page.tsx                homepage
  menu/ our-story/ our-standards/ locations/ locations/[slug]/
  contact/ privacy-policy/ order/
  events/ catering/ gift-cards/ rewards/    future pages, off until enabled
  sitemap.ts robots.ts not-found.tsx layout.tsx globals.css
components/             reusable UI (Header, Footer, MenuBrowser, forms, Picture...)
lib/                    data + logic
  types.ts                typed content models
  content.ts              loads content/ at build time
  ordering.ts             ordering integration layer (provider-agnostic)
  schema.ts               Schema.org JSON-LD
  site.ts                 shared helpers + page metadata
content/                editable content: what the CMS edits
  site.json home.json menu.json locations.json standards.json ordering.json social.json
  stories/*.md events/*.md
public/                 static files: images/, admin/ (CMS), favicon
scripts/                photo installer + image optimizer
docs/                   handoff, ordering plan, photo shot list, Claude Code playbook
```

## What changes at opening

While no location is open, ordering buttons read **Get Opening Updates** and point to the email signup, and an announcement bar shows. When a location is set to **Open** with an ordering link:
- **Order Online** appears in the navigation, hero, menu (per approved item) and location page.
- A **Menu / Order / Directions** bar appears at the bottom of the screen on phones.
- Hours appear once **Hours confirmed** is on.

## Docs

- **[docs/HANDOFF.md](docs/HANDOFF.md):** architecture, content model, CMS setup, SEO and analytics, accessibility, testing, ownership, launch phases
- **[docs/ORDERING.md](docs/ORDERING.md):** ordering integration plan and the embed vs. link recommendation
- **[docs/PHOTO_SHOT_LIST.md](docs/PHOTO_SHOT_LIST.md):** every photo the site needs, with framing, specs and file names
- **[docs/CLAUDE_CODE_PLAYBOOK.md](docs/CLAUDE_CODE_PLAYBOOK.md):** copy-and-paste Claude Code prompts from photos to launch day
- **[CLAUDE.md](CLAUDE.md):** project rules Claude Code follows automatically

## Before launch checklist

- [x] Official NEFRA logo: extracted as vector art from the brand guidelines into `public/brand/` (gold + charcoal) and in use. The favicon uses the logo's "N". Ask the designer for master SVG/AI files to confirm it matches exactly.
- [ ] Professional photography for every placeholder. Search the built HTML for `data-placeholder="photo"`.
- [ ] Final menu: approve items, add prices, verified allergens and dietary tags, then set `showDraftItems` to false.
- [ ] Founder review of Our Story (`content/stories/our-story.md` is a draft).
- [ ] Verify each Our Standards item against real suppliers and recipes.
- [ ] Newsletter and contact form endpoints, email, phone.
- [ ] Sterling address, coordinates, parking; hours and status at opening.
- [ ] Domain (`siteUrl`), Search Console, GA4, Google Business Profile.
- [ ] CMS backend repo in `public/admin/config.yml`; privacy policy review.
