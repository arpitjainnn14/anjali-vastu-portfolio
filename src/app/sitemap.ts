import type { MetadataRoute } from 'next';
import { getContent } from '@/content';
import { siteUrl } from '@/lib/site-url';
import { hindiLive } from '@/content/shared';
import { indexedPaths } from '@/lib/site-pages';
import { localePath } from '@/lib/locale-routing';
import { getSitedeskClient } from '@/lib/sitedesk-env';

/* The blog entries come from Sitedesk, so this file is built per request. See README "Blog". */
export const dynamic = 'force-dynamic';

/*
 * The page list lives in lib/site-pages.ts, shared with /sitemap.html. It
 * leaves out noindex pages (the notices, /book until booking is live).
 * No lastModified: stamping every URL with the build time on every deploy
 * teaches Google to ignore the field. Add real dates when content has them.
 * The Hindi pages are listed too, but only once `hindiLive` is on.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    ...indexedPaths(getContent('en'), 'en'),
    ...(hindiLive ? indexedPaths(getContent('hi'), 'hi') : []),
  ];
  const entries = await getSitedeskClient().getSitemap();
  /* If Sitedesk cannot be reached the blog entries are simply left out; the rest of the sitemap is unaffected.
     Posts hidden from search engines, and everything when indexing is switched off, are already absent from the list. */
  /* Only blog addresses: any other pages in Sitedesk are not routes of this site. */
  const live = entries.ok ? entries.data.filter((e) => /^(\/hi)?\/blog\//.test(e.path) && (hindiLive || !e.path.startsWith('/hi'))) : [];
  const blog = [
    ...(live.some((e) => !e.path.startsWith('/hi')) ? [{ url: `${siteUrl}${localePath('en', '/blog')}` }] : []),
    ...(live.some((e) => e.path.startsWith('/hi')) ? [{ url: `${siteUrl}${localePath('hi', '/blog')}` }] : []),
    ...live.map((e) => ({ url: `${siteUrl}${e.path}`, lastModified: new Date(e.lastModified) })),
  ];
  return [...paths.map((path) => ({ url: `${siteUrl}${path}` })), ...blog];
}
