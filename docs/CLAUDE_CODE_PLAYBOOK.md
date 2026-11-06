# Finishing the NEFRA website with Claude Code

Copy-and-paste prompts for each step from here to launch and beyond. Claude Code reads `CLAUDE.md` in this project automatically, so it already knows the brand rules, the "no unverified claims" rule and how the site is built. You only need to say what to do.

## Setup (once)

1. Install Claude Code: see https://code.claude.com/docs (desktop app, terminal, or claude.ai/code in the browser).
2. Get the project: open it from the GitHub repository in claude.ai/code, or on your computer run
   ```bash
   git clone <your NEFRA repository URL>
   cd <folder>
   claude
   ```
3. Install Node.js 20.9 or newer if you run it on your own computer, then run `npm install`.

Run the prompts in order. After each one, ask Claude Code to show you the result (`npm run dev`, or "take screenshots of the homepage on phone and desktop").

---

## Step 1: Add the logo

> I've put the official NEFRA wordmark at `photos/logo.svg` (ivory version). Run `npm run photos` to install it, then check the header and footer on phone and desktop. Make sure it's sized well (about 32–40px tall in the header) and stays sharp. Also make a favicon from the logo's icon or the letter N in the official artwork, without inventing a new mark, and replace `public/favicon.svg`. Show me screenshots.

## Step 2: Add the photography

> I've added the photos to `photos/`, named according to `docs/PHOTO_SHOT_LIST.md`, and written alt text and Instagram links in `photos/photos.json`. Run `npm install` and then `npm run photos`. Tell me which files were placed and which were skipped. Then screenshot the homepage, menu, Our Story and the Sterling page at phone and desktop sizes. Check that the hero headline is readable over the photo and that no important part of an image is cropped off. If the hero text is hard to read, adjust the overlay gradient, not the photo.

## Step 3: Finalize the menu

> Here is our final menu: [paste the menu: categories, item names, descriptions, prices, and any allergens and dietary tags we have verified]. Update `content/menu.json` to match. Use only the allergens and dietary tags I listed. Don't add any others. Mark each final item `approved: true`, and set `showDraftItems` to false so draft samples disappear. Keep the allergen disclaimer, and update its last sentence now that the information is published. Set the category order to: [your order]. Rebuild and show me the menu page on a phone.

## Step 4: Personalize Our Story

> Here are details about me and why I started NEFRA: [your name, background in restaurants, what you studied in health and nutrition, the moment you decided to start NEFRA, what you want guests to feel]. Rewrite `content/stories/our-story.md` in my voice using these details. Keep it genuine and personal, not like a corporate health-food company. Don't add facts I didn't give you. Keep the heading "A Vision Rooted in Something Greater", and update the founder photo alt text with my name. Show me the text before you save it.

## Step 5: Confirm Our Standards

> These are our confirmed sourcing and preparation standards: [e.g. which cooking oils we use, where our beef and chicken come from and what's verified (grass-fed, halal, etc.), what's made in house]. Update `content/standards.json` so it states exactly these facts, and set each item's status to "verified" only where it is. Remove or soften anything we can't verify yet, and don't add claims I haven't confirmed. Keep the "Quality Is Not a Trend. It's Our Foundation." heading.

## Step 6: Location details

> Our Sterling restaurant details: address [street, ZIP], phone [number], parking [description], Google Maps coordinates [lat, lng], Google Place ID [if known]. Update `content/locations.json`. Keep status "coming-soon" and leave `hoursConfirmed` off for now. Check that Get Directions opens the right place in Google Maps.

## Step 7: Connect email signup and contact form

> We use [Mailchimp / Klaviyo / Formspree / other] for email. Here is the form endpoint URL: [URL] (for the contact form: [URL]). Put them in `content/site.json`, then check that the signup form's field names match what [provider] expects (e.g. Mailchimp needs `EMAIL`). Update the form code if needed. Tell me exactly how to test that a signup arrives.

## Step 8: Domain, analytics and Search Console

> Our domain will be [https://www.example.com]. Set `siteUrl` in `content/site.json` and update `site_url`, `display_url` and the backend repo in `public/admin/config.yml` (our repo is [owner/name]). Add our GA4 Measurement ID [G-XXXX] and Search Console verification code [code]. Rebuild, confirm sitemap.xml and canonical links appear, and validate the JSON-LD on the homepage and Sterling page against Google's Restaurant structured data guidelines. Update the privacy policy's analytics section to match.

## Step 9: Go live

> Help me deploy this site to [Netlify / Cloudflare Pages] under NEFRA's own account. Walk me through each click: connecting the GitHub repo, build command `npm run build` (or `npm run images && npm run build` if photos are optimized at build time), output directory `out`, adding our domain and HTTPS. Then set up the CMS login so I can edit content at /admin/ (Netlify Identity + Git Gateway on Netlify, or GitHub OAuth otherwise). Follow docs/HANDOFF.md.

## Step 10: Pre-launch check

> Run a full pre-launch check: run `npm run typecheck` and `npm run build`, scan every page with axe-core for WCAG 2.2 AA problems, check for horizontal scrolling at 390px, run Lighthouse on the homepage and menu with mobile throttling, find broken links, and confirm every page has a unique title, description and one h1. Fix what you can, list anything that needs my input, and show me the scores.

---

## Opening day

> We're open! Our ordering provider is [Toast / Clover / SpotOn], and our Sterling online ordering link is [URL]. Our confirmed hours are [days and times]. Update `content/ordering.json` and `content/locations.json`: set the provider, add the ordering link, set the Sterling location to "open", enter the hours and turn on `hoursConfirmed`. Rebuild and show me, on a phone, the Order buttons, the bottom Menu / Order / Directions bar, and the location page. Check that Order Online opens our ordering page in one tap. Then remind me to update Google Business Profile with the same hours and to set its order link to our /order/ page.

## Later: expansion prompts

**Catering**
> We now offer catering. Details: [packages, minimums, lead time, service area, ordering link]. Turn on `features.catering` in `content/site.json`, write the catering page in `app/catering/page.tsx` from these details (no invented prices), and add the catering ordering link to `content/ordering.json`.

**Gift cards / family meals**
> Add our gift card link [URL] and family meals link [URL] to `content/ordering.json`, and check where they appear on the site.

**Events**
> Add an event: [title, date, time, description, photo]. Turn on `features.events` in `content/site.json`, create the event in `content/events/` as published, and check that it appears on the homepage and the News & Events page with correct Event structured data.

**A new location**
> We're opening a second location in [city]. Details: [address, phone, status, coordinates]. Add it to `content/locations.json` with its own SEO title and description targeting [city] searches for Mediterranean food, shawarma and falafel. Check that its page, the Locations page, the /order/ chooser and the structured data all work with two locations.

**Menu sync with the POS**
> We chose [provider]. Research whether its API lets us read our menu (items, prices, availability) and what access we need. If it's possible, write a script that pulls the menu into `content/menu.json` while keeping our descriptions and photos, and a scheduled GitHub Action that runs it nightly. Explain the costs and setup before building anything.

## Tips

- If Claude Code proposes adding a claim like "organic" or "grass-fed", only accept it if it's verified. `CLAUDE.md` tells it to ask.
- Ask for screenshots after visual changes, on phone and desktop.
- Small content changes (a price, an item, hours) don't need Claude Code at all. Use the CMS at `/admin/`.
