import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getContent } from '@/content';
import { BlogNotice, BlogPostPage, blogPostMetadata } from '@/components/pages/BlogPostPage';
import { redirectTarget } from '@/lib/sitedesk';
import { getBlogConfig, getBlogPost } from '@/lib/sitedesk-env';

/** Per request, like the list: see README "Blog". */
export const dynamic = 'force-dynamic';

const c = getContent('hi');
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getBlogPost((await params).slug, 'hi');
  return result.ok ? blogPostMetadata(c, 'hi', result.data) : { title: c.blog.meta.title, robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const result = await getBlogPost((await params).slug, 'hi');
  if (!result.ok && result.reason === 'not_found') {
    // The owner may have changed this post's address in Sitedesk: send visitors (and Google) to the new one.
    const config = await getBlogConfig();
    const to = config.ok ? redirectTarget(config.data.redirects, `/hi/blog/${(await params).slug}`) : null;
    if (to) permanentRedirect(to);
    notFound();
  }
  if (!result.ok) return <BlogNotice c={c} locale="hi" heading={c.blog.meta.title} body={c.blog.postUnavailable} />;
  return <BlogPostPage c={c} locale="hi" post={result.data} />;
}
