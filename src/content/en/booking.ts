/** Online booking: Cal ID for the calendar, Razorpay for payment. */

import { whatsappMessages } from './site';
import { consultationFee, cal, bookingLive, bookingEmbed } from '../shared';

export type { Fee } from '../shared';

/**
 * The fee for the consultations booked online, and the language-independent
 * Cal ID / Razorpay facts. Defined once in shared.ts; re-exported here so
 * existing call sites (`content.consultationFee`, `content.booking.calUsername`)
 * keep working unchanged.
 */
export { consultationFee };

export const booking = {
  /**
   * Off until Razorpay approves the live account. While false, service pages
   * keep their WhatsApp buttons, nothing links to /book, and /book is noindex.
   */
  live: bookingLive,
  calBaseUrl: cal.baseUrl,
  calUsername: cal.username,
  /**
   * Cal ID's inline embed, from the Embed dialog in Cal ID. Checked in a
   * real browser (Sept 2026): the calendar renders. Headless browsers get a
   * Cloudflare challenge from cal.id instead, so automated checks show an
   * empty box. null shows a plain link to the Cal ID page instead.
   */
  embed: bookingEmbed,
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
      'The booking asks only for your name, email and phone. After booking, you ' +
      'send Anjali your birth details on WhatsApp.',
    lengthNote: 'The calendar holds an hour, but the consultation runs as long as it needs.',
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
