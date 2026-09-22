import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { About } from '@/components/sections/About';
import { Teaching } from '@/components/sections/Teaching';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
import { Contact } from '@/components/sections/Contact';

/**
 * The page the whole site is really about. Ordered the way a stranger decides:
 * what she does, who she is, what others say, what is stopping them, and how
 * to reach her.
 */
export default function HomePage() {
  return (
    <>
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
