import { getContent, type Content, type Locale } from '@/content';
import { absoluteUrl, siteUrl } from './site-url';
import type { Service } from './booking';
import { localePath } from './locale-routing';

/**
 * JSON-LD for search engines and AI answer engines.
 *
 * One graph with stable @ids, so the business, Anjali and each service refer
 * to one another instead of being three unconnected claims. Only facts already
 * on the site go in here: prices only for the consultations booked online, and no
 * telephone, because the site deliberately never displays her number.
 *
 * Two kinds of node:
 * - The site graph (business, Anjali, the services) is one set of facts about
 *   one set of entities, so it is the same English graph on every page, Hindi
 *   ones included. Built from the Hindi bundle it would give the same @ids a
 *   second, conflicting name and description.
 * - Page-level nodes (the breadcrumb, the FAQ) describe the page being read:
 *   its words, its `/hi` URLs and `inLanguage: 'hi-IN'` on Hindi pages.
 */

const ids = {
  website: `${siteUrl}/#website`,
  business: `${siteUrl}/#business`,
  person: `${siteUrl}/#anjali`,
};

function inLanguageOf(locale: Locale): string {
  return locale === 'hi' ? 'hi-IN' : 'en-IN';
}

function cityOf(c: Content) {
  return {
    '@type': 'City',
    name: c.site.city,
    containedInPlace: { '@type': 'State', name: c.site.state },
  };
}

/**
 * ProfessionalService is a LocalBusiness subtype: a one-person practice in a
 * named city is exactly what it is for. The street address is deliberately
 * unpublished, so the address stops at the city.
 *
 * Takes no language: every page, English or Hindi, carries this same graph.
 */
export function siteGraph() {
  const c = getContent('en');
  const { site, about, services } = c;
  const city = cityOf(c);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ids.website,
        url: siteUrl,
        name: site.brand,
        inLanguage: inLanguageOf('en'),
        publisher: { '@id': ids.business },
      },
      {
        '@type': 'ProfessionalService',
        '@id': ids.business,
        name: site.brand,
        alternateName: `Astrologer ${site.name}`,
        description: site.description,
        url: siteUrl,
        image: absoluteUrl(about.portrait.src),
        address: {
          '@type': 'PostalAddress',
          addressLocality: site.city,
          addressRegion: site.state,
          addressCountry: 'IN',
        },
        areaServed: city,
        availableLanguage: ['English', 'Hindi'],
        foundingDate: String(site.practisingSince),
        founder: { '@id': ids.person },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Consultations',
          itemListElement: services.map((service) => ({
            '@type': 'Offer',
            itemOffered: { '@id': serviceId(service) },
            ...(service.booking
              ? { price: String(service.booking.fee.amount), priceCurrency: 'INR' }
              : {}),
          })),
        },
      },
      {
        '@type': 'Person',
        '@id': ids.person,
        name: site.name,
        jobTitle: 'Astrologer',
        image: absoluteUrl(about.portrait.src),
        url: absoluteUrl('/about'),
        worksFor: { '@id': ids.business },
        knowsLanguage: ['English', 'Hindi'],
        knowsAbout: ['Vedic astrology', 'Numerology', 'Vastu Shastra'],
        hasCredential: {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'degree',
          name: site.credential,
        },
        homeLocation: city,
      },
      ...services.map((service) => serviceNode(c, service)),
    ],
  };
}

function serviceId(service: Service) {
  return `${absoluteUrl(`/services/${service.slug}`)}#service`;
}

function serviceNode(c: Content, service: Service) {
  return {
    '@type': 'Service',
    '@id': serviceId(service),
    name: service.name,
    serviceType: service.name,
    description: service.summary,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { '@id': ids.business },
    areaServed: cityOf(c),
    availableLanguage: ['English', 'Hindi'],
  };
}

/** Mirrors the visible breadcrumb on a service page. */
export function serviceBreadcrumb(c: Content, service: Service, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    inLanguage: inLanguageOf(locale),
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: c.serviceDetail.breadcrumbRoot,
        item: absoluteUrl(localePath(locale, '/#services')),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: service.name,
        item: absoluteUrl(localePath(locale, `/services/${service.slug}`)),
      },
    ],
  };
}

/** The home page FAQ, word for word as it is shown, in the page's language. */
export function faqPage(c: Content, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: inLanguageOf(locale),
    url: absoluteUrl(localePath(locale, '/')),
    mainEntity: c.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

/** `<` escaped so copy can never close the script tag early. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
