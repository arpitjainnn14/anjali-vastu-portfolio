import type { Booking, Order, Payment } from '../src/types';

/** Saturday 26 Sep 2026, 08:00 IST: the moment the cron fires. */
export const NOW = new Date('2026-09-26T02:30:00Z');

/** Friday 25 Sep 2026 at the given IST hour. Inside "yesterday". */
export const yesterdayIst = (hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 8, 25, hour, minute) - 330 * 60_000);

export const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);

export function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'pay_A',
    orderId: 'order_A',
    status: 'captured',
    amount: 215100,
    amountRefunded: 0,
    createdAt: yesterdayIst(10),
    ...overrides,
  };
}

export function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 1,
    uid: 'bk_A',
    status: 'ACCEPTED',
    startTime: new Date('2026-09-28T05:30:00Z'),
    createdAt: yesterdayIst(10),
    fromReschedule: null,
    firstName: 'Priya',
    price: 215100,
    paid: true,
    payments: [{ success: true, amount: 215100 }],
    ...overrides,
  };
}

export function order(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order_A',
    amount: 215100,
    createdAt: new Date(yesterdayIst(10).getTime() + 2000),
    ...overrides,
  };
}
