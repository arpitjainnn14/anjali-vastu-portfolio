import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getContent, type Locale } from '@/content';
import { localePath } from '@/lib/locale-routing';
import { redirectTarget } from '@/lib/sitedesk';
import { getBlogConfig, getBlogPost } from '@/lib/sitedesk-env';
import { BlogNotice, BlogPostPage, blogPostMetadata } from './BlogPostPage';

/** Metadata for /blog/[slug] and /hi/blog/[slug]. An unloadable post is not indexed. */
export async function blogPostRouteMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const c = getContent(locale);
  const result = await getBlogPost(slug, locale);
  return result.ok ? blogPostMetadata(c, locale, result.data) : { title: c.blog.meta.title, robots: { index: false, follow: false } };
}

/**
 * One note. A missing note may have moved: the owner can change its address in Sitedesk, so the old address is sent
 * on to the new one before a 404. If Sitedesk cannot be reached, a short notice shows instead.
 */
export async function BlogPostRoute({ locale, slug }: { locale: Locale; slug: string }) {
  const c = getContent(locale);
  const result = await getBlogPost(slug, locale);
  if (!result.ok && result.reason === 'not_found') {
    const config = await getBlogConfig();
    const to = config.ok ? redirectTarget(config.data.redirects, localePath(locale, `/blog/${slug}`)) : null;
    if (to) permanentRedirect(to);
    notFound();
  }
  if (!result.ok) return <BlogNotice c={c} locale={locale} heading={c.blog.meta.title} body={c.blog.postUnavailable} />;
  return <BlogPostPage c={c} locale={locale} post={result.data} />;
}
