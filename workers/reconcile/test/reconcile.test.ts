import { describe, expect, it } from 'vitest';
import { istYesterday, reconcile, type Kind } from '../src/reconcile';
import { NOW, booking, daysAgo, order, payment, yesterdayIst } from './fixtures';

const kinds = (r: ReturnType<typeof reconcile>) => r.findings.map((f) => f.kind);
const run = (payments = [payment()], orders = [order()], bookings = [booking()]) => reconcile(payments, orders, bookings, [], NOW);

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
    const r = run([payment({ orderId: 'order_ghost' })], [], []);
    expect(r.findings[0]).toMatchObject({ kind: 'paid_no_booking', severity: 'red', paymentId: 'pay_A', amount: 215100 });
  });

  it('captured payment linked to a pending booking → paid_booking_unconfirmed (red)', () => {
    expect(kinds(run([payment()], [order()], [booking({ status: 'PENDING' })]))).toEqual(['paid_booking_unconfirmed']);
  });

  it('accepted paid booking with no captured payment → booking_no_payment (red)', () => {
    const r = run([], [], [booking()]);
    expect(r.findings[0]).toMatchObject({ kind: 'booking_no_payment', severity: 'red', name: 'Priya' });
  });

  it('two captured payments across a reschedule chain → double_charge (red)', () => {
    const t1 = yesterdayIst(9);
    const t2 = yesterdayIst(11);
    const original = booking({ uid: 'bk_orig', status: 'CANCELLED', createdAt: t1 });
    const moved = booking({ id: 2, uid: 'bk_new', fromReschedule: 'bk_orig', createdAt: t2 });
    const orderOrig = order({ id: 'order_orig', createdAt: new Date(t1.getTime() + 2000) });
    const orderNew = order({ id: 'order_new', createdAt: new Date(t2.getTime() + 2000) });
    const payOrig = payment({ id: 'pay_orig', orderId: 'order_orig', createdAt: t1 });
    const payNew = payment({ id: 'pay_new', orderId: 'order_new', createdAt: t2 });
    const r = run([payOrig, payNew], [orderOrig, orderNew], [original, moved]);
    expect(kinds(r)).toContain('double_charge');
  });

  it('Razorpay amount differs from Cal ID payment record → wrong_amount (red)', () => {
    expect(kinds(run([payment({ amount: 100 })], [order()], [booking()]))).toContain('wrong_amount');
  });

  it('wrong_amount detail names the amount Cal ID expected, in rupees', () => {
    const r = run([payment({ amount: 100 })], [order()], [booking()]);
    expect(r.findings.find((f) => f.kind === 'wrong_amount')?.detail).toBe('Cal ID expected ₹2,151');
  });

  it('a later event price change does not flag old bookings', () => {
    expect(run([payment()], [order()], [booking({ price: 250000 })]).findings).toEqual([]);
  });

  it('authorized for more than 24 hours → held_not_taken (orange)', () => {
    const r = run([payment({ status: 'authorized', createdAt: daysAgo(2) })], [], [booking({ status: 'PENDING' })]);
    expect(r.findings[0]).toMatchObject({ kind: 'held_not_taken', severity: 'orange' });
  });

  it('authorized for less than 24 hours → nothing yet', () => {
    const r = run([payment({ status: 'authorized', createdAt: new Date(NOW.getTime() - 3_600_000) })], [], [booking({ status: 'PENDING' })]);
    expect(kinds(r)).not.toContain('held_not_taken');
  });

  it('cancelled booking with a kept payment → cancelled_not_refunded (yellow)', () => {
    expect(kinds(run([payment()], [order()], [booking({ status: 'CANCELLED' })]))).toEqual(['cancelled_not_refunded']);
  });

  it('captured then fully refunded, booking cancelled → only refunded (info)', () => {
    const r = run([payment({ status: 'refunded', amountRefunded: 215100 })], [], [booking({ status: 'CANCELLED' })]);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]).toMatchObject({ kind: 'refunded', severity: 'info', amount: 215100 });
  });

  it('a fully refunded payment with no booking is not red', () => {
    const r = run([payment({ orderId: 'order_ghost', status: 'refunded', amountRefunded: 215100 })], [], []);
    expect(kinds(r)).toEqual(['refunded']);
  });

  it('rescheduled booking: payment on the original counts for the new one', () => {
    const original = booking({ uid: 'bk_old', status: 'CANCELLED' });
    const moved = booking({ id: 2, uid: 'bk_new', fromReschedule: 'bk_old', payments: [] });
    expect(run([payment()], [order()], [original, moved]).findings).toEqual([]);
  });

  it('free events are ignored', () => {
    expect(run([], [], [booking({ price: 0, payments: [] })]).findings).toEqual([]);
  });

  it('a kept payment is still checked when the event is now free', () => {
    expect(kinds(run([payment()], [order()], [booking({ status: 'CANCELLED', price: 0 })]))).toEqual(['cancelled_not_refunded']);
  });

  it('a reschedule of a booking older than the window is not flagged as unpaid', () => {
    expect(run([], [], [booking({ uid: 'bk_new', fromReschedule: 'bk_outside', payments: [] })]).findings).toEqual([]);
  });

  it('failed payments are only counted', () => {
    const r = run([payment({ status: 'failed' })], [], []);
    expect(r.findings).toEqual([]);
    expect(r.yesterday.failed).toBe(1);
  });

  it('records from the last 30 minutes are skipped', () => {
    const fresh = new Date(NOW.getTime() - 10 * 60_000);
    expect(
      run([payment({ createdAt: fresh, orderId: 'order_ghost' })], [], [booking({ createdAt: fresh, payments: [] })]).findings,
    ).toEqual([]);
  });

  it('problems older than 27 days are marked lastChance', () => {
    const r = run([payment({ orderId: 'order_ghost', createdAt: daysAgo(28) })], [], []);
    expect(r.findings[0].lastChance).toBe(true);
  });

  it('unreadable records become cant_verify (orange)', () => {
    const r = reconcile([], [], [], [{ source: 'Cal ID', id: 'bk_x', reason: 'unknown status ON_HOLD' }], NOW);
    expect(r.findings[0]).toMatchObject({ kind: 'cant_verify', severity: 'orange', detail: 'Cal ID bk_x: unknown status ON_HOLD' });
  });

  it('sorts red before orange before yellow before info', () => {
    const t1 = yesterdayIst(9);
    const t2 = yesterdayIst(13);
    const r = reconcile(
      [
        payment({ id: 'p1', orderId: 'o1', status: 'refunded', amountRefunded: 215100 }),
        payment({ id: 'p2', orderId: 'o2' }),
        payment({ id: 'p3', orderId: 'o3', status: 'authorized', createdAt: daysAgo(2) }),
        payment({ id: 'p4', orderId: 'ghost' }),
      ],
      [
        order({ id: 'o1', createdAt: new Date(t1.getTime() + 2000) }),
        order({ id: 'o2', createdAt: new Date(t2.getTime() + 2000) }),
      ],
      [
        booking({ uid: 'b1', status: 'CANCELLED', createdAt: t1, payments: [{ success: true, amount: 215100 }] }),
        booking({ uid: 'b2', status: 'CANCELLED', createdAt: t2, payments: [{ success: true, amount: 215100 }] }),
      ],
      [],
      NOW,
    );
    const order_: Kind[] = ['paid_no_booking', 'held_not_taken', 'cancelled_not_refunded', 'refunded'];
    expect(kinds(r)).toEqual(order_);
  });

  it('yesterday counts only payments created in the previous IST day', () => {
    const r = run(
      [payment(), payment({ id: 'pay_old', orderId: 'order_old', createdAt: daysAgo(3) })],
      [order(), order({ id: 'order_old', createdAt: new Date(daysAgo(3).getTime() + 2000) })],
      [booking(), booking({ uid: 'bk_old', payments: [{ success: true, amount: 215100 }], createdAt: daysAgo(3) })],
    );
    expect(r.yesterday.payments).toBe(1);
    expect(r.yesterday.capturedPaise).toBe(215100);
  });

  it('yesterday boundary: 23:59 IST on the 25th counts, 00:00 IST on the 26th does not', () => {
    const late = payment({ createdAt: yesterdayIst(23, 59) });
    const next = payment({ id: 'pay_next', orderId: 'order_next', createdAt: new Date('2026-09-25T18:30:00Z') });
    const bkNextCreatedAt = yesterdayIst(14);
    const r = run(
      [late, next],
      [order(), order({ id: 'order_next', createdAt: new Date(bkNextCreatedAt.getTime() + 2000) })],
      [booking(), booking({ uid: 'bk_next', createdAt: bkNextCreatedAt, payments: [{ success: true, amount: 215100 }] })],
    );
    expect(r.yesterday.payments).toBe(1);
  });

  describe('linking bookings to Razorpay orders by time', () => {
    it('an order created a few seconds after the booking links', () => {
      const t = yesterdayIst(9);
      const b = booking({ createdAt: t });
      const o = order({ createdAt: new Date(t.getTime() + 3000) });
      expect(run([payment()], [o], [b]).findings).toEqual([]);
    });

    it('an order created 5 minutes after the booking does not link: the payment is orphaned and the booking looks unpaid', () => {
      const t = yesterdayIst(9);
      const b = booking({ createdAt: t });
      const o = order({ createdAt: new Date(t.getTime() + 5 * 60_000) });
      const r = run([payment()], [o], [b]);

      expect(r.findings).toContainEqual(expect.objectContaining({ kind: 'paid_no_booking', paymentId: 'pay_A' }));
      expect(r.findings).toContainEqual(
        expect.objectContaining({ kind: 'booking_no_payment', detail: 'Cal ID marks it paid; no matching Razorpay payment found' }),
      );
    });

    it('two bookings 30 seconds apart with different amounts each link to their own order', () => {
      const t1 = yesterdayIst(9);
      const t2 = new Date(t1.getTime() + 30_000);
      const b1 = booking({ uid: 'b1', createdAt: t1, price: 100000, payments: [{ success: true, amount: 100000 }] });
      const b2 = booking({ uid: 'b2', createdAt: t2, price: 200000, payments: [{ success: true, amount: 200000 }] });
      const o1 = order({ id: 'o1', amount: 100000, createdAt: new Date(t1.getTime() + 2000) });
      const o2 = order({ id: 'o2', amount: 200000, createdAt: new Date(t2.getTime() + 2000) });
      const p1 = payment({ id: 'p1', orderId: 'o1', amount: 100000 });
      const p2 = payment({ id: 'p2', orderId: 'o2', amount: 200000 });

      expect(run([p1, p2], [o1, o2], [b1, b2]).findings).toEqual([]);
    });

    it('two same-amount bookings 30 seconds apart with two candidate orders → both cant_verify, neither linked', () => {
      const t1 = yesterdayIst(9);
      const t2 = new Date(t1.getTime() + 30_000);
      const b1 = booking({ uid: 'b1', createdAt: t1 });
      const b2 = booking({ uid: 'b2', createdAt: t2 });
      const o1 = order({ id: 'o1', createdAt: new Date(t1.getTime() + 2000) });
      const o2 = order({ id: 'o2', createdAt: new Date(t2.getTime() + 2000) });

      const r = run([], [o1, o2], [b1, b2]);
      const cantVerify = r.findings.filter((f) => f.kind === 'cant_verify');
      expect(cantVerify).toHaveLength(2);
      expect(cantVerify.map((f) => f.detail).sort()).toEqual([
        'Cal ID b1: matches more than one Razorpay order',
        'Cal ID b2: matches more than one Razorpay order',
      ]);
    });

    it('wrong_amount still fires through the time-based link', () => {
      const t = yesterdayIst(9);
      const b = booking({ createdAt: t });
      const o = order({ createdAt: new Date(t.getTime() + 2000) });
      expect(kinds(run([payment({ amount: 100 })], [o], [b]))).toContain('wrong_amount');
    });

    it('an abandoned PENDING checkout (paid:false, payment success:false) with an order but no payment is not flagged', () => {
      const t = yesterdayIst(9);
      const b = booking({ status: 'PENDING', paid: false, createdAt: t, payments: [{ success: false, amount: 215100 }] });
      const o = order({ createdAt: new Date(t.getTime() + 2000) });
      expect(run([], [o], [b]).findings).toEqual([]);
    });
  });
});
