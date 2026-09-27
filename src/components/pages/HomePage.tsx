import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { pageMetadata } from '@/lib/metadata';
import { faqPage, jsonLd } from '@/lib/structured-data';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Teaching } from '@/components/sections/Teaching';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
import { Contact } from '@/components/sections/Contact';

export function homeMetadata(c: Content, locale: Locale): Metadata {
  return pageMetadata({
    title: c.site.title,
    description: c.site.description,
    path: '/',
    absolute: true,
    locale,
    c,
  });
}

/**
 * The page the whole site is really about. Ordered the way a stranger decides:
 * what she does, who she is, what others say, what is stopping them, and how
 * to reach her.
 */
export function HomePage({ c, locale }: { c: Content; locale: Locale }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqPage(c))} />
      <Hero c={c} locale={locale} />
      <Services c={c} locale={locale} />
      <About c={c} />
      <Testimonials c={c} />
      <Teaching c={c} />
      <Faq c={c} />
      <Contact c={c} />
    </>
  );
}
