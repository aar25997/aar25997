import 'server-only';
import { dayRange, time12 } from '@/lib/format';
import { cityLine, directionsUrl, getContext } from '@/lib/site';
import type { Location } from '@/lib/types';
import { OrderLink } from './OrderLink';

export function Address({ loc }: { loc: Location }) {
  const a = loc.address;
  if (!a.street)
    return (
      <p>
        {cityLine(loc)}
        <br />
        <span className="italic">Full address to be announced.</span>
      </p>
    );
  return (
    <address className="not-italic">
      {a.street}
      <br />
      {a.city}, {a.region} {a.postalCode}
    </address>
  );
}

/** Hours are shown only after the owner marks them confirmed. */
export function HoursList({ loc }: { loc: Location }) {
  const rows = loc.hours.filter((h) => h.opens && h.closes && h.days.length);
  if (!loc.hoursConfirmed || !rows.length) return <p className="italic">Hours will be announced ahead of opening.</p>;
  return (
    <dl className="grid gap-1.5">
      {rows.map((h) => (
        <div key={h.days.join()} className="flex justify-between gap-6">
          <dt className="font-medium">{dayRange(h.days)}</dt>
          <dd className="tabular-nums">{time12(h.opens)} – {time12(h.closes)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LocationActions({ loc, dark = false }: { loc: Location; dark?: boolean }) {
  const { ordering } = getContext();
  const solid = dark ? 'btn btn-light' : 'btn btn-primary';
  const outline = dark ? 'btn btn-outline-light' : 'btn btn-outline';
  const order = ordering.urlFor(loc);
  const dir = directionsUrl(loc);
  const buttons: React.ReactNode[] = [];
  if (order) buttons.push(<OrderLink key="o" dest={{ url: order, external: true }} className={solid} />);
  if (dir)
    buttons.push(
      <a key="d" href={dir} target="_blank" rel="noopener" data-track="directions_click" className={buttons.length ? outline : solid}>
        Get Directions
      </a>,
    );
  if (loc.status !== 'open')
    buttons.push(
      <a key="s" href="#signup" data-track="signup_cta" className={buttons.length ? outline : solid}>
        Get Opening Updates
      </a>,
    );
  return <div className="mt-8 flex flex-wrap gap-3">{buttons}</div>;
}
