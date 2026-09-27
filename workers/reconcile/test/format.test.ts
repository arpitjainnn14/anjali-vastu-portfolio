import { describe, expect, it } from 'vitest';
import { ServiceError } from '../src/http';
import { formatFailure, formatReport, istDate, istTime, rupees } from '../src/format';
import { reconcile, type Report } from '../src/reconcile';
import { NOW, booking, daysAgo, payment, yesterdayIst } from './fixtures';

describe('helpers', () => {
  it('rupees uses Indian grouping and hides zero paise', () => {
    expect(rupees(215100)).toBe('₹2,151');
    expect(rupees(10_000_000)).toBe('₹1,00,000');
    expect(rupees(150)).toBe('₹1.50');
    expect(rupees(0)).toBe('₹0');
  });

  it('istDate and istTime', () => {
    expect(istDate(NOW)).toBe('Sat 26 Sep');
    expect(istTime(NOW)).toBe('8:00 am');
    expect(istTime(yesterdayIst(21, 42))).toBe('9:42 pm');
    expect(istTime(yesterdayIst(0, 5))).toBe('12:05 am');
  });
});

describe('formatReport', () => {
  it('quiet day', () => {
    expect(formatReport(reconcile([payment()], [booking()], [], NOW), NOW)).toBe(
      [
        '✅ Payments check · Sat 26 Sep, 8:00 am',
        'Yesterday: 1 payment, all matched to bookings.',
        'Captured ₹2,151 · Refunded ₹0',
        'Nothing needs you today.',
      ].join('\n'),
    );
  });

  it('no payments at all', () => {
    expect(formatReport(reconcile([], [], [], NOW), NOW)).toContain('Yesterday: no payments.');
  });

  it('problem day: header counts reds and oranges, problem first, with an action line', () => {
    const text = formatReport(reconcile([payment({ orderId: 'order_ghost', createdAt: yesterdayIst(21, 42) })], [], [], NOW), NOW);
    expect(text).toBe(
      [
        '🔴 Payments check · Sat 26 Sep, 8:00 am · 1 needs action',
        '',
        '🔴 Paid, but no booking (customer waiting)',
        '   ₹2,151 · paid Fri 25 Sep, 9:42 pm',
        '   Payment pay_A · Order order_ghost',
        '   → Find the customer in Razorpay: book a slot for them in Cal ID, or refund.',
        '',
        'Yesterday: 1 payment, 0 matched to bookings.',
        'Captured ₹2,151 · Refunded ₹0',
      ].join('\n'),
    );
  });

  it('marks problems older than yesterday as still open', () => {
    const text = formatReport(reconcile([payment({ orderId: 'order_ghost', createdAt: daysAgo(3) })], [], [], NOW), NOW);
    expect(text).toContain('   Still open since Wed 23 Sep');
  });

  it('warns on last-chance problems', () => {
    const text = formatReport(reconcile([payment({ orderId: 'order_ghost', createdAt: daysAgo(28) })], [], [], NOW), NOW);
    expect(text).toContain('   ⚠ Leaves this check in 2 days. Resolve it or note it by hand.');
  });

  it('uses "1 day" (not "1 days") when only one day is left', () => {
    const text = formatReport(reconcile([payment({ orderId: 'order_ghost', createdAt: daysAgo(29) })], [], [], NOW), NOW);
    expect(text).toContain('   ⚠ Leaves this check in 1 day. Resolve it or note it by hand.');
  });

  it('shows the booking name and time for booking problems', () => {
    const text = formatReport(reconcile([], [booking()], [], NOW), NOW);
    expect(text).toContain('🔴 Booking without payment');
    expect(text).toContain('   Priya · booked for Mon 28 Sep, 11:00 am');
  });

  it('uses "need" for more than one', () => {
    const text = formatReport(
      reconcile([payment({ orderId: 'x1' }), payment({ id: 'pay_B', orderId: 'x2' })], [], [], NOW),
      NOW,
    );
    expect(text.split('\n')[0]).toBe('🔴 Payments check · Sat 26 Sep, 8:00 am · 2 need action');
  });

  it('yellow only: yellow header and no "nothing needs you"', () => {
    const text = formatReport(reconcile([payment()], [booking({ status: 'CANCELLED' })], [], NOW), NOW);
    expect(text.split('\n')[0]).toBe('🟡 Payments check · Sat 26 Sep, 8:00 am · 1 to decide');
    expect(text).toContain('🟡 Cancelled, not refunded');
    expect(text).not.toContain('Nothing needs you today.');
  });

  it('orange only: orange header', () => {
    const text = formatReport(
      reconcile([payment({ status: 'authorized', createdAt: daysAgo(2) })], [booking({ status: 'PENDING' })], [], NOW),
      NOW,
    );
    expect(text.split('\n')[0]).toBe('🟠 Payments check · Sat 26 Sep, 8:00 am · 1 needs action');
  });

  it('info only keeps the green header and says nothing needs you', () => {
    const text = formatReport(
      reconcile([payment({ status: 'refunded', amountRefunded: 215100 })], [booking({ status: 'CANCELLED' })], [], NOW),
      NOW,
    );
    expect(text.split('\n')[0]).toMatch(/^✅ Payments check/);
    expect(text).toContain('Nothing needs you today.');
  });

  it('never exceeds 4,000 characters and says how many were left out', () => {
    const many = Array.from({ length: 200 }, (_, i) => payment({ id: `pay_${i}`, orderId: `ghost_${i}` }));
    const text = formatReport(reconcile(many, [], [], NOW), NOW);
    expect(text.length).toBeLessThanOrEqual(4000);
    expect(text).toMatch(/…and \d+ more\. Open Razorpay and Cal ID to see all\./);
    expect(text.split('\n')[0]).toContain('200 need action');
  });

  it('carries no email addresses', () => {
    const report: Report = reconcile([], [booking({ firstName: 'Priya' })], [], NOW);
    expect(formatReport(report, NOW)).not.toMatch(/@/);
  });
});

describe('formatFailure', () => {
  it('names the service and what went wrong', () => {
    expect(formatFailure(new ServiceError('Cal ID', 401, 'rejected the API key (401).'), NOW)).toBe(
      [
        '⚠️ Payments check FAILED · Sat 26 Sep, 8:00 am',
        'Cal ID rejected the API key (401).',
        'Payments were NOT checked today.',
        '→ Tell Arpit. Until fixed, compare Razorpay and Cal ID by hand.',
      ].join('\n'),
    );
  });

  it('handles unknown errors', () => {
    expect(formatFailure(new Error('boom'), NOW).split('\n')[1]).toBe('Unexpected error: boom');
  });
});
