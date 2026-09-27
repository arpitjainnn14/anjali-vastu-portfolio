import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { Teaching } from '@/components/sections/Teaching';
import { Contact } from '@/components/sections/Contact';
import { pageMetadata } from '@/lib/metadata';

export function teachingMetadata(c: Content, locale: Locale): Metadata {
  return pageMetadata({ ...c.teaching.meta, path: '/teaching', locale, c });
}

export function TeachingPage({ c }: { c: Content }) {
  return (
    <div className="pt-16 md:pt-20">
      <Teaching c={c} heading="h1" />
      <Contact c={c} />
    </div>
  );
}
