import type { Metadata } from 'next';
import { Teaching } from '@/components/sections/Teaching';
import { Contact } from '@/components/sections/Contact';
import { getContent } from '@/content';
import { pageMetadata } from '@/lib/metadata';

const c = getContent('en');

export const metadata: Metadata = pageMetadata({ ...c.teaching.meta, path: '/teaching', c });

export default function TeachingPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Teaching c={c} heading="h1" />
      <Contact c={c} />
    </div>
  );
}
