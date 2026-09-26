import type { MetadataRoute } from 'next';
import { services, picker, booking } from '@/content';
import { siteUrl } from '@/lib/site-url';
import { bookableServices, bookPageHref } from '@/lib/booking';

/*
 * Privacy is left out on purpose: it is noindex until it has been reviewed.
 * No lastModified: stamping every URL with the build time on every deploy
 * teaches Google to ignore the field. Add real dates when content has them.
 * /book pages are noindex (and left out here) until booking.live is true.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/about',
    '/teaching',
    '/contact',
    picker.href,
    ...services.map((s) => `/services/${s.slug}`),
    ...(booking.live ? bookableServices.map((s) => bookPageHref(s)) : []),
  ];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
