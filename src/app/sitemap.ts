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
  const client = getSitedeskClient();
  const [en, hi] = await Promise.all([client.listPosts('en'), hindiLive ? client.listPosts('hi') : Promise.resolve(null)]);
  /* If Sitedesk cannot be reached the blog entries are simply left out; the rest of the sitemap is unaffected. */
  const blog = [
    ...(en.ok && en.data.length > 0 ? [{ url: `${siteUrl}${localePath('en', '/blog')}` }] : []),
    ...(hi && hi.ok && hi.data.length > 0 ? [{ url: `${siteUrl}${localePath('hi', '/blog')}` }] : []),
    ...(en.ok ? en.data.map((p) => ({ url: `${siteUrl}${localePath('en', `/blog/${p.slug}`)}`, lastModified: new Date(p.publishedAt) })) : []),
    ...(hi && hi.ok ? hi.data.map((p) => ({ url: `${siteUrl}${localePath('hi', `/blog/${p.slug}`)}`, lastModified: new Date(p.publishedAt) })) : []),
  ];
  return [...paths.map((path) => ({ url: `${siteUrl}${path}` })), ...blog];
}
