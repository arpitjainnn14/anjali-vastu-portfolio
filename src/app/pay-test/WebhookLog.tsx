'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Delivery } from '@/lib/razorpay-webhooks';

/**
 * Webhook deliveries as the server received them. Polls because the events
 * arrive from Razorpay's server, not from this browser, which is the point:
 * close the checkout tab after paying and the delivery still turns up here.
 */

const POLL_MS = 3000;

const VERDICT_LABEL: Record<Delivery['verdict'], string> = {
  accepted: '✅ accepted',
  duplicate: '↺ duplicate',
  rejected: '❌ rejected',
};

export function WebhookLog() {
  const [items, setItems] = useState<Delivery[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      const response = await fetch('/api/razorpay-webhook').catch(() => null);
      const body = (await response?.json().catch(() => null)) as { deliveries?: Delivery[] } | null;
      if (alive && body?.deliveries) setItems(body.deliveries);
    }
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  /** What an attacker would try: a convincing "payment.captured" with a made-up seal. */
  async function forge() {
    const response = await fetch('/api/razorpay-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': '0'.repeat(64),
        'x-razorpay-event-id': `forged_${Date.now()}`,
      },
      body: JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_FORGED', order_id: 'order_FORGED', amount: 215100 } } },
      }),
    });
    setNote(`Forged webhook answered HTTP ${response.status}.`);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="t-h3 m-0 text-ink">Webhook deliveries</h2>
      <p className="t-body m-0">
        Razorpay&rsquo;s server calls <code>/api/razorpay-webhook</code> directly. New deliveries appear here within a
        few seconds.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={forge}>
          Send a forged webhook
        </Button>
        {note && <span className="t-small text-muted">{note}</span>}
      </div>

      {items.length === 0 ? (
        <p className="t-small m-0 text-muted">No deliveries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line-strong">
          <table className="t-small w-full min-w-[640px] border-collapse text-left text-ink">
            <thead>
              <tr>
                {['Time', 'Result', 'Event', 'Payment', 'What a booking system does'].map((h) => (
                  <th key={h} className="border-b border-line-strong p-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((d, i) => (
                <tr key={`${d.at}-${i}`}>
                  <td className="border-b border-line-strong p-3 tabular-nums">{new Date(d.at).toLocaleTimeString()}</td>
                  <td className="border-b border-line-strong p-3">{VERDICT_LABEL[d.verdict]}</td>
                  <td className="border-b border-line-strong p-3">{d.event}</td>
                  <td className="border-b border-line-strong p-3 break-all">{d.paymentId ?? '–'}</td>
                  <td className="border-b border-line-strong p-3">{d.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
