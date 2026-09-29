/**
 * Facts that do not change with language: the same in English and Hindi.
 *
 * The `en` and `hi` bundles both import from here rather than repeating these
 * values, so a phone number or a fee only has one place to be correct. Copy
 * that is *said* differently per language — even about the same fact, such as
 * the fee's `display` string — stays in the language modules instead.
 */

export const brand = 'Anjali Vastu & Astro Divine Solutions';
/** The header and footer wordmark, set on two lines so it fits beside the menu. */
export const brandLines = ['Anjali Vastu &', 'Astro Divine Solutions'] as const;

export const contact = {
  /**
   * Text only, no calls for now. The site deliberately offers no tel: link and
   * never displays this number; it exists only as the source of the WhatsApp
   * link below. To allow calls again, add a phoneHref and render it.
   */
  phoneDisplay: '+91 97291 33317',
  whatsappNumber: '919729133317',
  whatsappUrl: 'https://wa.me/919729133317',
  /** Written route for data requests. Required by the privacy notice. */
  email: 'astrologeranjali13@gmail.com',
  forminitFormId: 'uu1xst97189',
  forminitEndpoint: 'https://forminit.com/f/uu1xst97189',
} as const;

/**
 * The fee for the consultations booked online. `display` is written out, not
 * formatted at render, so other content modules (the FAQ) can quote it; a test
 * keeps it in step with `amount`.
 *
 * ₹2,151 leaves Anjali ₹2,100.24 after Razorpay's 2% plus 18% GST on that fee.
 */
export const consultationFee = { amount: 2151, display: '₹2,151' } as const;

export type Fee = typeof consultationFee;

export const cal = { baseUrl: 'https://cal.id', username: 'anjali-jain13' } as const;

/**
 * On since 2026-09-29: Razorpay is live, Cal ID's Razorpay app passed live
 * payment, reschedule and refund tests, and the daily payments check runs.
 * Set to false to hide booking again: service pages go back to their WhatsApp
 * buttons, nothing links to /book, and /book becomes noindex.
 */
export const bookingLive: boolean = true;

/**
 * Cal ID's inline embed, from the Embed dialog in Cal ID. Checked in a
 * real browser (Sept 2026): the calendar renders. Headless browsers get a
 * Cloudflare challenge from cal.id instead, so automated checks show an
 * empty box. null shows a plain link to the Cal ID page instead.
 */
export const bookingEmbed: { scriptUrl: string; origin: string } | null = {
  scriptUrl: 'https://cal.id/embed-link/embed.js',
  origin: 'https://cal.id',
};

/**
 * Whether the Hindi site is switched on for visitors. Stays false until
 * Anjali has read and corrected the translation (see docs/superpowers/specs/2026-09-27-hindi-site-design.md).
 * While false: no toggle is shown, /hi/* is noindex, and there are no hreflang
 * alternates or sitemap entries.
 */
export const hindiLive = false;

/**
 * Each language's name in its own script, for the language toggle: an English
 * page offers "हिंदी" and a Hindi page offers "English", whichever language
 * the page around it is in.
 */
export const languageNames = { en: 'English', hi: 'हिंदी' } as const;

export const practisingSince = 2017;

/** City and state, the same in structured data and in visible copy either language. */
export const geo = { city: 'Palwal', state: 'Haryana' } as const;
