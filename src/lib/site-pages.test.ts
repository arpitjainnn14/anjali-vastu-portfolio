import { describe, expect, it } from 'vitest';
import { services } from '@/content';
import { indexedPaths, sitePageGroups } from './site-pages';

describe('site pages', () => {
  it('lists every service page for search engines', () => {
    const paths = indexedPaths(false);
    for (const s of services) expect(paths).toContain(`/services/${s.slug}`);
    expect(paths).toContain('/');
  });

  it('keeps noindex notices out of sitemap.xml but on the HTML map', () => {
    const htmlPaths = sitePageGroups(false).flatMap((g) => g.pages.map((p) => p.href));
    for (const path of ['/privacy', '/terms', '/refund-policy']) {
      expect(htmlPaths).toContain(path);
      expect(indexedPaths(false)).not.toContain(path);
    }
  });

  it('adds /book pages only once booking is live', () => {
    expect(indexedPaths(false).some((p) => p.startsWith('/book/'))).toBe(false);
    expect(indexedPaths(true).some((p) => p.startsWith('/book/'))).toBe(true);
  });

  it('lists each path once', () => {
    const paths = sitePageGroups(true).flatMap((g) => g.pages.map((p) => p.href));
    expect(new Set(paths).size).toBe(paths.length);
  });
});
