import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { localeMetadata, localePath } from './locale-routing';

type PageMeta = {
  /** Page title. Run through the layout's template unless `absolute` is set. */
  title: string;
  description: string;
  /** The page's language-neutral (English) path; `locale` puts it under /hi. */
  path: string;
  locale: Locale;
  absolute?: boolean;
  /** The page's content bundle, for the brand name and the share image's alt text. */
  c: Content;
};

/**
 * Metadata for one page: title, description, canonical, Open Graph and the
 * Twitter card, all saying the same thing.
 *
 * Next merges metadata shallowly, so a page that sets `openGraph` replaces the
 * layout's whole object and a page that doesn't inherits the home page's. Every
 * page goes through here instead, so none of them shares a stranger's preview.
 *
 * The image is app/opengraph-image.jpg, named explicitly: Next only applies a
 * file-based image to routes that don't set `openGraph` themselves. It is a
 * static JPEG, not a generated PNG, because WhatsApp drops previews over
 * roughly 300 KB and a photo as PNG comes out at twice that.
 */
function shareImage(c: Content) {
  return {
    url: '/opengraph-image.jpg',
    width: 1200,
    height: 630,
    alt: `Astrologer ${c.site.name}, ${c.site.city}, ${c.site.state}`,
  };
}

export function pageMetadata({ title, description, path, locale, absolute = false, c }: PageMeta): Metadata {
  /* A title that already names the business does not repeat it. */
  const standalone = absolute || title.includes(c.site.brand);
  const shareTitle = standalone ? title : `${title} | ${c.site.brand}`;
  return {
    title: standalone ? { absolute: title } : title,
    description,
    ...localeMetadata(locale, path),
    openGraph: {
      type: 'website',
      locale: locale === 'hi' ? 'hi_IN' : 'en_IN',
      siteName: c.site.brand,
      title: shareTitle,
      description,
      url: localePath(locale, path),
      images: [shareImage(c)],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [shareImage(c)],
    },
  };
}
