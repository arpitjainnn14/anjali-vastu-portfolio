import type { Metadata } from 'next';
import { getContent } from '@/content';
import { BlogIndexPage, blogIndexMetadata } from '@/components/pages/BlogIndexPage';
import { getSitedeskClient } from '@/lib/sitedesk-env';

/** The blog reads Sitedesk per request; every other page stays static. See README "Blog". */
export const dynamic = 'force-dynamic';

const c = getContent('en');
export const metadata: Metadata = blogIndexMetadata(c, 'en');

export default async function Page() {
  return <BlogIndexPage c={c} locale="en" posts={await getSitedeskClient().listPosts('en')} />;
}
