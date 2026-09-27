import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { indexedPaths, sitePageGroups } from './site-pages';

const c = getContent('en');

describe('site pages', () => {
  it('lists every service page for search engines', () => {
    const paths = indexedPaths(c, false);
    for (const s of c.services) expect(paths).toContain(`/services/${s.slug}`);
    expect(paths).toContain('/');
  });

  it('keeps noindex notices out of sitemap.xml but on the HTML map', () => {
    const htmlPaths = sitePageGroups(c, false).flatMap((g) => g.pages.map((p) => p.href));
    for (const path of ['/privacy', '/terms', '/refund-policy']) {
      expect(htmlPaths).toContain(path);
      expect(indexedPaths(c, false)).not.toContain(path);
    }
  });

  it('adds /book pages only once booking is live', () => {
    expect(indexedPaths(c, false).some((p) => p.startsWith('/book/'))).toBe(false);
    expect(indexedPaths(c, true).some((p) => p.startsWith('/book/'))).toBe(true);
  });

  it('lists each path once', () => {
    const paths = sitePageGroups(c, true).flatMap((g) => g.pages.map((p) => p.href));
    expect(new Set(paths).size).toBe(paths.length);
  });
});
