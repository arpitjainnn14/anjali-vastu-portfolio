import {
  about,
  booking,
  contactSection,
  picker,
  privacy,
  refundPolicy,
  services,
  site,
  siteMap,
  teaching,
  terms,
} from '@/content';
import { bookableServices, bookPageHref } from './booking';

/**
 * Every public page, grouped, for both site maps: sitemap.xml (search engines)
 * and /sitemap.html (people). One list, so the two cannot disagree.
 *
 * `indexed: false` pages are noindex (see their `robots` metadata). People can
 * still reach them from the HTML map; the XML map leaves them out, since
 * listing a noindex URL there sends Google mixed signals.
 *
 * Left out of both: /booked (a thank-you page), /api, and the dev-only
 * Razorpay sandbox. /book pages appear only once `booking.live` is true.
 */
export type SitePage = { href: string; label: string; description: string; indexed: boolean };
export type SitePageGroup = { heading: string; pages: SitePage[] };

export function sitePageGroups(live: boolean = booking.live): SitePageGroup[] {
  const { groups, labels } = siteMap;
  return [
    {
      heading: groups.practice,
      pages: [
        { href: '/', label: labels.home, description: site.description, indexed: true },
        { href: '/about', label: labels.about, description: about.meta.description, indexed: true },
        { href: '/teaching', label: labels.teaching, description: teaching.meta.description, indexed: true },
        { href: '/contact', label: labels.contact, description: contactSection.meta.description, indexed: true },
      ],
    },
    {
      heading: groups.consultations,
      pages: [
        ...services.map((s) => ({
          href: `/services/${s.slug}`,
          label: s.name,
          description: s.meta.description,
          indexed: true,
        })),
        { href: picker.href, label: picker.pageTitle, description: picker.pageDescription, indexed: true },
      ],
    },
    {
      heading: groups.booking,
      pages: live
        ? bookableServices.map((s) => ({
            href: bookPageHref(s),
            label: `${labels.bookPrefix} ${s.name}`,
            description: s.meta.description,
            indexed: true,
          }))
        : [],
    },
    {
      heading: groups.policies,
      pages: [
        { href: '/privacy', label: privacy.heading, description: privacy.metaDescription, indexed: false },
        { href: '/terms', label: terms.heading, description: terms.metaDescription, indexed: false },
        {
          href: '/refund-policy',
          label: refundPolicy.heading,
          description: refundPolicy.metaDescription,
          indexed: false,
        },
      ],
    },
  ].filter((group) => group.pages.length > 0);
}

/** Paths for sitemap.xml: indexable pages only. */
export function indexedPaths(live: boolean = booking.live): string[] {
  return sitePageGroups(live).flatMap((g) => g.pages.filter((p) => p.indexed).map((p) => p.href));
}
