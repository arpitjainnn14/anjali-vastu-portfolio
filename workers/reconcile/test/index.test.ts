import { describe, expect, it, vi } from 'vitest';
import worker, { run, type Env } from '../src/index';
import { NOW } from './fixtures';

const env: Env = {
  RAZORPAY_KEY_ID: 'rzp_live_x',
  RAZORPAY_KEY_SECRET: 'RZP_SECRET',
  CALID_API_KEY: 'CAL_SECRET',
  TELEGRAM_BOT_TOKEN: 'TG_SECRET',
  TELEGRAM_CHAT_ID: '-1001',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/** A fake network: empty Razorpay and Cal ID, Telegram accepts. */
function fakeFetch(overrides: { cal?: () => Response } = {}) {
  return vi.fn(async (url: string) => {
    if (url.startsWith('https://api.razorpay.com/')) return json({ items: [] });
    if (url.startsWith('https://api.cal.id/')) return overrides.cal ? overrides.cal() : json({ data: [], meta: { pagination: { totalPages: 1 } } });
    if (url.startsWith('https://api.telegram.org/')) return json({ ok: true });
    throw new Error(`unexpected ${url}`);
  });
}

const deps = (fetchImpl: ReturnType<typeof fakeFetch>, log = vi.fn()) => ({ fetch: fetchImpl, now: NOW, log, sleep: async () => {} });

describe('run', () => {
  it('sends the daily summary to Telegram', async () => {
    const fetchImpl = fakeFetch();
    const text = await run(env, deps(fetchImpl));

    expect(text).toContain('✅ Payments check · Sat 26 Sep, 8:00 am');
    const telegramCalls = fetchImpl.mock.calls.filter(([u]) => String(u).includes('telegram'));
    expect(telegramCalls).toHaveLength(1);
  });

  it('uses 7 subrequests: 1 Razorpay payments, 1 Razorpay orders, 4 Cal ID, 1 Telegram', async () => {
    const fetchImpl = fakeFetch();
    await run(env, deps(fetchImpl));
    expect(fetchImpl).toHaveBeenCalledTimes(7);
  });

  it('sends the FAILED message when Cal ID rejects the key, without the key', async () => {
    const fetchImpl = fakeFetch({ cal: () => json({}, 401) });
    const text = await run(env, deps(fetchImpl));

    expect(text.split('\n').slice(0, 2)).toEqual(['⚠️ Payments check FAILED · Sat 26 Sep, 8:00 am', 'Cal ID rejected the API key (401).']);
    for (const secret of ['RZP_SECRET', 'CAL_SECRET', 'TG_SECRET']) expect(text).not.toContain(secret);
  });

  it('reports a missing setting by name', async () => {
    const text = await run({ ...env, CALID_API_KEY: '' }, deps(fakeFetch()));
    expect(text).toContain('Unexpected error: missing setting CALID_API_KEY');
  });

  it('DRY_RUN prints instead of sending', async () => {
    const fetchImpl = fakeFetch();
    const log = vi.fn();
    await run({ ...env, DRY_RUN: '1' }, deps(fetchImpl, log));

    expect(fetchImpl.mock.calls.some(([u]) => String(u).includes('telegram'))).toBe(false);
    expect(log.mock.calls[0][0]).toContain('✅ Payments check');
  });

  it('logs the message and rethrows when Telegram fails', async () => {
    const fetchImpl = vi.fn(async (url: string) =>
      url.includes('telegram') ? new Response('', { status: 500 }) : url.includes('razorpay') ? json({ items: [] }) : json({ data: [] }),
    );
    const log = vi.fn();
    await expect(run(env, deps(fetchImpl as never, log))).rejects.toThrow('Telegram answered HTTP 500.');
    expect(log.mock.calls[0][0]).toContain('could not send Telegram message');
    expect(log.mock.calls[0][0]).not.toContain('TG_SECRET');
  });
});

describe('worker', () => {
  it('has no public endpoint', async () => {
    const response = await worker.fetch();
    expect(response.status).toBe(404);
  });
});
