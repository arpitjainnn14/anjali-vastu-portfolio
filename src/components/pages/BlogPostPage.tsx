import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { Section, Container } from '@/components/ui/Section';
import { SmartLink } from '@/components/ui/SmartLink';
import { localePath } from '@/lib/locale-routing';
import { pageMetadata } from '@/lib/metadata';
import type { BlogPost } from '@/lib/sitedesk';
import { blogDate } from './BlogIndexPage';

export function blogPostMetadata(c: Content, locale: Locale, post: BlogPost): Metadata {
  return pageMetadata({ title: post.title, description: post.excerpt || c.blog.meta.description, path: `/blog/${post.slug}`, locale, c });
}

export function BlogPostPage({ c, locale, post }: { c: Content; locale: Locale; post: BlogPost }) {
  const { blog } = c;
  const other: Locale = locale === 'hi' ? 'en' : 'hi';
  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <article className="flex max-w-[760px] flex-col gap-6">
          <SmartLink href={localePath(locale, '/blog')} className="ink-link t-small inline-flex min-h-11 items-center self-start text-sindoor md:min-h-0">
            {blog.backToList}
          </SmartLink>
          <h1 className="t-h1 m-0 text-ink">{post.title}</h1>
          <span className="t-small text-muted">{blog.publishedLabel} {blogDate(post.publishedAt, locale)}{post.category ? ` · ${post.category}` : ''}</span>
          {/* The HTML is produced by Sitedesk's renderDoc: all text escaped, a fixed set of tags, safe links only. */}
          <div
            className="t-body flex flex-col gap-5 [&_a]:ink-link [&_a]:text-sindoor [&_blockquote]:m-0 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-[28px] [&_h2]:text-ink [&_h3]:mt-4 [&_h3]:font-display [&_h3]:text-[22px] [&_h3]:text-ink [&_li]:ml-6 [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          {post.languages.includes(other) && (
            <SmartLink href={localePath(other, `/blog/${post.slug}`)} className="ink-link t-small inline-flex min-h-11 items-center self-start text-sindoor md:min-h-0" lang={other}>
              {blog.otherLanguage}
            </SmartLink>
          )}
        </article>
      </Container>
    </Section>
  );
}

/** A heading and a line, for when a note cannot be loaded. */
export function BlogNotice({ c, locale, heading, body }: { c: Content; locale: Locale; heading: string; body: string }) {
  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-4">
          <h1 className="t-h1 m-0 text-ink">{heading}</h1>
          <p className="t-body m-0" role="status">{body}</p>
          <SmartLink href={localePath(locale, '/blog')} className="ink-link inline-flex min-h-11 items-center self-start text-sindoor md:min-h-0">
            {c.blog.backToList}
          </SmartLink>
        </div>
      </Container>
    </Section>
  );
}
