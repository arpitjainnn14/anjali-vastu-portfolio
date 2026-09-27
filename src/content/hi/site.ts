/** Who she is and how to reach her. The facts every other module leans on. */

import { brand, brandLines, practisingSince, geo } from '../shared';

export const site = {
  /** The business name stays in English on Hindi pages. */
  brand,
  brandLines,
  name: 'अंजलि जैन',
  /** Her legal name, as it is written on documents: kept in Latin letters. */
  legalName: 'Anjali Jain',
  /** Home page search title and description: under ~60 and ~160 characters. */
  title: 'Anjali Vastu & Astro Divine Solutions | पलवल में ज्योतिषी',
  description:
    'अंजलि जैन (ज्योतिष और वास्तु में Ph.D.) के साथ वैदिक ज्योतिष, अंकशास्त्र और वास्तु। ' +
    'पलवल में मिलकर या फ़ोन पर, हिंदी या अंग्रेज़ी में।',
  locale: 'hi-IN',
  /* City and state are shared facts (structured data uses them); running text spells them पलवल, हरियाणा. */
  city: geo.city,
  state: geo.state,
  /** City and state as a line of visible copy (the policy pages, the menu). */
  place: 'पलवल, हरियाणा',
  mapsUrl: 'TODO(google-maps-link)',
  languages: 'हिंदी और अंग्रेज़ी',
  practisingSince,
  credential: 'ज्योतिष और वास्तु में Ph.D.',
  replyWithin: '24 घंटे के अंदर',
} as const;

/** The seal is the same stamp in both languages; only the screen-reader text is translated. */
export const seal = {
  arcTop: 'ज्योतिष · अंकशास्त्र · वास्तु',
  arcBottom: 'PALWAL · SINCE 2017',
  name: ['अंजलि', 'जैन'],
  alt: 'ज्योतिषी अंजलि जैन की मुहर, पलवल, 2017 से प्रैक्टिस में',
} as const;

export { contact } from '../shared';

/** Prefilled WhatsApp openers. Short and natural, as a person would type them. */
export const whatsappMessages = {
  general: 'नमस्ते अंजलि जी, मैंने आपकी वेबसाइट देखी। मुझे consultation के बारे में पूछना था।',
  service: (name: string) => `नमस्ते अंजलि जी, मुझे ${name} consultation के बारे में पूछना था।`,
  teaching: 'नमस्ते अंजलि जी, मुझे क्लास के अगले बैच के बारे में पूछना था।',
} as const;
