import { NextResponse } from 'next/server';
import { isValidCalSignature } from '@/lib/cal-webhook';
import { bookingAlert, isAlertEvent, sendTelegram, type CalWebhook } from '@/lib/telegram';

/**
 * Cal ID booking webhook → a Telegram alert on Anjali's phone.
 *
 * Set up in Cal ID (Settings → Developer → Webhooks, or the event type's
 * Webhooks tab) with this URL, the booking triggers, and a secret that matches
 * CAL_WEBHOOK_SECRET here. Unsigned or wrongly signed calls get a 401 and
 * nothing is sent.
 *
 * Cal ID only needs a 2xx to stop retrying, so a failed Telegram send still
 * answers 200: retrying would not fix Telegram, and would repeat the alerts
 * that did get through.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const valid = await isValidCalSignature(
    body,
    request.headers.get('x-cal-signature-256'),
    process.env.CAL_WEBHOOK_SECRET,
  );
  if (!valid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let hook: CalWebhook;
  try {
    hook = JSON.parse(body) as CalWebhook;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (isAlertEvent(hook.triggerEvent)) {
    const text = bookingAlert(hook);
    if (text) await sendTelegram(text);
  }

  return NextResponse.json({ ok: true });
}
