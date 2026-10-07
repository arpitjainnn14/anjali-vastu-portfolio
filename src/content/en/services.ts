/** The three consultations: the home page list and each service page. */

import { consultationFee, type Fee } from './booking';

export type Service = {
  slug: string;
  name: string;
  /** Icon key; see components/ui/Icons.tsx */
  icon: 'sun' | 'grid' | 'compass';
  /** One line: the kind of question this service answers. */
  question: string;
  /** The home page list: the longer description under the name. */
  summary: string;
  /** The service page's h1. */
  heading: string;
  /** The service page's opening paragraph. */
  intro: string;
  /** Not-live wording; step 1 is swapped for `liveFirstStep` once booking is live. */
  steps: readonly { title: string; body: string }[];
  /** Step 1 once online booking is live. null: the service is never booked online. */
  liveFirstStep: { title: string; body: string } | null;
  /** The line above the closing button at the foot of a service page. */
  closing: string;
  /** The WhatsApp button's label while the service is not booked online. */
  whatsappLabel: string;
  /** At a glance, "Includes": what the fee buys beyond the session. */
  includes: string;
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
    question: 'Best for: questions about career, marriage and timing',
    summary:
      'Many people reach out to Anjali when life feels stuck, or when a big decision ' +
      'is coming up and they want to know if the timing is right. In a Vedic ' +
      'astrology (Jyotish) reading, she studies your birth chart, looks at planetary ' +
      'positions, and checks which dasha period you are in. Then she explains in ' +
      'simple language what this phase is likely to bring and when you might see ' +
      'changes. Each reading is built around the specific question you came with.',
    heading: 'Vedic Astrology Consultation with Anjali',
    intro:
      'Vedic astrology is about looking at your birth chart through the lens of the ' +
      'question you came with. Anjali studies where the planets are placed and which ' +
      'dasha period you are in. Then she explains, in simple words, what this phase ' +
      'is likely to bring and when you might start to see changes. Her Jyotish ' +
      'readings are for anyone facing a big decision around career, marriage or timing.',
    steps: [
      {
        title: 'Message her first',
        body:
          'Tell Anjali briefly what is on your mind, on WhatsApp or through the form. ' +
          'She will tell you whether a Vedic astrology reading is the right fit, or ' +
          'whether numerology or Vastu would suit it better.',
      },
      {
        title: 'Send her your birth details',
        body:
          'For a birth chart reading, she needs your date, time and place of birth. ' +
          'The exact birth time matters more than most people realise, so if you can, ' +
          'confirm it with your family or your birth certificate before the session.',
      },
      {
        title: 'Have your consultation',
        body:
          'Meet her in person in Palwal or talk over the phone, in English or Hindi, ' +
          'whichever feels more comfortable. There is no fixed time limit, so you can ' +
          'ask everything that is on your mind.',
      },
      {
        title: 'Call her for three months',
        body:
          'After your reading, you can call Anjali directly for three months with any ' +
          'follow-up questions. If she suggests a remedy, she will tell you the cost ' +
          'first, and you can decide. Remedies are always optional.',
      },
    ],
    liveFirstStep: {
      title: 'Book a time, or message her first',
      body:
        'You can book and pay for a Vedic astrology or numerology consultation online. ' +
        'If you are not sure which reading you need, or you are interested in Vastu, ' +
        'just message Anjali on WhatsApp. She will help you choose the right option.',
    },
    closing: 'Ready to begin?',
    whatsappLabel: 'Ask about Vedic astrology on WhatsApp',
    includes: 'Three months of calling Anjali directly for follow-ups',
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
    question: 'Best for: names, important dates and new beginnings',
    summary:
      'Starting a business, naming a baby, or wondering if your name is helping or ' +
      'holding you back? Anjali goes through your name and date of birth number by ' +
      'number and tells you clearly what they suggest. If a name correction would be ' +
      'useful, she will recommend it. If it is not worth changing, she will tell you that too.',
    heading: 'Numerology Consultation with Anjali',
    intro:
      'Numerology looks at the numbers hidden in your name and date of birth. Anjali ' +
      'goes through them one by one and tells you plainly what they suggest, and ' +
      'whether a name correction is actually worth doing. People come to her when ' +
      'they are starting a business, naming a child, or simply wondering if their ' +
      'name is helping or holding them back.',
    steps: [
      {
        title: 'Message her first',
        body:
          'Tell Anjali briefly what is on your mind, on WhatsApp or through the form. ' +
          'She will tell you whether numerology is the right fit, or whether a Vedic ' +
          'astrology reading or Vastu would suit it better.',
      },
      {
        title: 'Send her your name and date of birth',
        body:
          'For a numerology reading, she needs your full name and date of birth. If ' +
          'you are asking about a child’s name or a business name, tell her that too, ' +
          'so she can read the numbers with your specific question in mind.',
      },
      {
        title: 'Have your consultation',
        body:
          'Meet her in person in Palwal or talk over the phone, in English or Hindi, ' +
          'whichever feels more comfortable. There is no fixed time limit, so you can ' +
          'ask everything that is on your mind.',
      },
      {
        title: 'Call her for three months',
        body:
          'After your numerology reading, you can call Anjali directly for three ' +
          'months with any follow-up questions. If she suggests a remedy, she will ' +
          'tell you the cost first, and you can decide. Remedies are always optional.',
      },
    ],
    liveFirstStep: {
      title: 'Book a time, or message her first',
      body:
        'You can book and pay for a numerology consultation online. If you are not ' +
        'sure whether you need numerology, astrology or Vastu, just message Anjali on ' +
        'WhatsApp. She will help you choose the right option.',
    },
    closing: 'Ready to begin?',
    whatsappLabel: 'Ask about numerology on WhatsApp',
    includes: 'Three months of calling Anjali directly for follow-ups',
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
    question: 'Best for: homes or shops that do not feel quite right',
    summary:
      'Sometimes a space just feels heavy or “off”, and you cannot explain why. ' +
      'Anjali looks at direction, layout and placement, always keeping the people ' +
      'who live or work there in mind. Vastu for homes and Vastu for shops are ' +
      'offered as complete packages: one fee, with site visits as needed until the ' +
      'building work is finished. Message her on WhatsApp for full details.',
    heading: 'Vastu Consultation with Anjali',
    intro:
      'Vastu looks at how direction, layout and placement affect the way a space ' +
      'feels. Whether it is Vastu for a home or for a shop you work in every day, ' +
      'Anjali studies the space around the people who actually live and work there. ' +
      'Many people reach out to her when a place feels heavy or “off”, and they ' +
      'cannot explain why. Vastu is offered as a complete package: one fee, with ' +
      'site visits included until the building work is finished.',
    steps: [
      {
        title: 'Message Anjali on WhatsApp',
        body:
          'Vastu consultations are not booked online. Just send her a message, and ' +
          'she will reply personally with details about the package and the fee ' +
          'before anything is arranged.',
      },
      {
        title: 'Send her your plan or photos',
        body:
          'A floor plan or a few clear photos of your home or shop is enough to get ' +
          'started. If you are not sure what to send, ask her and she will guide you.',
      },
      {
        title: 'Have your consultation',
        body:
          'She will walk through your space with you, either in person in Palwal or ' +
          'over the phone, in English or Hindi, whichever you prefer. There is no ' +
          'fixed time limit, so you can ask everything that is on your mind.',
      },
      {
        title: 'Site visits until the building is complete',
        body:
          'Because Vastu is a package, you do not pay again for each visit. Anjali ' +
          'stays involved until the building work is complete. If a remedy such as a ' +
          'Vastu yantra might help, she will tell you the cost first. Remedies are ' +
          'always optional.',
      },
    ],
    liveFirstStep: null,
    closing: 'Have a home or shop that does not feel quite right?',
    whatsappLabel: 'Ask about Vastu on WhatsApp',
    includes: 'Site visits until the building is complete',
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
    'Every question is different, so Anjali offers three types of consultations. ' +
    'Choose the one that fits your situation, or just tell her what is on your mind ' +
    'and she will guide you to the right option.',
  /** Shown instead of a price for a service not booked online (Vastu). */
  priceOnRequest: 'Fee shared on WhatsApp',
  /** After the price of a service booked online. */
  feeIncludes: 'which includes three months of follow-up calls',
  needLabel: 'You will need',
  /** What a service needs, as it reads after "You will need:" — lower-cased, with a full stop. */
  needLine: (value: string) => `${value.charAt(0).toLowerCase()}${value.slice(1)}.`,
  footnote: 'Every consultation is available in English or Hindi, in person in Palwal or by phone.',
} as const;

