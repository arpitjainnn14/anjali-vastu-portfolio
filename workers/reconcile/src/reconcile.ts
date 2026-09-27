import { rupees } from './money';
import type { Booking, Payment, Unreadable } from './types';

/**
 * Pure comparison of Razorpay (the money) with Cal ID (the bookings). No I/O.
 * Rules and severities: docs/superpowers/specs/2026-09-26-payment-reconciliation-design.md
 */

export type Severity = 'red' | 'orange' | 'yellow' | 'info';

export type Kind =
  | 'paid_no_booking'
  | 'paid_booking_unconfirmed'
  | 'booking_no_payment'
  | 'double_charge'
  | 'wrong_amount'
  | 'held_not_taken'
  | 'cant_verify'
  | 'cancelled_not_refunded'
  | 'refunded';

export type Finding = {
  kind: Kind;
  severity: Severity;
  since: Date;
  lastChance: boolean;
  name: string | null;
  amount: number | null;
  paymentId: string | null;
  orderId: string | null;
  bookingStart: Date | null;
  detail: string | null;
};

export type DaySummary = { payments: number; matched: number; capturedPaise: number; refundedPaise: number; failed: number };
export type Report = { findings: Finding[]; yesterday: DaySummary };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const IST_OFFSET = 330 * MINUTE;

const GRACE = 30 * MINUTE;
const HELD_AFTER = 24 * HOUR;
const LAST_CHANCE_AFTER = 27 * DAY;

const SEVERITY: Record<Kind, Severity> = {
  paid_no_booking: 'red',
  paid_booking_unconfirmed: 'red',
  booking_no_payment: 'red',
  double_charge: 'red',
  wrong_amount: 'red',
  held_not_taken: 'orange',
  cant_verify: 'orange',
  cancelled_not_refunded: 'yellow',
  refunded: 'info',
};
const RANK: Record<Severity, number> = { red: 0, orange: 1, yellow: 2, info: 3 };

/** The previous calendar day in IST (UTC+5:30, no daylight saving). */
export function istYesterday(now: Date): { start: Date; end: Date } {
  const ist = new Date(now.getTime() + IST_OFFSET);
  const todayStart = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_OFFSET;
  return { start: new Date(todayStart - DAY), end: new Date(todayStart) };
}

