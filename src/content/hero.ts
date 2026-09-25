/** The home page hero. */

import { contact } from './site';

export const hero = {
  /* Sits above the headline as a plain line, not a tracked-out caps label. */
  standfirst: 'Vedic astrology, numerology and Vastu in Palwal, Haryana',
  /** Two lines: "Astrology that gives you / a *straight* answer." */
  headingLine1: 'Astrology that gives you',
  headingLine2Before: 'a ',
  headingAccent: 'straight',
  headingAfter: ' answer.',
  lead:
    'Anjali Jain reads your birth chart, your numbers and your home, then tells you ' +
    'plainly what she sees about work, marriage, family and timing. In English or ' +
    'Hindi, in Palwal or over the phone.',
  primaryCta: { label: 'Message Anjali on WhatsApp', href: contact.whatsappUrl },
  secondaryCta: { label: 'See what she offers', href: '/#services' },
  /**
   * A verbatim excerpt from Ginni Sharma's testimonial below. Keep it an exact
   * substring of her words; the ellipsis marks the cut.
   */
  proof: {
    quote: 'She is patient, gives you ample time to explain your concerns, and listens without rushing…',
    name: 'Ginni Sharma',
    role: 'client',
  },
  /*
   * One line, not a row of stat boxes: the boxed "2017 | Ph.D. | EN" trio is
   * the most recognisable template furniture on a services site, and these
   * three facts read perfectly well as a sentence.
   */
  credentials:
    'Learning since 1995 · Reading professionally since 2017 · ' +
    'Ph.D. in Astrology and Vastu · Consultations in English and Hindi',
} as const;
