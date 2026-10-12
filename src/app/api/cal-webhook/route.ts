import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { isValidCalSignature } from '@/lib/cal-webhook';
import { firstDelivery, type DedupeStore } from '@/lib/webhook-dedupe';
import { bookingAlert, isAlertEvent, parseCalWebhook, sendTelegram, type CalWebhook } from '@/lib/telegram';

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

/** A real Cal ID booking message is a few KB; anything far larger is refused before the signature work. */
const MAX_BODY_BYTES = 256 * 1024;

function dedupeStore(): DedupeStore | undefined {
  try {
    return (getCloudflareContext().env as { CAL_DEDUPE?: DedupeStore }).CAL_DEDUPE;
  } catch {
    return undefined; // outside the Worker (plain next dev without bindings)
  }
}

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return NextResponse.json({ ok: false }, { status: 413 });
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return NextResponse.json({ ok: false }, { status: 413 });
  const valid = await isValidCalSignature(
    body,
    request.headers.get('x-cal-signature-256'),
    process.env.CAL_WEBHOOK_SECRET,
  );
  if (!valid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let hook: CalWebhook | null;
  try {
    hook = parseCalWebhook(JSON.parse(body));
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!hook) return NextResponse.json({ ok: false }, { status: 400 });

  // Cal ID can deliver the same message twice; she gets one ping per message.
  if (isAlertEvent(hook.triggerEvent) && (await firstDelivery(dedupeStore(), body))) {
    const text = bookingAlert(hook);
    if (text) await sendTelegram(text);
  }

  return NextResponse.json({ ok: true });
}
