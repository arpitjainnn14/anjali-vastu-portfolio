import { describe, expect, it, vi } from 'vitest';
import { loadPublishedText } from './published-text';

const ok = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
const env = { SITEDESK_BUILD_URL: 'https://sd.test/', SITEDESK_READ_TOKEN: 'tok' };

describe('loadPublishedText', () => {
  it('asks Sitedesk with the read key and keeps only text', async () => {
    const f = ok({ texts: { en: { 'hero.lead': 'Hi', n: 1 }, hi: {} } });
    expect(await loadPublishedText(env, f)).toBe(JSON.stringify({ en: { 'hero.lead': 'Hi' }, hi: {} }));
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://sd.test/api/v1/sites/anjali/texts');
    expect(init.headers).toEqual({ authorization: 'Bearer tok' });
  });
  it('uses the code copy for a local build without settings', async () => {
    expect(await loadPublishedText({ npm_lifecycle_event: 'build' })).toBe('');
  });
  it('stops a build that goes live without settings', async () => {
    await expect(loadPublishedText({ WORKERS_CI: '1' })).rejects.toThrow(/SITEDESK_BUILD_URL/);
    await expect(loadPublishedText({ npm_lifecycle_event: 'deploy' })).rejects.toThrow(/SITEDESK_BUILD_URL/);
  });
  it('stops rather than building with old words when Sitedesk fails', async () => {
    await expect(loadPublishedText(env, ok({ error: 'no' }, 401))).rejects.toThrow(/HTTP 401/);
    await expect(loadPublishedText(env, ok({ nope: 1 }))).rejects.toThrow(/does not understand/);
    const down = vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    await expect(loadPublishedText(env, down)).rejects.toThrow(/offline/);
  });
});
