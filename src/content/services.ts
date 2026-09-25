/** The three consultations: the home page list and each service page. */

export type Service = {
  slug: string;
  name: string;
  /** Icon key; see components/ui/Icons.tsx */
  icon: 'sun' | 'grid' | 'compass';
  /** One line: the kind of question this service answers. */
  question: string;
  summary: string;
  detailLinkLabel: string;
  /** Service detail page: 4–5 lines, each naming something she actually looks at. */
  covers: string[];
  /** What a student/client needs to bring or know. */
  youWillNeed: string;
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
    detailLinkLabel: 'What a reading covers',
    covers: [
      'TODO(vedic-covers-1)',
      'TODO(vedic-covers-2)',
      'TODO(vedic-covers-3)',
      'TODO(vedic-covers-4)',
    ],
    youWillNeed: 'Birth date, time and place',
  },
  {
    slug: 'numerology',
    name: 'Numerology',
    icon: 'grid',
    question: 'For names, dates and new beginnings',
    summary:
      'Your name and date of birth, worked through number by number. She tells you ' +
      'what they point to, and whether a name correction is actually worth making.',
    detailLinkLabel: 'What a reading covers',
    covers: [
      'TODO(numerology-covers-1)',
      'TODO(numerology-covers-2)',
      'TODO(numerology-covers-3)',
      'TODO(numerology-covers-4)',
    ],
    youWillNeed: 'Full name and date of birth',
  },
  {
    slug: 'vastu',
    name: 'Vastu',
    icon: 'compass',
    question: 'For a home or shop that does not feel right',
    summary:
      'Direction, layout and placement for a home or a shop, assessed around the ' +
      'people who actually live and work in it.',
    detailLinkLabel: 'What a consultation covers',
    covers: [
      'TODO(vastu-covers-1)',
      'TODO(vastu-covers-2)',
      'TODO(vastu-covers-3)',
      'TODO(vastu-covers-4)',
    ],
    youWillNeed: 'A plan or photographs of the space',
  },
];

export const servicesSection = {
  heading: 'Three ways Anjali can *help*',
  lead:
    'Each one suits a different kind of question. Not sure which you need? Tell her ' +
    'what is going on and she will point you to the right one.',
  /** Shown on every row in place of a price. Pricing is never published. */
  priceLine: 'Fees shared on WhatsApp',
  needLabel: 'You will need',
  footnote: 'Every consultation is available in English or Hindi, in person in Palwal or by phone.',
} as const;

/** How it works, shown on every service detail page. */
export const howItWorks = [
  {
    title: 'Message her on WhatsApp, or send the form',
    body:
      'Say briefly what is on your mind. She will tell you whether a chart reading ' +
      'is the right fit, or whether numerology or Vastu suits it better.',
  },
  {
    title: 'She asks for the details she needs',
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
      'are more comfortable with.',
  },
  {
    title: 'TODO(after-consultation-title)',
    body: 'TODO(after-consultation-body: anything in writing? follow-up questions, for how long?)',
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
    youWillNeed: 'You will need',
    fees: 'Fees',
  },
  glanceWhere: 'In person in Palwal, or by phone',
  glanceFees: 'Shared on WhatsApp',
  ctaLabel: 'Ask about this on WhatsApp',
  reassurance: 'Anjali replies herself. There is no assistant and no booking desk.',
  otherHeading: 'Other consultations',
} as const;
