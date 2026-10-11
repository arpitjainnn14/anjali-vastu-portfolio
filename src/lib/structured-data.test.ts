import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { faqPage, serviceBreadcrumb, siteGraph } from './structured-data';
import { siteUrl } from './site-url';

const c = getContent('en');

type Offer = { itemOffered: { '@id': string }; price?: string; priceCurrency?: string };

function offers(): Offer[] {
  const graph = siteGraph()['@graph'] as unknown as Array<Record<string, unknown>>;
  const business = graph.find((n) => n['@type'] === 'ProfessionalService') as {
    hasOfferCatalog: { itemListElement: Offer[] };
  };
  return business.hasOfferCatalog.itemListElement;
}

function offerFor(slug: string) {
  const offer = offers().find((o) => o.itemOffered['@id'].includes(`/services/${slug}#`));
  if (!offer) throw new Error(`No offer for ${slug}`);
  return offer;
}

describe('offer catalogue', () => {
  it.each(['vedic-astrology', 'numerology'])('gives %s its price in rupees', (slug) => {
    expect(offerFor(slug)).toMatchObject({ price: '2151', priceCurrency: 'INR' });
  });

  it('gives Vastu no price', () => {
    const vastu = offerFor('vastu');
    expect(vastu.price).toBeUndefined();
    expect(vastu.priceCurrency).toBeUndefined();
  });
});

describe('siteGraph', () => {
  /*
   * Hindi pages carry the same graph as English ones: the same @ids with a
   * second, Hindi name and description would be conflicting claims about one
   * entity. siteGraph takes no language, so the English and Hindi layouts
   * make the same call; this pins what that one graph says.
   */
  it('is the English graph, whichever language the page is in', () => {
    const json = JSON.stringify(siteGraph());
    expect(json, 'no Hindi text in the site graph').not.toMatch(/[\u0900-\u097F]/);
    const graph = siteGraph()['@graph'] as unknown as Array<Record<string, unknown>>;
    expect(graph.find((n) => n['@type'] === 'WebSite')?.inLanguage).toBe('en-IN');
    expect(graph.find((n) => n['@type'] === 'Person')?.name).toBe(c.site.name);
  });
});

describe('faqPage', () => {
  it("is in the page's language, at the page's URL", () => {
    const hi = getContent('hi');
    expect(faqPage(hi, 'hi')).toMatchObject({ inLanguage: 'hi-IN', url: `${siteUrl}/hi` });
    expect(faqPage(hi, 'hi').mainEntity[0].name).toBe(hi.faq.items[0].q);
    expect(faqPage(c, 'en')).toMatchObject({ inLanguage: 'en-IN', url: `${siteUrl}/` });
  });
});

describe('serviceBreadcrumb', () => {
  it('points at the pages in the language being read, as the visible breadcrumb does', () => {
    const service = c.services[0];
    const items = (locale: 'en' | 'hi') => serviceBreadcrumb(c, service, locale).itemListElement.map((i) => i.item);
    expect(items('en')).toEqual([`${siteUrl}/#services`, `${siteUrl}/services/${service.slug}`]);
    expect(items('hi')).toEqual([`${siteUrl}/hi#services`, `${siteUrl}/hi/services/${service.slug}`]);
  });
});

describe('blogPosting (SEO audit: publisher and author on notes)', () => {
  const note = { slug: 'saturn-return', title: 'Saturn return', excerpt: 'What changes.', category: 'Astrology', tags: ['saturn'], publishedAt: Date.UTC(2026, 9, 1), featuredImage: 'https://sd.example/media/x', html: '', languages: ['en'] as ('en' | 'hi')[], seoTitle: '', seoDescription: 'About Saturn.', focusKeyword: 'saturn return', noindex: false, canonical: '', shareImage: null, shareTitle: '', shareDescription: '' };
  it('names the note, its date, Anjali as author and the business as publisher, linked to the site graph', async () => {
    const { blogPosting } = await import('./structured-data');
    const { getContent } = await import('@/content');
    const { absoluteUrl } = await import('./site-url');
    const g = blogPosting(getContent('en'), 'en', note);
    expect(g).toMatchObject({
      '@type': 'BlogPosting', headline: 'Saturn return', description: 'About Saturn.', inLanguage: 'en-IN',
      datePublished: '2026-10-01T00:00:00.000Z', url: absoluteUrl('/blog/saturn-return'), image: 'https://sd.example/media/x',
      keywords: 'saturn return, saturn', author: { '@id': absoluteUrl('/#anjali') }, publisher: { '@id': absoluteUrl('/#business') },
    });
  });
});
