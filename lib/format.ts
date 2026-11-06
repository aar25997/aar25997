export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

/** "21:30" -> "9:30 PM" */
export function time12(t: string): string {
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return t;
  const suffix = h % 24 >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return m ? `${hh}:${String(m).padStart(2, '0')} ${suffix}` : `${hh} ${suffix}`;
}

/** ["Monday","Tuesday","Wednesday"] -> "Monday – Wednesday" */
export function dayRange(days: string[]): string {
  const sorted = [...days].sort((a, b) => DAYS.indexOf(a as never) - DAYS.indexOf(b as never));
  const idx = sorted.map((d) => DAYS.indexOf(d as never));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  return sorted.length > 2 && consecutive ? `${sorted[0]} – ${sorted.at(-1)}` : sorted.join(', ');
}

export const money = (n: number | null) => (typeof n === 'number' ? `$${n.toFixed(2)}` : '');

export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const tel = (p: string) => p.replace(/[^\d+]/g, '');
