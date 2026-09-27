import { describe, expect, it, vi } from 'vitest';
import { ServiceError, type Http } from '../src/http';
import { listBookings, parseBooking } from '../src/calid';

const raw = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  uid: 'bk_7',
  status: 'ACCEPTED',
  startTime: '2026-09-28T03:45:00.000Z',
  createdAt: '2026-09-26T10:07:00.000Z',
  fromReschedule: null,
  attendees: [{ name: 'Priya Sharma', email: 'p@example.com' }],
  eventType: { price: 215100, currency: 'inr' },
  payment: [{ externalId: 'order_7', success: true, refunded: false, amount: 215100 }],
  ...overrides,
});

const page = (data: unknown[], totalPages = 1) => ({ success: true, data, meta: { pagination: { page: 1, totalPages } } });

describe('parseBooking', () => {
  it('maps the API shape, keeping only the first name', () => {
    expect(parseBooking(raw())).toEqual({
      id: 7,
      uid: 'bk_7',
      status: 'ACCEPTED',
      startTime: new Date('2026-09-28T03:45:00.000Z'),
      createdAt: new Date('2026-09-26T10:07:00.000Z'),
      fromReschedule: null,
      firstName: 'Priya',
      price: 215100,
      payments: [{ externalId: 'order_7', success: true, refunded: false, amount: 215100 }],
    });
  });

  it('uses "Someone" when there is no attendee name', () => {
    expect((parseBooking(raw({ attendees: [] })) as { firstName: string }).firstName).toBe('Someone');
  });

  it('returns a reason for an unknown status', () => {
    expect(parseBooking(raw({ status: 'ON_HOLD' }))).toBe('unknown status ON_HOLD');
  });

  it('returns a reason when the payment list is missing', () => {
    expect(parseBooking(raw({ payment: undefined }))).toBe('missing payment list');
  });

  it('returns a reason for a malformed payment record', () => {
    expect(parseBooking(raw({ payment: [{ externalId: 'o', success: 'yes' }] }))).toBe('malformed payment record');
  });
});

describe('listBookings', () => {
  const after = new Date('2026-08-27T02:30:00Z');

  it('asks each of the four status buckets with Bearer auth', async () => {
    const getJson = vi.fn(async () => page([]));
    await listBookings({ getJson }, 'calid_key', after);

    const urls = getJson.mock.calls.map((c) => (c as unknown as [string, string])[1]);
    expect(urls).toEqual(
      ['upcoming', 'past', 'cancelled', 'unconfirmed'].map(
        (s) => `https://api.cal.id/booking/?status=${s}&afterCreatedDate=2026-08-27T02%3A30%3A00.000Z&limit=100&page=1`,
      ),
    );
    expect((getJson.mock.calls[0] as unknown as [string, string, Record<string, string>])[2]).toEqual({
      Authorization: 'Bearer calid_key',
    });
  });

  it('follows totalPages', async () => {
    const getJson = vi
      .fn()
      .mockResolvedValueOnce(page([raw({ uid: 'bk_1' })], 2))
      .mockResolvedValueOnce(page([raw({ uid: 'bk_2' })], 2))
      .mockResolvedValue(page([]));
    const result = await listBookings({ getJson } as Http, 'k', after);

    expect(result.items.map((b) => b.uid)).toEqual(['bk_1', 'bk_2']);
    expect((getJson.mock.calls[1] as unknown as [string, string])[1]).toContain('page=2');
  });

  it('counts a booking seen in two buckets once', async () => {
    const getJson = vi
      .fn()
      .mockResolvedValueOnce(page([raw()]))
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([raw()]));
    const result = await listBookings({ getJson } as Http, 'k', after);

    expect(result.items).toHaveLength(1);
  });

  it('keeps unreadable bookings as Unreadable', async () => {
    const getJson = vi.fn().mockResolvedValueOnce(page([raw({ uid: 'bk_odd', status: 'ON_HOLD' })])).mockResolvedValue(page([]));
    const result = await listBookings({ getJson } as Http, 'k', after);

    expect(result.unreadable).toEqual([{ source: 'Cal ID', id: 'bk_odd', reason: 'unknown status ON_HOLD' }]);
  });

  it('fails the run if a response has no data list', async () => {
    const getJson = vi.fn(async () => ({ success: false }));
    const error = await listBookings({ getJson }, 'k', after).catch((e) => e);

    expect(error).toBeInstanceOf(ServiceError);
    expect(error.message).toBe('sent an unexpected response (no data list).');
  });
});
