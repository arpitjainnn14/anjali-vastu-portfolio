import type { Metadata, Viewport } from 'next';
import { Fraunces, Hanken_Grotesk, Tiro_Devanagari_Hindi } from 'next/font/google';
import { site, nav } from '@/content';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Motion } from '@/components/motion/Motion';
import { StickyWhatsApp } from '@/components/layout/StickyWhatsApp';
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
 * The host lives in an env var so pointing the custom domain at this is a
 * one-line change. Never hardcode it into OG tags or canonicals.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#F7F1E6',
  colorScheme: 'light',
};

/**
 * LocalBusiness rather than Organization: a one-person practice in a named
 * city with a phone number is exactly what this type is for. No price data —
 * there is none to publish.
 */
function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    description: site.description,
    areaServed: `${site.city}, ${site.state}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressRegion: site.state,
      addressCountry: 'IN',
    },
    availableLanguage: ['English', 'Hindi'],
    foundingDate: String(site.practisingSince),
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  };
}

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
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
