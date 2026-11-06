import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { Photo } from '@/components/Photo';
import { getStory } from '@/lib/content';
import { markdownToHtml } from '@/lib/markdown';
import { createSchema } from '@/lib/schema';
import { getContext, pageMetadata } from '@/lib/site';

// Content: content/stories/our-story.md (editable in the CMS under "Brand stories").
// DRAFT: written from the brand brief. The founder should review and personalize it.

export function generateMetadata() {
  const s = getStory('our-story');
  return pageMetadata({ title: s?.seoTitle || 'Our Story | NEFRA', description: s?.seoDescription, path: '/our-story/' });
}

export default function OurStoryPage() {
  const story = getStory('our-story');
  if (!story) notFound();
  const { site } = getContext();

  return (
    <>
      <JsonLd data={[createSchema(site).breadcrumbs([['Home', '/'], ['Our Story', '/our-story/']])]} />
      <section className="on-dark pattern-pills relative overflow-hidden bg-emerald text-ivory">
        <div className="container-site grid items-end gap-10 pb-16 pt-20 md:grid-cols-[1.2fr_1fr] md:pb-24 md:pt-28">
          <div>
            <span className="eyebrow rise">{story.eyebrow}</span>
            <h1 className="rise rise-1 text-h1 text-beige">{story.heading}</h1>
            {story.lead && <p className="rise rise-2 mt-6 max-w-xl font-display text-[clamp(1.15rem,2vw,1.45rem)] leading-snug tracking-[0.03em] text-stone">{story.lead}</p>}
          </div>
          <div className="frame-gold rise rise-3 aspect-[4/5] max-h-[28rem] max-w-full overflow-hidden rounded-card md:justify-self-end md:w-full">
            <Photo src={story.heroImage} alt={story.heroAlt} label="Story: the NEFRA kitchen" className="h-full w-full" priority sizes="(min-width: 864px) 40vw, 100vw" />
          </div>
        </div>
      </section>

      <article className="py-section">
        {story.body.trim() && <div className="container-site"><div className="prose-nefra mx-auto" dangerouslySetInnerHTML={{ __html: markdownToHtml(story.body) }} /></div>}
        <div className="grid gap-[clamp(4rem,9vw,7rem)]">
          {story.sections.map((s, i) => {
            if (s.layout === 'quote')
              return (
                <figure key={i} className="container-site" data-reveal>
                  <blockquote className="mx-auto max-w-3xl border-y border-gold py-12 text-center font-display text-[clamp(1.4rem,3vw,2.1rem)] leading-snug text-burgundy">
                    {s.body}
                  </blockquote>
                </figure>
              );
            const html = { __html: markdownToHtml(s.body) };
            if (s.layout === 'text')
              return (
                <section key={i} className="container-site" data-reveal>
                  <div className="mx-auto max-w-3xl text-center">
                    <span className="rule-gold mx-auto mb-8" aria-hidden="true" />
                    {s.heading && <h2 className="text-h2 text-emerald">{s.heading}</h2>}
                    <div className="prose-nefra mx-auto mt-6" dangerouslySetInnerHTML={html} />
                  </div>
                </section>
              );
            const imageFirst = s.layout === 'image-left';
            return (
              <section key={i} className="container-site grid items-center gap-10 md:grid-cols-2 md:gap-20" data-reveal>
                <div className={`frame-gold aspect-[4/5] max-w-full overflow-hidden rounded-card ${imageFirst ? '' : 'md:order-2'}`}>
                  <Photo src={s.image} alt={s.alt} label={s.alt || s.heading} className="h-full w-full" sizes="(min-width: 864px) 50vw, 100vw" />
                </div>
                <div>
                  <span className="rule-gold mb-7" aria-hidden="true" />
                  {s.heading && <h2 className="text-h2 text-emerald">{s.heading}</h2>}
                  <div className="prose-nefra mt-5" dangerouslySetInnerHTML={html} />
                </div>
              </section>
            );
          })}
        </div>
        <div className="container-site mt-section flex flex-wrap justify-center gap-3">
          <a href="/our-standards/" className="btn btn-primary">Read Our Standards</a>
          <a href="/menu/" className="btn btn-outline">Explore the Menu</a>
        </div>
      </article>
    </>
  );
}
