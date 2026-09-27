import type { MetadataRoute } from 'next';
import { getContent } from '@/content';
import { siteUrl } from '@/lib/site-url';
import { hindiLive } from '@/content/shared';
import { indexedPaths } from '@/lib/site-pages';

/*
 * The page list lives in lib/site-pages.ts, shared with /sitemap.html. It
 * leaves out noindex pages (the notices, /book until booking is live).
 * No lastModified: stamping every URL with the build time on every deploy
 * teaches Google to ignore the field. Add real dates when content has them.
 * The Hindi pages are listed too, but only once `hindiLive` is on.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...indexedPaths(getContent('en'), 'en'),
    ...(hindiLive ? indexedPaths(getContent('hi'), 'hi') : []),
  ];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
