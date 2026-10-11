import { getContent } from '@/content';
import { NotFoundPage } from '@/components/pages/NotFoundPage';

/* The Hindi site's twin of app/(en)/not-found.tsx. */
export default function NotFound() {
  return <NotFoundPage c={getContent('hi')} />;
}
