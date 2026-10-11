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
