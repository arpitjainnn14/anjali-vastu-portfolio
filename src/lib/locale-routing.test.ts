import { describe, expect, it } from 'vitest';
import { hindiLive } from '@/content/shared';
import { alternatePath, localeMetadata, localeOfPath, localePath } from './locale-routing';

/** Every English page on the site, and its Hindi twin. */
const pairs: [string, string][] = [
  ['/', '/hi'],
  ['/about', '/hi/about'],
  ['/teaching', '/hi/teaching'],
  ['/contact', '/hi/contact'],
  ['/which-reading', '/hi/which-reading'],
  ['/services/vedic-astrology', '/hi/services/vedic-astrology'],
  ['/services/numerology', '/hi/services/numerology'],
  ['/services/vastu', '/hi/services/vastu'],
  ['/book', '/hi/book'],
  ['/book/numerology', '/hi/book/numerology'],
  ['/booked', '/hi/booked'],
  ['/booked/numerology', '/hi/booked/numerology'],
  ['/terms', '/hi/terms'],
  ['/refund-policy', '/hi/refund-policy'],
  ['/privacy', '/hi/privacy'],
  ['/sitemap.html', '/hi/sitemap.html'],
];

describe('localePath', () => {
  it.each(pairs)('%s is itself in English and %s in Hindi', (en, hi) => {
    expect(localePath('en', en)).toBe(en);
    expect(localePath('hi', en)).toBe(hi);
  });

  it('keeps an in-page anchor on the home page', () => {
    expect(localePath('hi', '/#services')).toBe('/hi#services');
    expect(localePath('en', '/#services')).toBe('/#services');
  });

  it('leaves a path that is already Hindi alone', () => {
    expect(localePath('hi', '/hi/about')).toBe('/hi/about');
    expect(localePath('hi', '/hi')).toBe('/hi');
  });

  it('does not treat a page that merely starts with "hi" as Hindi', () => {
    expect(localePath('hi', '/history')).toBe('/hi/history');
  });

  it('leaves off-site, WhatsApp, mail and phone links alone', () => {
    for (const href of [
      'https://wa.me/910000000000?text=hi',
      'https://cal.id/anjali/numerology',
      'mailto:someone@example.com',
      'tel:+910000000000',
    ]) {
      expect(localePath('hi', href)).toBe(href);
    }
  });
});

describe('alternatePath', () => {
  it.each(pairs)('%s and %s point at each other', (en, hi) => {
    expect(alternatePath(en)).toBe(hi);
    expect(alternatePath(hi)).toBe(en);
  });
});

describe('localeOfPath', () => {
  it('reads the language from a path', () => {
    expect(localeOfPath('/')).toBe('en');
    expect(localeOfPath('/about')).toBe('en');
    expect(localeOfPath('/history')).toBe('en');
    expect(localeOfPath('/hi')).toBe('hi');
    expect(localeOfPath('/hi/about')).toBe('hi');
  });
});

describe('localeMetadata', () => {
  it('is false in every commit until Anjali has read the Hindi', () => {
    expect(hindiLive).toBe(false);
  });

  it('keeps Hindi pages out of search while Hindi is off', () => {
    const meta = localeMetadata('hi', '/about');
    expect(meta.robots).toEqual({ index: false, follow: false });
    expect(meta.alternates?.languages).toBeUndefined();
  });

  it('adds nothing to English pages while Hindi is off', () => {
    const meta = localeMetadata('en', '/about');
    expect(meta.robots).toBeUndefined();
    expect(meta.alternates?.languages).toBeUndefined();
  });

  it('points each page’s canonical at its own language', () => {
    expect(localeMetadata('en', '/about').alternates?.canonical).toBe('/about');
    expect(localeMetadata('hi', '/about').alternates?.canonical).toBe('/hi/about');
    expect(localeMetadata('hi', '/').alternates?.canonical).toBe('/hi');
  });

  it('links the two languages once Hindi is live', () => {
    for (const locale of ['en', 'hi'] as const) {
      const meta = localeMetadata(locale, '/about', true);
      expect(meta.robots).toBeUndefined();
      expect(meta.alternates?.languages).toEqual({
        'en-IN': '/about',
        'hi-IN': '/hi/about',
        'x-default': '/about',
      });
    }
  });
});
