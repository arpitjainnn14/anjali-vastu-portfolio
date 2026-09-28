'use client';

import { useState } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/Button';

/**
 * The browser half of the sandbox. Each step of the flow is written to an
 * on-page log, so the order ID, payment ID and signature can be seen moving
 * between the three parties.
 */

type SuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type FailedResponse = {
  error: { code: string; description: string; reason?: string; metadata?: { payment_id?: string } };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: SuccessResponse) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: 'payment.failed', callback: (response: FailedResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export function PayTest() {
  const [scriptReady, setScriptReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [lastSuccess, setLastSuccess] = useState<SuccessResponse | null>(null);

  const note = (line: string) => setLog((previous) => [...previous, line]);

  async function verify(response: SuccessResponse, label: string) {
    note(`${label}: sending order ID, payment ID and signature to /api/verify-payment…`);
    const result = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });
    const body = (await result.json().catch(() => ({}))) as { verified?: boolean; error?: string };
    note(
      body.verified
        ? `✅ ${label}: signature matches. A real system would now mark the order paid.`
        : `❌ ${label}: ${body.error ?? 'verification failed'} (HTTP ${result.status})`,
    );
  }

  async function pay() {
    if (!window.Razorpay) return;
    setBusy(true);
    setLog([]);
    setLastSuccess(null);

    note('1. Asking our server to create an order (POST /api/create-order)…');
    const result = await fetch('/api/create-order', { method: 'POST' });
    const order = (await result.json().catch(() => ({}))) as {
      order_id?: string;
      amount?: number;
      currency?: string;
      key_id?: string;
      error?: string;
    };

    if (!result.ok || !order.order_id || !order.key_id || !order.amount || !order.currency) {
      note(`❌ Order not created: ${order.error ?? 'unknown error'} (HTTP ${result.status})`);
      setBusy(false);
      return;
    }

    note(`   Razorpay created ${order.order_id} for ₹${(order.amount / 100).toLocaleString('en-IN')}.`);
    note('2. Opening Razorpay Checkout with that order ID and the public key ID…');

    const checkout = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: 'Anjali Jain',
      description: 'Sandbox test payment',
      handler: async (response) => {
        note(`3. Checkout says paid. payment_id ${response.razorpay_payment_id}`);
        note(`   signature ${response.razorpay_signature}`);
        setLastSuccess(response);
        await verify(response, '4. Real signature');
        setBusy(false);
      },
      modal: {
        ondismiss: () => {
          note('Checkout closed without a successful payment. Nothing was charged.');
          setBusy(false);
        },
      },
      theme: { color: '#b3261e' },
    });

    checkout.on('payment.failed', (response) => {
      const { code, description, reason, metadata } = response.error;
      note(`❌ Payment failed (${code}${reason ? `, ${reason}` : ''}): ${description}`);
      if (metadata?.payment_id) note(`   The failed attempt is ${metadata.payment_id} in the dashboard.`);
      note('   The modal stays open so the customer can retry.');
    });

    checkout.open();
  }

  async function tamper() {
    if (!lastSuccess) return;
    await verify({ ...lastSuccess, razorpay_signature: '0'.repeat(64) }, 'Tampered signature');
  }

  return (
    <div className="flex flex-col gap-4">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
        onError={() => note('❌ Could not load checkout.js. Check your connection.')}
      />

      <div className="flex flex-wrap gap-3">
        <Button onClick={pay} disabled={!scriptReady || busy}>
          {scriptReady ? 'Pay ₹2,151 (test)' : 'Loading checkout…'}
        </Button>
        <Button variant="secondary" onClick={tamper} disabled={!lastSuccess || busy}>
          Resend with a fake signature
        </Button>
      </div>

      {log.length > 0 && (
        <pre className="t-small m-0 overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-line-strong p-4 text-ink">
          {log.join('\n')}
        </pre>
      )}
    </div>
  );
}
