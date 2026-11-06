import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { Photo } from '@/components/Photo';
import { getEvents } from '@/lib/content';
import { enabledFeatures } from '@/lib/features';
import { formatDate } from '@/lib/format';
import { markdownToHtml } from '@/lib/markdown';
import { createSchema } from '@/lib/schema';
import { getContext, pageMetadata } from '@/lib/site';

// Static export needs at least one path; "_" renders the 404 page while no events exist.
export function generateStaticParams() {
  const events = enabledFeatures().events ? getEvents() : [];
  return events.length ? events.map((e) => ({ slug: e.slug })) : [{ slug: '_' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEvents().find((x) => x.slug === slug);
  if (!e) return {};
  return pageMetadata({ title: `${e.title} | NEFRA`, description: e.summary, path: `/events/${e.slug}/` });
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = enabledFeatures().events ? getEvents().find((x) => x.slug === slug) : undefined;
  if (!e) notFound();
  const { site, locations } = getContext();
  const schema = createSchema(site);
  const loc = locations.find((l) => l.slug === e.location);
  return (
    <>
      <JsonLd data={[e.type === 'event' ? schema.event(e, loc) : null, schema.breadcrumbs([['Home', '/'], ['News & Events', '/events/'], [e.title, `/events/${e.slug}/`]])]} />
      <PageHero eyebrow={<><a href="/events/" className="underline-offset-4">News &amp; Events</a> · <time dateTime={e.date}>{formatDate(e.date)}</time></>} title={e.title} lead={e.summary} />
      <article className="py-section">
        <div className="container-site">
          {e.image && <div className="mb-12 aspect-[16/9] max-w-4xl overflow-hidden rounded-card"><Photo src={e.image} alt={e.alt} label={e.title} className="h-full w-full" priority /></div>}
          <div className="prose-nefra" dangerouslySetInnerHTML={{ __html: markdownToHtml(e.body) }} />
        </div>
      </article>
    </>
  );
}