export function reconcile(payments: Payment[], bookings: Booking[], unreadable: Unreadable[], now: Date): Report {
  const t = now.getTime();
  const findings: Finding[] = [];
  const add = (kind: Kind, since: Date, extra: Partial<Finding> = {}) =>
    findings.push({
      kind,
      severity: SEVERITY[kind],
      since,
      lastChance: t - since.getTime() > LAST_CHANCE_AFTER,
      name: null,
      amount: null,
      paymentId: null,
      orderId: null,
      bookingStart: null,
      detail: null,
      ...extra,
    });
  const fresh = (d: Date) => t - d.getTime() < GRACE;

  // Reschedule chains: every booking maps to the uid of the first booking in its chain.
  const byUid = new Map(bookings.map((b) => [b.uid, b]));
  const rootOf = (b: Booking) => {
    let current = b;
    const seen = new Set<string>();
    while (current.fromReschedule && byUid.has(current.fromReschedule) && !seen.has(current.uid)) {
      seen.add(current.uid);
      current = byUid.get(current.fromReschedule)!;
    }
    return current.uid;
  };
  const chains = new Map<string, Booking[]>();
  for (const b of bookings) {
    const root = rootOf(b);
    chains.set(root, [...(chains.get(root) ?? []), b]);
  }

  // Link: Cal ID payment record externalId (= Razorpay order_id) → chain, and Cal ID's own amount.
  const chainOfKey = new Map<string, string>();
  const calAmountOfKey = new Map<string, number>();
  for (const b of bookings) {
    for (const p of b.payments) {
      if (!p.externalId) continue;
      chainOfKey.set(p.externalId, rootOf(b));
      calAmountOfKey.set(p.externalId, p.amount);
    }
  }

  const keptByChain = new Map<string, Payment[]>();
  for (const p of payments) {
    if (fresh(p.createdAt) || p.status === 'created' || p.status === 'failed') continue;
    const ids = { paymentId: p.id, orderId: p.orderId };

    if (p.status === 'authorized') {
      if (t - p.createdAt.getTime() > HELD_AFTER) add('held_not_taken', p.createdAt, { ...ids, amount: p.amount });
      continue;
    }

    // captured or refunded
    if (p.amountRefunded > 0) add('refunded', p.createdAt, { ...ids, amount: p.amountRefunded });
    const kept = p.amount - p.amountRefunded > 0;
    const root = p.orderId ? chainOfKey.get(p.orderId) : undefined;
    if (!root) {
      if (kept) add('paid_no_booking', p.createdAt, { ...ids, amount: p.amount });
      continue;
    }
    if (kept) keptByChain.set(root, [...(keptByChain.get(root) ?? []), p]);
  }

  const matchedIds = new Set<string>();
  for (const [root, chain] of chains) {
    const accepted = chain.find((b) => b.status === 'ACCEPTED');
    const pending = chain.find((b) => b.status === 'PENDING' || b.status === 'AWAITING_HOST');
    const latest = [...chain].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const shown = accepted ?? pending ?? latest;
    const person = { name: shown.firstName, bookingStart: shown.startTime };
    const kept = keptByChain.get(root) ?? [];
    const priced = chain.some((b) => b.price > 0);

    for (const p of kept) {
      const expected = p.orderId ? calAmountOfKey.get(p.orderId) : undefined;
      if (expected !== undefined && expected !== p.amount) {
        add('wrong_amount', p.createdAt, {
          ...person,
          amount: p.amount,
          paymentId: p.id,
          orderId: p.orderId,
          detail: `Cal ID expected ${rupees(expected)}`,
        });
      }
    }
    if (kept.length > 1) {
      add('double_charge', kept[1].createdAt, {
        ...person,
        amount: kept[1].amount,
        paymentId: kept.map((p) => p.id).join(', '),
      });
    }

    const first = kept[0];
    const payIds = first ? { amount: first.amount, paymentId: first.id, orderId: first.orderId } : {};
    if (accepted) {
      // Booking with price > 0 and no captured payment. Not raised when the chain starts with
      // a reschedule of a booking older than the window (that original was checked while in window).
      const rootBooking = byUid.get(root)!;
      if (priced && kept.length === 0 && !fresh(accepted.createdAt) && !rootBooking.fromReschedule) {
        add('booking_no_payment', accepted.createdAt, person);
      }
      if (kept.length === 1 && calAmountOfKey.get(first.orderId ?? '') === first.amount) matchedIds.add(first.id);
    } else if (pending) {
      if (first) add('paid_booking_unconfirmed', first.createdAt, { ...person, ...payIds });
    } else if (first) {
      add('cancelled_not_refunded', first.createdAt, { ...person, ...payIds });
    }
  }

  for (const u of unreadable) add('cant_verify', now, { detail: `${u.source} ${u.id}: ${u.reason}` });

  findings.sort((a, b) => RANK[a.severity] - RANK[b.severity] || a.since.getTime() - b.since.getTime());

  const { start, end } = istYesterday(now);
  const inDay = (d: Date) => d >= start && d < end;
  const yesterday: DaySummary = { payments: 0, matched: 0, capturedPaise: 0, refundedPaise: 0, failed: 0 };
  for (const p of payments) {
    if (!inDay(p.createdAt)) continue;
    if (p.status === 'failed') yesterday.failed++;
    if (p.status !== 'captured' && p.status !== 'refunded') continue;
    yesterday.payments++;
    yesterday.capturedPaise += p.amount;
    yesterday.refundedPaise += p.amountRefunded;
    if (matchedIds.has(p.id)) yesterday.matched++;
  }

  return { findings, yesterday };
}
