import { describe, expect, it } from 'vitest';
import { NOW, booking, payment, yesterdayIst } from './fixtures';

describe('fixtures', () => {
  it('NOW is 08:00 IST on Saturday 26 September 2026', () => {
    expect(NOW.toISOString()).toBe('2026-09-26T02:30:00.000Z');
  });

  it('yesterdayIst(10) is 10:00 IST on 25 September', () => {
    expect(yesterdayIst(10).toISOString()).toBe('2026-09-25T04:30:00.000Z');
  });

  it('the default payment and booking are linked by order ID', () => {
    expect(booking().payments[0].externalId).toBe(payment().orderId);
  });
});
