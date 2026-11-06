/**
 * NEFRA wordmark. Until the official SVG is set in content/site.json (logo), a
 * temporary text stand-in is shown. Do not treat the stand-in as the logo.
 */
export function Wordmark({ logo, name, className = '' }: { logo: string; name: string; className?: string }) {
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt={name} width={160} height={36} className={`h-8 w-auto md:h-9 ${className}`} />;
  }
  return (
    <span className={`font-display text-[1.65rem] font-semibold tracking-[0.34em] text-ivory ${className}`} data-placeholder="logo">
      {name}
    </span>
  );
}
