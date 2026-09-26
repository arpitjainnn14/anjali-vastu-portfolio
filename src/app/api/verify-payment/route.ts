import { NextResponse } from 'next/server';
import { razorpayKeys, sandboxEnabled, signatureMatches } from '@/lib/razorpay';

/**
 * Step 3 of the /pay-test sandbox: check the signature checkout handed back.
 *
 * Until this passes, a "success" from the browser is only a claim. This is
 * the moment a real system would mark the order paid and confirm the booking.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!sandboxEnabled) return new NextResponse(null, { status: 404 });

  const keys = razorpayKeys();
  if (!keys) {
    return NextResponse.json({ verified: false, error: 'Razorpay keys are not set.' }, { status: 500 });
  }

  const body = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const field = (key: string) => (typeof body[key] === 'string' ? (body[key] as string) : '');

  const orderId = field('razorpay_order_id');
  const paymentId = field('razorpay_payment_id');
  const signature = field('razorpay_signature');

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ verified: false, error: 'Missing order ID, payment ID or signature.' }, { status: 400 });
  }

  if (!signatureMatches(keys.keySecret, orderId, paymentId, signature)) {
    return NextResponse.json({ verified: false, error: 'Signature does not match. Not marked as paid.' }, { status: 400 });
  }

  return NextResponse.json({ verified: true, order_id: orderId, payment_id: paymentId });
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } });
}
