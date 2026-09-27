import { ServiceError, type Http } from './http';
import type { Fetched, Order, Payment, PaymentStatus, Unreadable } from './types';

const STATUSES: readonly PaymentStatus[] = ['created', 'authorized', 'captured', 'refunded', 'failed'];
const PAGE = 100;
const MAX_PAGES = 10;

export function parsePayment(raw: unknown): Payment | string {
  if (typeof raw !== 'object' || raw === null) return 'not an object';
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return 'missing id';
  if (!STATUSES.includes(r.status as PaymentStatus)) return `unknown status ${String(r.status)}`;
  if (typeof r.amount !== 'number') return 'missing amount';
  if (typeof r.created_at !== 'number') return 'missing created_at';

  return {
    id: r.id,
    orderId: typeof r.order_id === 'string' ? r.order_id : null,
    status: r.status as PaymentStatus,
    amount: r.amount,
    amountRefunded: typeof r.amount_refunded === 'number' ? r.amount_refunded : 0,
    createdAt: new Date(r.created_at * 1000),
  };
}

export function parseOrder(raw: unknown): Order | string {
  if (typeof raw !== 'object' || raw === null) return 'not an object';
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string') return 'missing id';
  if (typeof r.amount !== 'number') return 'missing amount';
  if (typeof r.created_at !== 'number') return 'missing created_at';

  return {
    id: r.id,
    amount: r.amount,
    createdAt: new Date(r.created_at * 1000),
  };
}

const idOf = (raw: unknown) =>
  typeof raw === 'object' && raw !== null && typeof (raw as { id?: unknown }).id === 'string'
    ? (raw as { id: string }).id
    : 'unknown';

/** Pages through a Razorpay `items` list endpoint, sharing the paging/cap/ServiceError shape. */
async function listPaged<T>(
  http: Http,
  auth: string,
  urlFor: (skip: number) => string,
  parse: (raw: unknown) => T | string,
  overflow: string,
): Promise<Fetched<T>> {
  const items: T[] = [];
  const unreadable: Unreadable[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = urlFor(page * PAGE);
    const body = (await http.getJson('Razorpay', url, { Authorization: auth })) as { items?: unknown };
    if (!Array.isArray(body?.items)) {
      throw new ServiceError('Razorpay', null, 'sent an unexpected response (no items list).');
    }

    for (const raw of body.items) {
      const parsed = parse(raw);
      if (typeof parsed === 'string') unreadable.push({ source: 'Razorpay', id: idOf(raw), reason: parsed });
      else items.push(parsed);
    }
    if (body.items.length < PAGE) return { items, unreadable };
  }

  throw new ServiceError('Razorpay', null, overflow);
}

export async function listPayments(
  http: Http,
  keyId: string,
  keySecret: string,
  from: Date,
  to: Date,
): Promise<Fetched<Payment>> {
  const auth = 'Basic ' + btoa(`${keyId}:${keySecret}`);
  const window = `from=${Math.floor(from.getTime() / 1000)}&to=${Math.floor(to.getTime() / 1000)}`;

  return listPaged(
    http,
    auth,
    (skip) => `https://api.razorpay.com/v1/payments?${window}&count=${PAGE}&skip=${skip}`,
    parsePayment,
    'returned more than 1,000 payments in 30 days; the checker needs paging changes.',
  );
}

export async function listOrders(
  http: Http,
  keyId: string,
  keySecret: string,
  from: Date,
  to: Date,
): Promise<Fetched<Order>> {
  const auth = 'Basic ' + btoa(`${keyId}:${keySecret}`);
  const window = `from=${Math.floor(from.getTime() / 1000)}&to=${Math.floor(to.getTime() / 1000)}`;

  return listPaged(
    http,
    auth,
    (skip) => `https://api.razorpay.com/v1/orders?${window}&count=${PAGE}&skip=${skip}`,
    parseOrder,
    'returned more than 1,000 orders in 30 days; the checker needs paging changes.',
  );
}
