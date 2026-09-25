import type { Metadata } from 'next';
import { site } from '@/content';

type PageMeta = {
  /** Page title. Run through the layout's template unless `absolute` is set. */
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
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
const shareImage = {
  url: '/opengraph-image.jpg',
  width: 1200,
  height: 630,
  alt: `Astrologer ${site.name}, ${site.city}, ${site.state}`,
};

export function pageMetadata({ title, description, path, absolute = false }: PageMeta): Metadata {
  /* "About Astrologer Anjali Jain | Anjali Jain" says her name twice. */
  const standalone = absolute || title.includes(site.name);
  const shareTitle = standalone ? title : `${title} | ${site.name}`;
  return {
    title: standalone ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: site.name,
      title: shareTitle,
      description,
      url: path,
      images: [shareImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [shareImage],
    },
  };
}
