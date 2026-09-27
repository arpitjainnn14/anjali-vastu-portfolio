import { ServiceError, type Http } from './http';
import type { Booking, BookingPayment, BookingStatus, Fetched, Unreadable } from './types';

/** GET /booking/ defaults to "upcoming" and has no "all", so ask every bucket. */
const BUCKETS = ['upcoming', 'past', 'cancelled', 'unconfirmed'] as const;
const STATUSES: readonly BookingStatus[] = ['ACCEPTED', 'PENDING', 'CANCELLED', 'REJECTED', 'AWAITING_HOST'];
const LIMIT = 100;
const MAX_PAGES = 10;

const isDate = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));

function parsePayments(raw: unknown): BookingPayment[] | string {
  if (!Array.isArray(raw)) return 'missing payment list';
  const out: BookingPayment[] = [];
  for (const p of raw) {
    const r = (p ?? {}) as Record<string, unknown>;
    if (typeof r.success !== 'boolean' || typeof r.refunded !== 'boolean' || typeof r.amount !== 'number') {
      return 'malformed payment record';
    }
    out.push({
      externalId: typeof r.externalId === 'string' ? r.externalId : null,
      success: r.success,
      refunded: r.refunded,
      amount: r.amount,
    });
  }
  return out;
}

export function parseBooking(raw: unknown): Booking | string {
  if (typeof raw !== 'object' || raw === null) return 'not an object';
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'number' || typeof r.uid !== 'string') return 'missing id';
  if (!STATUSES.includes(r.status as BookingStatus)) return `unknown status ${String(r.status)}`;
  if (!isDate(r.startTime) || !isDate(r.createdAt)) return 'missing times';

  const eventType = (r.eventType ?? {}) as Record<string, unknown>;
  if (typeof eventType.price !== 'number') return 'missing event price';

  const payments = parsePayments(r.payment);
  if (typeof payments === 'string') return payments;

  const attendees = Array.isArray(r.attendees) ? (r.attendees as { name?: unknown }[]) : [];
  const fullName = typeof attendees[0]?.name === 'string' ? attendees[0].name.trim() : '';

  return {
    id: r.id,
    uid: r.uid,
    status: r.status as BookingStatus,
    startTime: new Date(r.startTime),
    createdAt: new Date(r.createdAt),
    fromReschedule: typeof r.fromReschedule === 'string' ? r.fromReschedule : null,
    firstName: fullName.split(/\s+/)[0] || 'Someone',
    price: eventType.price,
    payments,
  };
}

const uidOf = (raw: unknown) =>
  typeof raw === 'object' && raw !== null && typeof (raw as { uid?: unknown }).uid === 'string'
    ? (raw as { uid: string }).uid
    : 'unknown';

export async function listBookings(http: Http, apiKey: string, afterCreated: Date): Promise<Fetched<Booking>> {
  const headers = { Authorization: `Bearer ${apiKey}` };
  const byUid = new Map<string, Booking>();
  const unreadable: Unreadable[] = [];

  for (const bucket of BUCKETS) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const query = new URLSearchParams({
        status: bucket,
        afterCreatedDate: afterCreated.toISOString(),
        limit: String(LIMIT),
        page: String(page),
      });
      const body = (await http.getJson('Cal ID', `https://api.cal.id/booking/?${query}`, headers)) as {
        data?: unknown;
        meta?: { pagination?: { totalPages?: unknown } };
      };
      if (!Array.isArray(body?.data)) {
        throw new ServiceError('Cal ID', null, 'sent an unexpected response (no data list).');
      }

      for (const raw of body.data) {
        const parsed = parseBooking(raw);
        if (typeof parsed === 'string') unreadable.push({ source: 'Cal ID', id: uidOf(raw), reason: parsed });
        else if (parsed.createdAt >= afterCreated) byUid.set(parsed.uid, parsed);
      }

      const totalPages = body.meta?.pagination?.totalPages;
      const donePaging = typeof totalPages === 'number' ? page >= totalPages : body.data.length < LIMIT;
      if (donePaging) break;
      if (page === MAX_PAGES) {
        throw new ServiceError('Cal ID', null, 'returned more than 1,000 bookings in one bucket; the checker needs paging changes.');
      }
    }
  }

  return { items: [...byUid.values()], unreadable };
}
