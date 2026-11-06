import { JsonLd } from '@/components/JsonLd';
import { Address, HoursList } from '@/components/LocationBits';
import { PageHero } from '@/components/PageHero';
import { Photo } from '@/components/Photo';
import { createSchema } from '@/lib/schema';
import { cityLine, getContext, pageMetadata, statusLabel } from '@/lib/site';

export function generateMetadata() {
  return pageMetadata({
    title: 'Locations: Mediterranean Food in Sterling & Northern Virginia | NEFRA',
    description: 'Find a NEFRA restaurant. Shawarma, Egyptian falafel and Mediterranean bowls in Northern Virginia, starting with Sterling.',
    path: '/locations/',
  });
}

export default function LocationsPage() {
  const { site, locations } = getContext();
  return (
    <>
      <JsonLd data={[createSchema(site).breadcrumbs([['Home', '/'], ['Locations', '/locations/']])]} />
      <PageHero eyebrow="Locations" title="Find NEFRA" lead="Our first restaurant is coming to Sterling, Virginia. More neighborhoods will follow." />
      <section className="py-section">
        <ul className="container-site grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((l) => (
            <li key={l.slug} className="overflow-hidden rounded-card border border-stone bg-white">
              <div className="aspect-[16/10] max-w-full overflow-hidden">
                <Photo src={l.photos[0]?.src} alt={l.photos[0]?.alt} label={`NEFRA ${l.address.city} restaurant`} className="h-full w-full" sizes="(min-width: 864px) 33vw, 100vw" />
              </div>
              <div className="p-7">
                <p className={`mb-4 inline-block rounded-pill border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${l.status === 'open' ? 'border-emerald text-emerald' : 'border-gold text-walnut'}`}>{statusLabel(l)}</p>
                <h2 className="text-[1.45rem]">{cityLine(l)}</h2>
                <div className="mt-3 text-muted"><Address loc={l} /></div>
                <div className="mt-4 text-[0.95rem] text-muted"><HoursList loc={l} /></div>
                <a href={`/locations/${l.slug}/`} className="link-arrow mt-6">Location details<span className="sr-only">: {l.address.city}</span></a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
