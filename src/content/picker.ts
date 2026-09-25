/**
 * "Which reading do I need?" — the three-question picker under the services.
 *
 * DRAFTED. Anjali reads and corrects this before the site ships: the answers
 * decide which of her services a stranger is pointed at, so the wording is
 * hers to approve.
 *
 * Each option carries a weight per service. The highest total wins; the order
 * of `services` breaks a tie. Weights, not a lookup table, because a question
 * like "a home that does not feel right" leans Vastu without ruling out a
 * chart reading.
 */

export type ServiceSlug = 'vedic-astrology' | 'numerology' | 'vastu';

export type PickerOption = {
  label: string;
  /** Points added per service. Anything omitted scores zero. */
  weights: Partial<Record<ServiceSlug, number>>;
  /** Folded into the WhatsApp message, so Anjali sees the answers. */
  echo: string;
};

export type PickerQuestion = {
  id: string;
  /** Asked as a heading, so it must read as a question. */
  prompt: string;
  options: PickerOption[];
};

export const picker = {
  /** The one-line invitation on the home page, which links to the page. */
  href: '/which-reading',
  linkLabel: 'Not sure which one? Answer three questions',

  /** The page itself. */
  pageTitle: 'Which reading do I need?',
  pageDescription:
    'Three questions that point you to Vedic astrology, numerology or Vastu, and write your message to Anjali for you.',
  pageHeading: 'Which reading do you *need*?',
  pageLead:
    'Three questions, about thirty seconds. Nothing is sent or stored — the answers stay in your browser and only write your message for you.',
  backLabel: 'Back to the consultations',

  eyebrow: 'Not sure which?',
  heading: 'Answer three questions',
  lead: 'Thirty seconds, and it tells you which of the three fits. Nothing is sent or stored — it only writes your message for you.',

  questions: [
    {
      id: 'about',
      prompt: 'What is on your mind?',
      options: [
        {
          label: 'Work, money or a decision',
          weights: { 'vedic-astrology': 3, numerology: 1 },
          echo: 'work or a decision',
        },
        {
          label: 'Love, marriage or family',
          weights: { 'vedic-astrology': 3 },
          echo: 'love, marriage or family',
        },
        {
          label: 'A home or shop that does not feel right',
          weights: { vastu: 4 },
          echo: 'a home or shop that does not feel right',
        },
        {
          label: 'A name, a date or a fresh start',
          weights: { numerology: 4 },
          echo: 'a name, a date or a fresh start',
        },
      ],
    },
    {
      id: 'timing',
      prompt: 'Is it about timing, or about a choice?',
      options: [
        {
          label: 'When will this change?',
          weights: { 'vedic-astrology': 3 },
          echo: 'wanting to know when things change',
        },
        {
          label: 'Which option should I take?',
          weights: { 'vedic-astrology': 1, numerology: 2 },
          echo: 'choosing between options',
        },
        {
          label: 'Why does this keep repeating?',
          weights: { numerology: 2, vastu: 2 },
          echo: 'something that keeps repeating',
        },
      ],
    },
    {
      id: 'details',
      prompt: 'What do you already know?',
      options: [
        {
          label: 'My birth date, time and place',
          weights: { 'vedic-astrology': 3 },
          echo: 'has birth date, time and place',
        },
        {
          label: 'My birth date, but not the time',
          weights: { numerology: 3, vastu: 1 },
          echo: 'has the birth date but not the time',
        },
        {
          label: 'The layout of the place in question',
          weights: { vastu: 4 },
          echo: 'has the layout of the place',
        },
      ],
    },
  ] as PickerQuestion[],

  /** Shown once all three are answered, above the service it landed on. */
  resultLabel: 'Start here',

  /** Why this one, in her terms. One line each. */
  because: {
    'vedic-astrology':
      'Your questions are about timing and the shape of a period, and you have the birth details a chart needs.',
    numerology:
      'Your questions are about names, dates and patterns, which is what the numbers are for, and they need no birth time.',
    vastu:
      'Your questions are about a place rather than a period, so the room comes before the chart.',
  } as Record<ServiceSlug, string>,

  /** The reassurance under the result: the tool is a signpost, not a verdict. */
  resultNote: 'If that looks wrong, say so in the message. She will tell you which one actually fits.',

  labels: {
    step: (current: number, total: number) => `Question ${current} of ${total}`,
    back: 'Back',
    restart: 'Start again',
    cta: 'Message Anjali about this',
    readMore: 'What this covers',
  },

  /** The message the WhatsApp button writes, with the answers folded in. */
  message: (serviceName: string, echoes: string[]) =>
    `Hello Anjali, the website suggested ${serviceName} for me — ` +
    `${echoes.join(', ')}. Could we talk about it?`,
} as const;
