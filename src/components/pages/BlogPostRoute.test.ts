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

describe('note keywords (SEO audit)', () => {
  it('puts the focus keyword and tags in front of the site keywords', async () => {
    const { blogPostMetadata } = await import('./BlogPostPage');
    const { getContent } = await import('@/content');
    const c = getContent('en');
    const note = { slug: 'n', title: 'T', excerpt: 'e', category: 'x', tags: ['saturn'], publishedAt: 1, featuredImage: null, html: '', languages: ['en'] as ('en' | 'hi')[], seoTitle: '', seoDescription: '', focusKeyword: 'saturn return', noindex: false, canonical: '', shareImage: null, shareTitle: '', shareDescription: '' };
    const kw = blogPostMetadata(c, 'en', note).keywords as string[];
    expect(kw.slice(0, 2)).toEqual(['saturn return', 'saturn']);
    expect(kw).toContain(c.site.keywords[0]);
  });
});
