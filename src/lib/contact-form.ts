import { form } from '@/content';

/**
 * Validation for the contact form, shared by the browser and the Route Handler.
 *
 * The browser copy is a courtesy; the server copy is the one that counts.
 * Keeping them in one module means they cannot drift apart.
 */

export type ContactValues = {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  consent: boolean;
  /** Honeypot. Anything here means a bot filled it in. */
  website: string;
};

export type FieldErrors = Partial<Record<keyof ContactValues, string>>;

/** Indian mobile numbers are 10 digits; allow +91, spaces and dashes around them. */
function digitCount(value: string) {
  return value.replace(/\D/g, '').length;
}

export function validate(values: ContactValues): FieldErrors {
  const errors: FieldErrors = {};
  const v = form.validation;

  if (!values.name.trim()) {
    errors.name = v.nameRequired;
  }

  if (!values.phone.trim()) {
    errors.phone = v.phoneRequired;
  } else if (digitCount(values.phone) < 10) {
    errors.phone = v.phoneTooShort;
  }

  /* Email is optional, so only validate what was actually typed. */
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = v.emailInvalid;
  }

  if (!values.message.trim()) {
    errors.message = v.messageRequired;
  }

  if (!values.consent) {
    errors.consent = v.consentRequired;
  }

  return errors;
}

export function hasErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0;
}

/** What the Route Handler sends back. The client never sees a Forminit code. */
export type ContactResult =
  | { status: 'ok' }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'rateLimited' }
  | { status: 'error' };
