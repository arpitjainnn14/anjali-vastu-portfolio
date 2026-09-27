'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { Content } from '@/content';
import { useContent } from '@/components/locale/LocaleProvider';
import { whatsappHref } from '@/lib/whatsapp';
import {
  TextField,
  SelectField,
  TextAreaField,
  CheckboxField,
  Honeypot,
} from '@/components/ui/Field';
import { AlertIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { Seal } from '@/components/art/Seal';
import { Button } from '@/components/ui/Button';
import {
  validate,
  hasErrors,
  type ContactValues,
  type FieldErrors,
  type ContactResult,
} from '@/lib/contact-form';
import { localePath } from '@/lib/locale-routing';

/**
 * The contact form. All six states from section 6.
 *
 * Posts JSON to /api/contact rather than to Forminit directly, so the API key
 * stays server-side and there is a place to validate and log.
 *
 * On failure the fields are **never cleared** — the form is uncontrolled and
 * nothing resets it, so a failed submit leaves everything the visitor typed
 * exactly where it was.
 */

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rateLimited';

function read(form: Content['form'], data: FormData): ContactValues {
  const get = (name: string) => String(data.get(name) ?? '');
  return {
    name: get(form.fields.name.name),
    phone: get(form.fields.phone.name),
    email: get(form.fields.email.name),
    service: get(form.fields.service.name),
    message: get(form.fields.message.name),
    consent: data.get(form.fields.consent.name) != null,
    website: get(form.fields.honeypot.name),
  };
}

export function ContactForm() {
  const { c, locale } = useContent();
  const { form, contactSection } = c;
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const busy = status === 'submitting';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const values = read(form, new FormData(event.currentTarget));

    const clientErrors = validate(c, values);
    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      setStatus('idle');
      /* Move the visitor to the first thing that needs fixing. */
      const firstField = Object.keys(clientErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[aria-invalid="true"], #${firstField}`)?.focus();
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale }),
      });
      const result: ContactResult = await response.json();

      if (result.status === 'ok') {
        setStatus('success');
        formRef.current?.reset();
      } else if (result.status === 'invalid') {
        setErrors(result.errors);
        setStatus('idle');
      } else if (result.status === 'rateLimited') {
        setStatus('rateLimited');
      } else {
        setStatus('error');
      }
    } catch {
      /* Offline, DNS, a dropped connection. Same message either way. */
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 border-t-2 border-ink pt-6 md:pt-8"
      >
        <Seal id="sent" seal={c.seal} size={92} />
        <span className="t-h3 text-ink">{form.states.success.heading}</span>
        <span className="t-body max-w-[42ch]">{form.states.success.body}</span>
        <a
          href={whatsappHref(c)}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-11 items-center gap-2 self-start text-[16px] font-semibold text-sindoor no-underline hover:text-sindoor-deep"
        >
          {form.states.success.cta}
          <ArrowRightIcon size={15} className="nudge" />
        </a>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6 border-t-2 border-ink pt-7 md:gap-8 md:pt-9"
    >
      <div className="grid gap-5 md:grid-cols-2 md:gap-7 md:gap-x-10">
        <TextField
          id={form.fields.name.id}
          name={form.fields.name.name}
          label={form.fields.name.label}
          autoComplete="name"
          required
          disabled={busy}
          error={errors.name}
        />
        <TextField
          id={form.fields.phone.id}
          name={form.fields.phone.name}
          label={form.fields.phone.label}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          disabled={busy}
          error={errors.phone}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:gap-7 md:gap-x-10">
        <TextField
          id={form.fields.email.id}
          name={form.fields.email.name}
          label={form.fields.email.label}
          type="email"
          inputMode="email"
          autoComplete="email"
          disabled={busy}
          error={errors.email}
        />
        <SelectField
          id={form.fields.service.id}
          name={form.fields.service.name}
          label={form.fields.service.label}
          options={form.serviceOptions}
          disabled={busy}
          error={errors.service}
        />
      </div>

      <TextAreaField
        id={form.fields.message.id}
        name={form.fields.message.name}
        label={form.fields.message.label}
        rows={5}
        required
        disabled={busy}
        error={errors.message}
      />

      <Honeypot id={form.fields.honeypot.id} name={form.fields.honeypot.name} label={form.honeypotLabel} />

      <div className="flex flex-col gap-5 border-t border-line pt-5 md:gap-6 md:pt-6">
        <CheckboxField
          id={form.fields.consent.id}
          name={form.fields.consent.name}
          required
          disabled={busy}
          error={errors.consent}
          aside={
            <Link
              href={localePath(locale, '/privacy')}
              className="ink-link inline-flex min-h-11 items-center t-small text-sindoor md:min-h-0"
            >
              {form.consentLinkLabel}
            </Link>
          }
        >
          {form.consentLabel}
        </CheckboxField>

        {status === 'error' && (
          <div role="alert" className="flex gap-2.5 text-sindoor">
            <AlertIcon size={18} className="mt-0.5 shrink-0" />
            <span className="t-small text-body">
              <span className="font-semibold text-ink">{form.states.error.heading}.</span>{' '}
              {form.states.error.body}
            </span>
          </div>
        )}

        {status === 'rateLimited' && (
          <div role="alert" className="flex gap-2.5 text-sindoor">
            <AlertIcon size={18} className="mt-0.5 shrink-0" />
            <span className="t-small text-body">
              <span className="font-semibold text-ink">{form.states.rateLimited.heading}.</span>{' '}
              {form.states.rateLimited.body}
            </span>
          </div>
        )}

        <Button type="submit" block disabled={busy} aria-busy={busy}>
          {busy && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-card/30 border-t-card"
            />
          )}
          {busy ? form.submittingLabel : form.submitLabel}
        </Button>

        <p className="m-0 t-caption text-muted">{contactSection.footnote}</p>
      </div>
    </form>
  );
}
