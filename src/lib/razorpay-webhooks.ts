/**
 * What the sandbox's webhook route has received, kept in memory so /pay-test
 * can show each delivery as it lands.
 *
 * In memory is enough for a dev-only sandbox and wrong for anything real: a
 * restart forgets which event IDs were seen, so a retried event would be
 * handled twice. A real receiver keeps seen IDs in a database.
 *
 * Held on globalThis so a hot reload in `next dev` does not wipe it.
 */

export type Verdict = 'accepted' | 'duplicate' | 'rejected';

export type Delivery = {
  at: string;
  verdict: Verdict;
  event: string;
  eventId: string | null;
  paymentId: string | null;
  orderId: string | null;
  amount: number | null;
  /** What a booking system would do with this event. */
  action: string;
};

type Store = { seen: Set<string>; log: Delivery[] };

const LOG_LIMIT = 50;

const store: Store = ((globalThis as { __razorpayWebhooks?: Store }).__razorpayWebhooks ??= {
  seen: new Set(),
  log: [],
});

/** True the first time an event ID is offered, false on every repeat. */
export function firstSighting(eventId: string): boolean {
  if (store.seen.has(eventId)) return false;
  store.seen.add(eventId);
  return true;
}

export function record(delivery: Omit<Delivery, 'at'>) {
  store.log.unshift({ at: new Date().toISOString(), ...delivery });
  store.log.length = Math.min(store.log.length, LOG_LIMIT);
}

export function deliveries(): Delivery[] {
  return store.log;
}
