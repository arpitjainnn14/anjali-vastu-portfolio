import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';
import { pageMetadata } from '@/lib/metadata';

export function testimonialsMetadata(c: Content, locale: Locale): Metadata {
  return pageMetadata({ ...c.testimonialsSection.meta, path: '/testimonials', locale, c });
}

/* Same section component as the home page, promoted to h1 for a standalone page. */
export function TestimonialsPage({ c }: { c: Content }) {
  return (
    <div className="pt-16 md:pt-20">
      <Testimonials c={c} heading="h1" />
      <Contact c={c} />
    </div>
  );
}
