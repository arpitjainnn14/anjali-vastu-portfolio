import type { Metadata } from 'next';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { getContent } from '@/content';
import { pageMetadata } from '@/lib/metadata';

const c = getContent('en');

export const metadata: Metadata = pageMetadata({ ...c.about.meta, path: '/about', c });

/* Same section component as the homepage, promoted to h1 for a standalone page. */
export default function AboutPage() {
  return (
    <div className="pt-16 md:pt-20">
      <About c={c} heading="h1" />
      <Contact c={c} />
    </div>
  );
}
