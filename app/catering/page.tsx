import { notFound } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { enabledFeatures } from '@/lib/features';
import { getContext, pageMetadata } from '@/lib/site';

// Future page: switched on with features.catering in content/site.json.
export function generateMetadata() {
  return pageMetadata({ title: 'Catering in Sterling & Northern Virginia | NEFRA', description: 'NEFRA catering for offices, events and gatherings.', path: '/catering/', noindex: !enabledFeatures().catering });
}

export default function CateringPage() {
  if (!enabledFeatures().catering) notFound();
  const { ordering } = getContext();
  return (
    <PageHero tone="emerald" eyebrow="Catering" title="NEFRA for Your Table" lead="Shawarma, falafel and generous sides for offices, events and family gatherings.">
      <p className="mt-6 max-w-xl text-stone">[Catering packages, minimums, lead times and service area go here once confirmed.]</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {ordering.extras.catering && <a href={ordering.extras.catering} className="btn btn-light" data-track="catering_click">Order Catering</a>}
        <a href="/contact/" className="btn btn-outline-light">Ask About Catering</a>
      </div>
    </PageHero>
  );
}
