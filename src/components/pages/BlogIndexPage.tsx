import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { Section, Container, Accented } from '@/components/ui/Section';
import { SmartLink } from '@/components/ui/SmartLink';
import { localePath } from '@/lib/locale-routing';
import { pageMetadata } from '@/lib/metadata';
import type { Fetched, BlogSummary } from '@/lib/sitedesk';

export function blogIndexMetadata(c: Content, locale: Locale): Metadata {
  return pageMetadata({ ...c.blog.meta, path: '/blog', locale, c });
}

export const blogDate = (ms: number, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(ms));

/** The list of notes. Posts come from Sitedesk per request; if it cannot be reached the page says so. */
export function BlogIndexPage({ c, locale, posts }: { c: Content; locale: Locale; posts: Fetched<BlogSummary[]> }) {
  const { blog } = c;
  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-6">
          <h1 className="t-h1 m-0 text-ink"><Accented text={blog.heading} /></h1>
          <p className="t-lead m-0">{blog.intro}</p>

          {!posts.ok ? (
            <p className="t-body m-0 mt-6" role="status">{blog.unavailable}</p>
          ) : posts.data.length === 0 ? (
            <p className="t-body m-0 mt-6">{blog.empty}</p>
          ) : (
            <ul className="m-0 mt-6 flex list-none flex-col gap-12 p-0">
              {posts.data.map((post) => (
                <li key={post.slug} className="flex flex-col gap-2">
                  <span className="t-small text-muted">{blogDate(post.publishedAt, locale)}{post.category ? ` · ${post.category}` : ''}</span>
                  <h2 className="t-h3 m-0 text-ink">
                    <SmartLink href={localePath(locale, `/blog/${post.slug}`)} className="ink-link">{post.title}</SmartLink>
                  </h2>
                  {post.excerpt && <p className="t-body m-0">{post.excerpt}</p>}
                  <SmartLink href={localePath(locale, `/blog/${post.slug}`)} className="ink-link inline-flex min-h-11 items-center text-sindoor md:min-h-0">
                    {blog.readMore}
                  </SmartLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </Section>
  );
}
