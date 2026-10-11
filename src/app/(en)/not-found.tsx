import { getContent } from '@/content';
import { NotFoundPage } from '@/components/pages/NotFoundPage';

/*
 * Shown when a page in the English site calls notFound() (for example a blog address with no note behind it).
 * Without it Next used its own bare 404 inside the layout, and resolved the share image against localhost.
 * Addresses that match no page at all use app/global-not-found.tsx.
 */
export default function NotFound() {
  return <NotFoundPage c={getContent('en')} />;
}
