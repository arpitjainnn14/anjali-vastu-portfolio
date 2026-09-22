import type { Metadata } from 'next';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { about, site } from '@/content';

export const metadata: Metadata = {
  title: 'About Anjali',
  description: about.paragraphs[0],
  alternates: { canonical: '/about' },
  openGraph: {
    title: `About Anjali — ${site.name}`,
    description: about.paragraphs[0],
    url: '/about',
  },
};

/* Same section component as the homepage, promoted to h1 for a standalone page. */
export default function AboutPage() {
  return (
    <div className="pt-16 md:pt-20">
      <About heading="h1" />
      <Contact />
    </div>
  );
}
