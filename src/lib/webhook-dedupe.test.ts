import { describe, expect, it } from 'vitest';
import { firstDelivery } from './webhook-dedupe';

function fakeKv() {
  const store = new Map<string, string>();
  const puts: { key: string; ttl?: number }[] = [];
  return {
    store, puts,
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string, o?: { expirationTtl?: number }) => { store.set(k, v); puts.push({ key: k, ttl: o?.expirationTtl }); },
  };
}

describe('firstDelivery (decision 2: no duplicate booking pings)', () => {
  it('is true the first time a message arrives and false when Cal ID sends the same one again', async () => {
    const kv = fakeKv();
    expect(await firstDelivery(kv, '{"triggerEvent":"BOOKING_CREATED","payload":{"uid":"a"}}')).toBe(true);
    expect(await firstDelivery(kv, '{"triggerEvent":"BOOKING_CREATED","payload":{"uid":"a"}}')).toBe(false);
    expect(await firstDelivery(kv, '{"triggerEvent":"BOOKING_CANCELLED","payload":{"uid":"a"}}')).toBe(true);
  });
  it('remembers for a week, and stores only a fingerprint, not the message', async () => {
    const kv = fakeKv();
    await firstDelivery(kv, 'secret name and phone');
    expect(kv.puts[0].ttl).toBe(7 * 24 * 3600);
    expect([...kv.store.keys()][0]).toMatch(/^cal:[0-9a-f]{64}$/);
    expect([...kv.store.values()].join()).not.toContain('secret');
  });
  it('still lets the alert through when the store is missing or failing', async () => {
    expect(await firstDelivery(undefined, 'x')).toBe(true);
    const broken = { get: async () => { throw new Error('down'); }, put: async () => {} };
    expect(await firstDelivery(broken, 'x')).toBe(true);
  });
});
