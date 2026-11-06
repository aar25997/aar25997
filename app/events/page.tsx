import { notFound } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { Photo } from '@/components/Photo';
import { getEvents } from '@/lib/content';
import { enabledFeatures } from '@/lib/features';
import { formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/site';

export function generateMetadata() {
  return pageMetadata({ title: 'News & Events | NEFRA Sterling, VA', description: 'News, openings and community events from NEFRA.', path: '/events/', noindex: !enabledFeatures().events });
}

export default function EventsPage() {
  if (!enabledFeatures().events) notFound();
  const events = getEvents();
  return (
    <>
      <PageHero eyebrow="Community" title="News & Events" />
      <section className="py-section">
        <ul className="container-site grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li key={e.slug} className="overflow-hidden rounded-card border border-stone bg-white">
              <div className="aspect-[16/10] max-w-full overflow-hidden"><Photo src={e.image} alt={e.alt} label={e.title} className="h-full w-full" sizes="(min-width: 864px) 33vw, 100vw" /></div>
              <div className="p-6">
                <p className="text-label font-semibold uppercase text-walnut">{e.type === 'event' ? 'Event' : 'Update'} · <time dateTime={e.date}>{formatDate(e.date)}</time></p>
                <h2 className="mt-2 text-h3"><a href={`/events/${e.slug}/`} className="text-charcoal hover:text-emerald">{e.title}</a></h2>
                <p className="mt-2 text-muted">{e.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
