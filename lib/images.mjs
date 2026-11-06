// Responsive images. `npm run images` (scripts/optimize-images.mjs) writes WebP
// variants and src/assets/img/manifest.json; when an image is in the manifest it is
// rendered as <picture> with srcset plus width/height (no layout shift). Without the
// manifest, images still render as plain lazy-loaded <img> tags.

import fs from 'node:fs';
import path from 'node:path';
import { esc } from './format.mjs';

export function createPicture({ root, href }) {
  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/assets/img/manifest.json'), 'utf8'));
  } catch {}

  const placeholder = (label, cls) =>
    `<div class="photo photo-slot ${cls}" role="img" aria-label="${esc(label)}"><span>${esc(label)}</span></div>`;

  /**
   * picture({ src, alt, label, cls, sizes, priority })
   * src: "/assets/img/..." path, or '' to show a labeled placeholder.
   * priority: true for the first large image on a page (hero), to load it eagerly.
   */
  return function picture({ src, alt = '', label = '', cls = '', sizes = '100vw', priority = false }) {
    if (!src) return placeholder(label || alt, cls);
    const key = src.replace(/^\//, '');
    const m = manifest[key];
    const attrs = [
      `class="photo ${cls}"`,
      `alt="${esc(alt)}"`,
      priority ? 'fetchpriority="high"' : 'loading="lazy"',
      'decoding="async"',
      m ? `width="${m.width}" height="${m.height}"` : '',
    ].filter(Boolean).join(' ');
    if (m?.variants?.length) {
      const srcset = m.variants.map((v) => `${href(v.src)} ${v.width}w`).join(', ');
      return `<picture><source type="image/webp" srcset="${esc(srcset)}" sizes="${esc(sizes)}"><img src="${esc(href(src))}" ${attrs}></picture>`;
    }
    return `<img src="${esc(href(src))}" ${attrs}>`;
  };
}
