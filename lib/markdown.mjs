// Minimal Markdown + JSON front matter, enough for brand stories and events.
// Files look like:
//   ---
//   { "title": "Our Story", "published": true }
//   ---
//   Paragraph text, ## headings, > pull quotes, - lists, **bold**, *italic*,
//   [links](/menu/) and ![alt text](/assets/img/photo.jpg) images on their own line.
//   Use ![Describe the photo](placeholder) to show a labeled photo slot.
// This is the format Decap CMS writes with `format: json-frontmatter`.

import { esc } from './format.mjs';

export function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  return { data: JSON.parse(m[1]), body: src.slice(m[0].length) };
}

function inline(text, href) {
  return esc(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
      const ext = /^https?:/.test(u);
      return `<a href="${ext ? u : href(u)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function renderMarkdown(md, { href = (u) => u, picture, dropcap = false } = {}) {
  let firstP = true;
  return md
    .replace(/\r/g, '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('<')) return block; // raw HTML
      let m;
      if ((m = block.match(/^(#{2,3})\s+(.*)$/))) return `<h${m[1].length}>${inline(m[2], href)}</h${m[1].length}>`;
      if ((m = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)))
        return `<figure class="prose-figure">${picture({ src: m[2] === 'placeholder' ? '' : m[2], alt: m[1], label: m[1], cls: 'photo-wide', sizes: '(min-width: 760px) 720px, 100vw' })}</figure>`;
      if (block.startsWith('>')) return `<blockquote class="pull-quote">${inline(block.replace(/^>\s?/gm, ''), href)}</blockquote>`;
      if (/^[-*]\s/.test(block)) return `<ul>${block.split('\n').map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ''), href)}</li>`).join('')}</ul>`;
      const cls = dropcap && firstP ? ' class="dropcap"' : '';
      firstP = false;
      return `<p${cls}>${inline(block.replace(/\n/g, ' '), href)}</p>`;
    })
    .join('\n');
}
