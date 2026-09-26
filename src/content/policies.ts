/** Terms of consultation, and refunds and cancellations. */

/**
 * DRAFTED. Written from what Anjali decided, not by a lawyer. She reads and
 * corrects both before booking goes live; Razorpay's review reads them too.
 */

export const terms = {
  heading: 'Terms of consultation',
  metaDescription:
    'What your consultation fee covers, how booking and rescheduling work, and what a reading is and is not.',
  intro:
    'These terms apply when you book and pay for a consultation on this site. ' +
    'Refunds and cancellations have a page of their own.',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: 'TODO(terms-last-updated-date)',
  reachHeading: 'Questions about these terms',
  reachLink: 'Message her on WhatsApp',
  reachNote: '. She answers these herself.',
  sections: [
    {
      heading: 'What your fee covers',
      body:
        'A Vedic astrology or numerology consultation with Anjali, in person in ' +
        'Palwal or by phone, in English or Hindi, with no fixed time limit. After ' +
        'it, three months of calling her directly with follow-up questions, counted ' +
        'from the date of your consultation.',
    },
    {
      heading: 'Booking and payment',
      body:
        'You choose a time on the booking page and pay the full fee when you book. ' +
        'Payment is handled by Razorpay. Your booking is confirmed as soon as the ' +
        'payment goes through, and the confirmation is sent to your email.',
    },
    {
      heading: 'Before your consultation',
      body:
        'For a chart reading, send Anjali your date, time and place of birth. For ' +
        'numerology, your full name and date of birth. The page you see after ' +
        'booking has a button to send them on WhatsApp.',
    },
    {
      heading: 'Rescheduling',
      body:
        'You may reschedule once, at least 24 hours before your session, using ' +
        'the link in your confirmation email.',
    },
    {
      heading: 'Remedies',
      body:
        'If a remedy such as a Vastu yantra would help, Anjali tells you what it ' +
        'is and what it costs. Remedies are optional and are not included in the ' +
        'consultation fee.',
    },
    {
      heading: 'Vastu',
      body:
        'Vastu consultations are arranged on WhatsApp, not booked on this site. ' +
        'The fee is agreed with Anjali before anything is arranged.',
    },
    {
      heading: 'What a consultation is',
      body:
        'Guidance based on astrology, numerology or Vastu. It is not medical, ' +
        'legal or financial advice, and it does not replace advice from a ' +
        'qualified professional.',
    },
  ],
} as const;

export const refundPolicy = {
  heading: 'Refunds and cancellations',
  metaDescription:
    'Consultations cannot be cancelled. When a refund is given, and how to reschedule instead.',
  intro:
    'Consultations cannot be cancelled and fees are not refunded, except in the ' +
    'cases below.',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: 'TODO(refund-policy-last-updated-date)',
  reachHeading: 'Asking for a refund',
  reachLink: 'Message her on WhatsApp',
  reachNote: ' with the name and email address you booked with.',
  sections: [
    {
      heading: 'When you get a refund',
      body:
        'You get a full refund if Anjali is unable to hold your session and a new ' +
        'time cannot be agreed, if you were charged twice for one booking, or if ' +
        'your payment went through but no booking was made. Any other genuine ' +
        'circumstance is considered by Anjali, and the decision is hers.',
    },
    {
      heading: 'Rescheduling instead',
      body:
        'You may reschedule once, at least 24 hours before your session, using the ' +
        'link in your confirmation email. A missed session is not refunded.',
    },
    {
      heading: 'The three months of calls',
      body:
        'The fee covers the consultation and the three months of calls together, ' +
        'so no part of it is refunded once the consultation has taken place.',
    },
    {
      heading: 'How refunds are paid',
      body: 'TODO(refund-timing: how many working days Razorpay takes to return money to the original payment method)',
    },
  ],
} as const;

/** Shared by every notice page (privacy, terms, refunds), after the WhatsApp line. */
export const policyPages = {
  emailPrefix: 'Or write to ',
} as const;
