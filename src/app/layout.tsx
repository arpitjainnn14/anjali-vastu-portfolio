import type { Metadata, Viewport } from 'next';
import { Fraunces, Hanken_Grotesk, Tiro_Devanagari_Hindi } from 'next/font/google';
import { site, nav } from '@/content';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Motion } from '@/components/motion/Motion';
import { StickyWhatsApp } from '@/components/layout/StickyWhatsApp';
import { siteUrl } from '@/lib/site-url';
import { siteGraph, jsonLd } from '@/lib/structured-data';
import './globals.css';

/* Self-hosted by next/font. No third-party request, no layout shift. */

/* Variable, with the SOFT and optical-size axes the type scale leans on. */
const fraunces = Fraunces({
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'opsz'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
});

const hanken = Hanken_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hanken',
});

/* A serif Devanagari to sit beside Fraunces. Hindi quotes and chart labels. */
const tiroDeva = Tiro_Devanagari_Hindi({
  weight: '400',
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-tiro-deva',
});

/**
 * Site-wide defaults only. Canonicals, Open Graph and Twitter tags are set per
 * page through lib/metadata.ts: set here, they leak into every page that
 * doesn't override them, including the 404, which then claims to be the home
 * page. The host comes from lib/site-url.ts; never hardcode it.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: '#F7F1E6',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * data-scroll-behavior: globals.css scrolls smoothly for in-page anchors.
     * Next 16 no longer switches that off during a route change unless told
     * to, so without this a new page animated towards the top, got cut short
     * as the shorter page swapped in, and left the visitor at the footer.
     */
    <html
      lang={site.locale}
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${hanken.variable} ${tiroDeva.variable}`}
    >
      <body className="bg-paper font-body text-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(siteGraph())}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-100 focus:rounded-control focus:bg-sindoor focus:px-5 focus:py-3 focus:text-card focus:t-small focus:font-semibold"
        >
          {nav.labels.skipToContent}
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <StickyWhatsApp />
        <Motion />
      </body>
    </html>
  );
}
