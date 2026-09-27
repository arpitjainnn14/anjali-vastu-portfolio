import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { pageMetadata } from '@/lib/metadata';

export function aboutMetadata(c: Content, locale: Locale): Metadata {
  return pageMetadata({ ...c.about.meta, path: '/about', locale, c });
}

/* Same section component as the homepage, promoted to h1 for a standalone page. */
export function AboutPage({ c }: { c: Content }) {
  return (
    <div className="pt-16 md:pt-20">
      <About c={c} heading="h1" />
      <Contact c={c} />
    </div>
  );
}
