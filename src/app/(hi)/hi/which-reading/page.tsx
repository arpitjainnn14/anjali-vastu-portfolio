import type { Metadata } from 'next';
import { getContent } from '@/content';
import { WhichReadingPage, whichReadingMetadata } from '@/components/pages/WhichReadingPage';

const c = getContent('hi');

export const metadata: Metadata = whichReadingMetadata(c, 'hi');

export default function Page() {
  return <WhichReadingPage c={c} locale="hi" />;
}
