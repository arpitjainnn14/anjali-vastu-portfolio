/** Questions people ask before they message. */

import { consultationFee } from './booking';

/**
 * DRAFTED. Every answer restates a fact already on this site; nothing new is
 * promised. Anjali signs these off before launch. Answers people's usual
 * reasons for not messaging: cost, distance, language, and the birth time.
 */
export const faq = {
  heading: 'Questions people usually ask *first*',
  items: [
    {
      q: 'How much does a consultation cost?',
      a:
        `A Vedic astrology or numerology consultation is ${consultationFee.display}, and ` +
        'that includes three months of calling Anjali directly afterwards. Vastu depends ' +
        'on the space, so message her on WhatsApp and she will tell you the fee before ' +
        'anything is arranged.',
    },
    {
      q: 'Do I have to come to Palwal?',
      a:
        'No. You can meet her in person in Palwal, or have the whole consultation over ' +
        'the phone. Classes are held online.',
    },
    {
      q: 'Do I need my exact time of birth?',
      a:
        'It helps a great deal. Fifteen minutes can move the ascendant, so check your ' +
        'birth time before a chart reading if you can. Numerology needs only your full ' +
        'name and date of birth.',
    },
    {
      q: 'Which languages does she consult in?',
      a: 'English and Hindi, whichever you are more comfortable with.',
    },
    {
      q: 'How soon will she reply?',
      a:
        'Usually within 24 hours. She reads and answers every message herself; there ' +
        'is no assistant.',
    },
    {
      q: 'Can I learn astrology from her?',
      a:
        'Yes. She teaches Vedic astrology, numerology and Vastu in three-month courses, ' +
        'live online, in small groups of four or five students.',
    },
    {
      q: 'What is the difference between astrology and Jyotish?',
      a:
        'They are close cousins. Jyotish is the traditional Indian word for the system, ' +
        'and many people simply call it astrology. In her readings, Anjali explains ' +
        'everything in plain language, so you do not need to know any of the technical terms.',
    },
    {
      q: 'Does she visit the site for Vastu?',
      a:
        'Yes. Vastu is offered as a package: one fee, with site visits until the ' +
        'building is complete.',
    },
    {
      q: 'I am not sure which reading I need. What should I do?',
      a:
        'Contact Anjali and tell her what is going on. She will point you to the right ' +
        'one, or you can answer the three quick questions on the website.',
    },
    {
      q: 'Is astrology only for people with problems?',
      a:
        'Not at all. Some people come when life feels stuck, but others come before a ' +
        'big decision, like a new job, a move or a marriage, simply because they want ' +
        'to choose the right moment.',
    },
    {
      q: `Is a consultation worth ${consultationFee.display}?`,
      a:
        'Anjali’s own story starts with paying too much for a reading that gave her no ' +
        'clear answer. That is why her fee includes three months of follow-up calls, so ' +
        'you are not left with questions and nobody to ask.',
    },
  ],
} as const;
