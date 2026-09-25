import type { Metadata } from 'next';
import { site } from '@/content';
import { pageMetadata } from '@/lib/metadata';
import { faqPage, jsonLd } from '@/lib/structured-data';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Teaching } from '@/components/sections/Teaching';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
import { Contact } from '@/components/sections/Contact';

export const metadata: Metadata = pageMetadata({
  title: site.title,
  description: site.description,
  path: '/',
  absolute: true,
});

/**
 * The page the whole site is really about. Ordered the way a stranger decides:
 * what she does, who she is, what others say, what is stopping them, and how
 * to reach her.
 */
export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqPage())} />
      <Hero />
      <Services />
      <About />
      <Testimonials />
      <Teaching />
      <Faq />
      <Contact />
    </>
  );
}
