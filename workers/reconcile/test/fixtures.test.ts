import { describe, expect, it } from 'vitest';
import { NOW, booking, order, payment, yesterdayIst } from './fixtures';

describe('fixtures', () => {
  it('NOW is 08:00 IST on Saturday 26 September 2026', () => {
    expect(NOW.toISOString()).toBe('2026-09-26T02:30:00.000Z');
  });

  it('yesterdayIst(10) is 10:00 IST on 25 September', () => {
    expect(yesterdayIst(10).toISOString()).toBe('2026-09-25T04:30:00.000Z');
  });

  it('the default order links the default booking to the default payment', () => {
    expect(order().id).toBe(payment().orderId);
    expect(order().amount).toBe(booking().payments[0].amount);
    const diffMs = Math.abs(order().createdAt.getTime() - booking().createdAt.getTime());
    expect(diffMs).toBeLessThanOrEqual(120_000);
  });
});
