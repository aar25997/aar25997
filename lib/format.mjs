// Small formatting helpers shared by the build.

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** "21:30" -> "9:30 PM" */
export function time12(t) {
  const [h, m] = String(t).split(':').map(Number);
  if (Number.isNaN(h)) return esc(t);
  const suffix = h % 24 >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return m ? `${hh}:${String(m).padStart(2, '0')} ${suffix}` : `${hh} ${suffix}`;
}

/** ["Monday","Tuesday","Wednesday"] -> "Monday – Wednesday" */
export function dayRange(days = []) {
  const sorted = [...days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
  const idx = sorted.map((d) => DAYS.indexOf(d));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (sorted.length > 2 && consecutive) return `${sorted[0]} – ${sorted.at(-1)}`;
  return sorted.join(', ');
}

export const money = (n) => (typeof n === 'number' ? `$${n.toFixed(2)}` : '');

export const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
