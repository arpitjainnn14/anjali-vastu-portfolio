import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { bookableServices } from './booking';

/** What Google shows: the page title, then the layout's " | <short brand>". It cuts titles at about 60 characters. */
const shown = (title: string) => `${title} | ${getContent('en').site.shortBrand}`;

describe('page titles fit in search results (SEO audit)', () => {
  const c = getContent('en');
  const titles = [
    c.about.meta.title, c.contactSection.meta.title, c.teaching.meta.title, c.testimonialsSection.meta.title,
    ...c.services.map((s) => s.meta.title),
    ...bookableServices(c).map((s) => c.booking.page.metaTitleFor(s.name)),
  ];
  it.each(titles)('"%s" stays within 60 characters with the brand', (t) => expect(shown(t).length).toBeLessThanOrEqual(60));
});

describe('each booking page has its own description (SEO audit)', () => {
  it.each(['en', 'hi'] as const)('%s', (locale) => {
    const c = getContent(locale);
    const descriptions = bookableServices(c).map((s) => c.booking.page.metaDescriptionFor(s.name));
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });
});
