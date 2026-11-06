export function PageHero({ eyebrow, title, lead, tone = 'light', children }: {
  eyebrow?: React.ReactNode;
  title: string;
  lead?: string;
  tone?: 'light' | 'emerald';
  children?: React.ReactNode;
}) {
  const emerald = tone === 'emerald';
  return (
    <section className={emerald ? 'on-dark bg-emerald text-ivory' : 'border-b border-stone bg-ivory'}>
      <div className="container-site pb-14 pt-16 md:pb-20 md:pt-24">
        <div className="max-w-3xl">
          {eyebrow && <span className="eyebrow rise">{eyebrow}</span>}
          <h1 className={`rise rise-1 text-h1 ${emerald ? 'text-ivory' : ''}`}>{title}</h1>
          {lead && <p className={`rise rise-2 mt-6 max-w-2xl text-lead ${emerald ? 'text-stone' : 'text-muted'}`}>{lead}</p>}
          {children && <div className="rise rise-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}
