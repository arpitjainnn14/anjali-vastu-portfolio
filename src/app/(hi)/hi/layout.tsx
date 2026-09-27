import type { Metadata, Viewport } from 'next';
import { Mukta } from 'next/font/google';
import { getContent } from '@/content';
import { SiteBody } from '@/components/layout/SiteBody';
import { siteUrl } from '@/lib/site-url';
import { fraunces, hanken, tiroDeva } from '../../fonts';
import '../../globals.css';

/**
 * The Hindi site's root layout, for every page under /hi. The English one is
 * app/(en)/layout.tsx; see there for why there are two.
 *
 * Hindi text is set in Tiro Devanagari Hindi (headings) and Mukta (body),
 * with Fraunces and Hanken kept for the English words and the business name
 * that run through it. globals.css puts the Devanagari faces behind the Latin
 * ones on `:lang(hi)`, so each script picks up its own font.
 */
const c = getContent('hi');

/*
 * Only Hindi pages use it. Not preloaded: both root layouts share one CSS
 * chunk, so a preload here was also sent on every English page (six files,
 * ~233 KB). Without it the browser fetches Mukta only when a Hindi page asks.
 */
const mukta = Mukta({
  weight: ['400', '500', '600'],
  subsets: ['devanagari', 'latin'],
  display: 'swap',
  preload: false,
  variable: '--font-mukta',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: c.site.title,
    template: `%s | ${c.site.brand}`,
  },
  description: c.site.description,
};

export const viewport: Viewport = {
  themeColor: '#F7F1E6',
  colorScheme: 'light',
};

export default function HindiRootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* data-scroll-behavior: see app/(en)/layout.tsx. */
    <html
      lang="hi"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${hanken.variable} ${tiroDeva.variable} ${mukta.variable}`}
    >
      <body className="bg-paper font-body text-body antialiased">
        <SiteBody c={c} locale="hi">
          {children}
        </SiteBody>
      </body>
    </html>
  );
}
