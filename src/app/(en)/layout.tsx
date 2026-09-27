import type { Metadata, Viewport } from 'next';
import { getContent } from '@/content';
import { SiteBody } from '@/components/layout/SiteBody';
import { siteUrl } from '@/lib/site-url';
import { fraunces, hanken, tiroDeva } from '../fonts';
import '../globals.css';

/**
 * The English site's root layout. The Hindi site has its own, at
 * app/(hi)/hi/layout.tsx: two root layouts, because `<html lang>` and the
 * fonts differ, and a page is static only if its layout needs nothing from
 * the request to know which language it is.
 *
 * Site-wide defaults only. Canonicals, Open Graph and Twitter tags are set per
 * page through lib/metadata.ts: set here, they leak into every page that
 * doesn't override them, including the 404, which then claims to be the home
 * page. The host comes from lib/site-url.ts; never hardcode it.
 */
const c = getContent('en');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: c.site.title,
    template: `%s | ${c.site.brand}`,
  },
  description: c.site.description,
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#F7F1E6',
  colorScheme: 'light',
};

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * data-scroll-behavior: globals.css scrolls smoothly for in-page anchors.
     * Next 16 no longer switches that off during a route change unless told
     * to, so without this a new page animated towards the top, got cut short
     * as the shorter page swapped in, and left the visitor at the footer.
     */
    <html
      lang={c.site.locale}
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${hanken.variable} ${tiroDeva.variable}`}
    >
      <body className="bg-paper font-body text-body antialiased">
        <SiteBody c={c} locale="en">
          {children}
        </SiteBody>
      </body>
    </html>
  );
}
