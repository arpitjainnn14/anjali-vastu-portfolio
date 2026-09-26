/** The three consultations: the home page list and each service page. */

import { consultationFee, type Fee } from './booking';

export type Service = {
  slug: string;
  name: string;
  /** Icon key; see components/ui/Icons.tsx */
  icon: 'sun' | 'grid' | 'compass';
  /** One line: the kind of question this service answers. */
  question: string;
  summary: string;
  /** Search result title and description. Keep under ~60 and ~160 characters. */
  meta: { title: string; description: string };
  detailLinkLabel: string;
  /** Service detail page: 4–5 lines, each naming something she actually looks at. */
  covers: string[];
  /** What a student/client needs to bring or know. */
  youWillNeed: string;
  /** Booked and paid online through Cal ID. null: arranged on WhatsApp only. */
  booking: { calSlug: string; fee: Fee } | null;
};

export const services: Service[] = [
  {
    slug: 'vedic-astrology',
    name: 'Vedic Astrology',
    icon: 'sun',
    question: 'For questions about career, marriage and timing',
    summary:
      'Your birth chart, read against the question you came with. Anjali looks at ' +
      'where the planets sit and which dasha you are running, then explains what ' +
      'this period is likely to bring and when things may shift.',
    meta: {
      title: 'Vedic Astrology Consultation in Palwal',
      description:
        'Your birth chart read for career, marriage and timing, in person in Palwal or by ' +
        'phone, in English or Hindi. Bring your birth date, time and place.',
    },
    detailLinkLabel: 'What a reading covers',
    covers: [
      'TODO(vedic-covers-1)',
      'TODO(vedic-covers-2)',
      'TODO(vedic-covers-3)',
      'TODO(vedic-covers-4)',
    ],
    youWillNeed: 'Birth date, time and place',
    booking: { calSlug: 'vedic-astrology', fee: consultationFee },
  },
  {
    slug: 'numerology',
    name: 'Numerology',
    icon: 'grid',
    question: 'For names, dates and new beginnings',
    summary:
      'Your name and date of birth, worked through number by number. She tells you ' +
      'what they point to, and whether a name correction is actually worth making.',
    meta: {
      title: 'Numerologist in Palwal: Name and Date Readings',
      description:
        'Your name and date of birth, worked through number by number, and a straight ' +
        'answer on whether a name correction is worth it. In Palwal or by phone.',
    },
    detailLinkLabel: 'What a reading covers',
    covers: [
      'TODO(numerology-covers-1)',
      'TODO(numerology-covers-2)',
      'TODO(numerology-covers-3)',
      'TODO(numerology-covers-4)',
    ],
    youWillNeed: 'Full name and date of birth',
    booking: { calSlug: 'numerology', fee: consultationFee },
  },
  {
    slug: 'vastu',
    name: 'Vastu',
    icon: 'compass',
    question: 'For a home or shop that does not feel right',
    summary:
      'Direction, layout and placement for a home or a shop, assessed around the ' +
      'people who actually live and work in it.',
    meta: {
      title: 'Vastu Consultant in Palwal for Homes and Shops',
      description:
        'Vastu for a home or shop: direction, layout and placement, assessed around the ' +
        'people who use it. In person in Palwal or by phone, in English or Hindi.',
    },
    detailLinkLabel: 'What a consultation covers',
    covers: [
      'TODO(vastu-covers-1)',
      'TODO(vastu-covers-2)',
      'TODO(vastu-covers-3)',
      'TODO(vastu-covers-4)',
    ],
    youWillNeed: 'A plan or photographs of the space',
    booking: null,
  },
];

export const servicesSection = {
  heading: 'Three ways Anjali can *help*',
  lead:
    'Each one suits a different kind of question. Not sure which you need? Tell her ' +
    'what is going on and she will point you to the right one.',
  /** Shown instead of a price for a service not booked online (Vastu). */
  priceOnRequest: 'Fees shared on WhatsApp',
  needLabel: 'You will need',
  footnote: 'Every consultation is available in English or Hindi, in person in Palwal or by phone.',
} as const;

/**
 * How it works, shown on every service detail page and the contact page.
 * DRAFTED. Anjali reads and corrects it before it ships. It must read true for
 * Vastu too, which is arranged on WhatsApp rather than booked online.
 */
export const howItWorks = [
  {
    title: 'Book a time, or message her first',
    body:
      'A chart reading or numerology consultation can be booked and paid for ' +
      'online. For Vastu, or if you are not sure which you need, message her on ' +
      'WhatsApp and she will point you to the right one.',
  },
  {
    title: 'Send her the details she needs',
    body:
      'For a chart reading, your date, time and place of birth. For numerology, ' +
      'your full name and date of birth. For Vastu, a plan or photographs of the ' +
      'space. For a chart, the birth time matters more than most people expect, ' +
      'so check it beforehand if you can.',
  },
  {
    title: 'The consultation',
    body:
      'In person in Palwal or over the phone, in English or Hindi, whichever you ' +
      'are more comfortable with. There is no fixed time limit.',
  },
  {
    title: 'Three months of calls',
    body:
      'For three months after your consultation you can call Anjali directly ' +
      'with follow-up questions. If a remedy such as a Vastu yantra would help, ' +
      'she tells you what it costs first. Remedies are always optional.',
  },
] as const;

/**
 * Service detail page chrome.
 *
 * These strings were on the Service-Detail board but not in the original
 * original content.ts. Added here rather than hardcoded in the component, so the rule
 * "every string the visitor reads lives here" still holds.
 */
export const serviceDetail = {
  breadcrumbLabel: 'Breadcrumb',
  breadcrumbRoot: 'Services',
  howItWorksHeading: 'How it works',
  glanceHeading: 'At a glance',
  glanceLabels: {
    where: 'Where',
    languages: 'Languages',
    length: 'Length',
    youWillNeed: 'You will need',
    fees: 'Fees',
  },
  glanceWhere: 'In person in Palwal, or by phone',
  /** Services booked online only. The calendar blocks an hour; she does not stop at one. */
  glanceLength: 'No fixed time limit',
  glanceFees: 'Shared on WhatsApp',
  ctaLabel: 'Ask about this on WhatsApp',
  reassurance: 'Anjali replies herself. There is no assistant.',
  otherHeading: 'Other consultations',
} as const;
