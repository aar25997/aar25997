// Places finished photos on the site.
//
//   1. Put photos in the photos/ folder, named as in docs/PHOTO_SHOT_LIST.md
//      (e.g. hero.jpg, featured-beef-shawarma.jpg, location-sterling-1.jpg).
//   2. Optional: photos/photos.json with alt text and links, e.g.
//        { "instagram-1.jpg": { "alt": "Falafel fresh from the fryer", "url": "https://www.instagram.com/p/..." } }
//   3. npm run photos
//
// Each photo is copied to public/images/photos/ and connected to the matching
// content field (with the shot list's default alt text unless you give your own).
// Responsive versions are generated if sharp is installed. Unrecognized names are
// listed and skipped. Safe to run again.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'photos');
const OUT = path.join(ROOT, 'public/images/photos');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const save = (p, d) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(d, null, 2) + '\n');

if (!fs.existsSync(IN)) {
  fs.mkdirSync(IN);
  console.log('Created photos/. Add photos named as in docs/PHOTO_SHOT_LIST.md, then run this again.');
  process.exit(0);
}

const site = read('content/site.json');
const home = read('content/home.json');
const menu = read('content/menu.json');
const locs = read('content/locations.json');
const social = read('content/social.json');
const storyPath = path.join(ROOT, 'content/stories/our-story.md');
const storySrc = fs.readFileSync(storyPath, 'utf8');
const fm = storySrc.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
const story = JSON.parse(fm[1]);
const storyBody = storySrc.slice(fm[0].length);

let extra = {};
try { extra = JSON.parse(fs.readFileSync(path.join(IN, 'photos.json'), 'utf8')); } catch {}

const IMG = /\.(jpe?g|png|webp)$/i;
const files = fs.readdirSync(IN).filter((f) => IMG.test(f) || /\.(mp4|svg)$/i.test(f)).sort();
const done = [], skipped = [];

function place(file) {
  fs.mkdirSync(OUT, { recursive: true });
  const name = slugify(file.replace(/\.[^.]+$/, '')) + path.extname(file).toLowerCase().replace('.jpeg', '.jpg');
  fs.copyFileSync(path.join(IN, file), path.join(OUT, name));
  return `/images/photos/${name}`;
}
const alt = (file, fallback) => extra[file]?.alt || fallback;

// Homepage photos: file name -> home.json section + default alt text
const HOME = {
  intro: 'A table set with NEFRA dishes',
  philosophy: 'Fresh herbs, vegetables and tahini on the NEFRA prep counter',
  'story-home': 'Hands preparing food in the NEFRA kitchen',
  community: 'Guests sharing a meal at NEFRA',
};

for (const file of files) {
  const base = file.replace(/\.[^.]+$/, '').toLowerCase();
  let m;
  if (base === 'logo' && /\.svg$/i.test(file)) site.logo = place(file);
  else if (base === 'hero' && IMG.test(file)) { home.hero.image = place(file); home.hero.imageAlt = alt(file, 'Shawarma roasting on the vertical spit at NEFRA'); }
  else if (base === 'hero' && /\.mp4$/i.test(file)) home.hero.video = place(file);
  else if (base === 'hero-poster' && IMG.test(file)) home.hero.poster = place(file);
  else if (base in HOME && IMG.test(file)) {
    const key = base === 'story-home' ? 'story' : base;
    home[key].image = place(file);
    home[key].imageAlt = alt(file, HOME[base]);
  } else if (base === 'story-hero' && IMG.test(file)) { story.heroImage = place(file); story.heroAlt = alt(file, 'The NEFRA kitchen'); }
  else if (base === 'founder' && IMG.test(file)) {
    const s = story.sections.find((x) => /founder/i.test(x.alt || '')) ?? story.sections[1];
    s.image = place(file); s.alt = alt(file, s.alt || 'The founder of NEFRA in the kitchen');
  } else if ((m = base.match(/^story-(\d+)$/)) && IMG.test(file)) {
    const withImages = story.sections.filter((x) => x.layout === 'image-left' || x.layout === 'image-right');
    const s = withImages[Number(m[1]) - 1];
    if (!s) { skipped.push(`${file} (the story has only ${withImages.length} photo sections)`); continue; }
    s.image = place(file); s.alt = alt(file, s.alt || s.heading);
  } else if ((m = base.match(/^featured-(.+)$/)) && IMG.test(file)) {
    const card = menu.featured.find((f) => slugify(f.title) === m[1]);
    if (!card) { skipped.push(`${file} (no featured card called "${m[1]}")`); continue; }
    card.image = place(file); card.alt = alt(file, card.alt || card.title);
  } else if ((m = base.match(/^item-(.+)$/)) && IMG.test(file)) {
    const item = menu.items.find((i) => slugify(i.name) === m[1]);
    if (!item) { skipped.push(`${file} (no menu item called "${m[1]}")`); continue; }
    item.image = place(file); item.alt = alt(file, item.name);
  } else if ((m = base.match(/^location-([a-z0-9-]+?)-(\d+)$/)) && IMG.test(file)) {
    const loc = locs.locations.find((l) => l.slug === m[1]);
    if (!loc) { skipped.push(`${file} (no location "${m[1]}")`); continue; }
    const i = Number(m[2]) - 1;
    loc.photos[i] = { src: place(file), alt: alt(file, i === 0 ? `Inside NEFRA ${loc.address.city}` : `NEFRA ${loc.address.city}`) };
    loc.photos = loc.photos.filter(Boolean);
  } else if ((m = base.match(/^instagram-(\d+)$/)) && IMG.test(file)) {
    const i = Number(m[1]) - 1;
    social.posts[i] = { image: place(file), alt: alt(file, 'NEFRA on Instagram'), url: extra[file]?.url || social.posts[i]?.url || '' };
    social.posts = social.posts.filter(Boolean);
  } else { skipped.push(`${file} (name not in the shot list)`); continue; }
  done.push(file);
}

save('content/site.json', site);
save('content/home.json', home);
save('content/menu.json', menu);
save('content/locations.json', locs);
save('content/social.json', social);
fs.writeFileSync(storyPath, `---\n${JSON.stringify(story, null, 2)}\n---\n${storyBody}`);

console.log(`Placed ${done.length} file(s): ${done.join(', ') || 'none'}`);
if (skipped.length) console.log(`Skipped:\n  ${skipped.join('\n  ')}`);
const noUrl = social.posts.filter((p) => !p.url).length;
if (noUrl) console.log(`Note: ${noUrl} Instagram photo(s) have no post link yet, so they link to the profile. Add "url" in photos/photos.json.`);

try {
  await import('sharp');
  execSync('node scripts/optimize-images.mjs', { cwd: ROOT, stdio: 'inherit' });
} catch {
  console.log('Tip: run `npm install` so photos also get fast, phone-sized versions.');
}
console.log('Done. Run `npm run dev` to see the photos, or `npm run build` to rebuild the site.');
