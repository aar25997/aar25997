import { Address, HoursList } from '@/components/LocationBits';
import { OrderLink } from '@/components/OrderLink';
import { PageHero } from '@/components/PageHero';
import { cityLine, getContext, pageMetadata } from '@/lib/site';

// /order/ is NEFRA's permanent ordering link (Instagram bio, QR codes, Google
// Business Profile). It keeps working if the ordering provider ever changes.

export function generateMetadata() {
  return pageMetadata({ title: 'Order Online | NEFRA', description: 'Order NEFRA online for pickup.', path: '/order/', noindex: true });
}

export default function OrderPage() {
  const { ordering } = getContext();
  const dest = ordering.primary();

  if (!ordering.isLive)
    return (
      <PageHero tone="emerald" eyebrow="Order Online" title="Online Ordering Opens With Our Restaurant" lead="We're not taking orders yet. Join our list and we'll let you know the moment we open.">
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#signup" className="btn btn-light">Get Opening Updates</a>
          <a href="/menu/" className="btn btn-outline-light">Preview the Menu</a>
        </div>
      </PageHero>
    );

  if (ordering.mode === 'embed' && ordering.orderable.length === 1) {
    const url = ordering.urlFor(ordering.orderable[0]);
    return (
      <section>
        <iframe src={url} title="Order online from NEFRA" allow="payment" className="block h-[calc(100svh-var(--header-h))] min-h-[40rem] w-full border-0 bg-white" />
        <p className="container-site py-4 text-[0.9rem]">Having trouble? <a href={url} target="_blank" rel="noopener" className="text-emerald underline">Open online ordering in a new window</a>.</p>
      </section>
    );
  }

  if (dest?.external)
    return (
      <PageHero title="Taking You to Online Ordering…">
        <meta httpEquiv="refresh" content={`0; url=${dest.url}`} />
        <div className="mt-8"><OrderLink dest={dest}>Continue to Order</OrderLink></div>
      </PageHero>
    );

  return (
    <>
      <PageHero eyebrow="Order Online" title="Choose Your NEFRA" />
      <section className="py-section">
        <ul className="container-site grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ordering.orderable.map((l) => (
            <li key={l.slug} className="rounded-card border border-stone bg-white p-7">
              <h2 className="text-[1.45rem]">{cityLine(l)}</h2>
              <div className="mt-3 text-muted"><Address loc={l} /></div>
              <div className="mt-4 text-[0.95rem]"><HoursList loc={l} /></div>
              <div className="mt-6"><OrderLink dest={{ url: ordering.urlFor(l), external: true }} /></div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
