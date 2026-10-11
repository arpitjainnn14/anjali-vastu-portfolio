import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/sitedesk-env', () => ({ getBlogPost: async () => ({ ok: false, reason: 'not_found' }), getBlogConfig: async () => ({ ok: false }) }));

describe('metadata for a blog address with no post (review 24)', () => {
  it('carries the real site address, so its share image is not a localhost link', async () => {
    const { blogPostRouteMetadata } = await import('./BlogPostRoute');
    const m = await blogPostRouteMetadata('en', 'nope');
    expect(m.openGraph?.images).toEqual([expect.objectContaining({ url: '/opengraph-image.jpg' })]);
    expect(m.robots).toEqual({ index: false, follow: false });
  });
});

describe('alternate languages for a note (review 29)', () => {
  it('names only the languages the note is published in, and only once Hindi is live', async () => {
    const { postAlternates } = await import('./BlogPostPage');
    expect(postAlternates('en', 'n', ['en'], true)).toEqual({ canonical: '/blog/n' });
    expect(postAlternates('en', 'n', ['en', 'hi'], true)).toEqual({ canonical: '/blog/n', languages: { 'en-IN': '/blog/n', 'hi-IN': '/hi/blog/n', 'x-default': '/blog/n' } });
    expect(postAlternates('en', 'n', ['en', 'hi'], false)).toEqual({ canonical: '/blog/n' });
    expect(postAlternates('hi', 'n', ['hi'], true)).toEqual({ canonical: '/hi/blog/n' });
  });
});
