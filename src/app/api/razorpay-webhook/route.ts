import { NextResponse } from 'next/server';
import { sandboxEnabled, webhookSignatureMatches } from '@/lib/razorpay';
import { deliveries, firstSighting, record } from '@/lib/razorpay-webhooks';

/**
 * The /pay-test sandbox's webhook receiver: Razorpay's server telling ours
 * what happened to a payment, with no browser in between.
 *
 * Order of checks matters:
 *   1. Seal first. Nothing in the body is read, let alone trusted, until the
 *      X-Razorpay-Signature matches an HMAC of the raw bytes.
 *   2. Then duplicates. Razorpay may deliver one event more than once, and
 *      events may arrive out of order; x-razorpay-event-id identifies each.
 *   3. Then act, and answer 200 quickly. Anything else tells Razorpay the
 *      delivery failed, and it tries again.
 *
 * A duplicate still gets a 200: it was handled the first time, and a
 * non-2xx would only make Razorpay keep resending it.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  status?: string;
  error_description?: string;
};

const ACTIONS: Record<string, (payment: PaymentEntity) => string> = {
  'payment.captured': () => 'Money taken. Confirm the booking (if not already confirmed).',
  'order.paid': () => 'Order fully paid. Confirm the booking (if not already confirmed).',
  'payment.authorized': () => 'Bank is holding the money. Wait for captured; do not confirm yet.',
  'payment.failed': (p) => `No money taken${p.error_description ? ` (${p.error_description})` : ''}. Do not book; release the slot.`,
};

export async function POST(request: Request) {
  if (!sandboxEnabled) return new NextResponse(null, { status: 404 });

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not set in .env.local');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';
  const eventId = request.headers.get('x-razorpay-event-id');

  if (!signature || !webhookSignatureMatches(secret, rawBody, signature)) {
    record({
      verdict: 'rejected',
      event: 'unverified',
      eventId,
      paymentId: null,
      orderId: null,
      amount: null,
      action: 'Signature does not match. Body ignored, nothing changed.',
    });
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let body: { event?: string; payload?: { payment?: { entity?: PaymentEntity } } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Body is not JSON.' }, { status: 400 });
  }
  const event = body.event ?? 'unknown';
  const payment = body.payload?.payment?.entity ?? {};
  const common = {
    event,
    eventId,
    paymentId: payment.id ?? null,
    orderId: payment.order_id ?? null,
    amount: payment.amount ?? null,
  };

  if (eventId && !firstSighting(eventId)) {
    record({ ...common, verdict: 'duplicate', action: 'Already handled. Acknowledged, nothing done twice.' });
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const action = ACTIONS[event]?.(payment) ?? 'Not an event this site acts on. Acknowledged.';
  record({ ...common, verdict: 'accepted', action });
  return NextResponse.json({ ok: true });
}

/** The delivery log for /pay-test. Dev only, like everything here. */
export async function GET() {
  if (!sandboxEnabled) return new NextResponse(null, { status: 404 });
  return NextResponse.json({ deliveries: deliveries() });
}
