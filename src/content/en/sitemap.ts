/** The human-readable site map at /sitemap.html. */

import { site } from './site';

export const siteMap = {
  href: '/sitemap.html',
  footerLabel: 'Site map',
  meta: {
    title: 'Site map',
    description: `Every page on the ${site.brand} site: consultations, classes, and how to reach Anjali Jain.`,
  },
  heading: 'Every page on the *site*',
  groups: {
    practice: 'The practice',
    consultations: 'Consultations',
    booking: 'Book online',
    policies: 'Notices',
  },
  /** Labels for pages whose own title is written for search, not for a list. */
  labels: {
    home: 'Home',
    about: 'About Anjali',
    teaching: 'Classes',
    testimonials: 'Testimonials',
    contact: 'Contact',
    bookPrefix: 'Book',
  },
} as const;
