import type { Metadata } from 'next';
import { Teaching } from '@/components/sections/Teaching';
import { Contact } from '@/components/sections/Contact';
import { teaching } from '@/content';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({ ...teaching.meta, path: '/teaching' });

export default function TeachingPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Teaching heading="h1" />
      <Contact />
    </div>
  );
}
