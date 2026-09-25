import type { Metadata } from 'next';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { about } from '@/content';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({ ...about.meta, path: '/about' });

/* Same section component as the homepage, promoted to h1 for a standalone page. */
export default function AboutPage() {
  return (
    <div className="pt-16 md:pt-20">
      <About heading="h1" />
      <Contact />
    </div>
  );
}
