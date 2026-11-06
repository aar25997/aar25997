import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { Address, HoursList, LocationActions } from '@/components/LocationBits';
import { Photo } from '@/components/Photo';
import { tel } from '@/lib/format';
import { createSchema } from '@/lib/schema';
import { cityLine, getContext, pageMetadata, statusLabel } from '@/lib/site';

// One page per entry in content/locations.json: add a location there and it gets
// its own URL, SEO metadata and Restaurant structured data automatically.

export function generateStaticParams() {
  return getContext().locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = getContext().locations.find((l) => l.slug === slug);
  if (!loc) return {};
  return pageMetadata({ title: loc.seo.title || `NEFRA ${cityLine(loc)}`, description: loc.seo.description, path: `/locations/${loc.slug}/` });
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { site, locations } = getContext();
  const loc = locations.find((l) => l.slug === slug);
  if (!loc) notFound();
  const schema = createSchema(site);
  const photos = loc.photos.length ? loc.photos : [{ src: '', alt: '' }];
  const label = 'mb-2 font-sans text-label font-semibold uppercase text-walnut';

  return (
    <>
      <JsonLd data={[schema.restaurant(loc), schema.breadcrumbs([['Home', '/'], ['Locations', '/locations/'], [loc.address.city, `/locations/${loc.slug}/`]])]} />
      <section className="on-dark bg-emerald text-ivory">
        <div className="container-site pb-16 pt-16 md:pb-20 md:pt-24">
          <p className="eyebrow rise"><a href="/locations/" className="text-stone underline-offset-4">Locations</a> · {statusLabel(loc)}</p>
          <h1 className="rise rise-1 max-w-3xl text-h1 text-ivory">{loc.status === 'open' ? `NEFRA ${loc.address.city}` : `Coming Soon to ${cityLine(loc)}`}</h1>
          <p className="rise rise-2 mt-6 max-w-2xl text-lead text-stone">
            {loc.status === 'open' ? `Shawarma, Egyptian falafel and Mediterranean bowls in ${cityLine(loc)}.` : loc.openingNote}
          </p>
          <div className="rise rise-3"><LocationActions loc={loc} dark /></div>
        </div>
      </section>

      <section className="py-section">
        <div className="container-site grid items-start gap-12 md:grid-cols-[1fr_1.3fr] md:gap-16">
          <dl className="grid gap-7">
            <div className="border-b border-stone pb-6"><dt className={label}>Address</dt><dd><Address loc={loc} /></dd></div>
            <div className="border-b border-stone pb-6"><dt className={label}>Hours</dt><dd><HoursList loc={loc} /></dd></div>
            <div className="border-b border-stone pb-6">
              <dt className={label}>Phone</dt>
              <dd>{loc.phone ? <a href={`tel:${tel(loc.phone)}`} className="text-emerald">{loc.phone}</a> : <span className="text-muted">To be announced.</span>}</dd>
            </div>
            {loc.parking && <div className="border-b border-stone pb-6"><dt className={label}>Parking</dt><dd>{loc.parking}</dd></div>}
            <div className="pb-2">
              <dt className={label}>Menu</dt>
              <dd>{loc.menuNote && <>{loc.menuNote} </>}<a href="/menu/" className="text-emerald underline underline-offset-4">View the menu</a></dd>
            </div>
          </dl>
          <div className="grid gap-3">
            {photos.map((p, i) => (
              <div key={i} className="aspect-[4/3] max-w-full overflow-hidden rounded-card">
                <Photo src={p.src} alt={p.alt} label={`NEFRA ${loc.address.city} restaurant`} className="h-full w-full" priority={i === 0 && !!p.src} sizes="(min-width: 864px) 55vw, 100vw" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
