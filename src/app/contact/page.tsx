import type { Metadata } from 'next';
import { Contact } from '@/components/sections/Contact';
import { contactSection, site } from '@/content';

export const metadata: Metadata = {
  title: 'Contact',
  description: contactSection.lead,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `Contact — ${site.name}`,
    description: contactSection.lead,
    url: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Contact heading="h1" />
    </div>
  );
}
