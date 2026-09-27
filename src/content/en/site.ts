/** Who she is and how to reach her. The facts every other module leans on. */

import { brand, brandLines, practisingSince, geo } from '../shared';

export const site = {
  /**
   * The business the site is branded as. `name` below stays the practitioner:
   * copy about her, the seal and the Person in the structured data use it.
   */
  brand,
  /** The header and footer wordmark, set on two lines so it fits beside the menu. */
  brandLines,
  name: 'Anjali Jain',
  // Spelling confirmed as "Anjali Jain". Her Rotary badge reads ANJALLI;
  // that spelling is not used anywhere on this site.
  legalName: 'Anjali Jain',
  /**
   * Home page search title and description. Titles stay under ~60 characters
   * and descriptions under ~160 so Google shows them whole; the search people
   * actually type ("astrologer in Palwal") leads.
   */
  title: 'Anjali Vastu & Astro Divine Solutions | Astrologer in Palwal',
  description:
    'Vedic astrology, numerology and Vastu with Anjali Jain, Ph.D. in Astrology and Vastu. ' +
    'In person in Palwal or by phone, in English or Hindi.',
  locale: 'en-IN',
  city: geo.city,
  state: geo.state,
  /** City and state as a line of visible copy (the policy pages, the menu). */
  place: `${geo.city}, ${geo.state}`,
  /** Street address is deliberately not published. City plus a map link only. */
  mapsUrl: 'TODO(google-maps-link)',
  languages: 'English and Hindi',
  practisingSince,
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

/** The same in every language: defined once in shared.ts. */
export { contact } from '../shared';

/** Prefilled WhatsApp openers. Keep them short; long ones look automated. */
export const whatsappMessages = {
  general: 'Hello Anjali, I found your website and wanted to ask about a consultation.',
  service: (name: string) => `Hello Anjali, I wanted to ask about a ${name} consultation.`,
  teaching: 'Hello Anjali, I wanted to ask about the next teaching batch.',
} as const;
