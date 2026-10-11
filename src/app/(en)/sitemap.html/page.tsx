import type { Metadata } from 'next';
import { getContent } from '@/content';
import { SiteMapPage, siteMapMetadata } from '@/components/pages/SiteMapPage';
import { getSitedeskClient } from '@/lib/sitedesk-env';

/** Per request, like the blog: the notes listed here come from Sitedesk (README "Blog"). */
export const dynamic = 'force-dynamic';

const c = getContent('en');

export const metadata: Metadata = siteMapMetadata(c, 'en');

export default async function Page() {
  return <SiteMapPage c={c} locale="en" posts={await getSitedeskClient().listPosts('en')} />;
}
