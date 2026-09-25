/** The contact section and its form: fields, states and messages. */

import { site } from './site';

export const contactSection = {
  meta: {
    title: 'Contact Astrologer Anjali Jain in Palwal',
    description:
      'WhatsApp is the quickest way to reach Anjali. Or leave your details and she will ' +
      'reply herself, usually within 24 hours. In English or Hindi.',
  },
  heading: 'Tell Anjali what you *want to know*',
  lead:
    'WhatsApp is the quickest way to reach her. If you would rather write, leave ' +
    'your details below and she will reply herself, usually within 24 hours.',
  formTitle: 'Prefer to write? Leave your details',
  details: [
    { label: 'Where', value: 'Palwal, Haryana', link: { label: 'Open the location in Maps', href: site.mapsUrl } },
    { label: 'Consultations', value: 'In person in Palwal, or by phone', link: null },
    { label: 'Languages', value: 'English and Hindi', link: null },
    { label: 'Usual reply time', value: 'Within 24 hours', link: null },
  ],
  footnote: 'Your message goes straight to Anjali. Nobody else reads it.',
  /** The WhatsApp CTA beside the form, and in the mobile drawer. */
  whatsappCta: 'Message on WhatsApp',
  /** The small pinned button on phones. Short, so it covers little of the page. */
  stickyLabel: 'WhatsApp Anjali',
} as const;

/** Forminit field names follow fi-{blockType}-{name}. Do not rename. */
export const form = {
  fields: {
    name: { id: 'name', name: 'fi-sender-firstName', label: 'Your name', type: 'text', required: true },
    phone: { id: 'phone', name: 'fi-sender-phone', label: 'Phone or WhatsApp', type: 'tel', inputMode: 'tel', required: true },
    email: { id: 'email', name: 'fi-sender-email', label: 'Email', type: 'email', inputMode: 'email', required: false },
    service: { id: 'service', name: 'fi-select-service', label: 'Topic', type: 'select', required: false },
    message: { id: 'message', name: 'fi-text-message', label: 'Your question, in a line or two', type: 'textarea', required: true },
    consent: { id: 'consent', name: 'fi-select-consent', type: 'checkbox', required: true },
    honeypot: { id: 'website', name: 'fi-text-website', type: 'text', required: false },
  },
  serviceOptions: [
    'Vedic astrology reading',
    'Numerology',
    'Vastu for a home or shop',
    'Learning from Anjali',
    'Not sure yet',
  ],
  consentLabel: 'Anjali may keep my name and contact details so she can get back to me.',
  consentLinkLabel: 'How your details are used',
  /** Read only by screen readers that reach the hidden spam trap. */
  honeypotLabel: 'Leave this field empty',
  submitLabel: 'Send to Anjali',
  submittingLabel: 'Sending',
  states: {
    success: {
      heading: 'That has reached Anjali',
      body: 'She will reply herself, usually within 24 hours. If it is urgent, WhatsApp is quicker.',
      cta: 'Message on WhatsApp instead',
    },
    error: {
      heading: 'That did not send',
      body:
        'Something went wrong on our side, not yours. Everything you typed is still ' +
        'here, so try again in a moment, or message her on WhatsApp.',
    },
    rateLimited: {
      heading: 'One moment',
      body: 'Give it five seconds and send again.',
    },
  },
  /** Field-level messages. Always paired with aria-invalid and an icon. */
  validation: {
    nameRequired: 'Please add your name.',
    phoneRequired: 'Please add a number she can reach you on.',
    phoneTooShort: 'That looks short. A mobile number is 10 digits.',
    emailInvalid: 'That email address does not look right.',
    messageRequired: 'Add a line about your question so she can reply properly.',
    consentRequired: 'Please tick this so she can get back to you.',
  },
} as const;
