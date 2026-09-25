/** Who she is and how to reach her. The facts every other module leans on. */

export const site = {
  name: 'Anjali Jain',
  // Spelling confirmed as "Anjali Jain". Her Rotary badge reads ANJALLI;
  // that spelling is not used anywhere on this site.
  legalName: 'Anjali Jain',
  title: 'Astrologer Anjali Jain — Vedic Astrology, Numerology and Vastu in Palwal',
  description:
    'Vedic astrology, numerology and Vastu consultations with Astrologer Anjali Jain, ' +
    'Ph.D. in Astrology and Vastu. In person in Palwal or by phone, in English and Hindi. ' +
    'Practising since 2017.',
  locale: 'en-IN',
  city: 'Palwal',
  state: 'Haryana',
  /** Street address is deliberately not published. City plus a map link only. */
  mapsUrl: 'TODO(google-maps-link)',
  languages: 'English and Hindi',
  practisingSince: 2017,
  credential: 'Ph.D. in Astrology & Vastu',
  replyWithin: 'within 24 hours',
} as const;

/**
 * The seal: her stamp, the way a practitioner inks a chart she has read.
 * Devanagari around the top, place and year around the bottom, name inside.
 */
export const seal = {
  arcTop: 'ज्योतिष · अंकशास्त्र · वास्तु',
  arcBottom: 'PALWAL · SINCE 2017',
  name: ['अंजलि', 'जैन'],
  /** Screen readers get the plain-English meaning, not the ornament. */
  alt: 'Seal of Astrologer Anjali Jain, Palwal, practising since 2017',
} as const;

export const contact = {
  /**
   * Text only, no calls for now. The site deliberately offers no tel: link and
   * never displays this number; it exists only as the source of the WhatsApp
   * link below. To allow calls again, add a phoneHref and render it.
   */
  phoneDisplay: '+91 97291 33317',
  whatsappNumber: '919729133317',
  whatsappUrl: 'https://wa.me/919729133317',
  /** Written route for data requests. Required by the privacy notice. */
  email: 'TODO(email-address)',
  forminitFormId: 'uu1xst97189',
  forminitEndpoint: 'https://forminit.com/f/uu1xst97189',
} as const;

/** Prefilled WhatsApp openers. Keep them short; long ones look automated. */
export const whatsappMessages = {
  general: 'Hello Anjali, I found your website and wanted to ask about a consultation.',
  service: (name: string) => `Hello Anjali, I wanted to ask about a ${name} consultation.`,
  teaching: 'Hello Anjali, I wanted to ask about the next teaching batch.',
} as const;
