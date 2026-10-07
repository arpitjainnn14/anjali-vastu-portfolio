import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { indexedPaths, isKnownPath, sitePageGroups } from './site-pages';
import { localePath } from './locale-routing';

const c = getContent('en');
const hi = getContent('hi');

describe('site pages', () => {
  it('lists every service page for search engines', () => {
    const paths = indexedPaths(c, 'en', false);
    for (const s of c.services) expect(paths).toContain(`/services/${s.slug}`);
    expect(paths).toContain('/');
  });

  it('keeps noindex notices out of sitemap.xml but on the HTML map', () => {
    const htmlPaths = sitePageGroups(c, 'en', false).flatMap((g) => g.pages.map((p) => p.href));
    for (const path of ['/privacy', '/terms', '/refund-policy']) {
      expect(htmlPaths).toContain(path);
      expect(indexedPaths(c, 'en', false)).not.toContain(path);
    }
  });

  it('adds /book pages only once booking is live', () => {
    expect(indexedPaths(c, 'en', false).some((p) => p.startsWith('/book/'))).toBe(false);
    expect(indexedPaths(c, 'en', true).some((p) => p.startsWith('/book/'))).toBe(true);
  });

  it('lists each path once', () => {
    const paths = sitePageGroups(c, 'en', true).flatMap((g) => g.pages.map((p) => p.href));
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('lists the Hindi twin of every page on the Hindi map', () => {
    const english = sitePageGroups(c, 'en', true).flatMap((g) => g.pages.map((p) => p.href));
    const hindi = sitePageGroups(hi, 'hi', true).flatMap((g) => g.pages.map((p) => p.href));
    expect(hindi).toEqual(english.map((path) => (path === '/' ? '/hi' : `/hi${path}`)));
    expect(indexedPaths(hi, 'hi', false)).toContain('/hi/services/vastu');
  });
});

describe('isKnownPath', () => {
  it.each([
    '/', '/about', '/teaching', '/contact', '/which-reading',
    '/services/vedic-astrology', '/services/numerology', '/services/vastu',
    '/book', '/book/vedic-astrology', '/book/numerology',
    '/booked', '/booked/vedic-astrology', '/booked/numerology',
    '/testimonials', '/terms', '/refund-policy', '/privacy', '/sitemap.html',
  ])('%s is a page, in English and in Hindi', (path) => {
    expect(isKnownPath(c, path)).toBe(true);
    expect(isKnownPath(c, localePath('hi', path))).toBe(true);
  });

  it.each(['/nope', '/hi/nope', '/services/nope', '/hi/services/nope', '/book/vastu', '/hi/booked/vastu', '/about/more'])(
    '%s is not a page',
    (path) => {
      expect(isKnownPath(c, path)).toBe(false);
    },
  );
});
