import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/content';
import { BlogNotice, BlogPostPage, blogPostMetadata } from '@/components/pages/BlogPostPage';
import { getBlogPost } from '@/lib/sitedesk-env';

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
  if (!result.ok && result.reason === 'not_found') notFound();
  if (!result.ok) return <BlogNotice c={c} locale="hi" heading={c.blog.meta.title} body={c.blog.postUnavailable} />;
  return <BlogPostPage c={c} locale="hi" post={result.data} />;
}
