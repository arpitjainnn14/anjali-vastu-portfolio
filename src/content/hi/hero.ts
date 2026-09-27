/** The home page hero. */

import { contact } from './site';

export const hero = {
  standfirst: 'पलवल, हरियाणा में वैदिक ज्योतिष, अंकशास्त्र और वास्तु',
  /**
   * Two lines: "ज्योतिष, जो दे / एक *सीधा* जवाब।" Line 2 must fit ~596px at the
   * desktop display size; "आपको सीधा जवाब।" wrapped, so "you" is left implied.
   */
  headingLine1: 'ज्योतिष, जो दे',
  headingLine2Before: 'एक ',
  headingAccent: 'सीधा',
  headingAfter: ' जवाब।',
  lead:
    'अंजलि जी आपकी कुंडली, आपके अंक और आपका घर देखती हैं, फिर काम, शादी, परिवार और ' +
    'सही समय के बारे में जो दिखता है, वह साफ़-साफ़ बताती हैं। हिंदी या अंग्रेज़ी में, ' +
    'पलवल में मिलकर या फ़ोन पर।',
  primaryCta: { label: 'अंजलि जी को WhatsApp करें', href: contact.whatsappUrl },
  secondaryCta: { label: 'सेवाएँ देखें', href: '/#services' },
  /** Ginni Sharma's own words, in English as she wrote them. Only the label is translated. */
  proof: {
    quote: 'She is patient, gives you ample time to explain your concerns, and listens without rushing…',
    name: 'Ginni Sharma',
    role: 'क्लाइंट',
  },
  credentials:
    '1995 से अध्ययन · 2017 से प्रोफ़ेशनल प्रैक्टिस · ' +
    'ज्योतिष और वास्तु में Ph.D. · हिंदी और अंग्रेज़ी में consultation',
} as const;
