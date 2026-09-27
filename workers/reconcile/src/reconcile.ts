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
/** How close, and how much closer than the next candidate, an order must be to trust proximity alone. */
const NEAREST_WINDOW = 10 * 1000;

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

  // Link: a whole reschedule chain (not a single booking) claims a Razorpay order by time.
  // Cal ID's payment[] carries no ID shared with Razorpay. A chain "has a charge" when any
  // booking in it has a payment[] record with amount > 0 (the first such record, searching
  // the chain, sets the expected amount); its candidate orders are those within 120 s of ANY
  // booking's createdAt in the chain — the order is stamped when it was first created, which
  // can predate a reschedule by any amount. Selection: the nearest candidate, if it is within
  // 10 s and at least 10 s closer than the next-nearest (Razorpay creates the real order 1–3 s
  // after the booking, so this is decisive almost always); otherwise the one candidate whose
  // amount matches the chain's, if there is exactly one. Anything else — including two chains
  // settling on the same order — can't be trusted: it is reported as `cant_verify` (always
  // orange, never on its own turned into a red finding) and not linked.
  const chainChargeAmount = new Map<string, number>(); // chain root → first charge's amount
  for (const [root, chain] of chains) {
    for (const b of chain) {
      const charge = b.payments.find((p) => p.amount > 0);
      if (charge) {
        chainChargeAmount.set(root, charge.amount);
        break;
      }
    }
  }

  const distanceToChain = (o: Order, chain: Booking[]) =>
    Math.min(...chain.map((b) => Math.abs(o.createdAt.getTime() - b.createdAt.getTime())));

  const chainOfKey = new Map<string, string>(); // order id → chain root
  const calAmountOfKey = new Map<string, number>(); // order id → the chain's expected amount
  const ambiguousOrderIds = new Set<string>();
  const ambiguousRoots = new Set<string>();
  const flagAmbiguous = (root: string, candidates: Order[]) => {
    ambiguousRoots.add(root);
    for (const o of candidates) ambiguousOrderIds.add(o.id);
    add('cant_verify', byUid.get(root)!.createdAt, { detail: `Cal ID ${root}: matches more than one Razorpay order` });
  };

  const rawCandidatesOf = new Map<string, Order[]>(); // root → its raw (120 s) candidates
  const tentative = new Map<string, Order>(); // root → selected order, before the cross-chain check
  const claimants = new Map<string, string[]>(); // order id → roots that tentatively selected it
  for (const [root, chain] of chains) {
    const expected = chainChargeAmount.get(root);
    if (expected === undefined) continue; // no charge anywhere in the chain

    const raw = orders.filter((o) => distanceToChain(o, chain) <= ORDER_LINK_WINDOW);
    if (raw.length === 0) continue; // no candidate at all: no link, no ambiguity

    rawCandidatesOf.set(root, raw);
    const byDistance = [...raw].sort((a, b) => distanceToChain(a, chain) - distanceToChain(b, chain));
    const nearestDist = distanceToChain(byDistance[0], chain);
    const nextDist = byDistance[1] ? distanceToChain(byDistance[1], chain) : null;

    let selected: Order | undefined;
    if (nearestDist <= NEAREST_WINDOW && (nextDist === null || nextDist - nearestDist >= NEAREST_WINDOW)) {
      selected = byDistance[0];
    } else {
      const sameAmount = raw.filter((o) => o.amount === expected);
      if (sameAmount.length === 1) selected = sameAmount[0];
    }

    if (!selected) {
      flagAmbiguous(root, raw);
      continue;
    }
    tentative.set(root, selected);
    claimants.set(selected.id, [...(claimants.get(selected.id) ?? []), root]);
  }

  for (const [root, order] of tentative) {
    if ((claimants.get(order.id)?.length ?? 0) > 1) {
      flagAmbiguous(root, rawCandidatesOf.get(root)!);
      continue;
    }
    chainOfKey.set(order.id, root);
    calAmountOfKey.set(order.id, chainChargeAmount.get(root)!);
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
      if (kept) {
        if (p.orderId && ambiguousOrderIds.has(p.orderId)) {
          add('cant_verify', p.createdAt, { paymentId: p.id, orderId: p.orderId, detail: 'could belong to more than one Cal ID booking' });
        } else {
          add('paid_no_booking', p.createdAt, { ...ids, amount: p.amount });
        }
      }
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
    // eventType.price can fall back to 0 (event type later deleted), so a chain with a real
    // charge on it still counts as priced even when every booking's price field does not.
    const priced = chain.some((b) => b.price > 0) || chainChargeAmount.has(root);

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
      if (
        priced &&
        kept.length === 0 &&
        !fresh(accepted.createdAt) &&
        !rootBooking.fromReschedule &&
        !ambiguousRoots.has(root)
      ) {
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
