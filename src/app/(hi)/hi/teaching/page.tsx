import type { Metadata } from 'next';
import { getContent } from '@/content';
import { TeachingPage, teachingMetadata } from '@/components/pages/TeachingPage';

const c = getContent('hi');

export const metadata: Metadata = teachingMetadata(c, 'hi');

export default function Page() {
  return <TeachingPage c={c} />;
}
