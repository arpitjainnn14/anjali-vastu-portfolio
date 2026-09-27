import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { serviceBreadcrumb, siteGraph } from './structured-data';
import { siteUrl } from './site-url';

const c = getContent('en');

type Offer = { itemOffered: { '@id': string }; price?: string; priceCurrency?: string };

function offers(): Offer[] {
  const graph = siteGraph(c, 'en')['@graph'] as unknown as Array<Record<string, unknown>>;
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

describe('inLanguage', () => {
  it('marks the WebSite node with the given locale', () => {
    const graph = siteGraph(c, 'hi')['@graph'] as unknown as Array<Record<string, unknown>>;
    const website = graph.find((n) => n['@type'] === 'WebSite');
    expect(website?.inLanguage).toBe('hi-IN');
    const graphEn = siteGraph(c, 'en')['@graph'] as unknown as Array<Record<string, unknown>>;
    const websiteEn = graphEn.find((n) => n['@type'] === 'WebSite');
    expect(websiteEn?.inLanguage).toBe('en-IN');
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
