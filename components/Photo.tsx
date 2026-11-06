import 'server-only';
import { pictureData } from '@/lib/images';
import { Picture } from './Picture';

/** Server wrapper: looks up responsive variants for a content image path. */
export function Photo(props: { src?: string; alt?: string; label: string; className?: string; sizes?: string; priority?: boolean }) {
  const { src = '', alt = '', ...rest } = props;
  return <Picture data={pictureData(src)} alt={alt || rest.label} {...rest} />;
}
