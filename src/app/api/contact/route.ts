import { NextResponse } from 'next/server';
import { getContent, isLocale, type Locale } from '@/content';
import { contact } from '@/content/shared';
import { validate, hasErrors, type ContactValues, type ContactResult } from '@/lib/contact-form';
import { contactAlert, sendTelegram } from '@/lib/telegram';

/**
 * Contact form proxy.
 *
 * The browser never posts to Forminit directly: the API key would have to ship
 * to the client, there would be no server-side validation, and there would be
 * nowhere to log a failure. All three of those matter more than the one hop.
 *
 * Nothing Forminit returns is ever shown to the visitor. Its error codes are
 * logged and collapsed into three outcomes the form knows how to render.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function asValues(body: unknown): ContactValues {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (key: string) => (typeof b[key] === 'string' ? (b[key] as string) : '');
  return {
    name: str('name'),
    phone: str('phone'),
    email: str('email'),
    service: str('service'),
    message: str('message'),
    consent: b.consent === true,
    website: str('website'),
  };
}

/** The language to validate and reply in. Defaults to English. */
function localeOf(body: unknown): Locale {
  const b = (body ?? {}) as Record<string, unknown>;
  return typeof b.locale === 'string' && isLocale(b.locale) ? b.locale : 'en';
}

function json(result: ContactResult, status = 200) {
  return NextResponse.json(result, { status });
}

export async function POST(request: Request) {
  let values: ContactValues;
  let locale: Locale;

  try {
    const body = await request.json();
    values = asValues(body);
    locale = localeOf(body);
  } catch {
    return json({ status: 'error' }, 400);
  }

  /*
   * Honeypot. A bot filled in a field no human can see, so accept the
   * submission silently and send nothing on. Telling it that it failed only
   * teaches it to try again.
   */
  if (values.website.trim() !== '') {
    return json({ status: 'ok' });
  }

  const errors = validate(getContent(locale), values);
  if (hasErrors(errors)) {
    return json({ status: 'invalid', errors }, 400);
  }

  const payload: Record<string, string> = {
    'fi-sender-firstName': values.name.trim(),
    'fi-sender-phone': values.phone.trim(),
    'fi-text-message': values.message.trim(),
    /*
     * The consent record. Keep what it said and when it was ticked — DPDP
     * treats the record, not the checkbox, as the evidence.
     */
    'fi-select-consent': `Consented at ${new Date().toISOString()}`,
  };

  if (values.email.trim()) payload['fi-sender-email'] = values.email.trim();
  if (values.service.trim()) payload['fi-select-service'] = values.service.trim();

  const apiKey = process.env.FORMINIT_API_KEY;

  try {
    const response = await fetch(contact.forminitEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
      },
      body: JSON.stringify(payload),
      /* Do not let a slow upstream hold the request open indefinitely. */
      signal: AbortSignal.timeout(10_000),
    });

    /* Rate limit is caught by name as well as by status — section 6. */
    if (response.status === 429) {
      return json({ status: 'rateLimited' }, 429);
    }

    const result = (await response.json().catch(() => null)) as
      | { success?: boolean; error?: string; message?: string }
      | null;

    if (result?.error === 'TOO_MANY_REQUESTS') {
      return json({ status: 'rateLimited' }, 429);
    }

    if (!response.ok || result?.success !== true) {
      console.error('[contact] forminit rejected the submission', {
        status: response.status,
        error: result?.error,
        message: result?.message,
      });
      return json({ status: 'error' }, 502);
    }

    /*
     * Ping Anjali's phone. Awaited so the Worker does not stop before the
     * request leaves; it never throws and gives up after five seconds, so a
     * Telegram problem cannot turn a delivered message into an error.
     */
    await sendTelegram(
      contactAlert({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        service: values.service.trim(),
        message: values.message.trim(),
        locale,
      }),
    );

    return json({ status: 'ok' });
  } catch (error) {
    console.error('[contact] could not reach forminit', error);
    return json({ status: 'error' }, 502);
  }
}

/** POST only. Anything else gets a 405 with the right header. */
export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } });
}
