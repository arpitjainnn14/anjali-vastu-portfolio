/** About Anjali. */

/** DRAFTED from what Anjali said. Needs her sign-off before launch. */
export const about = {
  meta: {
    title: 'About Astrologer Anjali Jain',
    description:
      'Anjali Jain has studied astrology since 1995 and read professionally since 2017. ' +
      'Ph.D. in Astrology and Vastu, consulting in Palwal in English and Hindi.',
  },
  heading: 'The client who never got a *straight answer*',
  paragraphs: [
    'Anjali first started learning astrology in 1995. She read books and studied ' +
      'with a few good teachers. Later, life became busy, and she put astrology on ' +
      'hold for many years.',
    'A difficult time in her life made her return to it. She visited an astrologer ' +
      'hoping to find answers, paid more than the session was worth, and left feeling ' +
      'just as confused. That experience stayed with her. She promised herself that ' +
      'if she ever did this work again, no client would leave without an answer.',
    'She has been offering readings since 2017. People ask her about work, love, ' +
      'marriage and other worries that do not fit into one category. She might give ' +
      'a birth chart reading, a numerology reading for a name or date of birth, or ' +
      'Vastu advice for a home or shop. Whatever the type, she explains everything as ' +
      'if talking to a friend, in plain words, in English or Hindi.',
    'Her clients come from Faridabad, Palwal and Delhi. Some meet her in person, ' +
      'while many speak with her over the phone.',
  ],
  facts: ['Learning since 1995', 'Reading professionally since 2017', 'Ph.D. in Astrology & Vastu'],
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
