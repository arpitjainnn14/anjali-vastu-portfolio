import { afterEach, describe, expect, it, vi } from 'vitest';
import { bookingAlert, contactAlert, escapeHtml, formatIndiaTime, sendTelegram } from './telegram';
import { calSignature, isValidCalSignature } from './cal-webhook';

describe('escapeHtml', () => {
  it('escapes the characters Telegram HTML mode reads', () => {
    expect(escapeHtml('<b>Ravi & sons</b>')).toBe('&lt;b&gt;Ravi &amp; sons&lt;/b&gt;');
  });
});

describe('formatIndiaTime', () => {
  it('shows a UTC time in India time', () => {
    expect(formatIndiaTime('2026-09-30T05:30:00Z')).toMatch(/30 Sept?.*11:00\s*am/i);
  });

  it('passes through something that is not a date', () => {
    expect(formatIndiaTime('soon')).toBe('soon');
  });
});

describe('contactAlert', () => {
  it('lists what the visitor sent, escaped', () => {
    const text = contactAlert({
      name: 'Ravi <Kumar>',
      phone: '98100 00000',
      email: '',
      service: 'Numerology',
      message: 'Is 2027 good for a new shop?',
      locale: 'hi',
    });
    expect(text).toContain('Ravi &lt;Kumar&gt;');
    expect(text).toContain('<b>Topic:</b> Numerology');
    expect(text).toContain('Page language:</b> Hindi');
    expect(text).not.toContain('Email:');
  });
});

describe('bookingAlert', () => {
  const hook = {
    triggerEvent: 'BOOKING_CREATED',
    payload: {
      type: 'vedic-astrology',
      title: 'Vedic Astrology between Anjali Jain and Ravi',
      startTime: '2026-09-30T05:30:00Z',
      location: 'Palwal',
      price: 215100,
      currency: 'inr',
      paid: true,
      attendees: [{ name: 'Ravi', email: 'ravi@example.com' }],
      responses: { attendeePhoneNumber: { label: 'Phone', value: '+91 98100 00000' } },
    },
  };

  it('gives the service, time, person, phone and fee', () => {
    const text = bookingAlert(hook)!;
    expect(text).toContain('New booking');
    expect(text).toContain('11:00');
    expect(text).toContain('<b>Name:</b> Ravi');
    expect(text).toContain('+91 98100 00000');
    expect(text).toContain('₹2151 (paid)');
    expect(text).toContain('<b>Where:</b> Palwal');
  });

  it('ignores events that are not about a booking', () => {
    expect(bookingAlert({ ...hook, triggerEvent: 'MEETING_ENDED' })).toBeNull();
  });
});

describe('sendTelegram', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does nothing without a token or chat', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await sendTelegram('hi', { token: '', chatId: '1' })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never throws when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await sendTelegram('hi', { token: 't', chatId: '1' })).toBe(false);
  });
});

describe('isValidCalSignature', () => {
  const body = '{"triggerEvent":"BOOKING_CREATED"}';

  it('accepts the HMAC of the body under the secret', async () => {
    const signature = await calSignature(body, 's3cret');
    expect(await isValidCalSignature(body, signature, 's3cret')).toBe(true);
  });

  it('rejects a wrong secret, a changed body, or no header', async () => {
    const signature = await calSignature(body, 's3cret');
    expect(await isValidCalSignature(body, signature, 'other')).toBe(false);
    expect(await isValidCalSignature(body + ' ', signature, 's3cret')).toBe(false);
    expect(await isValidCalSignature(body, null, 's3cret')).toBe(false);
    expect(await isValidCalSignature(body, signature, undefined)).toBe(false);
  });
});
