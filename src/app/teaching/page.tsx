import type { Metadata } from 'next';
import { Teaching } from '@/components/sections/Teaching';
import { Contact } from '@/components/sections/Contact';
import { teaching, site } from '@/content';

export const metadata: Metadata = {
  title: 'Teaching',
  description: teaching.lead,
  alternates: { canonical: '/teaching' },
  openGraph: {
    title: `Teaching — ${site.name}`,
    description: teaching.lead,
    url: '/teaching',
  },
};

export default function TeachingPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Teaching heading="h1" />
      <Contact />
    </div>
  );
}
