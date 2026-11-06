// Typed content models. The JSON/Markdown files in content/ follow these shapes,
// and the CMS (public/admin/config.yml) edits the same fields.

export type Link = { label: string; path: string };
export type Social = { network: string; handle?: string; url: string };
export type Img = { src: string; alt: string };

export type SiteSettings = {
  name: string;
  tagline: string;
  subTagline: string;
  description: string;
  cuisines: string[];
  siteUrl: string;
  logo: string;
  email: string;
  phone: string;
  social: Social[];
  navigation: Link[];
  footerLinks: Link[];
  announcement: { enabled: boolean; text: string; linkLabel: string; linkUrl: string };
  forms: { newsletterEndpoint: string; contactEndpoint: string };
  features: { catering: boolean; events: boolean; giftCards: boolean; rewards: boolean };
  analytics: { ga4MeasurementId: string; googleSiteVerification: string };
};

export type HomeContent = {
  hero: { eyebrow: string; headline: string; subheadline: string; copy: string; image: string; imageAlt: string; video: string; poster: string };
  intro: { eyebrow: string; headline: string; body: string; image: string; imageAlt: string };
  featured: { eyebrow: string; headline: string };
  philosophy: { eyebrow: string; headline: string; body: string; image: string; imageAlt: string };
  standards: { eyebrow: string; headline: string; pillars: { title: string; body: string }[] };
  story: { eyebrow: string; headline: string; body: string[]; image: string; imageAlt: string };
  location: { eyebrow: string; headline: string };
  community: { eyebrow: string; headline: string; body: string; image: string; imageAlt: string };
};

export type OrderingSettings = {
  provider: '' | 'toast' | 'clover' | 'spoton' | 'other';
  mode: 'link' | 'embed';
  defaultUrl: string;
  openInNewTab: boolean;
  trackingParams: string;
  cateringUrl: string;
  giftCardsUrl: string;
  familyMealsUrl: string;
  rewardsUrl: string;
};

export type MenuCategory = { id: string; name: string; description: string; order: number };

export type MenuItem = {
  name: string;
  category: string;
  description: string;
  /** USD. null until the price is final; the site then shows "Price at opening". */
  price: number | null;
  image: string;
  alt: string;
  /** Only verified allergens. */
  allergens: string[];
  /** Only verified dietary tags. */
  dietary: string[];
  customization: string;
  available: boolean;
  /** Location slugs. Empty = served everywhere. */
  locations: string[];
  orderUrl: string;
  /** false = draft/sample item, shown with a "Preview" tag only while showDraftItems is on. */
  approved: boolean;
};

export type FeaturedCard = { title: string; description: string; category: string; image: string; alt: string };

export type Menu = {
  showDraftItems: boolean;
  draftNotice: string;
  disclaimer: string;
  featured: FeaturedCard[];
  categories: MenuCategory[];
  items: MenuItem[];
};

export type Hours = { days: string[]; opens: string; closes: string };

export type Location = {
  slug: string;
  name: string;
  status: 'coming-soon' | 'open' | 'temporarily-closed';
  openingNote: string;
  address: { street: string; city: string; region: string; regionName: string; postalCode: string };
  coordinates: { lat: number | null; lng: number | null };
  googlePlaceId: string;
  mapsUrl: string;
  phone: string;
  orderUrl: string;
  hoursConfirmed: boolean;
  hours: Hours[];
  parking: string;
  menuNote: string;
  photos: Img[];
  seo: { title: string; description: string };
};

export type StandardsContent = {
  eyebrow: string;
  heading: string;
  lead: string;
  items: { id: string; title: string; body: string; status: 'commitment' | 'in-progress' | 'verified' }[];
  note: string;
};

export type StorySection = { heading: string; body: string; image?: string; alt?: string; layout: 'image-left' | 'image-right' | 'text' | 'quote' };

export type Story = {
  slug: string;
  title: string;
  path?: string;
  eyebrow?: string;
  heading: string;
  lead?: string;
  heroImage?: string;
  heroAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
  draft?: boolean;
  order?: number;
  sections: StorySection[];
  body: string;
};

export type EventPost = {
  slug: string;
  title: string;
  type: 'event' | 'update';
  date: string;
  endDate?: string;
  summary: string;
  image?: string;
  alt?: string;
  status: 'draft' | 'published';
  location?: string;
  body: string;
};

export type SocialContent = { posts: { image: string; alt: string; url: string }[] };
