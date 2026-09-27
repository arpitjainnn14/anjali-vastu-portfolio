import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { Contact } from '@/components/sections/Contact';
import { WhatHappensNext } from '@/components/sections/WhatHappensNext';
import { pageMetadata } from '@/lib/metadata';

export function contactMetadata(c: Content, locale: Locale): Metadata {
  return pageMetadata({ ...c.contactSection.meta, path: '/contact', locale, c });
}

/**
 * Contact. The form, then what happens after it is sent — on its own page the
 * form alone left a visitor with a column of empty fields and no idea who
 * reads them or what follows.
 */
export function ContactPage({ c }: { c: Content }) {
  return (
    <div className="pt-16 md:pt-20">
      <Contact c={c} heading="h1" standalone />
      <WhatHappensNext c={c} />
    </div>
  );
}
