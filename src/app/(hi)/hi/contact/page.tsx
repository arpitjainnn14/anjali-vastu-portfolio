import type { Metadata } from 'next';
import { getContent } from '@/content';
import { ContactPage, contactMetadata } from '@/components/pages/ContactPage';

const c = getContent('hi');

export const metadata: Metadata = contactMetadata(c, 'hi');

export default function Page() {
  return <ContactPage c={c} />;
}
