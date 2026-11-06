export function SectionHeading({ eyebrow, title, id, className = '', align = 'left', as: Tag = 'h2' }: {
  eyebrow?: string;
  title: string;
  id?: string;
  className?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Tag id={id} className={`${Tag === 'h1' ? 'text-h1' : 'text-h2'} text-emerald`}>
        {title}
      </Tag>
    </div>
  );
}
