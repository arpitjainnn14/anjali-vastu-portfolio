/** The nav bar and the footer. */

import { contact, site } from './site';
import { siteMap } from './sitemap';

export const nav = {
  /** Screen-reader labels for the bar and the mobile menu. */
  labels: {
    skipToContent: 'Skip to content',
    main: 'Main',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  /**
   * No separate call-to-action button in the bar. The page already asks for a
   * WhatsApp message in the hero, beside every service and in the contact
   * section, so a nav button only repeated it. Contact is a plain link.
   */
  links: [
    { label: 'Services', href: '/#services' },
    { label: 'About', href: '/about' },
    { label: 'Teaching', href: '/teaching' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;

export const footer = {
  blurb:
    'Vedic astrology, numerology and Vastu. Consultations in Palwal and by phone, ' +
    'classes online. Reading since 2017.',
  signoff: 'Ask the question you actually came with.',
  columns: [
    {
      heading: 'Services',
      showMeta: false,
      links: [
        { label: 'Vedic Astrology', href: '/services/vedic-astrology' },
        { label: 'Numerology', href: '/services/numerology' },
        { label: 'Vastu', href: '/services/vastu' },
        { label: 'Teaching', href: '/teaching' },
      ],
    },
    {
      heading: 'Practice',
      showMeta: false,
      links: [
        { label: 'About Anjali', href: '/about' },
        { label: 'Testimonials', href: '/testimonials' },
        { label: 'Contact', href: '/contact' },
        { label: 'How your details are used', href: '/privacy' },
        { label: 'Terms of consultation', href: '/terms' },
        { label: 'Refunds and cancellations', href: '/refund-policy' },
        { label: siteMap.footerLabel, href: siteMap.href },
      ],
    },
    {
      /*
       * WhatsApp only. The number is the same on both, so listing it twice
       * asked the visitor to choose between two spellings of one thing —
       * and WhatsApp is the route Anjali actually wants.
       */
      heading: 'Reach her',
      /* Where `meta` (city, languages) is listed, under the links. */
      showMeta: true,
      links: [{ label: 'WhatsApp', href: contact.whatsappUrl }],
    },
  ],
  meta: ['Palwal, Haryana', 'English and Hindi'],
  copyright: `© ${new Date().getFullYear()} ${site.brand}`,
  /** Under the wordmark: who the practice is. */
  practitioner: `${site.name}, ${site.credential}`,
} as const;

/** The page for an address that doesn't exist. */
export const notFound = {
  /** The browser tab. */
  title: '404: This page could not be found.',
  code: '404',
  message: 'This page could not be found.',
} as const;
