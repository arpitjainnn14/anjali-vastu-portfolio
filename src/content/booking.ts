/** Online booking: Cal ID for the calendar, Razorpay for payment. */

import { whatsappMessages } from './site';

/**
 * The fee for the consultations booked online. `display` is written out, not
 * formatted at render, so other content modules (the FAQ) can quote it; a test
 * keeps it in step with `amount`.
 *
 * ₹2,151 leaves Anjali ₹2,100.24 after Razorpay's 2% plus 18% GST on that fee.
 */
export const consultationFee = { amount: 2151, display: '₹2,151' } as const;

export type Fee = typeof consultationFee;

export const booking = {
  /**
   * Off until Razorpay approves the live account. While false, service pages
   * keep their WhatsApp buttons, nothing links to /book, and /book is noindex.
   */
  live: false as boolean,
  calBaseUrl: 'https://cal.id',
  calUsername: 'anjali-jain13',
  /**
   * Cal ID's inline embed, from the Embed dialog in Cal ID. null shows a
   * plain link to the Cal ID page instead of an embedded calendar.
   *
   * Left null: Cal ID serves its booking pages with `X-Frame-Options:
   * sameorigin`, so the browser refuses to display them in an iframe from
   * this site at all (confirmed with Playwright at /book/numerology — the
   * iframe element mounts but its content is blocked, with the console
   * error "Refused to display 'https://cal.id/' in a frame because it set
   * 'X-Frame-Options' to 'sameorigin'"). This is not a localhost-only
   * restriction: `sameorigin` rejects every embedding origin except cal.id
   * itself, so it would also block the embed once deployed. Flip this back
   * on if Cal ID's settings ever allow framing from this site's origin.
   */
  embed: null as { scriptUrl: string; origin: string } | null,
  ctaLabel: (fee: string) => `Book a consultation · ${fee}`,
  unsureLink: 'Not sure? Ask on WhatsApp',
  /** DRAFTED. What the fee buys beyond the session itself. */
  offerLine: 'Includes three months of calling Anjali directly.',
  /** The /book pages. DRAFTED. */
  page: {
    metaTitleFor: (name: string) => `Book a ${name} Consultation with Anjali Jain`,
    metaDescription:
      'Book a Vedic astrology or numerology consultation with Anjali Jain and pay ' +
      'online. In person in Palwal or by phone, in English or Hindi.',
    heading: 'Book a consultation',
    lead: 'Choose a time that suits you and pay online. Your booking is confirmed straight away.',
    detailsNote:
      'Nothing else is asked for here. After booking, you send Anjali your birth ' +
      'details on WhatsApp.',
    chooseLabel: 'Choose a consultation',
    pickTime: 'Choose a time',
    openCalendar: 'Open the calendar in a new tab',
    vastuNote: 'Looking for Vastu? It is arranged on WhatsApp.',
    vastuLink: 'Ask about Vastu',
    vastuMessage: whatsappMessages.service('Vastu'),
  },
} as const;
