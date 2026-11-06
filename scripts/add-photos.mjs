// Places finished photos on the site.
//
//   1. Put photos in the photos/ folder, named as in docs/PHOTO_SHOT_LIST.md
//      (e.g. hero.jpg, featured-beef-shawarma.jpg, location-sterling-1.jpg).
//   2. Optional: photos/photos.json with alt text and links, e.g.
//        { "instagram-1.jpg": { "alt": "Falafel fresh from the fryer", "url": "https://www.instagram.com/p/..." } }
//   3. npm run photos
//
// The script copies each photo to src/assets/img/photos/, fills in the matching
// content/*.json fields (using the default alt text from the shot list unless you
// give your own), creates responsive versions if sharp is installed, and rebuilds.
// Unrecognized file names are listed and skipped. Run it again any time.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { slugify } from '../lib/format.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'photos');
const OUT_DIR = 'src/assets/img/photos';
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const save = (p, d) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(d, null, 2) + '\n');

if (!fs.existsSync(IN)) {
  fs.mkdirSync(IN);
  console.log('Created photos/. Add photos named as in docs/PHOTO_SHOT_LIST.md, then run this again.');
  process.exit(0);
}

const site = read('content/site.json');
const menu = read('content/menu.json');
const locs = read('content/locations.json');
const social = read('content/social.json');
let extra = {};
try { extra = JSON.parse(fs.readFileSync(path.join(IN, 'photos.json'), 'utf8')); } catch {}

const IMG = /\.(jpe?g|png|webp)$/i;
const files = fs.readdirSync(IN).filter((f) => IMG.test(f) || /\.(mp4|svg)$/i.test(f)).sort();
const done = [], skipped = [];

function place(file) {
  fs.mkdirSync(path.join(ROOT, OUT_DIR), { recursive: true });
  const name = slugify(file.replace(/\.[^.]+$/, '')) + path.extname(file).toLowerCase().replace('.jpeg', '.jpg');
  fs.copyFileSync(path.join(IN, file), path.join(ROOT, OUT_DIR, name));
  return '/' + path.posix.join(OUT_DIR.replace(/^src\//, ''), name);
}
const alt = (file, fallback) => extra[file]?.alt || fallback;

for (const file of files) {
  const base = file.replace(/\.[^.]+$/, '').toLowerCase();
  let m;

  if (base === 'logo' && /\.svg$/i.test(file)) {
    site.logo = place(file);
  } else if (base === 'hero' && IMG.test(file)) {
    site.hero.image = place(file);
    site.hero.imageAlt = alt(file, 'Shawarma roasting on the vertical spit at NEFRA');
  } else if (base === 'hero' && /\.mp4$/i.test(file)) {
    site.hero.video = place(file);
  } else if (base === 'hero-poster' && IMG.test(file)) {
    site.hero.poster = place(file);
  } else if (base === 'philosophy' && IMG.test(file)) {
    site.images.philosophy = { src: place(file), alt: alt(file, 'Fresh herbs, vegetables and tahini on the NEFRA prep counter') };
  } else if (base === 'story-home' && IMG.test(file)) {
    site.images.story = { src: place(file), alt: alt(file, 'Hands preparing food in the NEFRA kitchen') };
  } else if ((m = base.match(/^featured-(.+)$/)) && IMG.test(file)) {
    const card = menu.featured.find((f) => slugify(f.title) === m[1]);
    if (!card) { skipped.push(`${file} (no featured card called "${m[1]}")`); continue; }
    card.image = place(file);
    card.alt = alt(file, card.alt || card.title);
  } else if ((m = base.match(/^item-(.+)$/)) && IMG.test(file)) {
    const item = menu.items.find((i) => slugify(i.name) === m[1]);
    if (!item) { skipped.push(`${file} (no menu item called "${m[1]}")`); continue; }
    item.image = place(file);
    item.alt = alt(file, item.name);
  } else if ((m = base.match(/^location-([a-z0-9-]+?)-(\d+)$/)) && IMG.test(file)) {
    const loc = locs.locations.find((l) => l.slug === m[1]);
    if (!loc) { skipped.push(`${file} (no location "${m[1]}")`); continue; }
    const i = Number(m[2]) - 1;
    loc.photos = loc.photos || [];
    loc.photos[i] = { src: place(file), alt: alt(file, i === 0 ? `Inside NEFRA ${loc.address.city}` : `NEFRA ${loc.address.city}`) };
    loc.photos = loc.photos.filter(Boolean);
  } else if ((m = base.match(/^instagram-(\d+)$/)) && IMG.test(file)) {
    const i = Number(m[1]) - 1;
    social.posts[i] = { image: place(file), alt: alt(file, 'NEFRA on Instagram'), url: extra[file]?.url || social.posts[i]?.url || '' };
    social.posts = social.posts.filter(Boolean);
  } else if (base === 'founder' && IMG.test(file)) {
    const storyPath = path.join(ROOT, 'content/stories/our-story.md');
    let story = fs.readFileSync(storyPath, 'utf8');
    const src = place(file);
    const a = alt(file, 'The founder of NEFRA in the kitchen');
    story = story.replace(/!\[[^\]]*\]\((placeholder|\/assets\/img\/photos\/founder\.[a-z]+)\)/, `![${a}](${src})`);
    fs.writeFileSync(storyPath, story);
  } else {
    skipped.push(`${file} (name not in the shot list)`);
    continue;
  }
  done.push(file);
}

save('content/site.json', site);
save('content/menu.json', menu);
save('content/locations.json', locs);
save('content/social.json', social);

console.log(`Placed ${done.length} file(s): ${done.join(', ') || 'none'}`);
if (skipped.length) console.log(`Skipped:\n  ${skipped.join('\n  ')}`);
const missingUrls = social.posts.filter((p) => !p.url).length;
if (missingUrls) console.log(`Note: ${missingUrls} Instagram photo(s) have no post link yet; they link to the profile. Add "url" in photos/photos.json.`);

try {
  await import('sharp');
  execSync('node scripts/optimize-images.mjs', { cwd: ROOT, stdio: 'inherit' });
} catch {
  console.log('Tip: run `npm install` once so photos also get fast, phone-sized versions.');
}
execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
