import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { hasErrors, validate, type ContactValues } from './contact-form';

const empty: ContactValues = {
  name: '',
  phone: '',
  email: '',
  service: '',
  message: '',
  consent: false,
  website: '',
};

describe('validate', () => {
  it('returns the English bundle messages when c = getContent(\'en\')', () => {
    const c = getContent('en');
    const errors = validate(c, empty);
    expect(errors.name).toBe(c.form.validation.nameRequired);
    expect(errors.phone).toBe(c.form.validation.phoneRequired);
    expect(errors.message).toBe(c.form.validation.messageRequired);
    expect(errors.consent).toBe(c.form.validation.consentRequired);
  });

  /*
   * Proves `validate` reads its messages from whichever bundle it is given,
   * rather than from a fixed English import.
   */
  it("returns the Hindi bundle's messages when c = getContent('hi')", () => {
    const c = getContent('hi');
    const errors = validate(c, empty);
    expect(errors.name).toBe(c.form.validation.nameRequired);
    expect(errors.name).not.toBe(getContent('en').form.validation.nameRequired);
  });

  it('flags a phone number under 10 digits', () => {
    const c = getContent('en');
    const errors = validate(c, { ...empty, name: 'A', phone: '12345', message: 'Hi', consent: true });
    expect(errors.phone).toBe(c.form.validation.phoneTooShort);
  });

  it('has no errors once every required field is filled in', () => {
    const c = getContent('en');
    const errors = validate(c, { ...empty, name: 'A', phone: '9876543210', message: 'Hi', consent: true });
    expect(hasErrors(errors)).toBe(false);
  });
});
