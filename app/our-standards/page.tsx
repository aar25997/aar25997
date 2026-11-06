import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { getStandards } from '@/lib/content';
import { createSchema } from '@/lib/schema';
import { getContext, pageMetadata } from '@/lib/site';

// Content: content/standards.json. Keep to commitments and process. Product-level
// claims (organic, grass-fed, seed-oil-free, allergen-free) only once verified.

export function generateMetadata() {
  return pageMetadata({
    title: 'Our Standards: Ingredients, Sourcing & Preparation | NEFRA',
    description: 'How NEFRA approaches ingredients, cooking oils, meat sourcing, traditional preparation, freshness, transparency and hospitality.',
    path: '/our-standards/',
  });
}

const statusText = { commitment: 'Our commitment', 'in-progress': 'Being finalized', verified: 'Verified' } as const;

export default function StandardsPage() {
  const { site } = getContext();
  const s = getStandards();
  return (
    <>
      <JsonLd data={[createSchema(site).breadcrumbs([['Home', '/'], ['Our Standards', '/our-standards/']])]} />
      <PageHero eyebrow={s.eyebrow} title={s.heading} lead={s.lead} />

      <section className="bg-sand py-section" aria-label="Our standards">
        <div className="container-site">
          <nav aria-label="Standards on this page" className="mb-14 flex flex-wrap gap-2">
            {s.items.map((i) => (
              <a key={i.id} href={`#${i.id}`} className="rounded-pill border border-walnut/30 px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-walnut no-underline hover:border-emerald hover:text-emerald">
                {i.title}
              </a>
            ))}
          </nav>
          <ul className="mx-auto grid max-w-4xl">
            {s.items.map((i) => (
              <li key={i.id} id={i.id} data-reveal className="grid gap-4 border-t border-walnut/25 py-10 md:grid-cols-[14rem_1fr] md:gap-10">
                <div>
                  <span className="mb-4 block h-px w-10 bg-gold" aria-hidden="true" />
                  <h2 className="text-[clamp(1.35rem,2.4vw,1.75rem)]">{i.title}</h2>
                  <p className={`mt-3 inline-block rounded-pill px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${i.status === 'in-progress' ? 'bg-ivory text-walnut' : 'bg-emerald text-ivory'}`}>
                    {statusText[i.status]}
                  </p>
                </div>
                <p className="text-[1.08rem] leading-[1.8] text-muted">{i.body}</p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-6 max-w-4xl border-t border-walnut/25 pt-8 text-[0.92rem] text-muted">{s.note}</p>
        </div>
      </section>

      <section className="py-section">
        <div className="container-site text-center">
          <h2 className="text-h2">Questions About Our Food?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">We're happy to talk about sourcing, preparation or allergens.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/contact/" className="btn btn-primary">Contact Us</a>
            <a href="/menu/" className="btn btn-outline">View the Menu</a>
          </div>
        </div>
      </section>
    </>
  );
}
