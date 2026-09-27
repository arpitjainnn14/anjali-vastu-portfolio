import type { Metadata } from 'next';
import { Contact } from '@/components/sections/Contact';
import { WhatHappensNext } from '@/components/sections/WhatHappensNext';
import { contactSection } from '@/content';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({ ...contactSection.meta, path: '/contact' });

/**
 * Contact. The form, then what happens after it is sent — on its own page the
 * form alone left a visitor with a column of empty fields and no idea who
 * reads them or what follows.
 */
export default function ContactPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Contact heading="h1" standalone />
      <WhatHappensNext />
    </div>
  );
}
