import { notFound } from 'next/navigation';
import { PageHero } from '@/components/PageHero';
import { enabledFeatures } from '@/lib/features';
import { getContext, pageMetadata } from '@/lib/site';

// Future page: switched on with features.rewards in content/site.json plus a
// rewardsUrl in content/ordering.json (from the POS or loyalty provider).
export function generateMetadata() {
  return pageMetadata({ title: 'Rewards | NEFRA', description: 'Earn rewards every time you visit.', path: '/rewards/', noindex: !enabledFeatures().rewards });
}

export default function Page() {
  if (!enabledFeatures().rewards) notFound();
  const { ordering } = getContext();
  return (
    <PageHero tone="emerald" eyebrow="NEFRA" title="Rewards" lead="Earn rewards every time you visit.">
      <div className="mt-8">
        <a href={ordering.extras.rewards} target="_blank" rel="noopener" className="btn btn-light" data-track="rewards_click">Join Rewards</a>
      </div>
    </PageHero>
  );
}
