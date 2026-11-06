// Responsive image data. `npm run images` writes WebP variants and
// public/images/manifest.json; images in the manifest render with srcset and
// width/height (no layout shift). Others render as plain lazy-loaded <img>.
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

export type PictureData = { src: string; width?: number; height?: number; srcSet?: string };

type Manifest = Record<string, { width: number; height: number; variants: { src: string; width: number }[] }>;
let manifest: Manifest | null = null;

export function pictureData(src: string): PictureData | null {
  if (!src) return null;
  if (!manifest) {
    try {
      manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/images/manifest.json'), 'utf8')) as Manifest;
    } catch {
      manifest = {};
    }
  }
  const m = manifest[src.replace(/^\//, '')];
  if (!m) return { src };
  return { src, width: m.width, height: m.height, srcSet: m.variants.length ? m.variants.map((v) => `${v.src} ${v.width}w`).join(', ') : undefined };
}
