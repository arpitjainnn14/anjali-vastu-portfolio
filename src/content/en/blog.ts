/** The blog: list page and post page chrome. The posts themselves come from Sitedesk. */
export const blog = {
  meta: {
    title: 'Notes from Anjali',
    description: 'Short notes on astrology, numerology and Vastu from Anjali Jain in Palwal.',
  },
  heading: 'Notes from *Anjali*',
  intro: 'Short reads on astrology, numerology and Vastu.',
  empty: 'Nothing here yet. Her first note will appear here soon.',
  unavailable: 'The notes cannot be loaded right now. Please try again in a few minutes.',
  postUnavailable: 'This note cannot be loaded right now. Please try again in a few minutes.',
  readMore: 'Read the note',
  backToList: 'All notes',
  /** The line under a note's title: its date, and its category when it has one. */
  dateLine: (date: string, category: string) => (category ? `${date} · ${category}` : date),
  publishedLine: (date: string, category: string) => `Published ${date}${category ? ` · ${category}` : ''}`,
  otherLanguage: 'हिंदी में पढ़ें',
};
