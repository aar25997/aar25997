import type { PictureData } from '@/lib/images';

type Props = {
  data: PictureData | null;
  alt: string;
  /** Shown on the placeholder until real photography is added. */
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Responsive photo, or a clearly marked placeholder (data-placeholder="photo") when
 * no image is set. Placeholders are never presented as real NEFRA photography.
 */
export function Picture({ data, alt, label, className = '', sizes = '100vw', priority = false }: Props) {
  if (!data) {
    return (
      <div className={`photo-placeholder ${className}`} data-placeholder="photo" role="img" aria-label={`Photo coming soon: ${label}`}>
        <span aria-hidden="true">{label}</span>
      </div>
    );
  }
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={data.src}
      alt={alt}
      width={data.width}
      height={data.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  );
  if (!data.srcSet) return img;
  return (
    <picture className="contents">
      <source type="image/webp" srcSet={data.srcSet} sizes={sizes} />
      {img}
    </picture>
  );
}
