import type { Metadata } from 'next';
import { getContent } from '@/content';
import { AboutPage, aboutMetadata } from '@/components/pages/AboutPage';

const c = getContent('en');

export const metadata: Metadata = aboutMetadata(c, 'en');

export default function Page() {
  return <AboutPage c={c} />;
}
