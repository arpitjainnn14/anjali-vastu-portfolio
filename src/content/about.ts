/** About Anjali. */

/** DRAFTED from what Anjali said. Needs her sign-off before launch. */
export const about = {
  eyebrow: 'About Anjali',
  heading: 'She was once the client who never got a *straight answer*',
  paragraphs: [
    'Anjali started learning astrology at nineteen, from books and from teachers. ' +
      'Then life took over, and she set it aside for years.',
    'She came back to it after a difficult period of her own. She went to an ' +
      'astrologer for help, paid far more than it was worth, and still did not get ' +
      'a clear answer. She decided that if she ever did this work, she would do it ' +
      'differently.',
    'She has been reading professionally since 2017. People come to her about work, ' +
      'love and marriage, and the things that do not fit neatly into either. She ' +
      'reads in English and Hindi.',
  ],
  /** The line set large beside the story. Drawn from paragraph two. */
  pullQuote: 'If she ever did this work, she would do it differently.',
  facts: ['Ph.D. in Astrology & Vastu', 'Reading since 2017', 'Teaches all three subjects'],
  portrait: {
    src: '/portrait/anjali.png',
    alt: 'Astrologer Anjali Jain',
    caption: 'Astrologer Anjali Jain · Palwal, Haryana',
    /** Source is 1138×1382. Frames crop with object-fit: cover. */
    objectPositionDesktop: '55% 45%',
    objectPositionMobile: '52% 28%',
  },
  /**
   * The highest-trust block on the page, and the one thing someone taking
   * advantage of clients would never write down. Worth chasing.
   */
  willNotDo: {
    heading: 'What she will not do',
    items: ['TODO(refusal-1)', 'TODO(refusal-2)', 'TODO(refusal-3)'],
  },
} as const;
