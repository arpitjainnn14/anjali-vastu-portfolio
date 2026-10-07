import type { Metadata } from 'next';
import { getContent } from '@/content';
import { TestimonialsPage, testimonialsMetadata } from '@/components/pages/TestimonialsPage';

const c = getContent('en');

export const metadata: Metadata = testimonialsMetadata(c, 'en');

export default function Page() {
  return <TestimonialsPage c={c} />;
}
