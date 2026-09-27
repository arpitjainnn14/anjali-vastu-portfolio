/** Teaching: the course, the tracks, the next batch. */

export const teaching = {
  meta: {
    title: 'Learn Astrology, Numerology and Vastu Online',
    description:
      'Three-month courses in Vedic astrology, numerology and Vastu with Anjali Jain. ' +
      'Live over video call, in small groups of four or five students.',
  },
  heading: 'Learn to read a chart *yourself*',
  lead:
    'Anjali teaches all three subjects she practises: Vedic astrology, numerology and ' +
    'Vastu. Classes are live over video call in small groups, so you can join from ' +
    'anywhere and still get proper attention.',
  nextBatchLabel: 'Next batch',
  specHeading: 'The course at a glance',
  spec: [
    { label: 'Duration', value: '3 months' },
    { label: 'Format', value: 'Live, over video call' },
    { label: 'Group size', value: 'Four or five students' },
    { label: 'Schedule', value: 'TODO(sessions-per-week-and-length)' },
    { label: 'Language', value: 'English and Hindi' },
    { label: 'Fees', value: 'Shared on WhatsApp' },
  ],
  nextBatch: 'TODO(next-batch-month)',
  cta: { label: 'Ask about the next batch' },
  tracks: [
    { slug: 'vedic-astrology', name: 'Vedic Astrology', icon: 'sun' as const,
      covers: 'TODO(teaching-vedic-covers)', prerequisite: 'TODO(teaching-vedic-prereq)' },
    { slug: 'numerology', name: 'Numerology', icon: 'grid' as const,
      covers: 'TODO(teaching-numerology-covers)', prerequisite: 'TODO(teaching-numerology-prereq)' },
    { slug: 'vastu', name: 'Vastu', icon: 'compass' as const,
      covers: 'TODO(teaching-vastu-covers)', prerequisite: 'TODO(teaching-vastu-prereq)' },
  ],
  /** Unconfirmed assumption. If it is all three in one course the section changes shape. */
  structureNote: 'TODO(confirm: three months per subject taken in sequence, or all three in one course?)',
} as const;
