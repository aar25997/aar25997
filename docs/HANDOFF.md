# NEFRA website: handoff and operations

## Architecture, and why

**Next.js (App Router) + TypeScript + Tailwind CSS**, built as a **static export**: every page is pre-rendered to plain HTML at build time and served from a CDN. Content lives in `content/` (JSON and Markdown) and is edited through **Decap CMS**, a free, open-source admin at `/admin/` that commits changes to the Git repository. The host rebuilds the site automatically after each save, in about a minute.

| Priority | How this setup meets it |
| --- | --- |
| Ease of editing | Form-based CMS screens for the homepage, menu, locations, standards, stories, events, ordering links and settings. No code changes for prices, items, hours or new locations. |
| Reliability | Static files on a CDN: no server, database or plugins to patch or hack. |
| Speed | Pre-rendered HTML, self-hosted fonts, responsive WebP images, very little JavaScript (only the mobile menu, menu filter, forms and small enhancements). |
| SEO | Server-rendered HTML for every page, unique metadata, canonical URLs, sitemap, robots and Restaurant JSON-LD per location. |
| Growth | Typed content models and reusable React components. New locations get their own page and structured data from data alone, and future pages (catering, events, gift cards, rewards) are already built behind switches. |
| Ownership | Everything is files in a Git repository NEFRA owns. Hosting is free to low-cost and portable. |

Why Next.js rather than Webflow or WordPress: the master brief asks for Next.js, TypeScript and Tailwind, and it gives a component system that can grow with the brand. It can later move to server rendering (for example, a server-side email API or live POS menu sync) without a rewrite. The cost of that choice is that **layout changes need a developer**. Day-to-day content (menu, prices, hours, photos, stories, events, ordering links) doesn't, because it goes through the CMS.

## Content model (editable collections)

| Collection | File | Fields |
| --- | --- | --- |
| Homepage | `content/home.json` | Every section's label, headline, copy and photo, including the hero image or video |
| Locations | `content/locations.json` | Name, address, coordinates, Google Place ID, hours (with a "confirmed" switch), phone, status, ordering URL, parking, menu note, photos, SEO title and description |
| Menu categories | `content/menu.json` → `categories` | ID, name, description, display order |
| Menu items | `content/menu.json` → `items` | Name, description, price, photo and alt text, category, allergens, dietary tags, customization note, availability, locations, item ordering link, approved (draft vs final) |
| Standards | `content/standards.json` | Each standard's title, text and status (commitment, being finalized, verified) |
| Brand stories | `content/stories/*.md` | Title, heading, intro, header photo, sections (photo left/right, text, pull quote), SEO title and description, published |
| Events and updates | `content/events/*.md` | Title, type, date and end date, summary, image, location, status (draft or published), details |
| Site settings | `content/site.json` | Brand, social links, logo, navigation, footer links, contact details, announcement bar, form endpoints, future-page switches, analytics |
| Ordering | `content/ordering.json` | Provider, mode, default URL, tracking, catering, gift card, family meal and rewards links |
| Instagram highlights | `content/social.json` | Curated posts (image, alt text, link) |

## Content editing setup (one time)

1. Create a GitHub organization or account **owned by NEFRA** and move this repository into it.
2. Connect the repository to a host. Netlify, Cloudflare Pages and Vercel all work: build command `npm run build`, output directory `out`.
3. Turn on CMS login:
   - **Netlify (simplest):** enable Identity and Git Gateway, then change `backend.name` to `git-gateway` in `public/admin/config.yml`.
   - **Other hosts:** keep `backend.name: github` and set up a GitHub OAuth app for Decap.
4. Set `backend.repo`, `site_url` and `display_url` in `public/admin/config.yml`.
5. Invite editors. They log in at `https://YOUR-DOMAIN/admin/`.

To edit locally without logging in, run `npm run cms` in one terminal and `npm run dev` in another, then open `http://localhost:3000/admin/index.html`.

## Photos

