import type { Metadata } from 'next';
import { Contact } from '@/components/sections/Contact';
import { contactSection } from '@/content';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({ ...contactSection.meta, path: '/contact' });

export default function ContactPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Contact heading="h1" />
    </div>
  );
}
