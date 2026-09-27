/** The nav bar and the footer. */

import { contact, site } from './site';
import { siteMap } from './sitemap';

export const nav = {
  labels: {
    skipToContent: 'सीधे मुख्य हिस्से पर जाएँ',
    main: 'मुख्य',
    menu: 'मेन्यू',
    openMenu: 'मेन्यू खोलें',
    closeMenu: 'मेन्यू बंद करें',
  },
  links: [
    { label: 'सेवाएँ', href: '/#services' },
    { label: 'परिचय', href: '/about' },
    { label: 'सीखें', href: '/teaching' },
    { label: 'अनुभव', href: '/#testimonials' },
    { label: 'संपर्क', href: '/contact' },
  ],
} as const;

export const footer = {
  blurb:
    'वैदिक ज्योतिष, अंकशास्त्र और वास्तु। पलवल में और फ़ोन पर consultation, ' +
    'और ऑनलाइन क्लास। 2017 से यह काम कर रही हैं।',
  signoff: 'जो सवाल सच में मन में है, वही पूछें।',
  columns: [
    {
      heading: 'सेवाएँ',
      showMeta: false,
      links: [
        { label: 'वैदिक ज्योतिष', href: '/services/vedic-astrology' },
        { label: 'अंकशास्त्र', href: '/services/numerology' },
        { label: 'वास्तु', href: '/services/vastu' },
        { label: 'सीखें', href: '/teaching' },
      ],
    },
    {
      heading: 'जानकारी',
      showMeta: false,
      links: [
        { label: 'अंजलि जी के बारे में', href: '/about' },
        { label: 'अनुभव', href: '/#testimonials' },
        { label: 'संपर्क', href: '/contact' },
        { label: 'आपकी जानकारी का उपयोग', href: '/privacy' },
        { label: 'Consultation की शर्तें', href: '/terms' },
        { label: 'रिफ़ंड और कैंसिलेशन', href: '/refund-policy' },
        { label: siteMap.footerLabel, href: siteMap.href },
      ],
    },
    {
      heading: 'संपर्क करें',
      showMeta: true,
      links: [{ label: 'WhatsApp', href: contact.whatsappUrl }],
    },
  ],
  meta: ['पलवल, हरियाणा', 'हिंदी और अंग्रेज़ी'],
  copyright: `© ${new Date().getFullYear()} ${site.brand}`,
  practitioner: `${site.name}, ${site.credential}`,
} as const;

/** The page for an address that doesn't exist. */
export const notFound = {
  title: '404: यह पेज नहीं मिला।',
  code: '404',
  message: 'यह पेज नहीं मिला।',
} as const;
