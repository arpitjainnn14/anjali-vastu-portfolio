/** The human-readable site map at /sitemap.html. */

import { site } from './site';

export const siteMap = {
  href: '/sitemap.html',
  footerLabel: 'साइट मैप',
  meta: {
    title: 'साइट मैप',
    description: `${site.brand} की साइट के सभी पेज: consultation, क्लास, और अंजलि जैन से संपर्क कैसे करें।`,
  },
  heading: 'साइट के सभी *पेज*',
  groups: {
    practice: 'प्रैक्टिस',
    consultations: 'Consultation',
    booking: 'ऑनलाइन बुकिंग',
    policies: 'नियम और सूचनाएँ',
  },
  labels: {
    home: 'होम',
    about: 'अंजलि जी के बारे में',
    teaching: 'क्लास',
    contact: 'संपर्क',
    bookPrefix: 'बुकिंग:',
  },
} as const;
