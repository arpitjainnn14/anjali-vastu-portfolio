/** Online booking: Cal ID for the calendar, Razorpay for payment. */

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
   */
  embed: null as { scriptUrl: string; origin: string } | null,
  ctaLabel: (fee: string) => `Book a consultation · ${fee}`,
  unsureLink: 'Not sure? Ask on WhatsApp',
  /** DRAFTED. What the fee buys beyond the session itself. */
  offerLine: 'Includes three months of calling Anjali directly.',
} as const;
