import type { Content } from '@/content';
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

export function sitePageGroups(c: Content, live: boolean = c.booking.live): SitePageGroup[] {
  const { groups, labels } = c.siteMap;
  return [
    {
      heading: groups.practice,
      pages: [
        { href: '/', label: labels.home, description: c.site.description, indexed: true },
        { href: '/about', label: labels.about, description: c.about.meta.description, indexed: true },
        { href: '/teaching', label: labels.teaching, description: c.teaching.meta.description, indexed: true },
        { href: '/contact', label: labels.contact, description: c.contactSection.meta.description, indexed: true },
      ],
    },
    {
      heading: groups.consultations,
      pages: [
        ...c.services.map((s) => ({
          href: `/services/${s.slug}`,
          label: s.name,
          description: s.meta.description,
          indexed: true,
        })),
        { href: c.picker.href, label: c.picker.pageTitle, description: c.picker.pageDescription, indexed: true },
      ],
    },
    {
      heading: groups.booking,
      pages: live
        ? bookableServices(c).map((s) => ({
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
        { href: '/privacy', label: c.privacy.heading, description: c.privacy.metaDescription, indexed: false },
        { href: '/terms', label: c.terms.heading, description: c.terms.metaDescription, indexed: false },
        {
          href: '/refund-policy',
          label: c.refundPolicy.heading,
          description: c.refundPolicy.metaDescription,
          indexed: false,
        },
      ],
    },
  ].filter((group) => group.pages.length > 0);
}

/** Paths for sitemap.xml: indexable pages only. */
export function indexedPaths(c: Content, live: boolean = c.booking.live): string[] {
  return sitePageGroups(c, live).flatMap((g) => g.pages.filter((p) => p.indexed).map((p) => p.href));
}
