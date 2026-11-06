// Generates responsive WebP versions of every photo in public/images and writes
// public/images/manifest.json, which the site uses for srcset + width/height.
//   npm install        (installs sharp, a dev dependency)
//   npm run images     (run after adding or replacing photos)
// Originals are kept; upload high-quality JPG/PNG files (about 2400px wide is plenty).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('sharp is not installed. Run `npm install` first.');
  process.exit(1);
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const IMG = path.join(PUBLIC, 'images');
fs.mkdirSync(IMG, { recursive: true });
const WIDTHS = [480, 960, 1600, 2400];
const GENERATED = /-\d+w\.webp$/;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);

const manifest = {};
for (const file of walk(IMG)) {
  if (!/\.(jpe?g|png|webp)$/i.test(file) || GENERATED.test(file)) continue;
  const rel = path.relative(PUBLIC, file).split(path.sep).join('/');
  const meta = await sharp(file).metadata();
  const variants = [];
  for (const w of WIDTHS.filter((w) => w < meta.width).concat(meta.width <= 2400 ? [meta.width] : [])) {
    const out = file.replace(/\.[^.]+$/, `-${w}w.webp`);
    if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(file).mtimeMs)
      await sharp(file).rotate().resize({ width: w }).webp({ quality: 78 }).toFile(out);
    variants.push({ src: '/' + path.relative(PUBLIC, out).split(path.sep).join('/'), width: w });
  }
  manifest[rel] = { width: meta.width, height: meta.height, variants };
  console.log(`  ${rel}: ${variants.map((v) => v.width).join(', ')}`);
}

fs.writeFileSync(path.join(IMG, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote manifest for ${Object.keys(manifest).length} images.`);
