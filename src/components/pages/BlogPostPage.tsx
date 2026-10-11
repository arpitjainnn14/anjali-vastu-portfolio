import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { Section, Container } from '@/components/ui/Section';
import { SmartLink } from '@/components/ui/SmartLink';
import { localePath } from '@/lib/locale-routing';
import { pageMetadata } from '@/lib/metadata';
import type { BlogPost } from '@/lib/sitedesk';
import { locales } from '@/content';
import { blogDate } from '@/lib/blog-date';
import { blogLink } from './blogStyles';

/** Title, description, canonical, robots and share card: the owner's choices from Sitedesk where set, the usual ones otherwise. */
export function blogPostMetadata(c: Content, locale: Locale, post: BlogPost): Metadata {
  const description = post.seoDescription || post.excerpt || c.blog.meta.description;
  const base = pageMetadata({ title: post.seoTitle || post.title, description, path: `/blog/${post.slug}`, locale, c });
  const image = post.shareImage ?? post.featuredImage;
  const shareTitle = post.shareTitle || (typeof base.openGraph?.title === 'string' ? base.openGraph.title : post.title);
  const shareDescription = post.shareDescription || description;
  const images = image ? [{ url: image, width: 1200, height: 630, alt: post.title }] : undefined;
  return {
    ...base,
    ...(post.canonical ? { alternates: { ...base.alternates, canonical: post.canonical } } : {}),
    ...(post.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { ...base.openGraph, title: shareTitle, description: shareDescription, ...(images ? { images } : {}) },
    twitter: { ...base.twitter, title: shareTitle, description: shareDescription, ...(images ? { images: [image as string] } : {}) },
  };
}

export function BlogPostPage({ c, locale, post }: { c: Content; locale: Locale; post: BlogPost }) {
  const { blog } = c;
  const other = locales.find((l) => l !== locale) as Locale;
  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <article className="flex max-w-[760px] flex-col gap-6">
          <SmartLink href={localePath(locale, '/blog')} className={`${blogLink} t-small self-start`}>
            {blog.backToList}
          </SmartLink>
          <h1 className="t-h1 m-0 text-ink">{post.title}</h1>
          <span className="t-small text-muted">{blog.publishedLine(blogDate(post.publishedAt, locale), post.category)}</span>
          {/* The HTML is produced by Sitedesk's renderDoc: all text escaped, a fixed set of tags, safe links only. */}
          <div
            className="t-body flex flex-col gap-5 [&_a]:ink-link [&_a]:text-sindoor [&_blockquote]:m-0 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-[28px] [&_h2]:text-ink [&_h3]:mt-4 [&_h3]:font-display [&_h3]:text-[22px] [&_h3]:text-ink [&_li]:ml-6 [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          {post.languages.includes(other) && (
            <SmartLink href={localePath(other, `/blog/${post.slug}`)} className={`${blogLink} t-small self-start`} lang={other}>
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
          <SmartLink href={localePath(locale, '/blog')} className={`${blogLink} self-start`}>
            {c.blog.backToList}
          </SmartLink>
        </div>
      </Container>
    </Section>
  );
}
