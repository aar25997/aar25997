import type { OrderDestination } from '@/lib/ordering';

/** Link to the configured ordering provider (or /order/). Tracked as a conversion. */
export function OrderLink({ dest, className = 'btn btn-primary', children = 'Order Online', track = 'order_click', newTab = false }: {
  dest: OrderDestination;
  className?: string;
  children?: React.ReactNode;
  track?: string;
  newTab?: boolean;
}) {
  const external = dest.external && newTab ? { target: '_blank', rel: 'noopener' } : {};
  return (
    <a href={dest.url} className={className} data-track={track} {...external}>
      {children}
    </a>
  );
}
