import { site, about, services, faq, serviceDetail, type Service } from '@/content';
import { absoluteUrl, siteUrl } from './site-url';

/**
 * JSON-LD for search engines and AI answer engines.
 *
 * One graph with stable @ids, so the business, Anjali and each service refer
 * to one another instead of being three unconnected claims. Only facts already
 * on the site go in here: no price data (there is none to publish), and no
 * telephone, because the site deliberately never displays her number.
 */

const ids = {
  website: `${siteUrl}/#website`,
  business: `${siteUrl}/#business`,
  person: `${siteUrl}/#anjali`,
};

const city = {
  '@type': 'City',
  name: site.city,
  containedInPlace: { '@type': 'State', name: site.state },
};

/**
 * ProfessionalService is a LocalBusiness subtype: a one-person practice in a
 * named city is exactly what it is for. The street address is deliberately
 * unpublished, so the address stops at the city.
 */
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ids.website,
        url: siteUrl,
        name: site.name,
        inLanguage: site.locale,
        publisher: { '@id': ids.business },
      },
      {
        '@type': 'ProfessionalService',
        '@id': ids.business,
        name: `Astrologer ${site.name}`,
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
      ...services.map(serviceNode),
    ],
  };
}

function serviceId(service: Service) {
  return `${absoluteUrl(`/services/${service.slug}`)}#service`;
}

function serviceNode(service: Service) {
  return {
    '@type': 'Service',
    '@id': serviceId(service),
    name: service.name,
    serviceType: service.name,
    description: service.summary,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { '@id': ids.business },
    areaServed: city,
    availableLanguage: ['English', 'Hindi'],
  };
}

/** Mirrors the visible breadcrumb on a service page. */
export function serviceBreadcrumb(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: serviceDetail.breadcrumbRoot, item: absoluteUrl('/#services') },
      { '@type': 'ListItem', position: 2, name: service.name, item: absoluteUrl(`/services/${service.slug}`) },
    ],
  };
}

/** The home page FAQ, word for word as it is shown. */
export function faqPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
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
