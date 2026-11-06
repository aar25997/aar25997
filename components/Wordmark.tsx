/**
 * The official NEFRA logo (wordmark + "Flavors Of Civilization"), extracted as
 * vector art from the NEFRA Brand Guidelines. Brand rules: gold on dark
 * backgrounds, charcoal on gold/light backgrounds; never recolored, outlined,
 * rotated, stretched or given effects; never smaller than 100px wide / 28px high.
 * Files: public/brand/nefra-logo-gold.svg, public/brand/nefra-logo-charcoal.svg
 */
const RATIO = 1155 / 333; // viewBox of the extracted artwork

export function Wordmark({ logo, name, size = 'md', className = '' }: { logo: string; name: string; size?: 'md' | 'lg'; className?: string }) {
  const h = size === 'lg' ? 56 : 44;
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`${name}, Flavors Of Civilization`}
        width={Math.round(h * RATIO)}
        height={h}
        className={`${size === 'lg' ? 'h-14' : 'h-10 md:h-11'} w-auto ${className}`}
      />
    );
  }
  // Fallback only if the logo file is removed from settings.
  return <span className={`font-display text-[1.65rem] font-semibold tracking-[0.2em] text-gold ${className}`} data-placeholder="logo">{name}</span>;
}
