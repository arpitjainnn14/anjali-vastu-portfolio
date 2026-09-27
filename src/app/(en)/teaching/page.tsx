import type { Metadata } from 'next';
import { getContent } from '@/content';
import { TeachingPage, teachingMetadata } from '@/components/pages/TeachingPage';

const c = getContent('en');

export const metadata: Metadata = teachingMetadata(c, 'en');

export default function Page() {
  return <TeachingPage c={c} />;
}
