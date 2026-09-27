import { describe, expect, it, vi } from 'vitest';
import { ServiceError, type Http } from '../src/http';
import { listOrders, listPayments, parseOrder, parsePayment } from '../src/razorpay';

const raw = (overrides: Record<string, unknown> = {}) => ({
  id: 'pay_1',
  order_id: 'order_1',
  status: 'captured',
  amount: 215100,
  amount_refunded: 0,
  created_at: 1790380800,
  ...overrides,
});

describe('parsePayment', () => {
  it('maps the API shape to Payment', () => {
    expect(parsePayment(raw())).toEqual({
      id: 'pay_1',
      orderId: 'order_1',
      status: 'captured',
      amount: 215100,
      amountRefunded: 0,
      createdAt: new Date(1790380800 * 1000),
    });
  });

  it('treats a missing order ID as null', () => {
    expect((parsePayment(raw({ order_id: null })) as { orderId: unknown }).orderId).toBeNull();
  });

  it('returns a reason for an unknown status', () => {
    expect(parsePayment(raw({ status: 'pending_review' }))).toBe('unknown status pending_review');
  });

  it('returns a reason when amount is missing', () => {
    expect(parsePayment(raw({ amount: undefined }))).toBe('missing amount');
  });
});

describe('listPayments', () => {
  const from = new Date('2026-08-27T02:30:00Z');
  const to = new Date('2026-09-26T02:30:00Z');

  it('sends Basic auth and the window in Unix seconds', async () => {
    const getJson = vi.fn(async () => ({ items: [raw()] }));
    await listPayments({ getJson }, 'rzp_live_id', 'secret', from, to);

    const [service, url, headers] = getJson.mock.calls[0] as unknown as [string, string, Record<string, string>];
    expect(service).toBe('Razorpay');
    expect(url).toBe('https://api.razorpay.com/v1/payments?from=1787797800&to=1790389800&count=100&skip=0');
    expect(headers.Authorization).toBe('Basic ' + btoa('rzp_live_id:secret'));
  });

  it('pages with skip until a short page', async () => {
    const full = Array.from({ length: 100 }, (_, i) => raw({ id: `pay_${i}` }));
    const getJson = vi.fn().mockResolvedValueOnce({ items: full }).mockResolvedValueOnce({ items: [raw({ id: 'pay_last' })] });
    const result = await listPayments({ getJson } as Http, 'k', 's', from, to);

    expect(result.items).toHaveLength(101);
    expect((getJson.mock.calls[1] as unknown as [string, string])[1]).toContain('skip=100');
  });

  it('keeps unreadable records as Unreadable instead of dropping them', async () => {
    const getJson = vi.fn(async () => ({ items: [raw(), raw({ id: 'pay_odd', status: 'weird' })] }));
    const result = await listPayments({ getJson }, 'k', 's', from, to);

    expect(result.items).toHaveLength(1);
    expect(result.unreadable).toEqual([{ source: 'Razorpay', id: 'pay_odd', reason: 'unknown status weird' }]);
  });

  it('fails the whole run if the response has no items list', async () => {
    const getJson = vi.fn(async () => ({ error: 'x' }));
    const error = await listPayments({ getJson }, 'k', 's', from, to).catch((e) => e);

    expect(error).toBeInstanceOf(ServiceError);
    expect(error.message).toBe('sent an unexpected response (no items list).');
  });
});

const rawOrder = (overrides: Record<string, unknown> = {}) => ({
  id: 'order_1',
  amount: 215100,
  created_at: 1790380800,
  ...overrides,
});

describe('parseOrder', () => {
  it('maps the API shape to Order', () => {
    expect(parseOrder(rawOrder())).toEqual({
      id: 'order_1',
      amount: 215100,
      createdAt: new Date(1790380800 * 1000),
    });
  });

  it('returns a reason when id is missing', () => {
    expect(parseOrder(rawOrder({ id: undefined }))).toBe('missing id');
  });

  it('returns a reason when amount is missing', () => {
    expect(parseOrder(rawOrder({ amount: undefined }))).toBe('missing amount');
  });

  it('returns a reason when created_at is missing', () => {
    expect(parseOrder(rawOrder({ created_at: undefined }))).toBe('missing created_at');
  });
});

describe('listOrders', () => {
  const from = new Date('2026-08-27T02:30:00Z');
  const to = new Date('2026-09-26T02:30:00Z');

  it('sends Basic auth and the window in Unix seconds, to /v1/orders', async () => {
    const getJson = vi.fn(async () => ({ items: [rawOrder()] }));
    await listOrders({ getJson }, 'rzp_live_id', 'secret', from, to);

    const [service, url, headers] = getJson.mock.calls[0] as unknown as [string, string, Record<string, string>];
    expect(service).toBe('Razorpay');
    expect(url).toBe('https://api.razorpay.com/v1/orders?from=1787797800&to=1790389800&count=100&skip=0');
    expect(headers.Authorization).toBe('Basic ' + btoa('rzp_live_id:secret'));
  });

  it('pages with skip until a short page', async () => {
    const full = Array.from({ length: 100 }, (_, i) => rawOrder({ id: `order_${i}` }));
    const getJson = vi.fn().mockResolvedValueOnce({ items: full }).mockResolvedValueOnce({ items: [rawOrder({ id: 'order_last' })] });
    const result = await listOrders({ getJson } as Http, 'k', 's', from, to);

    expect(result.items).toHaveLength(101);
    expect((getJson.mock.calls[1] as unknown as [string, string])[1]).toContain('skip=100');
  });

  it('keeps unreadable records as Unreadable instead of dropping them', async () => {
    const getJson = vi.fn(async () => ({ items: [rawOrder(), rawOrder({ id: undefined })] }));
    const result = await listOrders({ getJson }, 'k', 's', from, to);

    expect(result.items).toHaveLength(1);
    expect(result.unreadable).toEqual([{ source: 'Razorpay', id: 'unknown', reason: 'missing id' }]);
  });

  it('fails the whole run if the response has no items list', async () => {
    const getJson = vi.fn(async () => ({ error: 'x' }));
    const error = await listOrders({ getJson }, 'k', 's', from, to).catch((e) => e);

    expect(error).toBeInstanceOf(ServiceError);
    expect(error.message).toBe('sent an unexpected response (no items list).');
  });
});
