import { notFound } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { enabledFeatures } from '@/lib/features';
import { getContext, pageMetadata } from '@/lib/site';

// Future page: switched on with features.giftCards in content/site.json plus a
// giftCardsUrl in content/ordering.json (from the POS or loyalty provider).
export function generateMetadata() {
  return pageMetadata({ title: 'Gift Cards | NEFRA', description: 'Share a NEFRA meal with someone.', path: '/gift-cards/', noindex: !enabledFeatures().giftCards });
}

export default function Page() {
  if (!enabledFeatures().giftCards) notFound();
  const { ordering } = getContext();
  return (
    <PageHero tone="emerald" eyebrow="NEFRA" title="Gift Cards" lead="Share a NEFRA meal with someone.">
      <div className="mt-8">
        <a href={ordering.extras.giftCards} target="_blank" rel="noopener" className="btn btn-light" data-track="giftCards_click">Buy a Gift Card</a>
      </div>
    </PageHero>
  );
}
