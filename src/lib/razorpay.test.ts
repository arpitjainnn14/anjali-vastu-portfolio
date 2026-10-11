import { afterEach, describe, expect, it, vi } from 'vitest';
import { razorpayKeys } from './razorpay';

afterEach(() => vi.unstubAllEnvs());

describe('the payment sandbox only takes test keys (review 21)', () => {
  it('accepts a test key', () => {
    vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_test_abc');
    vi.stubEnv('RAZORPAY_KEY_SECRET', 's');
    expect(razorpayKeys()).toEqual({ ok: true, keys: { keyId: 'rzp_test_abc', keySecret: 's' } });
  });
  it('refuses a live key, so the sandbox can never take a real payment', () => {
    vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_live_abc');
    vi.stubEnv('RAZORPAY_KEY_SECRET', 's');
    const r = razorpayKeys();
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/test key/);
  });
  it('says when keys are missing', () => {
    vi.stubEnv('RAZORPAY_KEY_ID', '');
    vi.stubEnv('RAZORPAY_KEY_SECRET', '');
    expect(razorpayKeys().ok).toBe(false);
  });
});
