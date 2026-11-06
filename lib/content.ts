// Loads content/ at build time. Every page is pre-rendered, so this runs on the
// build machine only, never in the visitor's browser.
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { EventPost, HomeContent, Location, Menu, OrderingSettings, SiteSettings, SocialContent, StandardsContent, Story } from './types';

const ROOT = process.cwd();
const json = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', file), 'utf8')) as T;

/** Markdown file with a JSON front matter block between --- lines (Decap's json-frontmatter). */
function parseFrontMatter(src: string): { data: Record<string, unknown>; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  return { data: JSON.parse(m[1]), body: src.slice(m[0].length) };
}

function collection<T>(dir: string): T[] {
  const full = path.join(ROOT, 'content', dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith('.md')).map((f) => {
    const { data, body } = parseFrontMatter(fs.readFileSync(path.join(full, f), 'utf8'));
    return { slug: f.replace(/\.md$/, ''), ...data, body } as T;
  });
}

export const getSite = () => json<SiteSettings>('site.json');
export const getHome = () => json<HomeContent>('home.json');
export const getOrderingSettings = () => json<OrderingSettings>('ordering.json');
export const getLocations = () => json<{ locations: Location[] }>('locations.json').locations;
export const getSocial = () => json<SocialContent>('social.json');
export const getStandards = () => json<StandardsContent>('standards.json');

export function getMenu(): Menu {
  const menu = json<Menu>('menu.json');
  return {
    ...menu,
    categories: [...menu.categories].sort((a, b) => a.order - b.order),
    items: menu.items.filter((i) => i.approved || menu.showDraftItems),
  };
}

export const getStories = () =>
  collection<Story>('stories').filter((s) => s.published !== false).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
export const getStory = (slug: string) => getStories().find((s) => s.slug === slug);

export const getEvents = () =>
  collection<EventPost>('events').filter((e) => e.status === 'published').sort((a, b) => b.date.localeCompare(a.date));
