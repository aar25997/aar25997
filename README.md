# Nefra website

A one-page static site: plain HTML, CSS and JavaScript, no build step.

## Files
- `index.html` — page content and structure
- `styles.css` — styling (light and dark mode, mobile-friendly)
- `script.js` — mobile menu, scroll animations, contact form
- `assets/logo.svg` — placeholder logo and favicon

## Before publishing
All text in `[square brackets]` is placeholder copy. Replace it with real details about Nefra:
1. Hero tagline, headline and intro (`index.html`)
2. About, services and process sections
3. Contact email and location in `index.html`, plus `CONTACT_EMAIL` in `script.js`
4. Swap `assets/logo.svg` for the real logo and adjust `--accent` in `styles.css` to the brand color

## Preview locally
Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Hosting
Works as-is on GitHub Pages (Settings → Pages → deploy from this branch), Netlify or Vercel.
