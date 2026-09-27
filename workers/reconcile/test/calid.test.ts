import { describe, expect, it, vi } from 'vitest';
import { ServiceError, type Http } from '../src/http';
import { listBookings, parseBooking } from '../src/calid';

const raw = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  uid: 'bk_7',
  status: 'ACCEPTED',
  paid: true,
  startTime: '2026-09-28T03:45:00.000Z',
  createdAt: '2026-09-26T10:07:00.000Z',
  fromReschedule: null,
  attendees: [{ name: 'Priya Sharma', email: 'p@example.com' }],
  eventType: { price: 215100, currency: 'inr' },
  payment: [{ paymentOption: 'ON_BOOKING', success: true, amount: 215100 }],
  ...overrides,
});

const page = (data: unknown[], totalPages = 1) => ({ success: true, data, meta: { pagination: { page: 1, totalPages } } });

describe('parseBooking', () => {
  it('maps the API shape, keeping only the first name', () => {
    expect(parseBooking(raw())).toEqual({
      id: 7,
      uid: 'bk_7',
      status: 'ACCEPTED',
      paid: true,
      startTime: new Date('2026-09-28T03:45:00.000Z'),
      createdAt: new Date('2026-09-26T10:07:00.000Z'),
      fromReschedule: null,
      firstName: 'Priya',
      price: 215100,
      payments: [{ success: true, amount: 215100 }],
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
    expect(parseBooking(raw({ payment: [{ success: 'yes' }] }))).toBe('malformed payment record');
  });

  it('parses payment records with no externalId or refunded field', () => {
    expect((parseBooking(raw()) as { payments: unknown }).payments).toEqual([{ success: true, amount: 215100 }]);
  });

  it('returns a reason when the paid flag is missing', () => {
    expect(parseBooking(raw({ paid: undefined }))).toBe('missing paid flag');
  });

  it('defaults price to 0 when eventType price is missing', () => {
    expect((parseBooking(raw({ eventType: { currency: 'usd' } })) as { price: number }).price).toBe(0);
  });

  it('defaults price to 0 when eventType price is not a number', () => {
    expect((parseBooking(raw({ eventType: { price: 'free', currency: 'usd' } })) as { price: number }).price).toBe(0);
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

  it('keeps paging while pages are full when totalPages is missing', async () => {
    const full = Array.from({ length: 100 }, (_, i) => raw({ uid: `bk_${i}`, id: i }));
    const getJson = vi
      .fn()
      .mockResolvedValueOnce({ success: true, data: full })
      .mockResolvedValueOnce({ success: true, data: [raw({ uid: 'bk_last', id: 999 })] })
      .mockResolvedValue({ success: true, data: [] });
    const result = await listBookings({ getJson } as Http, 'k', after);

    expect(result.items).toHaveLength(101);
    expect((getJson.mock.calls[1] as unknown as [string, string])[1]).toContain('page=2');
  });

  it('throws when a bucket exceeds the page cap', async () => {
    const full = Array.from({ length: 100 }, (_, i) => raw({ uid: `bk_${i}`, id: i }));
    const getJson = vi.fn(async () => page(full, 99));
    const error = await listBookings({ getJson }, 'k', after).catch((e) => e);

    expect(error).toBeInstanceOf(ServiceError);
    expect(error.message).toBe('returned more than 1,000 bookings in one bucket; the checker needs paging changes.');
  });

  it('drops bookings created before the window even if Cal ID returns them', async () => {
    const stale = raw({ uid: 'bk_stale', createdAt: '2026-08-01T00:00:00.000Z' });
    const getJson = vi.fn().mockResolvedValueOnce(page([stale])).mockResolvedValue(page([]));
    const result = await listBookings({ getJson } as Http, 'k', after);

    expect(result.items).toEqual([]);
    expect(result.unreadable).toEqual([]);
  });
});
