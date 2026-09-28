import { NextResponse } from 'next/server';
import { createOrder, razorpayKeys, sandboxEnabled, SANDBOX_AMOUNT_PAISE } from '@/lib/razorpay';

/**
 * Step 1 of the /pay-test sandbox: ask Razorpay for an order.
 *
 * The amount is fixed here, not read from the request — an order is how the
 * server pins the price before the customer sees checkout. The response also
 * carries the public key ID, so the browser needs no env var of its own.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  if (!sandboxEnabled) return new NextResponse(null, { status: 404 });

  const keys = razorpayKeys();
  if (!keys) {
    return NextResponse.json({ error: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not set in .env.local.' }, { status: 500 });
  }

  const result = await createOrder(keys, SANDBOX_AMOUNT_PAISE, `pay-test-${Date.now()}`);

  if (!result.ok) {
    console.error('[create-order] failed', result);
    if (result.reason === 'auth') {
      return NextResponse.json({ error: 'Razorpay rejected the keys. Check both values in .env.local.' }, { status: 401 });
    }
    return NextResponse.json({ error: result.detail ?? 'Razorpay did not create the order.' }, { status: 502 });
  }

  return NextResponse.json({
    order_id: result.order.id,
    amount: result.order.amount,
    currency: result.order.currency,
    key_id: keys.keyId,
  });
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } });
}
