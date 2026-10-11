import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { pageMetadata } from './metadata';

describe('keywords, author and publisher on every page (SEO audit)', () => {
  it.each(['en', 'hi'] as const)('the %s pages name keywords, the author and the publisher', (locale) => {
    const c = getContent(locale);
    const m = pageMetadata({ title: 'About', description: 'd', path: '/about', locale, c });
    expect(m.keywords).toEqual(c.site.keywords);
    expect(m.authors).toEqual([{ name: c.site.name, url: locale === 'hi' ? '/hi/about' : '/about' }]);
    expect(m.publisher).toBe(c.site.brand);
  });
  it('a page can add its own keywords in front of the site’s', () => {
    const c = getContent('en');
    const m = pageMetadata({ title: 'Vastu', description: 'd', path: '/services/vastu', locale: 'en', c, keywords: ['Vastu for shops'] });
    expect((m.keywords as string[])[0]).toBe('Vastu for shops');
    expect(m.keywords).toContain(c.site.keywords[0]);
  });
});
