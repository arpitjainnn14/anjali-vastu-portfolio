import type { Metadata } from 'next';
import { getContent } from '@/content';
import { ContactPage, contactMetadata } from '@/components/pages/ContactPage';

const c = getContent('en');

export const metadata: Metadata = contactMetadata(c, 'en');

export default function Page() {
  return <ContactPage c={c} />;
}