Upload high-quality originals (JPG or PNG, about 2,400px wide) through the CMS, and always fill in the alt text. Then a developer runs `npm run images` (or sets the host's build command to `npm run images && npm run build`). This creates 480 to 2,400px WebP versions and records sizes, so phones download small files and pages don't jump while loading.

## SEO and analytics checklist

- [ ] Set **Site URL** in settings. This turns on canonical links, `sitemap.xml` and absolute URLs in structured data.
- [ ] Google Search Console: add the property, paste the verification code into settings, and submit `https://YOUR-DOMAIN/sitemap.xml`.
- [ ] Google Analytics 4: create a property and paste the Measurement ID (G-…) into settings. Mark `order_click`, `order_item_click`, `directions_click` and `sign_up` as key events for conversion tracking. Ordering links also carry UTM tags, so the provider's reports can attribute website orders.
- [ ] Google Business Profile: use exactly the same name, address, phone and hours as the location entry. Set its website to the location page and its order link to `/order/`.
- [ ] Validate structured data with the Rich Results Test (`https://search.google.com/test/rich-results`) on the homepage and each location page.
- [ ] Each page has a unique title and description. Location pages have their own SEO fields, which become the landing pages for future locations.

**Structured data:** Restaurant JSON-LD (name, description, slogan, cuisines, URL, menu, address, and coordinates, phone, hours and photos when confirmed) on each location page and on the homepage while there's one location. Also WebSite and BreadcrumbList on all pages, and Event for published events. Hours are only included when "Hours confirmed" is on, so search engines never receive proposed hours.

## Accessibility (target: WCAG 2.2 AA)

- **Color contrast** was checked for every text and background pair in use. Antique Gold is never used for text on light or emerald backgrounds (it measures 2.6–2.8:1), only for decoration or on charcoal (5.1:1).
- **Keyboard:** skip link, visible 3px focus outlines in a color that contrasts with each background, Escape closes the mobile menu, and the sticky header and bottom bar don't cover focused content.
- **Reduced motion:** fade-ins, smooth scrolling and hero video autoplay turn off. A hero video always has a pause button.
- **Forms:** labeled fields, errors announced to screen readers, and focus moves to the first invalid field.
- **Images:** every photo field has alt text, and decorative elements are hidden from screen readers.
- **Automated check:** axe-core reports no WCAG 2.2 AA violations across all pages in both the pre-opening and open states, at phone and desktop sizes. Before launch, also test manually with VoiceOver (iPhone) and TalkBack (Android).

## Testing before launch

| Device | Browsers |
| --- | --- |
| iPhone (current and one older model) | Safari |
| Android phone | Chrome |
| iPad / tablet | Safari, Chrome |
| Desktop | Chrome, Safari, Firefox, Edge |

Check: navigation and mobile menu, every Order button (one tap to the provider), Get Directions opens Google Maps, newsletter and contact form submissions arrive, menu category tabs, the 404 page, and a Lighthouse run on a throttled 4G profile (target 90+ for Performance, Accessibility, Best Practices and SEO).

## Ownership and accounts

The domain, website files, content and every account below should be owned by the NEFRA business entity, with developers invited as users, never the other way around.

| Account | Owner | Notes |
| --- | --- | --- |
| Domain registrar | NEFRA | Auto-renew on, registrar lock on |
| GitHub (code + content) | NEFRA organization | Developers invited as members |
| Hosting (Netlify / Cloudflare / Vercel) | NEFRA | Team account with NEFRA as owner |
| Google Analytics, Search Console, Business Profile | NEFRA Google account | Developers get user access |
| Email marketing (Mailchimp, Klaviyo…) | NEFRA | Provides the newsletter endpoint |
| Ordering / POS | NEFRA | Provides ordering URLs |
| Instagram @nefrahouse | NEFRA | |

## Cost categories (for quotes)

- **One-time:** design and development, photography and video, copywriting, logo SVG preparation, ordering integration setup.
- **Recurring:** domain (yearly), hosting (often free at this traffic), email marketing (by list size), form service if not using the email provider, ordering and POS fees, optional maintenance retainer.

## Launch phases

| Phase | Turn on |
| --- | --- |
| **1. Pre-opening (now)** | Homepage, story, standards, menu preview, coming-soon location, email signup, contact, Instagram. Ordering buttons show "Get Opening Updates". |
| **2. Opening** | Final menu and prices, address, phone, confirmed hours, parking, coordinates, ordering link + location status Open (enables Order buttons and the mobile bottom bar), verified sourcing details, analytics key events. |
| **3. Expansion** | Catering page (`cateringEnabled`), catering, gift card and family meal links, events, more locations (each gets its own page and structured data), more brand stories, loyalty. |
