import type { Metadata } from 'next';
import { getContent } from '@/content';
import { HomePage, homeMetadata } from '@/components/pages/HomePage';

const c = getContent('hi');

export const metadata: Metadata = homeMetadata(c, 'hi');

export default function Page() {
  return <HomePage c={c} locale="hi" />;
}
