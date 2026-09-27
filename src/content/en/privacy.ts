/** The privacy notice. */

import { contact } from './site';

/**
 * DRAFT. Written by a designer, not a lawyer. Must be reviewed before publishing.
 *
 * India's DPDP Rules were notified November 2025; full compliance due 13 May 2027.
 * The notice must be clear, itemised and separate from any terms of service.
 */
export const privacy = {
  heading: 'How your details are used',
  metaDescription: 'What Anjali Jain collects through this site, why, and what you can ask for.',
  intro:
    'This notice covers the contact form and online booking on this site. It is ' +
    'short and itemised on purpose, and separate from everything else.',
  lastUpdatedLabel: 'Last updated',
  reachHeading: 'Reaching her about this',
  reachLink: 'Message her on WhatsApp',
  reachNote: '. She handles these herself.',
  lastUpdated: 'TODO(privacy-last-updated-date)',
  sections: [
    {
      heading: 'What is collected',
      body:
        'When you use the contact form, Anjali Jain receives your name, your phone ' +
        'number, your email address if you choose to give one, which service you are ' +
        'asking about, and whatever you write in the message box. When you book a ' +
        'consultation online, she receives your name, email address and phone number, ' +
        'the time you chose, and confirmation that you have paid. She never sees your ' +
        'card, bank or UPI details. Neither the form nor the booking asks for your ' +
        'date, time or place of birth. If a reading needs those, you send them to ' +
        'Anjali directly.',
    },
    {
      heading: 'Why',
      body:
        'So that she can reply to you and arrange a consultation. Nothing else. Your ' +
        'details are not used for marketing, not added to any mailing list, and not ' +
        'sold, rented or given to anyone.',
    },
    {
      heading: 'Who can see it',
      body:
        'Anjali. The form is delivered by Forminit, a form service that stores your ' +
        'submission so she can read it. Bookings are handled by Cal ID, a scheduling ' +
        'service, and payments by Razorpay, a payment gateway. Each of them handles ' +
        'your details only to do that job. TODO(forminit-cal-id-razorpay-privacy-links)',
    },
    {
      heading: 'How long it is kept',
      body:
        'TODO(retention-period: e.g. twelve months after we last spoke, then deleted). ' +
        'If you ask for it to be deleted sooner, it is deleted sooner.',
    },
    {
      heading: 'What you can ask for',
      body:
        'You can ask to see what is held about you, to have it corrected, or to have ' +
        'it deleted. You can also withdraw your consent at any time, and that is as ' +
        'easy as giving it was. Message her on WhatsApp or write to ' +
        `${contact.email}. It will be dealt with within 90 days at the latest, and ` +
        'in practice much sooner.',
    },
    {
      heading: 'If you are not satisfied',
      body:
        `Raise it with Anjali Jain at ${contact.email}. If it is ` +
        'still not resolved, you can take the complaint to the Data Protection Board ' +
        'of India.',
    },
    {
      heading: 'Cookies',
      /* Decided: no analytics, so no cookies and no consent banner. */
      body: 'This site sets no cookies and uses no analytics.',
    },
  ],
} as const;
