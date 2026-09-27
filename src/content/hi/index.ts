/**
 * The Hindi content bundle: every string a Hindi-reading visitor sees.
 *
 * DRAFTED by translation from en/. Anjali reads and corrects it before
 * `hindiLive` (shared.ts) is switched on; docs/hindi-review/hi-site-text.md
 * is the side-by-side copy for her review. `Content` (../locale.ts) keeps
 * the shape identical to English, parity.test.ts checks it at runtime, and
 * identifiers.test.ts checks that slugs, icons, hrefs and weights are
 * untouched.
 *
 * Style: everyday Hindi in Devanagari, warm and plain, as a person would say
 * it. The visitor is always "आप"; Anjali is "अंजलि जी" in running text and
 * "अंजलि जैन" where the English uses her full name (meta text, legal pages,
 * captions). She is referred to as "वे" with plural verbs (वे बताती हैं).
 * Sentences end in "।".
 *
 * Glossary: use these, everywhere.
 *
 *   Kept in Latin letters
 *     Anjali Vastu & Astro Divine Solutions (the brand), WhatsApp, UPI, Ph.D.,
 *     Razorpay, Cal ID, Forminit, ₹2,151, the email address, and
 *     "consultation" (masculine: "आपका consultation", "consultation बुक हो
 *     गया"). Testimonial quotes, titles and names stay as the client wrote them.
 *
 *   English words written in Devanagari
 *     online → ऑनलाइन          book / booking → बुक करें / बुकिंग
 *     payment → पेमेंट          fee → फ़ीस
 *     email → ईमेल             form → फ़ॉर्म
 *     message → मैसेज          call → कॉल
 *     calendar → कैलेंडर        confirmation → कन्फ़र्मेशन
 *     refund → रिफ़ंड           cancel / cancellation → कैंसिल / कैंसिलेशन
 *     package → पैकेज          site visit → साइट विज़िट
 *     class → क्लास            course → कोर्स
 *     batch → बैच              student → स्टूडेंट
 *     client → क्लाइंट          video call → वीडियो कॉल
 *     professional → प्रोफ़ेशनल  practice → प्रैक्टिस
 *
 *   Hindi words
 *     Vedic astrology → वैदिक ज्योतिष     astrology → ज्योतिष
 *     astrologer → ज्योतिषी               numerology → अंकशास्त्र (as on the seal)
 *     numerologist → अंकशास्त्री           Vastu → वास्तु
 *     birth chart / chart reading → कुंडली / कुंडली देखना
 *     dasha → दशा     ascendant → लग्न     remedy → उपाय     yantra → यंत्र
 *     name correction → नाम में सुधार
 *     date / time / place of birth → जन्म की तारीख / जन्म का समय / जन्म का स्थान
 *     reschedule → समय बदलना           services → सेवाएँ
 *     testimonials → अनुभव              about → परिचय (nav), अंजलि जी के बारे में
 *     teaching (the page) → सीखें        contact → संपर्क
 *     in person in Palwal → पलवल में मिलकर     by phone → फ़ोन पर
 *     English and Hindi → हिंदी और अंग्रेज़ी (Hindi first on Hindi pages)
 *     "a straight answer" → सीधा जवाब     "plainly" → साफ़-साफ़
 *
 *   Spelling: nukta on फ़ and ज़ (फ़ीस, फ़ोन, ज़रूरी); chandrabindu in
 *   सेवाएँ, जाएँ, पाँच.
 */

import { site, seal, contact, whatsappMessages } from './site';
import { nav, footer, notFound } from './navigation';
import { hero } from './hero';
import {
  services,
  servicesSection,
  bookFirstStepLive,
  howItWorks,
  serviceDetail,
} from './services';
import { booking } from './booking';
import { picker } from './picker';
import { about } from './about';
import { teaching } from './teaching';
import { testimonials, testimonialsSection } from './testimonials';
import { faq } from './faq';
import { contactSection, form } from './contact';
import { privacy } from './privacy';
import { terms, refundPolicy, policyPages } from './policies';
import { siteMap } from './sitemap';
import type { Content } from '../locale';

export const hi: Content = {
  site,
  seal,
  contact,
  whatsappMessages,
  nav,
  footer,
  hero,
  services,
  servicesSection,
  bookFirstStepLive,
  howItWorks,
  serviceDetail,
  booking,
  picker,
  about,
  teaching,
  testimonials,
  testimonialsSection,
  faq,
  contactSection,
  form,
  privacy,
  terms,
  refundPolicy,
  policyPages,
  siteMap,
  notFound,
};
