import type { MetadataRoute } from 'next';
import { services, picker } from '@/content';
import { siteUrl } from '@/lib/site-url';

/*
 * Privacy is left out on purpose: it is noindex until it has been reviewed.
 * No lastModified: stamping every URL with the build time on every deploy
 * teaches Google to ignore the field. Add real dates when content has them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/about',
    '/teaching',
    '/contact',
    picker.href,
    ...services.map((s) => `/services/${s.slug}`),
  ];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
