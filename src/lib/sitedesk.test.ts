import { describe, expect, it, vi } from 'vitest';
import { createSitedeskClient, redirectTarget } from './sitedesk';

const summary = { slug: 'hello', title: 'Hello', excerpt: 'Hi.', category: 'Care', tags: ['a'], publishedAt: 5 };
const post = { ...summary, html: '<p>Hi.</p>', languages: ['en'] };
const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function client(request: (path: string) => Promise<Response>) {
  return createSitedeskClient({ request, site: 'anjali' });
}

describe('listPosts', () => {
  it('returns the posts for the language', async () => {
    const request = vi.fn(async () => respond(200, { posts: [summary] }));
    expect(await client(request).listPosts('hi')).toMatchObject({ ok: true, data: [summary] });
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
    expect(await client(async () => respond(200, { post })).getPost('hello', 'en')).toMatchObject({ ok: true, data: post });
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

describe('SEO fields and images', () => {
  const full = { ...post, seoTitle: 'SEO title', seoDescription: 'SEO description', noindex: true, canonical: 'https://x.example/a', shareImage: 'https://sd.example/media/s', shareTitle: 'Share', shareDescription: 'Share text' };
  it('passes the SEO fields through, and fills safe defaults when Sitedesk does not send them', async () => {
    const got = await client(async () => respond(200, { post: { ...full, featuredImage: 'https://sd.example/media/f' } })).getPost('hello', 'en');
    expect(got).toMatchObject({ ok: true, data: { seoTitle: 'SEO title', noindex: true, canonical: 'https://x.example/a', shareImage: 'https://sd.example/media/s', featuredImage: 'https://sd.example/media/f' } });
    const old = await client(async () => respond(200, { post })).getPost('hello', 'en');
    expect(old).toMatchObject({ ok: true, data: { seoTitle: '', seoDescription: '', noindex: false, canonical: '', shareImage: null, featuredImage: null } });
  });
  it('lists featured images', async () => {
    const r = await client(async () => respond(200, { posts: [{ ...summary, featuredImage: 'https://sd.example/media/f' }, summary] })).listPosts('en');
    expect(r.ok && r.data.map((p) => p.featuredImage)).toEqual(['https://sd.example/media/f', null]);
  });
});

describe('redirects from Sitedesk', () => {
  const config = { redirects: [{ from: '/blog/old-name', to: '/blog/new-name' }, { from: '/hi/blog/old-name', to: '/hi/blog/new-name' }] };
  it('reads the redirect list', async () => {
    const r = await client(async () => respond(200, { config })).getConfig();
    expect(r).toEqual({ ok: true, data: { redirects: config.redirects } });
  });
  it('treats a broken config reply as unavailable', async () => {
    expect(await client(async () => respond(200, { config: { redirects: 'x' } })).getConfig()).toEqual({ ok: false, reason: 'unavailable' });
    expect(await client(async () => respond(500, {})).getConfig()).toEqual({ ok: false, reason: 'unavailable' });
  });
  it('finds where an old address now lives, and only for the exact old address', () => {
    expect(redirectTarget(config.redirects, '/blog/old-name')).toBe('/blog/new-name');
    expect(redirectTarget(config.redirects, '/hi/blog/old-name')).toBe('/hi/blog/new-name');
    expect(redirectTarget(config.redirects, '/blog/other')).toBeNull();
  });
  it('only ever redirects to a path on this site or a web address', () => {
    expect(redirectTarget([{ from: '/a', to: 'javascript:alert(1)' }], '/a')).toBeNull();
    expect(redirectTarget([{ from: '/a', to: '//evil.example' }], '/a')).toBeNull();
    expect(redirectTarget([{ from: '/a', to: 'https://other.example/x' }], '/a')).toBe('https://other.example/x');
  });
});

describe('sitemap addresses from Sitedesk', () => {
  it('returns the addresses (already without hidden posts), and refuses junk', async () => {
    const entries = [{ path: '/blog/a', lastModified: 5 }, { path: '/hi/blog/a', lastModified: 5 }];
    expect(await client(async () => respond(200, { entries, robots: 'x', indexing: true })).getSitemap()).toEqual({ ok: true, data: entries });
    expect(await client(async () => respond(200, { entries: [{ path: 5 }] })).getSitemap()).toEqual({ ok: false, reason: 'unavailable' });
    expect(await client(async () => respond(500, {})).getSitemap()).toEqual({ ok: false, reason: 'unavailable' });
  });
  it('drops any entry that is not a plain site path', async () => {
    const entries = [{ path: '/blog/a', lastModified: 1 }, { path: 'https://evil.example/x', lastModified: 1 }, { path: '//evil', lastModified: 1 }];
    const r = await client(async () => respond(200, { entries, robots: '', indexing: true })).getSitemap();
    expect(r).toEqual({ ok: true, data: [{ path: '/blog/a', lastModified: 1 }] });
  });
});
