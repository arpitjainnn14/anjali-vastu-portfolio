import { describe, expect, it, vi } from 'vitest';
import { loadPublishedText } from './published-text';

const ok = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
const env = { SITEDESK_BUILD_URL: 'https://sd.test/' };

describe('loadPublishedText', () => {
  it('asks Sitedesk and keeps only text', async () => {
    const f = ok({ texts: { en: { 'hero.lead': 'Hi', n: 1 }, hi: {} } });
    expect(await loadPublishedText(env, f)).toBe(JSON.stringify({ en: { 'hero.lead': 'Hi' }, hi: {} }));
    expect(((f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string])[0]).toBe('https://sd.test/api/v1/sites/anjali/texts');
  });
  it('uses the code copy for a local build, with no network', async () => {
    const f = ok({});
    expect(await loadPublishedText({ npm_lifecycle_event: 'build' }, f)).toBe('');
    expect(f).not.toHaveBeenCalled();
  });
  it('a build that goes live reads the real Sitedesk with nothing set up', async () => {
    for (const live of [{ WORKERS_CI: '1' }, { npm_lifecycle_event: 'deploy' }, { npm_lifecycle_event: 'upload' }]) {
      const f = ok({ texts: { en: {}, hi: {} } });
      expect(await loadPublishedText(live, f)).toBe('{"en":{},"hi":{}}');
      expect(((f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string])[0]).toBe('https://sitedesk.jainarpit2004.workers.dev/api/v1/sites/anjali/texts');
    }
  });
  it('stops rather than building with old words when Sitedesk fails', async () => {
    await expect(loadPublishedText(env, ok({ error: 'no' }, 500))).rejects.toThrow(/HTTP 500/);
    await expect(loadPublishedText(env, ok({ nope: 1 }))).rejects.toThrow(/does not understand/);
    const down = vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    await expect(loadPublishedText(env, down)).rejects.toThrow(/offline/);
  });
});
