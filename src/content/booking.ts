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
   * Off for now. In a headless Playwright check (Sept 2026) the Cal ID
   * frame was refused (X-Frame-Options SAMEORIGIN), but cal.id serves
   * automated browsers a Cloudflare challenge page, so this needs
   * re-checking in a real browser before switching on. Values from Cal
   * ID's Embed dialog: scriptUrl https://cal.id/embed-link/embed.js,
   * origin https://cal.id.
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
  /** The /booked page Cal ID sends people to after paying. DRAFTED. */
  booked: {
    metaTitle: 'Booking Received',
    metaDescription: 'Your consultation with Anjali Jain, and the details to send her.',
    headingFor: (name: string) => `Your ${name} consultation is booked`,
    body:
      'The confirmation is on its way to your email. One more step: send Anjali ' +
      'the details she needs for your reading.',
    genericHeading: 'Thank you',
    genericBody:
      'If you have just booked a consultation, the confirmation is on its way to ' +
      'your email. Send Anjali the details she needs for your reading on WhatsApp.',
    detailsCta: 'Send your details on WhatsApp',
  },
  /** The prefilled WhatsApp message from /booked. One field per line, left blank to fill in. */
  detailsMessage: {
    openerFor: (name: string) => `Hello Anjali, I have just booked a ${name} consultation. My details:`,
    opener: 'Hello Anjali, I have just booked a consultation. My details:',
    lines: {
      'vedic-astrology': ['Date of birth:', 'Time of birth:', 'Place of birth:'],
      numerology: ['Full name:', 'Date of birth:'],
    } as Record<string, readonly string[]>,
    combined: ['Full name:', 'Date of birth:', 'Time of birth:', 'Place of birth:'],
  },
} as const;
