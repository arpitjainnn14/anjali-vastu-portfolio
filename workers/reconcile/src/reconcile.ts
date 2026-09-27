import { rupees } from './money';
import type { Booking, Order, Payment, Unreadable } from './types';

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
/** A booking's Razorpay order is created 1–3 s after the booking, in practice; allow slack either way. */
const ORDER_LINK_WINDOW = 120 * 1000;

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

export function reconcile(payments: Payment[], orders: Order[], bookings: Booking[], unreadable: Unreadable[], now: Date): Report {
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

  // Link: a booking with a charge (a payment[] record with amount > 0) claims the Razorpay
  // order created within 120 s of its own createdAt. Cal ID's payment[] carries no shared ID
  // with Razorpay, so time is the only link; an order matched by more than one booking, or a
  // booking matched to more than one order, can't be trusted and is reported instead of linked.
  const chargeAmount = new Map<string, number>(); // booking uid → first charge's amount
  for (const b of bookings) {
    const charge = b.payments.find((p) => p.amount > 0);
    if (charge) chargeAmount.set(b.uid, charge.amount);
  }

  const candidatesOf = new Map<string, Order[]>(); // booking uid → its filtered candidate orders
  const claimants = new Map<string, string[]>(); // order id → booking uids that claim it
  for (const b of bookings) {
    const expected = chargeAmount.get(b.uid);
    if (expected === undefined) continue;

    let candidates = orders.filter((o) => Math.abs(o.createdAt.getTime() - b.createdAt.getTime()) <= ORDER_LINK_WINDOW);
    if (candidates.length > 1) {
      const sameAmount = candidates.filter((o) => o.amount === expected);
      if (sameAmount.length > 0) candidates = sameAmount;
    }
    candidatesOf.set(b.uid, candidates);
    for (const o of candidates) claimants.set(o.id, [...(claimants.get(o.id) ?? []), b.uid]);
  }

  const chainOfKey = new Map<string, string>(); // order id → chain root
  const calAmountOfKey = new Map<string, number>(); // order id → the booking's expected amount
  for (const b of bookings) {
    const candidates = candidatesOf.get(b.uid);
    if (!candidates || candidates.length === 0) continue; // no charge, or no candidate order

    const ambiguous = candidates.length > 1 || candidates.some((o) => (claimants.get(o.id)?.length ?? 0) > 1);
    if (ambiguous) {
      add('cant_verify', b.createdAt, { detail: `Cal ID ${b.uid}: matches more than one Razorpay order` });
      continue;
    }

    const [order] = candidates;
    chainOfKey.set(order.id, rootOf(b));
    calAmountOfKey.set(order.id, chargeAmount.get(b.uid)!);
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
    // eventType.price can fall back to 0 (event type later deleted), so a booking with a real
    // charge on it still counts as priced even when its price field does not.
    const priced = chain.some((b) => b.price > 0 || chargeAmount.has(b.uid));

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
        const markedPaid = chain.some((b) => b.paid);
        add('booking_no_payment', accepted.createdAt, {
          ...person,
          ...(markedPaid ? { detail: 'Cal ID marks it paid; no matching Razorpay payment found' } : {}),
        });
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
