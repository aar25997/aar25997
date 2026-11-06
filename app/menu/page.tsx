import { JsonLd } from '@/components/JsonLd';
import { MenuBrowser, type MenuItemView } from '@/components/MenuBrowser';
import { OrderLink } from '@/components/OrderLink';
import { PageHero } from '@/components/PageHero';
import { getMenu } from '@/lib/content';
import { money, slugify } from '@/lib/format';
import { pictureData } from '@/lib/images';
import { createSchema } from '@/lib/schema';
import { getContext, pageMetadata, wherePhrase } from '@/lib/site';

export function generateMetadata() {
  const { primaryLocation } = getContext();
  return pageMetadata({
    title: 'Menu: Shawarma, Falafel & Mediterranean Bowls | NEFRA Sterling, VA',
    description: `The NEFRA menu: beef and chicken shawarma, Egyptian falafel, bowls and plates, sandwiches, sides and more, ${wherePhrase(primaryLocation)}.`,
    path: '/menu/',
  });
}

export default function MenuPage() {
  const { site, locations, ordering } = getContext();
  const menu = getMenu();
  const dest = ordering.primary();
  const hasDrafts = menu.items.some((i) => !i.approved);

  const items: MenuItemView[] = menu.items.map((i) => ({
    key: `${i.category}-${slugify(i.name)}`,
    name: i.name,
    category: i.category,
    description: i.description,
    // Unapproved items never show a price, even if one was entered.
    price: i.approved ? money(i.price) : '',
    picture: pictureData(i.image),
    alt: i.alt || i.name,
    allergens: i.allergens,
    dietary: i.dietary,
    customization: i.customization,
    available: i.available,
    draft: !i.approved,
    where: locations.length > 1 && i.locations.length
      ? `Available at ${i.locations.map((s) => locations.find((l) => l.slug === s)?.address.city ?? s).join(', ')}`
      : '',
    order: i.approved ? ordering.forItem(i) : null,
  }));

  const extras = [
    ordering.extras.familyMeals && ordering.isLive && { href: ordering.extras.familyMeals, label: 'Family meals', track: 'family_meals_click' },
    site.features.catering && ordering.extras.catering && { href: ordering.extras.catering, label: 'Catering', track: 'catering_click' },
    site.features.giftCards && ordering.extras.giftCards && { href: ordering.extras.giftCards, label: 'Gift cards', track: 'gift_cards_click' },
  ].filter(Boolean) as { href: string; label: string; track: string }[];

  return (
    <>
      <JsonLd data={[createSchema(site).breadcrumbs([['Home', '/'], ['Menu', '/menu/']])]} />
      <PageHero
        eyebrow="The Menu"
        title="Our Menu"
        lead="Shawarma carved from the spit, falafel made the Egyptian way, and generous bowls and plates built around them."
      >
        {(dest || extras.length > 0) && (
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {dest && <OrderLink dest={dest} />}
            {extras.map((e) => (
              <a key={e.label} href={e.href} target="_blank" rel="noopener" data-track={e.track} className="link-arrow">{e.label}</a>
            ))}
          </div>
        )}
        {hasDrafts && (
          <p className="mt-8 flex max-w-2xl gap-3 rounded-card border border-walnut/30 bg-sand px-5 py-4 text-[0.95rem] text-charcoal" role="note">
            <span aria-hidden="true" className="mt-2 h-2 w-2 flex-none rounded-full bg-walnut" />
            {menu.draftNotice}
          </p>
        )}
      </PageHero>

      <MenuBrowser categories={menu.categories} items={items} />

      <aside aria-labelledby="allergen-h" className="container-site pb-section">
        <div className="max-w-3xl rounded-card border-l-[3px] border-gold bg-sand p-7">
          <h2 id="allergen-h" className="mb-2 font-sans text-label font-semibold uppercase text-walnut">Allergens &amp; dietary information</h2>
          <p className="text-[0.97rem] text-muted">{menu.disclaimer}</p>
        </div>
      </aside>
    </>
  );
}