/**
 * Step 1's wording once online booking is live. Swapped in for `howItWorks[0]`
 * by `howItWorksSteps` in `lib/booking.ts`.
 */
export const bookFirstStepLive = {
  title: 'Book a time, or message her first',
  body:
    'A chart reading or numerology consultation can be booked and paid for ' +
    'online. For Vastu, or if you are not sure which you need, message her on ' +
    'WhatsApp and she will point you to the right one.',
} as const;

/**
 * How it works, shown on every service detail page and the contact page.
 * DRAFTED. Anjali reads and corrects it before it ships. It must read true for
 * Vastu too, which is arranged on WhatsApp rather than booked online. Step 1
 * here is the not-yet-live wording; see `bookFirstStepLive` above.
 */
export const howItWorks = [
  {
    title: 'Message her on WhatsApp, or send the form',
    body:
      'Say briefly what is on your mind. She will tell you whether a chart ' +
      'reading is the right fit, or whether numerology or Vastu suits it ' +
      'better.',
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
      'After a chart reading or numerology consultation, you can call Anjali ' +
      'directly for three months with follow-up questions. If a remedy such as ' +
      'a Vastu yantra would help, she tells you what it costs first. Remedies ' +
      'are always optional.',
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
    includes: 'Includes',
  },
  glanceWhere: 'In person in Palwal, or by phone',
  /** Services booked online only. The calendar blocks an hour; she does not stop at one. */
  glanceLength: 'No fixed time limit',
  glanceFees: 'Package pricing; full details shared on WhatsApp',
  reassurance: 'Anjali replies herself. There is no assistant.',
  otherHeading: 'Other consultations',
} as const;
