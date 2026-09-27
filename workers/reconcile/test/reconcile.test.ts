import { describe, expect, it } from 'vitest';
import { istYesterday, reconcile, type Kind } from '../src/reconcile';
import { NOW, booking, daysAgo, payment, yesterdayIst } from './fixtures';

const kinds = (r: ReturnType<typeof reconcile>) => r.findings.map((f) => f.kind);
const run = (payments = [payment()], bookings = [booking()]) => reconcile(payments, bookings, [], NOW);

describe('istYesterday', () => {
  it('is Friday 25 Sep 00:00–24:00 IST for a run at 08:00 IST on the 26th', () => {
    const { start, end } = istYesterday(NOW);
    expect(start.toISOString()).toBe('2026-09-24T18:30:00.000Z');
    expect(end.toISOString()).toBe('2026-09-25T18:30:00.000Z');
  });
});

describe('reconcile', () => {
  it('matched: no findings, counted in yesterday', () => {
    const r = run();
    expect(r.findings).toEqual([]);
    expect(r.yesterday).toEqual({ payments: 1, matched: 1, capturedPaise: 215100, refundedPaise: 0, failed: 0 });
  });

  it('captured payment with no linked booking → paid_no_booking (red)', () => {
    const r = run([payment({ orderId: 'order_ghost' })], []);
    expect(r.findings[0]).toMatchObject({ kind: 'paid_no_booking', severity: 'red', paymentId: 'pay_A', amount: 215100 });
  });

  it('captured payment linked to a pending booking → paid_booking_unconfirmed (red)', () => {
    expect(kinds(run([payment()], [booking({ status: 'PENDING' })]))).toEqual(['paid_booking_unconfirmed']);
  });

  it('accepted paid booking with no captured payment → booking_no_payment (red)', () => {
    const r = run([], [booking()]);
    expect(r.findings[0]).toMatchObject({ kind: 'booking_no_payment', severity: 'red', name: 'Priya' });
  });

  it('two captured payments on one booking → double_charge (red)', () => {
    const b = booking({
      payments: [
        { externalId: 'order_A', success: true, refunded: false, amount: 215100 },
        { externalId: 'order_B', success: true, refunded: false, amount: 215100 },
      ],
    });
    const r = run([payment(), payment({ id: 'pay_B', orderId: 'order_B' })], [b]);
    expect(kinds(r)).toContain('double_charge');
  });

  it('Razorpay amount differs from Cal ID payment record → wrong_amount (red)', () => {
    expect(kinds(run([payment({ amount: 100 })], [booking()]))).toContain('wrong_amount');
  });

  it('wrong_amount detail names the amount Cal ID expected, in rupees', () => {
    const r = run([payment({ amount: 100 })], [booking()]);
    expect(r.findings.find((f) => f.kind === 'wrong_amount')?.detail).toBe('Cal ID expected ₹2,151');
  });

  it('a later event price change does not flag old bookings', () => {
    expect(run([payment()], [booking({ price: 250000 })]).findings).toEqual([]);
  });

  it('authorized for more than 24 hours → held_not_taken (orange)', () => {
    const r = run([payment({ status: 'authorized', createdAt: daysAgo(2) })], [booking({ status: 'PENDING' })]);
    expect(r.findings[0]).toMatchObject({ kind: 'held_not_taken', severity: 'orange' });
  });

  it('authorized for less than 24 hours → nothing yet', () => {
    const r = run([payment({ status: 'authorized', createdAt: new Date(NOW.getTime() - 3_600_000) })], [booking({ status: 'PENDING' })]);
    expect(kinds(r)).not.toContain('held_not_taken');
  });

  it('cancelled booking with a kept payment → cancelled_not_refunded (yellow)', () => {
    expect(kinds(run([payment()], [booking({ status: 'CANCELLED' })]))).toEqual(['cancelled_not_refunded']);
  });

  it('captured then fully refunded, booking cancelled → only refunded (info)', () => {
    const r = run([payment({ status: 'refunded', amountRefunded: 215100 })], [booking({ status: 'CANCELLED' })]);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]).toMatchObject({ kind: 'refunded', severity: 'info', amount: 215100 });
  });

  it('a fully refunded payment with no booking is not red', () => {
    const r = run([payment({ orderId: 'order_ghost', status: 'refunded', amountRefunded: 215100 })], []);
    expect(kinds(r)).toEqual(['refunded']);
  });

  it('rescheduled booking: payment on the original counts for the new one', () => {
    const original = booking({ uid: 'bk_old', status: 'CANCELLED' });
    const moved = booking({ id: 2, uid: 'bk_new', fromReschedule: 'bk_old', payments: [] });
    expect(run([payment()], [original, moved]).findings).toEqual([]);
  });

  it('free events are ignored', () => {
    expect(run([], [booking({ price: 0, payments: [] })]).findings).toEqual([]);
  });

  it('a kept payment is still checked when the event is now free', () => {
    expect(kinds(run([payment()], [booking({ status: 'CANCELLED', price: 0 })]))).toEqual(['cancelled_not_refunded']);
  });

  it('a reschedule of a booking older than the window is not flagged as unpaid', () => {
    expect(run([], [booking({ uid: 'bk_new', fromReschedule: 'bk_outside', payments: [] })]).findings).toEqual([]);
  });

  it('failed payments are only counted', () => {
    const r = run([payment({ status: 'failed' })], []);
    expect(r.findings).toEqual([]);
    expect(r.yesterday.failed).toBe(1);
  });

  it('records from the last 30 minutes are skipped', () => {
    const fresh = new Date(NOW.getTime() - 10 * 60_000);
    expect(run([payment({ createdAt: fresh, orderId: 'order_ghost' })], [booking({ createdAt: fresh, payments: [] })]).findings).toEqual([]);
  });

  it('problems older than 27 days are marked lastChance', () => {
    const r = run([payment({ orderId: 'order_ghost', createdAt: daysAgo(28) })], []);
    expect(r.findings[0].lastChance).toBe(true);
  });

  it('unreadable records become cant_verify (orange)', () => {
    const r = reconcile([], [], [{ source: 'Cal ID', id: 'bk_x', reason: 'unknown status ON_HOLD' }], NOW);
    expect(r.findings[0]).toMatchObject({ kind: 'cant_verify', severity: 'orange', detail: 'Cal ID bk_x: unknown status ON_HOLD' });
  });

  it('sorts red before orange before yellow before info', () => {
    const r = reconcile(
      [
        payment({ id: 'p1', orderId: 'o1', status: 'refunded', amountRefunded: 215100 }),
        payment({ id: 'p2', orderId: 'o2' }),
        payment({ id: 'p3', orderId: 'o3', status: 'authorized', createdAt: daysAgo(2) }),
        payment({ id: 'p4', orderId: 'ghost' }),
      ],
      [
        booking({ uid: 'b1', status: 'CANCELLED', payments: [{ externalId: 'o1', success: true, refunded: true, amount: 215100 }] }),
        booking({ uid: 'b2', status: 'CANCELLED', payments: [{ externalId: 'o2', success: true, refunded: false, amount: 215100 }] }),
      ],
      [],
      NOW,
    );
    const order: Kind[] = ['paid_no_booking', 'held_not_taken', 'cancelled_not_refunded', 'refunded'];
    expect(kinds(r)).toEqual(order);
  });

  it('yesterday counts only payments created in the previous IST day', () => {
    const r = run([payment(), payment({ id: 'pay_old', orderId: 'order_old', createdAt: daysAgo(3) })], [
      booking(),
      booking({ uid: 'bk_old', payments: [{ externalId: 'order_old', success: true, refunded: false, amount: 215100 }], createdAt: daysAgo(3) }),
    ]);
    expect(r.yesterday.payments).toBe(1);
    expect(r.yesterday.capturedPaise).toBe(215100);
  });

  it('yesterday boundary: 23:59 IST on the 25th counts, 00:00 IST on the 26th does not', () => {
    const late = payment({ createdAt: yesterdayIst(23, 59) });
    const next = payment({ id: 'pay_next', orderId: 'order_next', createdAt: new Date('2026-09-25T18:30:00Z') });
    const r = run([late, next], [
      booking(),
      booking({ uid: 'bk_next', payments: [{ externalId: 'order_next', success: true, refunded: false, amount: 215100 }] }),
    ]);
    expect(r.yesterday.payments).toBe(1);
  });
});
