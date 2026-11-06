import { ContactForm } from '@/components/ContactForm';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { tel } from '@/lib/format';
import { createSchema } from '@/lib/schema';
import { cityLine, getContext, pageMetadata } from '@/lib/site';

export function generateMetadata() {
  return pageMetadata({ title: 'Contact NEFRA | Sterling, VA', description: 'Get in touch with NEFRA about questions, partnerships, press, careers or future catering.', path: '/contact/' });
}

export default function ContactPage() {
  const { site, locations, instagram } = getContext();
  const row = 'grid gap-1 border-b border-stone py-5 sm:grid-cols-[8rem_1fr] sm:gap-6';
  const key = 'pt-0.5 text-label font-semibold uppercase text-walnut';
  return (
    <>
      <JsonLd data={[createSchema(site).breadcrumbs([['Home', '/'], ['Contact', '/contact/']])]} />
      <PageHero eyebrow="Contact" title="We'd Love to Hear From You" lead="Questions about our food, partnerships, press or joining the team: send us a note." />
      <section className="py-section">
        <div className="container-site grid items-start gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <h2 className="mb-2 font-sans text-label font-semibold uppercase text-walnut">Reach us</h2>
            <dl>
              {site.email && <div className={row}><dt className={key}>Email</dt><dd className="select-all"><a href={`mailto:${site.email}`} className="text-emerald">{site.email}</a></dd></div>}
              {site.phone && <div className={row}><dt className={key}>Phone</dt><dd><a href={`tel:${tel(site.phone)}`} className="text-emerald">{site.phone}</a></dd></div>}
              {site.social.map((s) => (
                <div key={s.url} className={row}><dt className={key}>{s.network}</dt><dd><a href={s.url} target="_blank" rel="noopener" data-track="social_click" className="text-emerald">{s.handle || s.url}</a></dd></div>
              ))}
              <div className={row}><dt className={key}>Location</dt><dd>{locations.map((l) => <span key={l.slug} className="block">{cityLine(l)}{l.status === 'open' ? '' : ' (coming soon)'}</span>)}</dd></div>
            </dl>
          </div>
          <div className="rounded-card border border-stone bg-white p-6 sm:p-10">
            <ContactForm endpoint={site.forms.contactEndpoint} instagram={instagram?.handle ?? '@nefrahouse'} cateringEnabled={site.features.catering} />
          </div>
        </div>
      </section>
    </>
  );
}
