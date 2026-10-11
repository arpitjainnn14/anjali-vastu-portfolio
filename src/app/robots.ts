import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';
import { getSitedeskClient } from '@/lib/sitedesk-env';

/* Follows "Let search engines show this site" in Sitedesk, so it is built per request (README "Blog").
   If Sitedesk cannot be reached, the site stays visible: hiding it by accident is the worse mistake. */
export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const sitemap = await getSitedeskClient().getSitemap();
  if (sitemap.ok && !sitemap.indexing) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
