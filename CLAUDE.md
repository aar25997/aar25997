# NEFRA website: notes for Claude Code

Website for NEFRA ("Flavors of Civilization"), a premium fast-casual Mediterranean restaurant opening in Sterling, Virginia. Instagram: @nefrahouse.

Stack: Next.js 16 App Router + TypeScript + Tailwind CSS v4, static export (`output: 'export'`) to `out/`. Content lives in `content/` (JSON + Markdown) and is edited by staff through Decap CMS at `/admin/`.

## Commands
- `npm run dev`: dev server at http://localhost:3000
- `npm run build`: production build. **Must pass with no errors after every change.**
- `npm run typecheck`
- `npm run photos`: place photos from `photos/` (see docs/PHOTO_SHOT_LIST.md)
- `npm run images`: regenerate responsive WebP versions (sharp)

## Where things live
- Routes: `app/**/page.tsx`. Components: `components/`. Logic and data: `lib/`.
- Content: `content/*.json`, `content/stories/*.md`, `content/events/*.md`, typed in `lib/types.ts` and loaded in `lib/content.ts` (build time only, `server-only`). **Prefer content changes over code.** Never hard-code prices, items, hours, addresses or copy in components.
- **When you add or rename a content field, update `lib/types.ts` AND `public/admin/config.yml`.**
- Ordering: only `lib/ordering.ts` knows about providers. Every Order button uses `ordering.primary()`, `ordering.forItem()` or `ordering.urlFor()`.
- Structured data: `lib/schema.ts`. Page metadata: `pageMetadata()` in `lib/site.ts`.
- Images: use `<Photo>` (server) or `<Picture>` (client-safe). With no image they render a placeholder marked `data-placeholder="photo"`. Never fill a slot with stock or AI imagery presented as NEFRA's own.
- Future pages (events, catering, gift cards, rewards) are gated by `content/site.json` → `features` via `lib/features.ts`. Don't link them while off.
- Design tokens: the `@theme` block in `app/globals.css`. The Tailwind color palette is reset to NEFRA colors only (`bg-emerald`, `bg-burgundy`, `text-beige`, `border-gold`...). Shared classes: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-light`, `.btn-gold`, `.btn-outline-light`, `.eyebrow`, `.link-arrow`, `.rule-gold`, `.frame-gold`, `.pattern-pills`, `.pattern-pills-gold`, `.container-site`, `.prose-nefra`, `.field-input`. Use `.on-dark` on dark sections so focus rings and links switch to light.

## Brand rules (NEFRA Brand Guidelines 2026 + the website brief)
The brand guidelines are the authority: follow them strictly, no personal-preference adjustments.
- Palette: Emerald Green #0E5A4F (primary), Burgundy #3B0014, Beige #C8A76A, Gold #B08D57, Brown #6B4A32 (`walnut`), Charcoal Black #232323; supporting neutrals Ivory #F7F4EE, Sand #E9E1D6, Stone #D7C9B6, White. No other colors.
- **No gradients** (brand guidelines, Color Misuse). Use flat colors and flat photo overlays.
- **Gold text:** allowed on burgundy (5.7:1) and charcoal (5.1:1). On emerald use **beige**, and only for large headings (3.5:1). Gold is never text on ivory, sand or emerald.
- Type: Cinzel (`font-display`, main typeface, headings at weight 600) and Poppins (`font-sans`, secondary typeface) for everything else.
- **Logo:** only the official artwork in `public/brand/` (gold on dark, charcoal on gold/light). Never recreate it in live text, recolor, outline, rotate, stretch or add effects. Minimum 100px wide / 28px high; keep clear space around it.
- Brand pattern: the pill shapes from the logo's "O" (`.pattern-pills` tone-on-tone on emerald, `.pattern-pills-gold` outline on burgundy). Square image frames with a gold hairline (`.frame-gold`). Pill-shaped buttons.
- Feel: timeless, premium without pretension, earthy, modern, authentic, welcoming. Heritage through type, color and story, never pyramids, pharaohs or ornate "ancient" graphics. NEFRA is Mediterranean with Egyptian influence, not "an Egyptian restaurant".
- Never invent a logo, symbol or new brand color.
- Motion: subtle fades and rises only (`data-reveal`, `.rise`). No parallax, autoplaying audio or popups. Respect `prefers-reduced-motion`.

## Content rules: do not break these
- **No unverified claims.** Never write "organic", "grass-fed", "allergen-free", "seed-oil-free", "halal", "gluten-free", nutrition facts or health benefits unless the owner confirms them for that specific product.
- **No invented facts.** Never invent prices, addresses, phone numbers, hours, opening dates, founder details, ratings, reviews or testimonials. Leave fields empty; the UI shows "to be announced" states.
- Draft menu items (`approved: false`) show a Preview tag and never a price. Set `showDraftItems: false` at launch.
- Hours show only when `hoursConfirmed` is true. Structured data must match what's visible.
- Forms must never claim success unless the endpoint accepted the submission.

## Quality bar
- WCAG 2.2 AA: keyboard access, visible focus, labeled fields, alt text, reduced motion, 4.5:1 text contrast.
- Mobile first: check 390px wide. No horizontal scrolling.
- One `h1` per page, headings in order, unique title and description.
- Performance: server components by default; `'use client'` only for real interactivity. No heavy libraries without a clear reason.
