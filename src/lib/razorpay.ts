import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Razorpay Standard Checkout, server side. A learning sandbox only.
 *
 * Real bookings are paid through Cal ID's Razorpay app (see
 * docs/superpowers/specs/2026-09-26-online-booking-design.md). This exists so
 * the order → checkout → signature flow Cal ID runs can be watched step by
 * step on /pay-test. Nothing here knows about slots, so it must never take a
 * real payment: every entry point is switched off in production builds.
 *
 * Plain fetch rather than the `razorpay` SDK — the whole API surface used is
 * one POST, and seeing the raw call is the point of the sandbox.
 *
 * Server-only: this file reads RAZORPAY_KEY_SECRET. Never import it from a
 * 'use client' component.
 */

export const sandboxEnabled = process.env.NODE_ENV !== 'production';

/** The server decides the price. The browser never sends an amount. */
export const SANDBOX_AMOUNT_PAISE = 215100; // ₹2,151, the consultation fee
export const SANDBOX_CURRENCY = 'INR';

export type RazorpayKeys = { keyId: string; keySecret: string };

export function razorpayKeys(): RazorpayKeys | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export type Order = { id: string; amount: number; currency: string };

export type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; reason: 'auth' | 'rejected' | 'unreachable'; detail?: string };

export async function createOrder(keys: RazorpayKeys, amount: number, receipt: string): Promise<CreateOrderResult> {
  if (!Number.isInteger(amount) || amount < 100) {
    return { ok: false, reason: 'rejected', detail: 'Amount must be a whole number of paise, at least 100.' };
  }

  const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString('base64');

  try {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount, currency: SANDBOX_CURRENCY, receipt }),
      signal: AbortSignal.timeout(10_000),
    });

    const body = (await response.json().catch(() => null)) as
      | (Order & { error?: { description?: string } })
      | null;

    if (response.status === 401) {
      return { ok: false, reason: 'auth', detail: body?.error?.description };
    }
    if (!response.ok || !body?.id) {
      return { ok: false, reason: 'rejected', detail: body?.error?.description };
    }

    return { ok: true, order: { id: body.id, amount: body.amount, currency: body.currency } };
  } catch (error) {
    console.error('[razorpay] could not reach the orders API', error);
    return { ok: false, reason: 'unreachable' };
  }
}

/**
 * The proof that Razorpay, not the browser, says this order was paid.
 *
 * Razorpay signs `order_id|payment_id` with the key secret, which only it and
 * this server hold. A tampered or invented success message cannot produce a
 * matching signature. Compared in constant time so the check leaks nothing
 * about how close a guess was.
 */
export function signatureMatches(keySecret: string, orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
