import type { MetadataRoute } from 'next';
import { services, picker } from '@/content';

/* Privacy is left out on purpose: it is noindex until it has been reviewed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const paths = [
    '/',
    '/about',
    '/teaching',
    '/contact',
    picker.href,
    ...services.map((s) => `/services/${s.slug}`),
  ];
  return paths.map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
