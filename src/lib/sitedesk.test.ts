import { describe, expect, it, vi } from 'vitest';
import { createSitedeskClient } from './sitedesk';

const summary = { slug: 'hello', title: 'Hello', excerpt: 'Hi.', category: 'Care', tags: ['a'], publishedAt: 5 };
const post = { ...summary, html: '<p>Hi.</p>', languages: ['en'] };
const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function client(request: (path: string) => Promise<Response>) {
  return createSitedeskClient({ request, site: 'anjali' });
}

describe('listPosts', () => {
  it('returns the posts for the language', async () => {
    const request = vi.fn(async () => respond(200, { posts: [summary] }));
    expect(await client(request).listPosts('hi')).toEqual({ ok: true, data: [summary] });
    expect(request).toHaveBeenCalledWith('/api/v1/sites/anjali/posts?lang=hi');
  });
  it('treats errors, junk and network failures as unavailable, never throwing', async () => {
    for (const request of [
      async () => respond(500, { error: 'x' }),
      async () => respond(401, { error: 'Unauthorized.' }),
      async () => respond(200, { posts: 'not a list' }),
      async () => respond(200, { posts: [{ slug: 5 }] }),
      async () => new Response('<html>', { status: 200 }),
      async () => { throw new Error('network'); },
    ]) {
      expect(await client(request).listPosts('en')).toEqual({ ok: false, reason: 'unavailable' });
    }
  });
});

describe('getPost', () => {
  it('returns one post, and maps 404 to not_found', async () => {
    expect(await client(async () => respond(200, { post })).getPost('hello', 'en')).toEqual({ ok: true, data: post });
    expect(await client(async () => respond(404, { error: 'Not found.' })).getPost('hello', 'en')).toEqual({ ok: false, reason: 'not_found' });
  });
  it('requests the right path and refuses slugs that are not plain web addresses', async () => {
    const request = vi.fn(async () => respond(200, { post }));
    await client(request).getPost('hello-world-2', 'en');
    expect(request).toHaveBeenCalledWith('/api/v1/sites/anjali/posts/hello-world-2?lang=en');
    for (const bad of ['../secret', 'a/b', 'a%2Fb', '', 'UPPER', 'a b', '.']) {
      request.mockClear();
      expect(await client(request).getPost(bad, 'en')).toEqual({ ok: false, reason: 'not_found' });
      expect(request).not.toHaveBeenCalled();
    }
  });
  it('treats a malformed post as unavailable', async () => {
    expect(await client(async () => respond(200, { post: { ...post, html: 7 } })).getPost('hello', 'en')).toEqual({ ok: false, reason: 'unavailable' });
  });
  it('treats a server error or a network failure as unavailable', async () => {
    expect(await client(async () => respond(503, {})).getPost('hello', 'en')).toEqual({ ok: false, reason: 'unavailable' });
    expect(await client(async () => { throw new Error('down'); }).getPost('hello', 'en')).toEqual({ ok: false, reason: 'unavailable' });
  });
});

describe('what counts as "no such post"', () => {
  it('only Sitedesk’s own 404 does; any other 404 means the integration is broken, not that the post is gone', async () => {
    const html404 = async () => new Response('<html>404 This page could not be found</html>', { status: 404 });
    const otherJson404 = async () => respond(404, { message: 'nope' });
    expect(await client(html404).getPost('hello', 'en')).toEqual({ ok: false, reason: 'unavailable' });
    expect(await client(otherJson404).getPost('hello', 'en')).toEqual({ ok: false, reason: 'unavailable' });
    expect(await client(async () => respond(404, { error: 'Not found.' })).getPost('hello', 'en')).toEqual({ ok: false, reason: 'not_found' });
  });

  it('refuses an oversized slug without asking Sitedesk', async () => {
    const request = vi.fn(async () => respond(200, { post }));
    expect(await client(request).getPost('a'.repeat(101), 'en')).toEqual({ ok: false, reason: 'not_found' });
    expect(request).not.toHaveBeenCalled();
    expect((await client(request).getPost('a'.repeat(100), 'en')).ok).toBe(true);
  });
});
