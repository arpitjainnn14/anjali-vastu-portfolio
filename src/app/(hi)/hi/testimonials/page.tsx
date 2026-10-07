import type { Metadata } from 'next';
import { getContent } from '@/content';
import { TestimonialsPage, testimonialsMetadata } from '@/components/pages/TestimonialsPage';

const c = getContent('hi');

export const metadata: Metadata = testimonialsMetadata(c, 'hi');

export default function Page() {
  return <TestimonialsPage c={c} />;
}
