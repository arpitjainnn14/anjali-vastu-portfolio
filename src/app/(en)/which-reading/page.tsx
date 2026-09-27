import type { Metadata } from 'next';
import { getContent } from '@/content';
import { WhichReadingPage, whichReadingMetadata } from '@/components/pages/WhichReadingPage';

const c = getContent('en');

export const metadata: Metadata = whichReadingMetadata(c, 'en');

export default function Page() {
  return <WhichReadingPage c={c} locale="en" />;
}
