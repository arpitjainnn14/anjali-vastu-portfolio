/** The few KV methods used here, so tests can pass a fake. */
export interface DedupeStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

const WEEK_SECONDS = 7 * 24 * 3600;

async function fingerprint(body: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * True the first time this exact Cal ID message arrives, false when it is delivered again (Cal ID retries, or sends a
 * copy). Only a fingerprint of the message is kept, for a week. If the store is missing or fails, the alert goes out
 * anyway: a rare double ping is better than a missed booking. KV is eventually consistent, so two copies arriving within
 * seconds at different data centres may both get through; that is the accepted trade-off on the free plan.
 */
export async function firstDelivery(store: DedupeStore | undefined, body: string): Promise<boolean> {
  if (!store) return true;
  try {
    const key = `cal:${await fingerprint(body)}`;
    if (await store.get(key)) return false;
    await store.put(key, '1', { expirationTtl: WEEK_SECONDS });
    return true;
  } catch {
    return true;
  }
}
